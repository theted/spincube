import * as THREE from "three";
import { Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { CORE } from "../constants.js";
import { GLYPHS } from "../assets/glyphs.js";

// The settings the letter's shape is built from; a change rebuilds it
const shapeKey = () =>
  [CORE.glyph, CORE.size, CORE.depth, CORE.bevel, CORE.bevelSize, CORE.bevelSegments].join();

/**
 * The S's height per unit of font size, so CORE.size sets its height
 * whichever glyph it is drawn from.
 * @param {Font} font
 * @returns {number}
 */
function glyphHeight(font) {
  const points = font.generateShapes("S", 1).flatMap((shape) => shape.getPoints());
  const box = new THREE.Box2().setFromPoints(points);
  return box.max.y - box.min.y;
}

/**
 * Extrudes the S named by CORE.glyph, centred so it can turn about its own
 * middle.
 * @returns {TextGeometry}
 */
function createLetterGeometry() {
  const data = GLYPHS[CORE.glyph];
  if (!data) throw new Error(`spincube: unknown glyph "${CORE.glyph}"`);
  const font = new Font(data);
  const geometry = new TextGeometry("S", {
    font,
    size: CORE.size / glyphHeight(font),
    depth: CORE.depth,
    curveSegments: 18,
    bevelEnabled: true,
    bevelThickness: CORE.bevel,
    bevelSize: CORE.bevelSize,
    // Cut the bevel into the letter rather than around it, so the outline
    // stays the glyph's and the glowing face sits inset in the metal
    bevelOffset: -CORE.bevelSize,
    bevelSegments: CORE.bevelSegments,
  });
  geometry.center();
  return geometry;
}

/**
 * Creates the S at the heart of the cube: a glowing face set in a rounded
 * metal bevel, like an embossed sign, on polished metal sides.
 * @returns {{mesh: THREE.Mesh, face: THREE.Material, rim: THREE.Material, applySettings: Function}}
 */
export function createCoreLetter() {
  // ExtrudeGeometry puts the front and back caps in group 0, the bevel and
  // the sides in group 1
  const face = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.35,
    metalness: 0,
  });
  const rim = new THREE.MeshStandardMaterial({ metalness: 1 });
  const mesh = new THREE.Mesh(createLetterGeometry(), [face, rim]);
  let builtFrom = shapeKey();

  const applySettings = () => {
    face.emissive.set(CORE.faceColor);
    face.emissiveIntensity = CORE.faceGlow;
    rim.color.set(CORE.rimColor);
    rim.roughness = CORE.rimRoughness;
    rim.envMapIntensity = CORE.rimReflection;
    rim.emissive.set(CORE.faceColor);
    rim.emissiveIntensity = CORE.rimGlow;
    if (shapeKey() !== builtFrom) {
      mesh.geometry.dispose();
      mesh.geometry = createLetterGeometry();
      builtFrom = shapeKey();
    }
  };
  applySettings();

  return { mesh, face, rim, applySettings };
}
