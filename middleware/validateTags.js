import dotenv from 'dotenv';

// Ensure environment is loaded
dotenv.config();

// Default tags if none are configured
const DEFAULT_TAGS = ['front', 'back', 'inside', 'spine'];

// Function to get allowed tags, called each time the middleware runs
function getEffectiveTags() {
  // Get from environment or use defaults
  const configuredTags = process.env.ALLOWED_TAGS
    ? process.env.ALLOWED_TAGS.split(',').map(tag => tag.trim())
    : [];
  
  return configuredTags.length > 0 ? configuredTags : DEFAULT_TAGS;
}

export const validateTags = (req, res, next) => {
  // Get the currently effective tags each time the middleware runs
  const effectiveTags = getEffectiveTags();
  
  console.log('=== validateTags middleware ===');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file ? { 
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype
  } : 'No file');
  console.log('Effective tags from config:', effectiveTags);
  
  let tags = [];
  
  // Try to get tags from the 'tag' field which can be single value or array
  if (req.body.tag) {
    console.log('Tags found in req.body.tag');
    // If it's an array, use it directly
    if (Array.isArray(req.body.tag)) {
      tags = req.body.tag;
    } else {
      // If it's a single value, put it in an array
      tags = [req.body.tag];
    }
    console.log('Tags extracted from req.body.tag:', tags);
  }
  // Try existing method as fallback
  else if (req.body.tags) {
    try {
      // If tags is a JSON string
      if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
        tags = JSON.parse(req.body.tags);
      } else {
        // Handle as direct value
        tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      }
      console.log('Tags extracted from req.body.tags:', tags);
    } catch (e) {
      console.error('Error parsing tags JSON:', e);
      tags = [];
    }
  }
  
  // If no tags provided, continue
  if (!tags || !tags.length) {
    console.log('No tags found in request');
    req.validatedTags = [];
    return next();
  }

  // Validate tags against allowed list
  console.log('Validating tags:', tags);
  console.log('Allowed tags:', effectiveTags);
  
  const invalidTags = tags.filter(tag => !effectiveTags.includes(tag));
  
  if (invalidTags.length) {
    console.log('Invalid tags found:', invalidTags);
    return res.status(400).json({
      success: false,
      message: `Invalid tags: ${invalidTags.join(', ')}. Allowed tags are: ${effectiveTags.join(', ')}`
    });
  }

  // Store validated tags
  req.validatedTags = tags;
  console.log('Final validated tags:', req.validatedTags);
  next();
};