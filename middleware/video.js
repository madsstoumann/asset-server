import fs from 'fs';
import path from 'path';

// Video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];

// MIME types mapping
const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
  '.m4v': 'video/x-m4v'
};

/**
 * Middleware for streaming video content with support for 206 Partial Content
 */
export const videoMiddleware = (req, res, next) => {
  try {
    // Check if the request path is for a video file
    const filePath = path.join(process.cwd(), req.path);
    const extension = path.extname(filePath).toLowerCase();
    
    if (!VIDEO_EXTENSIONS.includes(extension)) {
      return next(); // Not a video file, pass to next middleware
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(); // File doesn't exist, let next middleware handle it
    }
    
    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    
    // Check if Range header exists
    const range = req.headers.range;
    
    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Calculate chunk size
      const chunkSize = (end - start) + 1;
      
      // Set content headers for partial response
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      
      // Create read stream for the specific range and pipe to response
      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
      
      // Handle stream errors
      fileStream.on('error', (err) => {
        console.error(`Stream error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error streaming video file' });
        } else {
          res.end();
        }
      });
    } else {
      // No Range header, send the entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes' // Inform client that ranges are supported
      });
      
      // Stream the entire file
      fs.createReadStream(filePath).pipe(res);
    }
    
  } catch (error) {
    console.error(`Video middleware error: ${error.message}`);
    next(error);
  }
};

// Export additional utility functions that might be useful for controllers
export const isVideoFile = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(extension);
};

export const getVideoMimeType = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return MIME_TYPES[extension] || 'application/octet-stream';
};
