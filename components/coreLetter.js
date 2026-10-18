import * as THREE from "three";
import { Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { CORE } from "../constants.js";
import { helvetikerBoldS } from "../assets/helvetikerBoldS.js";

// The S glyph spans from 29 units below the baseline to 1040 above, per 1000.
const GLYPH_HEIGHT_EM = 1.069;

/**
 * Creates the S at the heart of the cube: glowing amber faces wrapped in a
 * polished metal rim. It is centred so it can turn about its own middle.
 * @returns {{mesh: THREE.Mesh, face: THREE.Material, rim: THREE.Material, applySettings: Function}}
 */
export function createCoreLetter() {
  const geometry = new TextGeometry("S", {
    font: new Font(helvetikerBoldS),
    size: CORE.size / GLYPH_HEIGHT_EM,
    depth: CORE.depth,
    curveSegments: 18,
    bevelEnabled: true,
    bevelThickness: CORE.bevel,
    bevelSize: CORE.bevel * 0.7,
    bevelSegments: 5,
  });
  geometry.center();

  // ExtrudeGeometry puts the front and back caps in group 0, the sides in group 1
  const face = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.35,
    metalness: 0,
  });
  const rim = new THREE.MeshStandardMaterial({
    metalness: 1,
    roughness: 0.16,
    emissiveIntensity: 0.12,
  });

  const applySettings = () => {
    face.emissive.set(CORE.faceColor);
    face.emissiveIntensity = CORE.faceGlow;
    rim.color.set(CORE.rimColor);
    rim.emissive.set(CORE.faceColor);
  };
  applySettings();

  return { mesh: new THREE.Mesh(geometry, [face, rim]), face, rim, applySettings };
}
