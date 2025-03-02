import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import zlib from 'zlib';
import { promisify } from 'util';

const brotliCompress = promisify(zlib.brotliCompress);

// Get allowed widths from env
const allowedWidths = process.env.ALLOWED_WIDTHS 
  ? process.env.ALLOWED_WIDTHS.split(',').map(w => parseInt(w))
  : [200, 400, 800, 1200, 1600];

export const imageMiddleware = async (req, res, next) => {
  if (!req.query.w && !req.query.h) {
    return next();
  }

  try {
    const width = req.query.w ? parseInt(req.query.w) : null;

    // Validate width is allowed
    if (width && !allowedWidths.includes(width)) {
      return res.status(400).json({
        success: false,
        message: `Width must be one of: ${allowedWidths.join(', ')}`
      });
    }

    const assetPath = path.join('assets', req.path);
    const originalFilePath = path.join(process.cwd(), assetPath);

    // Check if file exists
    if (!fs.existsSync(originalFilePath)) {
      return next();
    }

    // Get original image metadata
    const metadata = await sharp(originalFilePath).metadata();
    
    // Check if requested width is larger than original
    if (width > metadata.width) {
      return res.status(400).json({
        success: false,
        message: `Requested width (${width}px) exceeds original image width (${metadata.width}px)`
      });
    }

    // Create cache directory path
    const dir = path.dirname(originalFilePath);
    const filename = path.basename(originalFilePath);
    const cacheDir = path.join(dir, width.toString());
    const cachedFilePath = path.join(cacheDir, filename);

    // Check if cached version exists
    if (fs.existsSync(cachedFilePath)) {
      // Serve cached file with Brotli compression if supported
      if (process.env.ENABLE_COMPRESSION === 'true' && 
          req.headers['accept-encoding']?.includes('br')) {
        const compressed = await brotliCompress(fs.readFileSync(cachedFilePath), {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: parseInt(process.env.COMPRESSION_LEVEL) || 11
          }
        });
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Content-Type', `image/${path.extname(filename).substring(1)}`);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(compressed);
      }
      return res.sendFile(cachedFilePath);
    }

    // Create cache directory if it doesn't exist
    fs.mkdirSync(cacheDir, { recursive: true });

    // Process and save the image
    const imageBuffer = await sharp(originalFilePath)
      .resize({ 
        width,
        withoutEnlargement: true
      })
      .toBuffer();

    // Save to cache
    fs.writeFileSync(cachedFilePath, imageBuffer);

    // Serve with Brotli compression if supported
    if (process.env.ENABLE_COMPRESSION === 'true' && 
        req.headers['accept-encoding']?.includes('br')) {
      const compressed = await brotliCompress(imageBuffer, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: parseInt(process.env.COMPRESSION_LEVEL) || 11
        }
      });
      res.setHeader('Content-Encoding', 'br');
      res.setHeader('Content-Type', `image/${path.extname(filename).substring(1)}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(compressed);
    }

    // If no compression, send regular response
    res.setHeader('Content-Type', `image/${path.extname(filename).substring(1)}`);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.send(imageBuffer);

  } catch (error) {
    console.error('Error processing image:', error);
    return next();
  }
};