import Cropper from "cropperjs";
import { uploadItem } from "./services";

import * as THREE from "three"

const uploadModal = document.getElementById("upload-modal")

const uploadContainer = document.getElementById('upload-container');
const uploadInput = document.getElementById('upload-input');
const uploadText = document.getElementById('upload-text');
const uploadPreview = document.getElementById('upload-preview');

const uploadTitle = document.getElementById("upload-title")
const uploadDescription = document.getElementById("upload-description")
const uploadHandle = document.getElementById("upload-handle")

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

    uploadTitle.value = "";
    uploadDescription.value = "";
    uploadHandle.value = "";
}


export function displayUploadModal(cropAspect = 1 / 1, uploadProps) {
    uploadModal.style.display = "block";
    cropAspectRatio = cropAspect;

    uploadProperties = uploadProps;
    console.log("upload propers: ", uploadProps)
}

export function initUploadModal() {

    console.log("init")

    const closeBtn = document.getElementById("upload-close")

    closeBtn.addEventListener("click", closeUploadModal)

    const openInput = () => {
        uploadInput.click();
    }

    const fileChange = (event) => {
        console.log("upload inpit: ", file)
        file = event.target.files[0];
        handleFile(file);
    }

    const submitCallback = () => {

        if (!file) {
            return toastMessage("Select an image.")
        }

        cropper.destroy();
        uploadSpinner.style.display = 'block';
        uploadSubmit.disabled = true;


        const { img_id, museum } = uploadProperties;

        uploadItem(file, uploadTitle.value, uploadDescription.value, uploadHandle.value, null, img_id, museum).then((res) => {
            uploadSpinner.style.display = 'none';
            uploadSubmit.disabled = false;


            const uploadEvent = new CustomEvent("uploadevent", {
                detail: {
                    ...uploadProperties,
                    title: uploadTitle.value,
                    description: uploadDescription.value,
                    name: uploadHandle.value,
                    img_url: URL.createObjectURL(file)
                }
            });

            document.body.dispatchEvent(uploadEvent)

            if (res.success) {
                closeUploadModal()

            }


        }).catch((error) => {
            console.log("error 2: ", error.message)
            toastMessage(`${error.message}`)

            uploadSpinner.style.display = 'none';
            uploadSubmit.disabled = false;
        })

    }

    uploadContainer.removeEventListener('click', openInput);
    uploadContainer.addEventListener('click', openInput);

    uploadInput.removeEventListener('change', fileChange);
    uploadInput.addEventListener('change', fileChange);

    uploadSubmit.removeEventListener("click", submitCallback)
    uploadSubmit.addEventListener("click", submitCallback)

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


    const cropCallback = () => {
        const canvas = cropper.getCroppedCanvas();
        console.log("File: ", file)
        const croppedImageDataURL = canvas?.toDataURL('image/jpeg');

        canvas?.toBlob((blob) => {
            if (blob) {
                // Create a File object from the Blob
                file = new File([blob], file.name, { type: file.type });
            }
        }, file.type)

        uploadPreview.src = croppedImageDataURL;
        uploadPreview.style.display = 'block';
        uploadText.style.display = 'none';

        cropperContainer.style.display = 'none';

        cropper.destroy(); // Destroy previous instance if exists

    }

    cropBtn.removeEventListener("click", cropCallback)
    cropBtn.addEventListener("click", cropCallback)

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
                rotatable: true,
                crop(event) {
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

    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);

    const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z)
    ];

    const min = new THREE.Vector2(Infinity, Infinity);
    const max = new THREE.Vector2(-Infinity, -Infinity);

    // Project each corner to screen space and find the min/max x and y coordinates
    corners.forEach(corner => {
        vector.copy(corner).project(camera);

        // Convert the normalized coordinates (-1 to 1) to pixel coordinates
        const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;

        min.x = Math.min(min.x, x);
        min.y = Math.min(min.y, y);
        max.x = Math.max(max.x, x);
        max.y = Math.max(max.y, y);
    });

    const width = max.x - min.x;
    const height = max.y - min.y;

    return { width, height };
}


export function calculateProjectedDimensions(geometry, camera, renderer) {
    const positionArray = geometry.getAttribute('position').array;
    
    // Variables to store the projected min and max values
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
  
    // Create a vector to hold the 3D position of each vertex
    const vertex = new THREE.Vector3();
  
    // Loop through each vertex and project it to 2D screen space
    for (let i = 0; i < positionArray.length; i += 3) {
      vertex.set(positionArray[i], positionArray[i + 1], positionArray[i + 2]);
      
      // Project the vertex to normalized device coordinates (NDC)
      vertex.project(camera);
  
      // Convert NDC to screen coordinates
      const halfWidth = renderer.domElement.clientWidth / 2;
      const halfHeight = renderer.domElement.clientHeight / 2;
  
      const screenX = (vertex.x * halfWidth) + halfWidth;
      const screenY = -(vertex.y * halfHeight) + halfHeight;  // Invert Y-axis
  
      // Update min and max values for width and height
      minX = Math.min(minX, screenX);
      maxX = Math.max(maxX, screenX);
      minY = Math.min(minY, screenY);
      maxY = Math.max(maxY, screenY);
    }
  
    // Calculate the projected width and height
    const projectedWidth = maxX - minX;
    const projectedHeight = maxY - minY;
  
    return { width: projectedWidth, height: projectedHeight };
  }