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
        'Content-Type': 'application/octet-stream',
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

    // Step 3: Wait for Asset Processing
    const assetId = assetData.sys.id;
    const assetProcessingUrl = `${assetUrl}/${assetId}/files/en-US/process`;
    const processingResponse = await fetch(assetProcessingUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
      },
    });

    if (!processingResponse.ok) {
      throw new Error(`Failed to process asset: ${processingResponse.statusText}`);
    }

    // Step 4: Publish the asset
    const publishUrl = `${assetUrl}/${assetId}/published`;
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
    fetchAndDisplayTimeline();
  } catch (error) {
    console.error('Error uploading file:', error);
    document.getElementById('uploadStatus').innerText = `Error: ${error.message}`;
  }
}

// Function to fetch images from Contentful and format them for TimelineJS
function fetchAndDisplayTimeline() {
  client
    .getEntries({ content_type: 'galleryImage' }) // Replace 'galleryImage' with your content type ID
    .then((response) => {
      const events = response.items.map((item) => {
        const imageUrl = item.fields.image.fields.file.url;
        const title = item.fields.title || 'Untitled';
        const description = item.fields.description || '';
        const date = item.fields.date || new Date().toISOString().split('T')[0]; // Use a custom date field or default to today's date

        return {
          start_date: {
            year: new Date(date).getFullYear(),
            month: new Date(date).getMonth() + 1,
            day: new Date(date).getDate(),
          },
          text: {
            headline: title,
            text: description,
          },
          media: {
            url: `https:${imageUrl}`,
            thumbnail: `https:${imageUrl}`,
          },
        };
      });

      const timelineData = {
        title: {
          text: {
            hea
