import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to get asset directory path (similar to controller)
function getAssetDirectoryPath(sku) {
  const chunkedPath = [];
  
  // Process SKU in chunks of 2 characters
  for (let i = 0; i < sku.length; i += 2) {
    if (i + 2 <= sku.length) {
      chunkedPath.push(sku.substring(i, i + 2));
    } else if (i < sku.length) {
      chunkedPath.push(sku.substring(i) + '0');
    }
  }
  
  // If SKU is too short, pad with leading directories
  while (chunkedPath.length > 0 && chunkedPath.length < 3) {
    chunkedPath.unshift('00');
  }
  
  // Add the full SKU as the final directory
  const dirPath = [...chunkedPath, sku];
  return path.join('assets', ...dirPath);
}

// Custom storage strategy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Get product ID from parameters
      const { id } = req.params;
      console.log(`Storing files for SKU ${id} in: ${getAssetDirectoryPath(id)}`);
      
      const dir = path.join(process.cwd(), getAssetDirectoryPath(id));
      
      // Create directory if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
      
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Get product ID from parameters
      const { id } = req.params;
      const dir = path.join(process.cwd(), getAssetDirectoryPath(id));
      
      // Extract original filename and extension
      const originalName = path.parse(file.originalname).name;
      const extension = path.extname(file.originalname);
      
      // Check if a file with the same name already exists
      const originalFullPath = path.join(dir, `${originalName}${extension}`);
      
      if (fs.existsSync(originalFullPath)) {
        // If file exists, add timestamp and random number to ensure uniqueness
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000000000);
        const newFilename = `${originalName}-${timestamp}-${randomNum}${extension}`;
        console.log(`File ${originalName}${extension} already exists, using ${newFilename}`);
        cb(null, newFilename);
      } else {
        // If file doesn't exist, use original name
        console.log(`Using original filename: ${originalName}${extension}`);
        cb(null, `${originalName}${extension}`);
      }
    } catch (error) {
      cb(error);
    }
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Get allowed types from query parameters or environment variable
  const allowedTypes = process.env.ALLOWED_TYPES
    ? process.env.ALLOWED_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10') * 1024 * 1024 // Default 10MB
  }
});

// Export file-related utilities
export default {
  upload,
  getAssetDirectoryPath
};
