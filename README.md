# SpinCube

A glass cube with a glowing S at its heart, built with Three.js.

Live at **https://spincube.sundbergsolutions.se**.

The cube tumbles slowly in front of a dark backdrop of thin light lines. Its
glass refracts and splits them into rainbow fringes, and a polished studio
environment draws highlights along its edges. The S inside keeps turning
back to face you.

## Controls

- **Drag** to spin the cube; let go mid-drag to throw it. A hard throw drags
  the S along with it before it swings back.
- **Hold** (mouse, touch or Space) to charge. The S burns brighter, the
  backdrop lines bend in towards the cube and the dust is drawn in.
- **Release** to fire a pulse: a ripple runs out through the backdrop lines,
  a shockwave pushes the dust away, and the cube wobbles and spins. A longer
  hold gives a stronger pulse.
- **Scroll** to zoom.

The pointer also drifts the camera slightly for parallax. With
`prefers-reduced-motion` set, the idle motion is calmer and the dust stays put.

## Development

```bash
npm install
npm run dev      # http://127.0.0.1:5191
npm test
npm run build    # static site in dist/
npm run preview  # serve dist/
```

### Tuning

Every parameter lives in `constants.js`. To tune visually, press **d** in the
dev server, or add `?debug` to the URL of any build. That opens a lil-gui
panel bound to those settings. Changes are kept in localStorage, so they're
back on the next visit with `?debug` (the page without it always shows the
defaults), and the panel's title counts them. **Copy changed settings** puts
just those changes on the clipboard as JSON, in the shape `overrides` takes
and ready to paste into `constants.js`; **Copy all settings** copies every
value, and **Reset to defaults** clears them.

**Presets** offers whole looks: **Defaults**, the built-in looks in
`components/debugPresets.js` (**Original** is the S before Inter Black,
exactly; then Breathing, Ice chrome, White, Frosted, Prism, Neon, Ember, Calm
and Turntable), and your own, kept in localStorage. **Save current as
preset** stores every value under the name above it, picking one from
**load** brings it back, and **Copy preset** / **Copy all presets** copy
their changes from the defaults in the same JSON shape.

The panel's **The S** folder has a **font** dropdown that swaps the letter
for other candidate glyphs (`assets/glyphCandidates.js`, loaded only with
the panel) and its **size**, then **Emboss** (a preset, the bevel's height,
width and roundness, whether it's cut into the face or built out around the
letter, and the letter's depth), **Glow** (a preset, colour and strength,
and how much and how fast it breathes), **Spin** (its own spin, how far and how fast it rocks, and
the spring that turns it back to face you, which the cube's spin drags at)
and **Metal** (colour, roughness, reflection and glow). **Hide controls**
clears the panel off the scene; **d** brings it back, or the **Controls**
button on touch screens.

In development, `window.spincube` exposes the motion state and a
`frame(dt, time)` function for poking at things from the console.

`embed.html` (dev server only, not built) mounts the cube transparently over
a stand-in for the sundbergsolutions.se hero. To try settings, pass them in
the URL: `/embed.html?overrides={"GLASS":{"envMapIntensity":2.5}}`.

## Embedding

The package exports `mountSpinCube`, so another site can depend on this repo
(`npm i github:theted/spincube`) instead of copying it. sundbergsolutions.se
does this.

```js
import { mountSpinCube } from "spincube";

const cube = mountSpinCube(element, {
  background: "transparent", // or "scene" for the light-line backdrop
  overrides: { CAMERA: { distance: 5.6 }, DUST: { count: 220 } },
});
// later
cube.dispose();
```

The canvas fills `element` and follows its size. The defaults suit a cube
inside a page:
- only a press on the cube itself charges or spins it, and the cursor shows
  that;
- the wheel and Space are left alone;
- vertical swipes still scroll the page and pinches still zoom it;
- a touch the browser takes over for scrolling neither pulses nor throws;
- rendering pauses while the cube is off screen or the tab is hidden.

To use the scene as a section background with the cube off to one side,
pass `background: "scene"` and a `layout`: `{ x: 0.74, y: 0.47 }` puts the
cube at those fractions of the canvas. The camera's view is shifted
off-axis rather than turned, so the backdrop's glow, the charge pinch and
the ripple stay centred on the cube. `layout` can be a function of the
canvas size, for breakpoints. If page content sits on top of the canvas,
pass that section as `pointerTarget`: a press that lands on the cube then
spins it even through the text, and every other press reaches the page.
sundbergsolutions.se's hero works this way.
For large canvases, `overrides: { RENDER: { maxPixelRatio: 1.25,
transmissionScale: 0.6 } }` keeps the cost down.

`index.d.ts` lists every option. `overrides` change the module-level settings
in `constants.js`, so mount one cube per page.

On a transparent canvas, three.js clears the buffer that glass refracts to
half-transparent white, which makes the glass look milky.
`components/stage.js` swaps that clear for a fully transparent one. That
depends on three's internals, which is why `three` is pinned to `~0.186`.
Recheck the embed after any three upgrade.

## How it works

- **Glass**: `MeshPhysicalMaterial` with transmission, dispersion, a little
  iridescence and both faces rendered, so the inner faces add depth.
- **Reflections**: a procedural studio of emissive softboxes and strip lights,
  prefiltered once with `PMREMGenerator` and slowly rotated.
- **The S**: a single glyph from Inter Black, embedded in
  `assets/interBlackS.js`. Its faces glow champagne, set in a rounded bevel
  cut into the letter, so they sit inset like an embossed sign. The bevel
  and the sides are polished metal.
- **Backdrop**: one shader on a large sphere draws the gradient, nebula glow,
  light lines and the pulse ripple.
- **Motion**: quaternion spins integrated from angular velocity, plus damped
  springs with substeps. All of it is independent of the frame rate and unit
  tested (`utils/`, `tests/`).
- **Post-processing**: MSAA in a half-float render target, then bloom, then
  ACES tone mapping, then a finishing pass that adds colour fringing, a
  vignette and grain.

## Project structure

- `index.js`, `index.d.ts` – the library entry, `mountSpinCube`
- `main.js` – the standalone page: mounts the cube and the debug panel
- `components/scene.js` – wiring and the animation loop
- `constants.js` – all tunable parameters
- `components/` – scene pieces (stage, environment, backdrop, cube, dust,
  post-processing, debug panel)
- `shaders/` – GLSL, one file per shader
- `utils/` – springs, rotation maths, input and the motion model
- `tests/` – Vitest unit tests

## Deployment

`.github/workflows/deploy.yml` runs the unit tests and a build on every pull
request. A push to `master` (or a manual run on `master`) then deploys `dist/`
to S3 behind CloudFront, using the shared `deploy-static.yml` workflow from
[theted/workflows](https://github.com/theted/workflows). That workflow sets
long-lived cache headers on the fingerprinted `assets/*` and `max-age=0` on
everything else. The setup follows archetype A in the private
theted/infrastructure repo (`static-s3.md`), which also records the AWS
resources behind it.

The workflow reads the standard secrets: `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` and
`CLOUDFRONT_DISTRIBUTION_ID`.

## Docker

For a local production-like run:

```bash
docker build -t spincube .
docker run -p 8080:80 spincube   # http://localhost:8080
```

The image builds the site with Node and serves `dist/` from nginx. The live
site doesn't use it.

## License

ISC. Inter is copyright (c) 2016 The Inter Project Authors, under the SIL
Open Font License 1.1. The debug panel's candidate glyphs credit their fonts
in `assets/glyphCandidates.js`.
