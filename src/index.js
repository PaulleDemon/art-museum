import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import SimpleFPControls from './controls.js'; // Adjust the import based on your file structure
import FirstPersonCamera from './controller.js';

let camera, scene, renderer, controls;
let prevTime = performance.now();

function init() {

    const container = document.getElementById('model-container');
    container.tabIndex = 0;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 10, 0);

    // Lights setup
    const light = new THREE.AmbientLight(0x404040, 100);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


    // GLTFLoader to load the model
    const loader = new GLTFLoader();
    loader.load("/assets/scene.gltf", function (gltf) {
        const museum = gltf.scene.children[0];
        museum.scale.set(0.5, 0.5, 0.5);
        scene.add(gltf.scene);
        animate();
         // Use SimpleFPControls for first-person movement
        // controls = new SimpleFPControls(camera, museum, container);
        // scene.add(controls.getObject());
        controls = new FirstPersonCamera(camera, gltf.scene.children, container)
        controls.translation_.set(-3, 10, 0);  // Manually set camera position
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    controls?.update(delta); // Update controls with the delta time

    renderer.render(scene, camera);

    prevTime = time;
    requestAnimationFrame(animate);
}

init();
