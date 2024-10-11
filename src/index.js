import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import FirstPersonPlayer from './control';


const clock = new THREE.Clock();

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x88ccee);
// scene.fog = new THREE.Fog(0x88ccee, 0, 50);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
camera.position.set(0, 10, 0)

const light = new THREE.AmbientLight("#fff", 5);
scene.add(light);


const container = document.getElementById('model-container');
container.tabIndex = 0;
container.focus()

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.innerWidth, container.innerHeight);
renderer.setAnimationLoop(animate);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const cssRenderer = new CSS2DRenderer();
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.setSize(container.innerWidth, container.innerHeight);
container.appendChild(cssRenderer.domElement);

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);


const STEPS_PER_FRAME = 5;

// FIXME: the model is only loaded when window is resized

const worldOctree = new Octree();

let fpView;

window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.setSize(container.innerWidth, container.innerHeight);

}


const loader = new GLTFLoader().setPath('/assets/');

loader.load('art_gallery/scene.gltf', (gltf) => {

    scene.add(gltf.scene);


    const annotationDiv = document.createElement('div');
    annotationDiv.className = 'annotation';
    annotationDiv.style.backgroundColor = "red";
    annotationDiv.textContent = '3D Annotation';
    annotationDiv.style.zIndex = 1000;

    const label = new CSS2DObject(annotationDiv);
    gltf.scene.add(label);
    label.position.set(1, 2, 1); // Position the label above the cube

    // camera.lookAt(label.position)

    // gltf.scene.traverse(child => {

    //     if (child.isMesh) {

    //         child.castShadow = true;
    //         child.receiveShadow = true;

    //         if (child.material.map) {

    //             child.material.map.anisotropy = 4;

    //         }

    //     }
    // });

    // const helper = new OctreeHelper(worldOctree);
    // helper.visible = false;
    // scene.add(helper);

    onWindowResize();

    fpView = new FirstPersonPlayer(camera, scene, container)

    fpView.loadOctaTree(gltf.scene)
    // worldOctree.fromGraphNode(gltf.scene);

    fpView.updatePlayer(0.01);


    // const gui = new GUI({ width: 200 });
    // gui.add({ debug: false }, 'debug')
    //     .onChange(function (value) {

    //         helper.visible = value;

    //     });

});



function animate() {

    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for (let i = 0; i < STEPS_PER_FRAME; i++) {

        fpView?.update(deltaTime)
    }

    cssRenderer.render(scene, camera);
    renderer.render(scene, camera);
    
    stats.update();

}