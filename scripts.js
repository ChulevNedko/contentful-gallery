// Replace with your Contentful Space ID and Access Token
const SPACE_ID = 'your_space_id';
const ACCESS_TOKEN = 'your_access_token';

// Initialize Contentful client
const client = contentful.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN
});

// Fetch images from Contentful
client.getEntries({ content_type: 'galleryImage' })
  .then((response) => {
    const images = response.items;
    displayImages(images);
  })
  .catch((error) => console.error('Error fetching images:', error));

// Function to display images in the gallery
function displayImages(images) {
  const gallery = document.getElementById('gallery');

  images.forEach((image) => {
    const imageUrl = image.fields.image.fields.file.url;
    const title = image.fields.title || 'Untitled';
    const description = image.fields.description || '';

    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
      <img src="https:${imageUrl}" alt="${title}">
      <div class="info">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;

    gallery.appendChild(galleryItem);
  });
}
