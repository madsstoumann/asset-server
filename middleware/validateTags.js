import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default tags to use if none are configured
const DEFAULT_TAGS = ['front', 'back', 'inside', 'spine'];

export const validateTags = (req, res, next) => {
  console.log('Raw request body:', JSON.stringify(req.body));
  
  // Get the allowed tags inside the function instead of at module scope
  const configuredTags = process.env.ALLOWED_TAGS
    ? process.env.ALLOWED_TAGS.split(',').map(tag => tag.trim())
    : [];
  
  // Use either configured tags or default tags if none are configured
  const effectiveTags = configuredTags.length > 0 ? configuredTags : DEFAULT_TAGS;
  
  console.log('Effective allowed tags:', effectiveTags);
  
  // Extract tags from request
  const tags = req.body.tags || [];
  console.log('Tags from request:', tags);
  
  // If no tags provided, continue
  if (!tags || !tags.length) {
    req.validatedTags = [];
    return next();
  }

  // Ensure tags is an array
  const tagArray = Array.isArray(tags) ? tags : [tags];
  
  // Check if all provided tags are allowed
  const invalidTags = tagArray.filter(tag => !effectiveTags.includes(tag));
  
  if (invalidTags.length) {
    console.log('Invalid tags found:', invalidTags);
    return res.status(400).json({
      success: false,
      message: `Invalid tags: ${invalidTags.join(', ')}. Allowed tags are: ${effectiveTags.join(', ')}`
    });
  }

  // Store validated tags in request object
  req.validatedTags = tagArray;
  console.log('Validated tags:', req.validatedTags);
  next();
};