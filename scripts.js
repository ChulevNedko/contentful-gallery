// Replace with your Contentful Space ID and Management API Token
const SPACE_ID = 'knjrsi0p38d7';
const MANAGEMENT_TOKEN = 'CFPAT-2UQZjdMv3hkSteVsqJMugbUttGphxVtoya9Qc09b0Fc';
const DELIVERY_ACCESS_TOKEN = '0HiJ_QyDreZxamVaC8PgHN7dqGrO0pN2Ap01ghJ2puU'

// Initialize Contentful client for fetching images
const client = contentful.createClient({
  space: SPACE_ID,
  accessToken: DELIVERY_ACCESS_TOKEN,
});

// Function to handle the file upload process
async function uploadFile(file) {
  const uploadUrl = `https://upload.contentful.com/spaces/${SPACE_ID}/uploads`;
  const assetUrl = `https://api.contentful.com/spaces/${SPACE_ID}/environments/master/assets`;

  try {
    // Step 1: Upload the file to Contentful
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();

    // Step 2: Create the asset entry
    const assetCreationResponse = await fetch(assetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
      },
      body: JSON.stringify({
        fields: {
          title: {
            'en-US': file.name,
          },
          file: {
            'en-US': {
              contentType: file.type,
              fileName: file.name,
              uploadFrom: {
                sys: {
                  type: 'Link',
                  linkType: 'Upload',
                  id: uploadData.sys.id,
                },
              },
            },
          },
        },
      }),
    });

    if (!assetCreationResponse.ok) {
      throw new Error(`Failed to create asset: ${assetCreationResponse.statusText}`);
    }

    const assetData = await assetCreationResponse.json();

    // Step 3: Publish the asset
    const publishUrl = `${assetUrl}/${assetData.sys.id}/published`;
    const publishResponse = await fetch(publishUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
        'X-Contentful-Version': assetData.sys.version,
      },
    });

    if (!publishResponse.ok) {
      throw new Error(`Failed to publish asset: ${publishResponse.statusText}`);
    }

    console.log('File uploaded and published successfully');
    document.getElementById('uploadStatus').innerText = 'Upload successful!';

    // Re-fetch and display images after successful upload
    fetchAndDisplayImages();
  } catch (error) {
    console.error('Error uploading file:', error);
    document.getElementById('uploadStatus').innerText = `Error: ${error.message}`;
  }
}

// Function to fetch images from Contentful and display them in the gallery
function fetchAndDisplayImages() {
  client
    .getEntries({ content_type: 'galleryImage' }) // Replace 'galleryImage' with your content type ID
    .then((response) => {
      const images = response.items;
      displayImages(images);
    })
    .catch((error) => console.error('Error fetching images:', error));
}

// Function to dynamically display images in the gallery
function displayImages(images) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = ''; // Clear the gallery before re-rendering

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

// Add event listener to the upload form
document.getElementById('uploadForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file) {
    uploadFile(file); // Call the function to upload the selected file
  } else {
    alert('Please select a file to upload.');
  }
});

// Fetch and display images on page load
fetchAndDisplayImages();
