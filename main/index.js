// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// import sceneModelPath from './assets/scene.gltf';


console.log("THREE: ", THREE)
let scene, camera, renderer, controls;

function init() {

    const container = document.getElementById('model-container'); 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
    camera.rotation.y = 45 / 180 * Math.PI;
    camera.position.x = 800;
    camera.position.y = 100;
    camera.position.z = 10;

    const hlight = new THREE.AmbientLight(0x404040, 100);
    scene.add(hlight);

    //Adding directional lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    //Adding Shadow
    const light = new THREE.PointLight(0xc4c4c4, 10);
    light.position.set(0, 300, 500);
    scene.add(light);

    const light2 = new THREE.PointLight(0xc4c4c4, 10);
    light2.position.set(500, 100, 0);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xc4c4c4, 10);
    light3.position.set(0, 100, -500);
    scene.add(light3);

    const light4 = new THREE.PointLight(0xc4c4c4, 10);
    light4.position.set(-500, 300, 0);
    scene.add(light4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.tabIndex = 1; // Ensure canvas can be focused
    renderer.domElement.focus(); // Set focus on the canvas

    renderer.domElement.addEventListener('keydown', function(event) {
        console.log(`Key pressed: ${event.key} (keyCode: ${event.keyCode})`);
    }, false);

    container.appendChild(renderer.domElement);


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', renderer);
    controls.enableKeys = true;
    controls.keys = {
        LEFT: 37,  // ArrowLeft
        UP: 38,    // ArrowUp
        RIGHT: 39, // ArrowRight
        DOWN: 40   // ArrowDown
    };
    


    let loader = new THREE.GLTFLoader();
    loader.load("./assets/scene.gltf", function (gltf) {
        const museum = gltf.scene.children[0];
        museum.scale.set(0.5, 0.5, 0.5);
        scene.add(gltf.scene);
        animate();
    });
}

function animate() {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();