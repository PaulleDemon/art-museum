
import "./style/index.css"

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import FirstPersonPlayer from './control';
import AnnotationDiv from "./annotationDiv";

import { closeUploadModal, displayUploadModal, getMeshSizeInPixels, initUploadModal, setCropAspectRatio } from "./utils";
import { getMuseumList } from "./services";
import ImageMaterial from "./imageTexture";
import { Museum } from "./constants";

const clock = new THREE.Clock();
const scene = new THREE.Scene();

let model = null;

const STEPS_PER_FRAME = 5;
let fpView;
let gallery_mesh;
let annotationMesh = {}

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


/**
 * 
 * @param {THREE.Mesh} mesh 
 * @param {string} imgUrl 
 */
function setImageToMesh2(mesh, imgUrl){

    
    // mesh.updateMatrix()
    // console.log("CSS3d: ", mesh.position, mesh.name, mesh.rotation, mesh.scale)

    // Add it to the scene
    // scene.add(css3DObject);
    

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imgUrl, (texture) => {

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    
        // Create a material with the texture
        const material = new THREE.MeshBasicMaterial({ map: texture });
    
        // Create your mesh (e.g., a box)
        // const geometry = new THREE.BoxGeometry(1, 1, 1); // Example geometry
        // const mesh = new THREE.Mesh(geometry, material);
        // scene.add(mesh);
    
        // Function to adjust texture to fit the mesh size
        function adjustTextureToFitMesh(mesh, texture) {
            // Compute the mesh size dynamically using the bounding box
            const boundingBox = new THREE.Box3().setFromObject(mesh);
            const size = boundingBox.getSize(new THREE.Vector3()); // Get size (width, height, depth)
    
            // Get the texture dimensions
            const textureWidth = texture.image.width;   // Original texture width
            const textureHeight = texture.image.height; // Original texture height
    
            // Calculate aspect ratios
            const meshAspect = size.x / size.y;
            const textureAspect = textureWidth / textureHeight;
    
            // Determine scaling for the texture
            if (meshAspect > textureAspect) {
                // Mesh is wider than texture
                texture.repeat.set(size.x / textureWidth, size.x / textureWidth / textureAspect);
            } else {
                // Mesh is taller than texture
                texture.repeat.set(size.y / textureHeight * textureAspect, size.y / textureHeight);
            }
    
            // Center the texture if needed (optional)
            // texture.offset.set(0, 0);
            texture.offset.set(0.5 - (texture.repeat.x * 0.5), 0.5 - (texture.repeat.y * 0.5));
        }
    
        // Initial adjustment of the texture
        adjustTextureToFitMesh(mesh, texture);
    

        // const material = new THREE.MeshBasicMaterial({map: texture,  side: THREE.DoubleSide})

        mesh.material = material;
        // mesh.scale.x = texture.image.width
        // mesh.scale.y = texture.image.height
        mesh.material.needsUpdate = true
        console.log("mesh: ", texture.image, );

        // const textureWidth = texture.image.width;
        // const textureHeight = texture.image.height;
        // const aspectRatio = textureWidth / textureHeight;


        // Adjust decal size based on aspect ratio
        // let decalWidth, decalHeight;
        // if (aspectRatio > 1) {
        //     // Texture is wider than it is tall (landscape)
        //     decalWidth = 1 * aspectRatio;  // Scale width by aspect ratio
        //     decalHeight = 1;  // Keep height constant
        // } else {
        //     // Texture is taller than it is wide (portrait)
        //     decalWidth = 1;  // Keep width constant
        //     decalHeight = 1 / aspectRatio;  // Scale height inversely by aspect ratio
        // }
        // // Decal size, adjust the x and y values based on the aspect ratio
        // const decalSize = new THREE.Vector3(decalWidth, 1, decalHeight);

        // const decalPosition = new THREE.Vector3();
        // mesh.getWorldPosition(decalPosition);

        // // Create a rotation for the decal
        // const decalRotation = new THREE.Quaternion();
        // mesh.getWorldQuaternion(decalRotation);

        // const box = new THREE.Box3().setFromObject(mesh);
        // const center = new THREE.Vector3();
        // box.getCenter(center);  // Get the center of the bounding box in world coordinates
        


        // // Create the decal geometry using the mesh's properties
        // const decalGeometry = new DecalGeometry(mesh, center, decalRotation, decalSize);

        // // Create a material for the decal
        // const decalMaterial = new THREE.MeshPhongMaterial({
        //     map: texture,
        //     transparent: true,
        //     depthTest: true,
        //     polygonOffset: true,
        //     polygonOffsetFactor: - 4,
        //     depthWrite: false, // Ensure the decal shows correctly
        // });



        // // Create the decal mesh
        // const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
        // decalMesh.renderOrder = 1;

        // const helperGeometry = new THREE.SphereGeometry(0.1); // Adjust size as necessary
        // const helperMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        // const helperMesh = new THREE.Mesh(helperGeometry, helperMaterial);
        // helperMesh.position.copy(center); // Position it similarly
        // scene.add(helperMesh);

        // scene.add(decalMesh);
        // console.log("texture: ", texture, center, decalRotation)

        // Add the decal to the scene
        
    });
    
}



/**
 * 
 * @param {THREE.Mesh} mesh 
 * @param {string} imgUrl 
 */
function setImageToMesh(mesh, imgUrl){

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imgUrl, (texture) => {


        // texture.wrapS = THREE.ClampToEdgeWrapping; // Prevent horizontal mirroring
        // texture.wrapT = THREE.ClampToEdgeWrapping;

        // texture.flipY = true;

        const imageBounds = new THREE.Vector2(texture.image.width, texture.image.height);
    
        // Set the imageBounds uniform for the material
        ImageMaterial.uniforms.imageBounds.value.copy(imageBounds);
        ImageMaterial.uniforms.map.value = texture;


        mesh.material = ImageMaterial;
     
        mesh.material.needsUpdate = true

        
    });
    
}


document.body.addEventListener("uploadevent", (event) =>{

    console.log("event: ", event)

    const {img_id, title, description, img_url, price, name} = event.detail

    if (!(img_id in annotationMesh)){
        return
    }

    annotationMesh[img_id].annotationDiv.setAnnotationDetails(title, description, name)
    
    setImageToMesh(annotationMesh[img_id].mesh, img_url)

})


const loader = new GLTFLoader().setPath('/assets/');


loader.load('art_gallery2/scene.gltf', (gltf) => {

    model = gltf
    scene.add(gltf.scene);

    let count = 0;
    annotationMesh = {}
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
            const annotationDiv = new AnnotationDiv(count, child.name)
            const label = new CSS2DObject(annotationDiv.getElement())
            // center.copy(label.position)
            label.position.set(center.x, center.y, center.z)

            annotationMesh[child.name] = {label, annotationDiv, mesh: child}

            annotationDiv.onAnnotationDblClick = ({event, id}) => {
                const targetPosition = label.position;

                // Vector from camera to the target position
                const direction = new THREE.Vector3();
                direction.subVectors(targetPosition, camera.position).normalize();

                // Adjust this to set how close you want the camera to get
                const distance = 2; 
                // Move the camera closer to the target
                camera.position.addScaledVector(direction, distance);

                // Ensure the camera looks at the target
                camera.lookAt(targetPosition);
            }

            annotationDiv.onAnnotationClick = ({event, id}) => {
                const {width, height} = getMeshSizeInPixels(child, camera, renderer)
                displayUploadModal(width/height, {img_id: child.name, museum: Museum.ART_GALLERY})
                // setCropAspectRatio()
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
    getMuseumList(0).then((data) => {
        console.log("museum data: ", data)
        data.data.forEach((data) => {

            const {img_id, title, description, img_cid, price, name} = data

            if (!(img_id in annotationMesh)){
                return
            }

            annotationMesh[img_id].annotationDiv.setAnnotationDetails(title, description, name)
            
            setImageToMesh(annotationMesh[img_id].mesh, `https://gateway.pinata.cloud/ipfs/${img_cid}`)
        })
    })


});



function hideAnnotations(){
    Object.values(annotationMesh).forEach(({label, annotationDiv}) => {
        label.element.style.opacity = "0"
    })
}

function showAnnotations(){
    Object.values(annotationMesh).forEach(({label, annotationDiv}) => {
        label.element.style.opacity = "100"
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
    requestAnimationFrame(animate)


}
// renderer.setAnimationLoop(animate);

animate()