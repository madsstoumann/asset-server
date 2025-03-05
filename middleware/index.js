// Export all middleware modules
export { tags } from './tags.js';
export { upload } from './upload.js';
export { validation } from './validation.js';
export { imageMiddleware } from './image.js';
export { videoMiddleware, isVideoFile, getVideoMimeType } from './video.js';
export { isDocumentFile, getDocumentMimeType } from './document.js';

// Export default object with all middlewares
export default {
  tags,
  upload,
  validation,
  imageMiddleware,
  videoMiddleware
};
