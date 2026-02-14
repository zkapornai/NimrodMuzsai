import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('viewerBox');

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// CAMERA (top-down oriented so the model's underside never becomes visible)
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 3, 1.5);
camera.lookAt(0, 0, 0);

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
controls.enabled = false; // alapból OFF
// Restrict vertical rotation so camera never goes below the model (no underside)
controls.enablePan = false;
controls.minPolarAngle = 0;              // top
controls.maxPolarAngle = Math.PI / 2;   // horizon (can't go under)

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

//  HOVER LOGIKA
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
    model.rotation.z += 0.003; //  csak hoverkor forog
    controls.update();
  }

  renderer.render(scene, camera);
}
animate();

// ===== SCROLL ANIMATION PENTRU NUMBERS =====
function animateCountUp(element, target) {
  const duration = 2000; // 2 secunde
  const start = Date.now();
  
  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(progress * target);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}

// Intersection Observer pentru detectare scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const numberValues = document.querySelectorAll('.number-value');
      numberValues.forEach((element) => {
        const target = parseInt(element.getAttribute('data-target'));
        // Verifica daca animatia nu a rulat deja
        if (element.textContent === '0') {
          animateCountUp(element, target);
        }
      });
      // Opriteste observatorul dupa prima triggerare
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// Incepe observarea Numbersbox-ului
const numbersbox = document.querySelector('.Numbersbox');
if (numbersbox) {
  observer.observe(numbersbox);
}

// Continuous seamless carousel (no libs)
// Duplicates track children, then translates left continuously. When offset >= originalWidth -> offset -= originalWidth

(function () {
  const SPEED = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-speed')) || 0.04; // px per ms
  const track = document.getElementById('carousel-track');
  if (!track) return;

  // clone children to allow seamless loop
  const children = Array.from(track.children);
  if (children.length === 0) return;

  // duplicate content
  const cloneFragment = document.createDocumentFragment();
  children.forEach(node => {
    const c = node.cloneNode(true);
    cloneFragment.appendChild(c);
  });
  track.appendChild(cloneFragment);

  // measure original width (half the total after cloning)
  // we wait one tick to ensure layout
  requestAnimationFrame(() => {
    const totalWidth = track.scrollWidth;
    const originalWidth = totalWidth / 2;

    let offset = 0;
    let last = performance.now();

    function step(now) {
      const dt = now - last;
      last = now;

      offset += SPEED * dt; // increase offset (px)
      if (offset >= originalWidth) {
        // loop back seamlessly
        offset -= originalWidth;
      }
      track.style.transform = `translateX(${-offset}px)`;
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);

    // optional: pause on hover of track or newsletter (nice UX)
    const viewport = track.parentElement;
    const pauseTargets = [viewport, document.querySelector('.nl-form')];
    let paused = false;

    pauseTargets.forEach(el => {
      if (!el) return;
      el.addEventListener('mouseenter', () => { paused = true; track.style.opacity = '0.98'; });
      el.addEventListener('mouseleave', () => { paused = false; });
    });

    // modify loop step to respect pause
    // (redefine step to check paused)
    last = performance.now();
    function stepPaused(now) {
      const dt = now - last;
      last = now;
      if (!paused) {
        offset += SPEED * dt;
        if (offset >= originalWidth) offset -= originalWidth;
        track.style.transform = `translateX(${-offset}px)`;
      }
      requestAnimationFrame(stepPaused);
    }
    requestAnimationFrame(stepPaused);
  });
})();
