// The solids the glass can be cut as. Each is a list of corners on the unit
// sphere; the tetrahedron's family runs tetrahedron → truncated tetrahedron
// (corners cut off a third of the way along each edge) → octahedron (cut to
// the middle of each edge: the rectified tetrahedron).

const SIGNS = [-1, 1];

/** Scales corners so the furthest is one unit from the centre. */
const unit = (corners) => {
  const reach = Math.max(...corners.map((c) => Math.hypot(...c)));
  return corners.map((c) => c.map((v) => v / reach));
};

/** Every arrangement of three values, without repeats. */
const permutations = ([a, b, c]) => {
  const all = [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]];
  return all.filter((p, i) => all.findIndex((q) => q.join() === p.join()) === i);
};

/** Each corner with every combination of signs that passes the test. */
const signed = (corner, keep = () => true) =>
  SIGNS.flatMap((x) => SIGNS.flatMap((y) => SIGNS.map((z) => [x, y, z])))
    .filter(keep)
    .map((s) => corner.map((v, i) => v * s[i]))
    .filter((p, i, all) => all.findIndex((q) => q.join() === p.join()) === i);

const even = (s) => s[0] * s[1] * s[2] > 0;
const PHI = (1 + Math.sqrt(5)) / 2;

export const SOLIDS = {
  // Cut by components/glassSolid.js as a rounded box, as it always was
  cube: unit(signed([1, 1, 1])),
  tetrahedron: unit(signed([1, 1, 1], even)),
  // Four hexagons and four triangles
  truncated: unit(permutations([1, 1, 3]).flatMap((p) => signed(p, even))),
  // The rectified tetrahedron: eight triangles
  octahedron: unit(permutations([1, 0, 0]).flatMap((p) => signed(p))),
  // The rectified cube: six squares and eight triangles
  cuboctahedron: unit(permutations([1, 1, 0]).flatMap((p) => signed(p))),
  icosahedron: unit(
    [[0, 1, PHI], [1, PHI, 0], [PHI, 0, 1]].flatMap((p) => signed(p))
  ),
};

/**
 * How far a solid's faces are from its centre, as a fraction of how far its
 * corners are: the room inside for the S.
 * @param {number[][]} corners - Corners on the unit sphere
 * @returns {number}
 */
export function innerRadius(corners) {
  let nearest = 1;
  for (let a = 0; a < corners.length; a++) {
    for (let b = a + 1; b < corners.length; b++) {
      for (let c = b + 1; c < corners.length; c++) {
        const [u, v, w] = [corners[a], corners[b], corners[c]];
        const e1 = v.map((x, i) => x - u[i]);
        const e2 = w.map((x, i) => x - u[i]);
        const n = [
          e1[1] * e2[2] - e1[2] * e2[1],
          e1[2] * e2[0] - e1[0] * e2[2],
          e1[0] * e2[1] - e1[1] * e2[0],
        ];
        const length = Math.hypot(...n);
        if (length < 1e-9) continue;
        const side = corners.map((p) => (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]) / length);
        const offset = (u[0] * n[0] + u[1] * n[1] + u[2] * n[2]) / length;
        // A face: every corner on one side of the plane
        if (side.every((s) => s <= offset + 1e-9) || side.every((s) => s >= offset - 1e-9)) {
          nearest = Math.min(nearest, Math.abs(offset));
        }
      }
    }
  }
  return nearest;
}
