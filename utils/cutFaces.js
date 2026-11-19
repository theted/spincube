// Splits a solid's surface into two material groups: group 0 is everything
// else, group 1 the faces left where corners were cut off (see CUTS in
// solids.js). The rounded edges and corners stay in group 0, so each cut
// face is a flat pane with a clear rim.

import * as THREE from "three";

const SAME = 1e-3;

/**
 * Sorts the triangles so the cut faces come last, and sets the two groups.
 * Changes the geometry in place.
 * @param {THREE.BufferGeometry} geometry - With a normal attribute; must be
 *   non-indexed if there are cuts (ConvexGeometry is)
 * @param {number[][]} cuts - Outward normals of the cut faces, any length
 * @returns {THREE.BufferGeometry} The same geometry
 */
export function groupCutFaces(geometry, cuts = []) {
  geometry.clearGroups();
  if (!cuts.length) {
    geometry.addGroup(0, Infinity, 0);
    return geometry;
  }
  if (geometry.index) throw new Error("spincube: cut faces need a non-indexed geometry");

  const directions = cuts.map((c) => new THREE.Vector3(...c).normalize());
  const normal = geometry.getAttribute("normal");
  const n = new THREE.Vector3();
  // A triangle on a cut face: all three corners share that face's normal
  const faceOf = (vertex) => {
    n.fromBufferAttribute(normal, vertex);
    return directions.findIndex((d) => d.distanceTo(n) < SAME);
  };
  const isCut = (first) => {
    const face = faceOf(first);
    return face >= 0 && faceOf(first + 1) === face && faceOf(first + 2) === face;
  };

  const kept = [];
  const cut = [];
  for (let first = 0; first < normal.count; first += 3) {
    (isCut(first) ? cut : kept).push(first);
  }
  const order = [...kept, ...cut];

  for (const name of Object.keys(geometry.attributes)) {
    const attribute = geometry.getAttribute(name);
    const size = attribute.itemSize;
    const sorted = new attribute.array.constructor(attribute.array.length);
    order.forEach((first, slot) => {
      const from = first * size;
      sorted.set(attribute.array.subarray(from, from + 3 * size), slot * 3 * size);
    });
    geometry.setAttribute(name, new THREE.BufferAttribute(sorted, size, attribute.normalized));
  }
  geometry.addGroup(0, kept.length * 3, 0);
  geometry.addGroup(kept.length * 3, cut.length * 3, 1);
  return geometry;
}
