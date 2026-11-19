// Rounds off a convex solid: the shape a ball of the given radius sweeps out
// as its centre moves through the solid. Flat faces stay flat, edges become
// quarter-pipes and corners patches of a sphere, all meeting smoothly.

import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

const SAME = 1e-4;

/** The distinct outward face normals of a convex solid, and the corners on each face. */
function findFaces(corners) {
  const hull = new ConvexGeometry(corners);
  const normal = hull.getAttribute("normal");
  const faces = [];
  for (let i = 0; i < normal.count; i += 3) {
    const n = new THREE.Vector3().fromBufferAttribute(normal, i);
    if (!faces.some((face) => face.normal.distanceTo(n) < SAME)) {
      const reach = Math.max(...corners.map((corner) => corner.dot(n)));
      faces.push({
        normal: n,
        corners: corners.flatMap((corner, index) => (reach - corner.dot(n) < SAME ? [index] : [])),
      });
    }
  }
  hull.dispose();
  return faces;
}

/** Directions covering a sphere evenly, for the corner patches. */
function sphereDirections(detail) {
  const sphere = new THREE.IcosahedronGeometry(1, detail);
  const position = sphere.getAttribute("position");
  const seen = new Set();
  const directions = [];
  for (let i = 0; i < position.count; i++) {
    const d = new THREE.Vector3().fromBufferAttribute(position, i);
    const key = `${d.x.toFixed(4)},${d.y.toFixed(4)},${d.z.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      directions.push(d);
    }
  }
  sphere.dispose();
  return directions;
}

/**
 * Builds the rounded solid's geometry, with exact normals: a face's normal
 * across the face, turning evenly around edges and corners.
 * @param {THREE.Vector3[]} corners - The corners of a convex solid
 * @param {number} radius - How far the surface stands off that solid
 * @param {number} [segments] - Steps across each rounded edge
 * @returns {THREE.BufferGeometry}
 */
export function createRoundedHull(corners, radius, segments = 8) {
  const faces = findFaces(corners);
  const fill = sphereDirections(Math.max(1, Math.round(segments / 3)));

  // Around each corner: the normals of its faces, arcs between each pair of
  // them that share an edge, and a sprinkling over the patch in between
  const points = [];
  corners.forEach((corner, index) => {
    const own = faces.filter((face) => face.corners.includes(index));
    const directions = own.map((face) => face.normal.clone());
    for (let a = 0; a < own.length; a++) {
      for (let b = a + 1; b < own.length; b++) {
        const shared = own[a].corners.filter((c) => own[b].corners.includes(c));
        if (shared.length < 2) continue;
        for (let step = 1; step < segments; step++) {
          directions.push(
            own[a].normal.clone().lerp(own[b].normal, step / segments).normalize()
          );
        }
      }
    }
    const middle = own.reduce((sum, face) => sum.add(face.normal), new THREE.Vector3()).normalize();
    const spread = Math.min(...own.map((face) => face.normal.dot(middle)));
    for (const d of fill) {
      if (d.dot(middle) > spread && !directions.some((known) => known.distanceTo(d) < 0.02)) {
        directions.push(d.clone());
      }
    }
    for (const d of directions) points.push(d.multiplyScalar(radius).add(corner));
  });

  const geometry = new ConvexGeometry(points);
  // Every point of the surface is one radius from the corner it came from
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const p = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    let nearest = corners[0];
    for (const corner of corners) {
      if (p.distanceToSquared(corner) < p.distanceToSquared(nearest)) nearest = corner;
    }
    p.sub(nearest).normalize();
    normal.setXYZ(i, p.x, p.y, p.z);
  }
  normal.needsUpdate = true;
  return geometry;
}
