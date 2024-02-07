document.getElementById('upload-submit-button').addEventListener('click', (event) => {
    let file = document.getElementById('upload-file-input').files[0];
    let filename = file.name;

    let formData = new FormData();
    formData.append('file', file);

    fetch(`/upload/${filename}`, {
        method: 'POST',
        body: formData
    })
    .then((res) => {
        if (res.ok) {
            console.log('File uploaded successfully');
        } else {
            console.log('Error uploading file');
        }
    });
});


document.getElementById('download-button').addEventListener('click', (event) => {
    let filename = document.getElementById('download-filename-input').value;
    let img = document.getElementById('image-display');
    img.src = `/image/${filename}`;
});
