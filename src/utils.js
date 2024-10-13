import Cropper from "cropperjs";
import { uploadItem } from "./services";

import * as THREE from "three"

const uploadModal = document.getElementById("upload-modal")

const uploadContainer = document.getElementById('upload-container');
const uploadInput = document.getElementById('upload-input');
const uploadText = document.getElementById('upload-text');
const uploadPreview = document.getElementById('upload-preview');

const uploadSpinner = document.getElementById("upload-spinner")

const uploadSubmit = document.getElementById("upload-btn");

const cropperContainer = document.getElementById("upload-cropper-container")
const cropPreview = document.getElementById("crop-preview")

const cropBtn = document.getElementById("crop-btn")

const toastAlert = document.getElementById("toast-alert");
toastAlert.style.display = "none"

let cropper;
let file = null;
let cropAspectRatio = 1 / 1;

let uploadProperties = {
    museum: 0,
    img_id: null
}



export function toastMessage(message) {

    toastAlert.style.display = "flex";
    toastAlert.textContent = message;

    setTimeout(() => {
        toastAlert.style.display = "none"
    }, 3000)

}


export function closeUploadModal() {
    uploadModal.style.display = "none";
    uploadPreview.src = '';
    uploadPreview.style.display = 'none';
    uploadText.style.display = 'block';
    uploadInput.value = null; // Clear file input
}


export function displayUploadModal(cropAspect = 1 / 1, uploadProps) {
    uploadModal.style.display = "block";
    cropAspectRatio = cropAspect;

    uploadProperties = uploadProps;
    console.log("upload propers: ", uploadProps)
}

export function initUploadModal() {

    const uploadTitle = document.getElementById("upload-title")
    const uploadDescription = document.getElementById("upload-description")
    const uploadHandle = document.getElementById("upload-handle")

    const closeBtn = document.getElementById("upload-close")

    closeBtn.addEventListener("click", closeUploadModal)

    uploadContainer.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (event) => {
        file = event.target.files[0];
        handleFile(file);
    });

    uploadSubmit.addEventListener("click", () => {

        if (!file) {
            return toastMessage("Select an image.")
        }

        cropper.destroy();
        uploadSpinner.style.display = 'block';
        uploadSubmit.disabled = true;


        const {img_id, museum} = uploadProperties;

        uploadItem(file, uploadTitle.value, uploadDescription.value, uploadHandle.value, null, img_id, museum).then((res) =>{
            uploadSpinner.style.display = 'none';
            uploadSubmit.disabled = false;
            

            const uploadEvent = new CustomEvent("uploadevent", {
                                        detail:{
                                                    ...uploadProperties, 
                                                    title: uploadTitle.value,
                                                    description: uploadDescription.value,
                                                    name: uploadHandle.value,
                                                    img_url: URL.createObjectURL(file)
                                                }
                                            });

            document.body.dispatchEvent(uploadEvent)

            if (res.success){
                uploadModal.style.display = 'none';

                uploadTitle.value = "";
                uploadInput.value = null;
                uploadPreview.src = ""
                uploadPreview.style.display = 'none';
                uploadText.style.display = 'block';
                uploadDescription.value = "";
                uploadHandle.value = "";

            }


        }).catch((error) => {
            console.log("error 2: ", error.message)
            toastMessage(`${error.message}`)
            
            uploadSpinner.style.display = 'none';
            uploadSubmit.disabled = false;
        })
    })

    // Handle drag-and-drop
    uploadContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadContainer.classList.add('dragover');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('dragover');
    });

    uploadContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadContainer.classList.remove('dragover');

        file = event.dataTransfer.files[0];
        handleFile(file);
    });



    cropBtn.addEventListener("click", () => {
        const canvas = cropper.getCroppedCanvas();
        const croppedImageDataURL = canvas.toDataURL('image/jpeg');

        uploadPreview.src = croppedImageDataURL;
        uploadPreview.style.display = 'block';
        uploadText.style.display = 'none';

        cropperContainer.style.display = 'none';

        cropper.destroy(); // Destroy previous instance if exists


    })

    uploadModal.style.display = "none";

}

export function setCropAspectRatio(aspect) {
    cropAspectRatio = aspect
}

function handleFile(file) {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
        const reader = new FileReader();
        reader.onload = function (e) {

            cropPreview.src = e.target.result;
            // Initialize Cropper.js
            if (cropper) {
                cropper.destroy(); // Destroy previous instance if exists
            }

            cropperContainer.style.display = 'flex'

            cropper = new Cropper(cropPreview, {
                aspectRatio: cropAspectRatio,

                crop(event) {
                    // Optional: Handle crop events
                },
            });



        };
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a PNG or JPG image.');
    }
}



export function getMeshSizeInPixels(mesh, camera, renderer) {
    const vector = new THREE.Vector3();

    // Compute the bounding box of the mesh
    const boundingBox = new THREE.Box3().setFromObject(mesh);

    // Get the eight corners of the bounding box
    const vertices = [
        new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z), // Bottom-left-back
        new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z), // Bottom-left-front
        new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z), // Top-left-back
        new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z), // Top-left-front
        new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z), // Bottom-right-back
        new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z), // Bottom-right-front
        new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z), // Top-right-back
        new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z)  // Top-right-front
    ];

    // Project the bounding box corners to screen space
    const screenCoordinates = vertices.map(vertex => {
        vector.copy(vertex).project(camera);
        return {
            x: (vector.x + 1) * renderer.domElement.width / 2,
            y: (-vector.y + 1) * renderer.domElement.height / 2
        };
    });

    // Find the min and max screen coordinates to get the width and height in pixels
    const minX = Math.min(...screenCoordinates.map(coord => coord.x));
    const maxX = Math.max(...screenCoordinates.map(coord => coord.x));
    const minY = Math.min(...screenCoordinates.map(coord => coord.y));
    const maxY = Math.max(...screenCoordinates.map(coord => coord.y));

    const width = maxX - minX;
    const height = maxY - minY;

    return { width, height };
}