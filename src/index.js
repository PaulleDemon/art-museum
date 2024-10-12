
import "./style/index.css"

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import FirstPersonPlayer from './control';
import AnnotationDiv from "./annotationDiv";

import { closeUploadModal, displayUploadModal, initUploadModal } from "./utils";

const clock = new THREE.Clock();
const scene = new THREE.Scene();

let model = null;

const STEPS_PER_FRAME = 5;
let fpView;
let gallery_mesh;
let annotations = []

initUploadModal()

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

const cssRenderer = new CSS2DRenderer();
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
// cssRenderer.domElement.style.zIndex = 1000;
cssRenderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(cssRenderer.domElement);

const css3dRenderer = new CSS3DRenderer();
css3dRenderer.domElement.style.position = 'absolute';
css3dRenderer.domElement.style.top = '0';
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(css3dRenderer.domElement);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setAnimationLoop(animate);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);




window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    css3dRenderer.setSize(container.clientWidth, container.clientHeight);

}

container.addEventListener("keydown", (e) => {

    if (e.key === "Shift"){
        hideAnnotations()
    }

})

container.addEventListener("keyup", (e) => {

    if (e.key === "Shift"){
        showAnnotations()
    }

})



const loader = new GLTFLoader().setPath('/assets/');


loader.load('art_gallery2/scene.gltf', (gltf) => {

    model = gltf
    scene.add(gltf.scene);

    let count = 0;
    annotations = []
    gltf.scene.traverse((child) => {

        if (child.name === "art_gallery") {
            gallery_mesh = child
        }

        if (child.isMesh && /^art_holder\d*$/.test(child.name)) {  // Regex to match "art_holder", "art_holder1", "art_holder2", etc.
            count += 1;
            // Create an annotation div element
            
            // annotationDiv.style.width = `50px`

            const box = new THREE.Box3().setFromObject(child);
            const center = new THREE.Vector3();
            box.getCenter(center);  // Get the center of the bounding box in world coordinates
            
            // const annotationDiv = createAnnotationDiv(count)
            const annotationDiv = new AnnotationDiv(count, count)
            const label = new CSS2DObject(annotationDiv.getElement())
            // center.copy(label.position)
            label.position.set(center.x, center.y, center.z)

            annotations.push(label)

            annotationDiv.onAnnotationClick = ({event, id}) => {
                const targetPosition = label.position;

                // Vector from camera to the target position
                const direction = new THREE.Vector3();
                direction.subVectors(targetPosition, camera.position).normalize();

                // Set the desired distance from the target
                const distance = 2; // Adjust this to set how close you want the camera to get

                // Move the camera closer to the target
                camera.position.addScaledVector(direction, distance);

                // Ensure the camera looks at the target
                camera.lookAt(targetPosition);
            }

            annotationDiv.onAnnotationDblClick = ({event, id}) => {
                displayUploadModal()
            }

            scene.add(label);
            // annotations.push({ label, center, object: child }); 
        }
    });


    // gltf.scene.traverse(child => {

    //     if (child.isMesh) {

    //         child.castShadow = true;
    //         child.receiveShadow = true;

    //         if (child.material.map) {

    //             child.material.map.anisotropy = 4;

    //         }

    //     }
    // });

    onWindowResize();

    fpView = new FirstPersonPlayer(camera, scene, container)

    fpView.loadOctaTree(gltf.scene)
    // worldOctree.fromGraphNode(gltf.scene);

    fpView.updatePlayer(0.01);

});


function hideAnnotations(){
    annotations.forEach(lbl => {
        lbl.element.style.opacity = "0"
    })
}

function showAnnotations(){
    annotations.forEach(lbl => {
        lbl.element.style.opacity = "100"
    })
}


function updateAnnotations() {
    // Update the camera's position each frame
    camera.getWorldPosition(camera.position);
    model?.scene.traverse((child) => {
        if (child.isMesh && /^art_holder\d*$/.test(child.name)) {
            const box = new THREE.Box3().setFromObject(child);
            const center = new THREE.Vector3();
            box.getCenter(center);

            // Create a ray from the camera to the annotation
            const direction = center.clone().sub(camera.position).normalize();
            raycaster.set(camera.position, direction);

            // Check for intersections with other meshes
            const intersects = raycaster.intersectObjects(model.scene.children, true);
            let isOccluded = false;

            // Check if the first intersection is closer than the annotation distance
            if (intersects.length > 0) {
                const distanceToFirstObject = intersects[0].distance;
                const distanceToAnnotation = camera.position.distanceTo(center);

                if (distanceToFirstObject < distanceToAnnotation) {
                    isOccluded = true;
                }
            }

            // Find the corresponding label and set visibility
            const annotationLabel = child.annotationLabel; // Assuming you store a reference to the annotation in the mesh
            if (annotationLabel) {
                annotationLabel.visible = !isOccluded; // Show/hide based on occlusion
            }
        }
    });
}


function animate() {

    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for (let i = 0; i < STEPS_PER_FRAME; i++) {

        fpView?.update(deltaTime)
    }

    // updateAnnotations()
    // checkAnnotationVisibility();
    cssRenderer.render(scene, camera);
    css3dRenderer.render(scene, camera);
    renderer.render(scene, camera);

    // stats.update();

}