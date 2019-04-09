const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', () => {
    const reader = new FileReader();
    reader.onload = () => {
        const img = document.getElementsByTagName('img')[0];
        img.className = 'form__preview-imageUrl';
        img.src = reader.result;
    }
    reader.readAsDataURL(fileInput.files[0]);
});
