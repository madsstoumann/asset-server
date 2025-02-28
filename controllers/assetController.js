import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Helper function to generate consistent directory path from SKU
function getAssetDirectoryPath(sku) {
  const chunkedPath = [];
  
  // Process SKU in chunks of 2 characters
  for (let i = 0; i < sku.length; i += 2) {
    if (i + 2 <= sku.length) {
      // Get each 2-character chunk
      chunkedPath.push(sku.substring(i, i + 2));
    } else if (i < sku.length) {
      // Handle odd-length SKUs by padding the last char with 0
      chunkedPath.push(sku.substring(i) + '0');
    }
  }
  
  // If SKU is too short, pad with leading directories
  // but don't add more than 3 total levels
  while (chunkedPath.length > 0 && chunkedPath.length < 3) {
    chunkedPath.unshift('00');
  }
  
  // Add the full SKU as the final directory
  const dirPath = [...chunkedPath, sku];
  return path.join('assets', ...dirPath);
}

// Get asset by ID with optional dimensions and DPI
export const getAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { width, height, dpi } = req.query;
    
    // Use the helper function to get the directory path
    const dir = getAssetDirectoryPath(id);
    
    // Check if directory exists
    if (!fs.existsSync(dir)) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    // Read directory to find files
    const files = fs.readdirSync(dir);
    
    // Look for default file first, then take the first one
    let assetFile = files.find(file => file.includes('default')) || files[0];
    
    if (!assetFile) {
      return res.status(404).json({
        success: false,
        message: 'No assets found for this ID'
      });
    }
    
    const filePath = path.join(dir, assetFile);
    const fileExt = path.extname(filePath).toLowerCase();
    
    // For image files, apply resizing if requested
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExt) && (width || height || dpi)) {
      const resizeOptions = {};
      
      if (width) resizeOptions.width = parseInt(width);
      if (height) resizeOptions.height = parseInt(height);
      
      // Set DPI metadata if specified
      const metadata = dpi ? { density: parseInt(dpi) } : {};
      
      // Process the image
      const imageBuffer = await sharp(filePath)
        .resize(resizeOptions)
        .withMetadata(metadata)
        .toBuffer();
      
      // Set appropriate content type
      res.set('Content-Type', `image/${fileExt.substring(1)}`);
      return res.send(imageBuffer);
    }
    
    // For non-image files or no resize requested, send the file directly
    res.sendFile(path.resolve(filePath));
    
  } catch (error) {
    console.error('Error getting asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve asset',
      error: error.message
    });
  }
};

// Upload a new asset
export const uploadAsset = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded'
      });
    }
    
    const { id } = req.params;
    const filePath = req.file.path;
    const tags = req.validatedTags || [];
    
    console.log('Tags received in controller:', tags);
    console.log('File saved as:', path.basename(filePath));
    
    // Create metadata
    const assetMetadata = {
      id,
      filename: path.basename(filePath),
      originalname: req.file.originalname,
      path: filePath.replace(/\\/g, '/'),
      tags,
      uploadDate: new Date().toISOString()
    };

    // Save metadata
    const metadataPath = path.join(path.dirname(filePath), 'metadata.json');
    
    // Check if metadata.json exists already
    let existingMetadata = { assets: [] };
    if (fs.existsSync(metadataPath)) {
      try {
        existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (!existingMetadata.assets) {
          existingMetadata.assets = [];
        }
      } catch (err) {
        console.error('Error parsing existing metadata:', err);
      }
    }

    // Write metadata - merge with existing if needed
    fs.writeFileSync(metadataPath, JSON.stringify({
      ...existingMetadata,
      assets: [...existingMetadata.assets, assetMetadata]
    }, null, 2));
    
    res.status(201).json({
      success: true,
      message: 'Asset uploaded successfully',
      asset: assetMetadata
    });
    
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload asset',
      error: error.message
    });
  }
};

// Get list of assets in a specific folder
export const getAssetList = (req, res) => {
  try {
    const { id } = req.params;
    const dir = getAssetDirectoryPath(id);
    
    if (!fs.existsSync(dir)) {
      return res.status(404).json({
        success: false,
        message: 'Asset folder not found'
      });
    }
    
    const files = fs.readdirSync(dir);
    const metadataPath = path.join(dir, 'metadata.json');
    let metadataContent = { assets: [] };
    
    // Load metadata file if it exists
    if (fs.existsSync(metadataPath)) {
      try {
        const rawData = fs.readFileSync(metadataPath, 'utf8');
        console.log('Raw metadata content:', rawData);
        metadataContent = JSON.parse(rawData);
        if (!metadataContent.assets) metadataContent.assets = [];
      } catch (err) {
        console.error('Error reading metadata:', err);
      }
    }
    
    // Get details for each file, excluding metadata.json
    const assets = files
      .filter(file => file !== 'metadata.json')
      .map(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        // Find asset metadata by matching filename
        const assetMetadata = metadataContent.assets.find(a => {
          if (!a) return false;
          return a.filename === file || a.path.endsWith(file);
        });
        
        console.log(`File ${file}:`, assetMetadata ? `Metadata found: ${JSON.stringify(assetMetadata.tags)}` : 'No metadata found');
        
        // Get tags from metadata if available
        const tags = assetMetadata?.tags || [];
        
        return {
          name: file,
          path: filePath.replace(/\\/g, '/'),
          size: stats.size,
          tags,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      });
    
    res.json({
      success: true,
      count: assets.length,
      assets
    });
    
  } catch (error) {
    console.error('Error listing assets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve asset list',
      error: error.message
    });
  }
};

/**
 * Update tags for an existing asset
 */
export const updateAssetTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename } = req.body;
    const tags = req.validatedTags || [];
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    console.log(`Updating tags for ${filename} to:`, tags);
    
    // Get directory path
    const dir = getAssetDirectoryPath(id);
    const metadataPath = path.join(dir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        success: false,
        message: 'Asset metadata not found'
      });
    }

    // Read and parse existing metadata
    let metadata = { assets: [] };
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (!metadata.assets) metadata.assets = [];
    } catch (err) {
      console.error('Error reading metadata:', err);
    }
    
    // Find the asset in the metadata
    const assetIndex = metadata.assets.findIndex(asset => 
      asset && (asset.filename === filename || asset.path.includes(filename))
    );
    
    if (assetIndex === -1) {
      console.log('No matching asset found in metadata');
      
      // Asset not found in metadata, create new entry
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        metadata.assets.push({
          id,
          filename,
          path: filePath.replace(/\\/g, '/'),
          tags,
          updateDate: new Date().toISOString()
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Asset file not found'
        });
      }
    } else {
      // Update tags for the existing asset
      console.log(`Found asset at index ${assetIndex}, updating tags`);
      metadata.assets[assetIndex].tags = tags;
      metadata.assets[assetIndex].updateDate = new Date().toISOString();
    }
    
    // Save updated metadata
    console.log('Saving updated metadata:', JSON.stringify(metadata, null, 2));
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return res.json({
      success: true,
      message: 'Tags updated successfully',
      tags
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};