const fs = require('fs');
const path = require('path');

// Mock S3 functionality with local file storage
const uploadFileToS3 = async (file, folder = '') => {
  try {
    // Create folder if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    // Debug logging
    console.log('File upload attempt:');
    console.log('Original name:', file.originalname);
    console.log('Buffer size:', file.buffer ? file.buffer.length : 'No buffer');
    console.log('MIME type:', file.mimetype);
    console.log('Target filepath:', filepath);

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);
    
    // Verify file was written
    const fileExists = fs.existsSync(filepath);
    const fileSize = fileExists ? fs.statSync(filepath).size : 0;
    console.log('File written successfully:', fileExists);
    console.log('File size on disk:', fileSize);

    // Set permissions to ensure the file is readable
    fs.chmodSync(filepath, 0o644);

    // Return a URL-like path that can be used by the frontend
    const fileUrl = `http://localhost:5000/uploads/${folder}/${filename}`;
    console.log('Generated URL:', fileUrl);
    
    return fileUrl;
  } catch (error) {
    console.error('Error in uploadFileToS3:', error);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

const deleteFileFromS3 = async (fileUrl) => {
  try {
    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    
    const filepath = path.join(__dirname, '../uploads', folder, filename);
    
    // Delete file if it exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    return true;
  } catch (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};

module.exports = {
  uploadFileToS3,
  deleteFileFromS3
}; 