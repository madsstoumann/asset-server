import path from 'path';

// Document file extensions
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

// MIME types mapping
const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain'
};

/**
 * Check if a file is a document based on its extension
 * @param {string} filename - The filename to check
 * @returns {boolean} True if the file is a document
 */
export const isDocumentFile = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return DOCUMENT_EXTENSIONS.includes(extension);
};

/**
 * Get the MIME type for a document file
 * @param {string} filename - The filename to get MIME type for
 * @returns {string} The MIME type
 */
export const getDocumentMimeType = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return MIME_TYPES[extension] || 'application/octet-stream';
};
