import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('viewerBox');

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// CAMERA
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 1.2, 1.5);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(600, 600);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 1));
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(5, 10, 5);
scene.add(dir);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enabled = false; // ⛔ alapból OFF

let model;

// LOAD MODEL
const loader = new GLTFLoader();
loader.load('./silo_zsiganak.glb', (gltf) => {
  model = gltf.scene;

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center);
  model.scale.setScalar(2.5 / size);
  model.rotation.x = -Math.PI / 2;

  scene.add(model);

  controls.target.copy(model.position);
  controls.update();
});

// 🖱️ HOVER LOGIKA
let isHovering = false;

container.addEventListener('mouseenter', () => {
  isHovering = true;
  controls.enabled = true;
});

container.addEventListener('mouseleave', () => {
  isHovering = false;
  controls.enabled = false;
});

// LOOP
function animate() {
  requestAnimationFrame(animate);

  if (isHovering && model) {
    model.rotation.z += 0.003; // 🔥 csak hoverkor forog
    controls.update();
  }

  renderer.render(scene, camera);
}
animate();
