import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

let scene, camera, renderer, cube;
let initialSpinSpeed = new THREE.Vector2(0.001, 0.0025);
let userSpinVelocity = new THREE.Vector2(0, 0);
let dampingFactor = 0.97;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.body.appendChild(renderer.domElement);

  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(
    // "./lonely_road_afternoon_puresky_4k.hdr",
    // "./short_tunnel_4k.hdr",
    // "./dikhololo_night_4k.hdr",
    "./kloofendal_overcast_puresky_4k.hdr",
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    },
    undefined,
    (error) => {
      console.error("An error occurred loading the HDRI:", error);
      scene.background = new THREE.Color(0x111111);
      const fallbackLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(fallbackLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
    }
  );

  // Lights (even with env map, some direct lights can help)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Low intensity
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight2.position.set(-5, -5, -5);
  scene.add(directionalLight2);

  // Cube Geometry (Rounded)
  const cubeSize = 1.5;
  const cornerRadius = 0.02;
  const segments = 10; // More segments for smoother rounding
  const geometry = new RoundedBoxGeometry(
    cubeSize,
    cubeSize,
    cubeSize,
    segments,
    cornerRadius
  );

  // Cube Material (Metallic, Shiny, Dark Gray)
  const material = new THREE.MeshStandardMaterial({
    color: 0x777777, // Darker gray
    metalness: 1, // Fully metallic
    roughness: 0.05, // Very shiny (low roughness)
    // envMap: scene.environment is automatically used if material.envMap is not set
    // and scene.environment is set.
  });

  // Cube Mesh
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  renderer.domElement.addEventListener("pointerdown", onPointerDown, false);
  renderer.domElement.addEventListener("pointermove", onPointerMove, false);
  renderer.domElement.addEventListener("pointerup", onPointerUp, false);
  renderer.domElement.addEventListener("pointerout", onPointerUp, false); // Treat pointerout as pointerup
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
  isDragging = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onPointerMove(event) {
  if (!isDragging) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  const rotateSpeed = 0.00015;
  userSpinVelocity.y += deltaMove.x * rotateSpeed;
  userSpinVelocity.x += deltaMove.y * rotateSpeed;

  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onPointerUp() {
  isDragging = false;
}

function animate() {
  requestAnimationFrame(animate);

  // Apply base spin
  cube.rotation.x += initialSpinSpeed.x;
  cube.rotation.y += initialSpinSpeed.y;

  // Apply user spin and damping
  if (!isDragging) {
    userSpinVelocity.x *= dampingFactor;
    userSpinVelocity.y *= dampingFactor;

    // Stop tiny rotations to prevent perpetual micro-spinning from user input
    const epsilon = 0.0001;
    if (Math.abs(userSpinVelocity.x) < epsilon) userSpinVelocity.x = 0;
    if (Math.abs(userSpinVelocity.y) < epsilon) userSpinVelocity.y = 0;
  }

  cube.rotation.x += userSpinVelocity.x;
  cube.rotation.y += userSpinVelocity.y;

  renderer.render(scene, camera);
}
