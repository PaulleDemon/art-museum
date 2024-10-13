import Cropper from "cropperjs";
import { uploadItem } from "./services";

const uploadModal = document.getElementById("upload-modal")

const uploadContainer = document.getElementById('upload-container');
const uploadInput = document.getElementById('upload-input');
const uploadText = document.getElementById('upload-text');
const uploadPreview = document.getElementById('upload-preview');

const uploadSubmit = document.getElementById("upload-btn");

const uploadCropper = document.getElementById("upload-cropper")

const toastAlert = document.getElementById("toast-alert");

let cropper;


toastAlert.style.display = "none"

let file = null;


export function toastMessage(message){

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


export function displayUploadModal() {
    uploadModal.style.display = "block";
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

        if (!file){
            return toastMessage("Select an image.")
        }

        cropper.destroy();
        uploadItem(file, uploadTitle.value, uploadDescription.value, uploadHandle.value, null, 0, 0)
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



    uploadModal.style.display = "none";

}

function handleFile(file) {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadPreview.src = e.target.result;
            uploadPreview.style.display = 'block';
            uploadText.style.display = 'none'; // Hide the text once an image is uploaded

            // Initialize Cropper.js
            if (cropper) {
                cropper.destroy(); // Destroy previous instance if exists
            }

            document.getElementById("upload-cropper-container").style.display = 'block'

            cropper = new Cropper(uploadPreview, {
                viewMode: 1,
                aspectRatio: 16 / 9,
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