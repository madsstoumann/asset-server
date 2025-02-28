const allowedTags = process.env.ALLOWED_TAGS
  ? process.env.ALLOWED_TAGS.split(',').map(tag => tag.trim())
  : [];

export const validateTags = (req, res, next) => {
  const tags = req.body.tags || [];
  
  // If no tags provided, continue
  if (!tags.length) {
    return next();
  }

  // Ensure tags is an array
  const tagArray = Array.isArray(tags) ? tags : [tags];
  
  // Check if all provided tags are allowed
  const invalidTags = tagArray.filter(tag => !allowedTags.includes(tag));
  
  if (invalidTags.length) {
    return res.status(400).json({
      success: false,
      message: `Invalid tags: ${invalidTags.join(', ')}. Allowed tags are: ${allowedTags.join(', ')}`
    });
  }

  // Store validated tags in request object
  req.validatedTags = tagArray;
  next();
};