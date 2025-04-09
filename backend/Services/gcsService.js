const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Google Cloud Storage Configuration
const storage = new Storage({
    keyFilename: path.join(__dirname, 'spacifyd-f8b8f586d425.json')
});
const bucketName = 'spacifyd_bucket';

async function uploadMultipleImagesToGCS(images, id, type = 'product') {
    try {
        const uploadedUrls = [];
        for (let i = 0; i < images.length; i++) {
            try {
                // Dynamically detect extension from the image data
                let extension = 'png'; // Default
                const mimeTypeMatch = images[i].match(/data:image\/([a-zA-Z0-9]+);base64/);
                if (mimeTypeMatch && mimeTypeMatch[1]) {
                    extension = mimeTypeMatch[1];
                    // Convert jpeg to jpg for file extension
                    if (extension === 'jpeg') extension = 'jpg';
                }
               
                // Use type parameter to determine if it's a product or project
                const fileName = `${type}_${id}_img_${i}.${extension}`;
                
                // Set a timeout for the upload
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), 30000);
                });
                
                // Race the upload against the timeout
                const imageUrl = await Promise.race([
                    uploadImageToGCS(images[i], fileName),
                    timeoutPromise
                ]);
                
                uploadedUrls.push(imageUrl);
                
                // Add a small delay between uploads to prevent overwhelming the connection
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (imageError) {
                console.error(`Error uploading image ${i} for ${type} ${id}:`, imageError);
                // Instead of failing the entire batch, log the error and continue
                // You could also push a placeholder or default image URL here
                uploadedUrls.push(`ERROR_UPLOADING_IMAGE_${i}`);
            }
        }
        
        // If none of the images were uploaded successfully, throw an error
        if (uploadedUrls.length === 0) {
            throw new Error('Failed to upload any images');
        }
        
        return uploadedUrls;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw new Error('Failed to upload images: ' + error.message);
    }
}

// Also update the uploadImageToGCS function to handle timeouts better
async function uploadImageToGCS(base64Image, fileName) {
    try {
        // Check if the base64 string includes the data URL prefix
        let base64Data = base64Image;
        let contentType = 'image/png'; // Default content type
        
        // If the base64 string includes the data URL prefix (e.g., "data:image/jpeg;base64,...")
        if (base64Image.includes(';base64,')) {
            // Extract the content type from the data URL
            contentType = base64Image.split(';')[0].split(':')[1];
            // Extract just the base64 data part
            base64Data = base64Image.split(';base64,')[1];
        }
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');
        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        
        // Set upload options with a timeout
        const options = {
            metadata: { contentType: contentType },
            resumable: false, // Using non-resumable upload for smaller files
            timeout: 20000 // 20 second timeout
        };
        
        // Upload the file with the correct content type
        await file.save(buffer, options);
        
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        return publicUrl;
    } catch (error) {
        console.error('Error uploading to GCS:', error);
        console.error('Error details:', error.message);
        throw new Error('Failed to upload image: ' + error.message);
    }
}

async function generateSignedUrl(imageUrl, expirationMs = 1000 * 60 * 60 * 24) {
    try {
        // Extract the filename from the URL
        const fileName = imageUrl.split('/').pop();
        
        // Get the file reference
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        
        // Generate a signed URL
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + expirationMs,
        });
        
        return signedUrl;
    } catch (error) {
        console.error(`Error generating signed URL for image: ${imageUrl}`, error);
        // Return original URL if there's an error
        return imageUrl;
    }
}




module.exports = { uploadMultipleImagesToGCS,generateSignedUrl,uploadImageToGCS };