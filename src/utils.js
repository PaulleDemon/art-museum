const uploadModal = document.getElementById("upload-modal")

const uploadContainer = document.getElementById('upload-container');
const uploadInput = document.getElementById('upload-input');
const uploadText = document.getElementById('upload-text');
const uploadPreview = document.getElementById('upload-preview');

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
    
    const closeBtn = document.getElementById("upload-close")

    closeBtn.addEventListener("click", closeUploadModal)

    uploadContainer.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        handleFile(file);
    });

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

        const file = event.dataTransfer.files[0];
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
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a PNG or JPG image.');
    }
}