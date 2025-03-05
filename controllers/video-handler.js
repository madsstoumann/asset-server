import path from 'path';
import fs from 'fs';
import { createSimplePoster } from '../utils/simple-poster.js';

/**
 * Generate a poster image for a video file
 * 
 * @param {string} videoFilePath - Path to the video file
 * @returns {Promise<string|null>} Path to the generated poster or null if failed
 */
export async function createPosterImage(videoFilePath) {
  try {
    const videoDir = path.dirname(videoFilePath);
    const videoName = path.basename(videoFilePath, path.extname(videoFilePath));
    const posterPath = path.join(videoDir, `${videoName}-poster.jpg`);
    
    // Use the simple SVG poster instead of the complex canvas approach
    // This avoids issues with the mp4box library
    const svgPosterPath = createSimplePoster(videoFilePath, posterPath);
    
    console.log(`Generated poster for ${videoName} at ${svgPosterPath || posterPath}`);
    return svgPosterPath || posterPath;
    
  } catch (error) {
    console.error(`Failed to generate poster for ${videoFilePath}:`, error);
    return null;
  }
}
