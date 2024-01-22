document.getElementById('download').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    fetch('/download', {
        method: 'GET',
    })
    .then(response => response.blob()) // A blob is a file-like object of immutable, raw data
    .then(blob => {
        const img = document.createElement('img');
        // Creates a URL representing the blob. The URL lifetime is tied to the document in the window on which it was created
        img.src = URL.createObjectURL(blob);
        document.body.appendChild(img);
        
    })
    .catch(error => console.error('Error:', error));
});