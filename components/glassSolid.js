import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLASS, SOLID } from "../constants.js";
import { groupCutFaces } from "../utils/cutFaces.js";
import { createRoundedHull } from "../utils/roundedHull.js";
import { CUTS, SOLIDS, innerRadius } from "../utils/solids.js";

// The settings the solid's shape is built from; a change rebuilds it
const shapeKey = () => [SOLID.form, SOLID.size, SOLID.rounding, SOLID.segments].join();

/**
 * How far the solid's corners reach from its centre, for hit tests.
 * @returns {number}
 */
export function solidReach() {
  const corners = SOLIDS[SOLID.form];
  if (!corners) throw new Error(`spincube: unknown solid "${SOLID.form}"`);
  return SOLID.size / innerRadius(corners);
}

/**
 * Cuts the solid named by SOLID.form, its faces SOLID.size from the centre
 * and its edges rounded off, with the faces where corners were cut off in a
 * group of their own (see utils/cutFaces.js).
 * @returns {THREE.BufferGeometry}
 */
function createSolidGeometry() {
  const { form, size, rounding, segments } = SOLID;
  if (form === "cube") {
    return groupCutFaces(new RoundedBoxGeometry(size * 2, size * 2, size * 2, segments, rounding));
  }
  // The rounding stands off a smaller solid, so the faces end up at `size`
  const corners = SOLIDS[form];
  const scale = (size - rounding) / innerRadius(corners);
  const hull = createRoundedHull(
    corners.map((c) => new THREE.Vector3(...c).multiplyScalar(scale)),
    rounding,
    segments
  );
  return groupCutFaces(hull, CUTS[form]);
}

/** Copies the GLASS settings onto a material. */
function applyGlass(material) {
  material.color.set(GLASS.color);
  material.roughness = GLASS.roughness;
  material.thickness = GLASS.thickness;
  material.ior = GLASS.ior;
  material.dispersion = GLASS.dispersion;
  material.iridescence = GLASS.iridescence;
  material.iridescenceIOR = GLASS.iridescenceIOR;
  material.attenuationColor.set(GLASS.attenuationColor);
  material.attenuationDistance = GLASS.attenuationDistance;
  material.envMapIntensity = GLASS.envMapIntensity;
  material.specularIntensity = GLASS.specularIntensity;
}

const createGlassMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    metalness: 0,
    transmission: 1,
    side: THREE.DoubleSide, // Inner faces add depth to the refraction
  });

/**
 * Creates the glass solid: physically based transmission, dispersion and a
 * faint thin-film iridescence. The faces where corners were cut off are
 * ground to a satin (SOLID.cutFrost), so a rectified tetrahedron still shows
 * the tetrahedron it was cut from.
 * @returns {{mesh: THREE.Mesh, applySettings: Function}}
 */
export function createGlassSolid() {
  solidReach(); // Fails early on an unknown form
  const clear = createGlassMaterial();
  const cut = createGlassMaterial();
  const mesh = new THREE.Mesh(createSolidGeometry(), [clear, cut]);
  let builtFrom = shapeKey();

  const applySettings = () => {
    applyGlass(clear);
    applyGlass(cut);
    cut.roughness = Math.max(GLASS.roughness, SOLID.cutFrost);
    cut.iridescence = Math.min(1, GLASS.iridescence + SOLID.cutSheen);
    cut.emissive.set(GLASS.attenuationColor).multiplyScalar(SOLID.cutMilk);
    if (shapeKey() !== builtFrom) {
      solidReach();
      mesh.geometry.dispose();
      mesh.geometry = createSolidGeometry();
      builtFrom = shapeKey();
    }
  };
  applySettings();

  return { mesh, applySettings };
}
