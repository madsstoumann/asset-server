import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory of current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Function to scan directories recursively
function scanDirectories(dir) {
  const allFiles = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of allFiles) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      scanDirectories(fullPath);
    } else if (file.name === 'metadata.json') {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        console.log(`\nMetadata file: ${fullPath}`);
        
        if (data.assets && Array.isArray(data.assets)) {
          data.assets.forEach((asset, index) => {
            console.log(`  Asset ${index + 1}: ${asset.filename || path.basename(asset.path || 'unknown')}`);
            console.log(`    Tags: ${(asset.tags && asset.tags.length) ? asset.tags.join(', ') : 'No tags'}`);
          });
        } else {
          console.log('  No assets array found in metadata');
        }
      } catch (err) {
        console.error(`Error reading metadata file ${fullPath}:`, err);
      }
    }
  }
}

// Start scanning from the assets directory
const assetsDir = path.join(rootDir, 'assets');
console.log(`Scanning for metadata files in ${assetsDir}...\n`);

if (fs.existsSync(assetsDir)) {
  scanDirectories(assetsDir);
} else {
  console.log('Assets directory not found');
}
