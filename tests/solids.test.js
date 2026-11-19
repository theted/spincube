import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { CUTS, SOLIDS, innerRadius, restingQuaternion } from "../utils/solids.js";
import { createRoundedHull } from "../utils/roundedHull.js";
import { groupCutFaces } from "../utils/cutFaces.js";

describe("solids", () => {
  it("have the right number of corners, all on the unit sphere", () => {
    const counts = Object.fromEntries(Object.entries(SOLIDS).map(([name, c]) => [name, c.length]));
    expect(counts).toEqual({
      cube: 8,
      tetrahedron: 4,
      truncated: 12,
      rectified: 6,
      cuboctahedron: 12,
      icosahedron: 12,
    });
    for (const corners of Object.values(SOLIDS)) {
      for (const corner of corners) expect(Math.hypot(...corner)).toBeCloseTo(1, 6);
    }
  });

  it("know how much room is inside", () => {
    expect(innerRadius(SOLIDS.tetrahedron)).toBeCloseTo(1 / 3, 6);
    expect(innerRadius(SOLIDS.rectified)).toBeCloseTo(1 / Math.sqrt(3), 6);
    expect(innerRadius(SOLIDS.cube)).toBeCloseTo(1 / Math.sqrt(3), 6);
    expect(innerRadius(SOLIDS.truncated)).toBeCloseTo(3 / Math.sqrt(33), 6);
  });
});

describe("rounded hull", () => {
  const corners = SOLIDS.rectified.map((c) => new THREE.Vector3(...c));
  const geometry = createRoundedHull(corners, 0.1, 6);
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");

  it("stands one radius off the solid everywhere", () => {
    const p = new THREE.Vector3();
    let furthest = 0;
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i);
      const nearest = Math.min(...corners.map((c) => c.distanceTo(p)));
      expect(nearest).toBeCloseTo(0.1, 5);
      furthest = Math.max(furthest, p.length());
    }
    expect(furthest).toBeCloseTo(1.1, 2);
  });

  it("has unit normals pointing outwards", () => {
    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i);
      n.fromBufferAttribute(normal, i);
      expect(n.length()).toBeCloseTo(1, 5);
      expect(n.dot(p)).toBeGreaterThan(0);
    }
  });

  it("keeps the faces flat", () => {
    // Most of the surface is the eight faces, each with a single normal
    const flat = new Set();
    const n = new THREE.Vector3();
    let onFace = 0;
    for (let i = 0; i < normal.count; i++) {
      n.fromBufferAttribute(normal, i);
      const s = 1 / Math.sqrt(3);
      if ([n.x, n.y, n.z].every((v) => Math.abs(Math.abs(v) - s) < 1e-4)) {
        onFace++;
        flat.add([n.x, n.y, n.z].map(Math.sign).join());
      }
    }
    expect(flat.size).toBe(8);
    expect(onFace).toBeGreaterThan(8 * 3);
  });
});

describe("cut faces", () => {
  const build = (form) =>
    groupCutFaces(
      createRoundedHull(SOLIDS[form].map((c) => new THREE.Vector3(...c)), 0.08, 6),
      CUTS[form]
    );

  it("are faces of their solid", () => {
    for (const [form, cuts] of Object.entries(CUTS)) {
      const corners = SOLIDS[form];
      for (const cut of cuts) {
        // The corners furthest along a face normal make a face: three or more
        const n = cut.map((v) => v / Math.hypot(...cut));
        const reach = Math.max(...corners.map((c) => c[0] * n[0] + c[1] * n[1] + c[2] * n[2]));
        const onFace = corners.filter((c) => reach - (c[0] * n[0] + c[1] * n[1] + c[2] * n[2]) < 1e-6);
        expect(onFace.length, `${form} ${cut}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("split the rectified tetrahedron into four clear triangles and four cut ones", () => {
    const geometry = build("rectified");
    const [kept, cut] = geometry.groups;
    expect(geometry.groups).toHaveLength(2);
    expect(cut.start).toBe(kept.count);
    expect(kept.count + cut.count).toBe(geometry.getAttribute("position").count);

    // Every cut triangle lies on one of the four cut faces, all four used
    const normal = geometry.getAttribute("normal");
    const n = new THREE.Vector3();
    const faces = new Set();
    for (let i = cut.start; i < cut.start + cut.count; i++) {
      n.fromBufferAttribute(normal, i);
      expect(n.x * n.y * n.z).toBeGreaterThan(0); // The tetrahedron's corners: an even sign
      faces.add([n.x, n.y, n.z].map(Math.sign).join());
    }
    expect(faces.size).toBe(4);

    // The clear faces are still there among the rest
    let clear = 0;
    for (let i = 0; i < kept.count; i++) {
      n.fromBufferAttribute(normal, i);
      const s = 1 / Math.sqrt(3);
      if ([n.x, n.y, n.z].every((v) => Math.abs(Math.abs(v) - s) < 1e-4)) clear++;
    }
    expect(clear).toBeGreaterThan(0);
  });

  it("leave a solid without cuts in one group", () => {
    const geometry = groupCutFaces(
      createRoundedHull(SOLIDS.icosahedron.map((c) => new THREE.Vector3(...c)), 0.08, 6),
      CUTS.icosahedron
    );
    expect(geometry.groups).toEqual([{ start: 0, count: Infinity, materialIndex: 0 }]);
  });
});

describe("resting pose", () => {
  it("turns a whole face of the tetrahedron to the viewer, a corner up", () => {
    const q = restingQuaternion("rectified");
    const face = new THREE.Vector3(1, 1, -1).normalize().applyQuaternion(q);
    expect(face.z).toBeGreaterThan(0.9); // Nearly face on, tipped a little
    expect(face.z).toBeLessThan(0.999);
    const centre = new THREE.Vector3(1, 1, -1).divideScalar(3).applyQuaternion(q);
    const top = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    expect(top.y - centre.y).toBeGreaterThan(Math.abs(top.x - centre.x) * 2);
  });

  it("keeps the three-quarter view for the others", () => {
    const q = restingQuaternion("cube");
    expect(q.equals(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, -0.45, 0)))).toBe(true);
  });
});
