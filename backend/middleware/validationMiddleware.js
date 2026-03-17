const { isValidObjectId } = require('mongoose');

/**
 * Middleware to validate ObjectId parameters
 * Usage: router.delete('/:commentId', validateObjectId('commentId'), protect, deleteComment);
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};

/**
 * Middleware to validate required body fields
 * Usage: validateBodyFields(['username', 'email'])(req, res, next)
 */
const validateBodyFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to sanitize and validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  let { limit = 10, page = 1 } = req.query;

  limit = parseInt(limit);
  page = parseInt(page);

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      message: 'Limit must be a number between 1 and 100',
    });
  }

  if (isNaN(page) || page < 1) {
    return res.status(400).json({
      message: 'Page must be a positive number',
    });
  }

  // Attach sanitized values to request
  req.query.limit = limit;
  req.query.page = page;

  next();
};

/**
 * Middleware to validate string input (XSS prevention)
 */
const validateStringInput = (fieldName) => {
  return (req, res, next) => {
    const value = req.body[fieldName];

    // Check if field exists and is a string
    if (value && typeof value !== 'string') {
      return res.status(400).json({
        message: `${fieldName} must be a string`,
      });
    }

    // Check for empty string after trim
    if (value && value.trim().length === 0) {
      return res.status(400).json({
        message: `${fieldName} cannot be empty`,
      });
    }

    // Prevent very large strings (potential DoS)
    if (value && value.length > 5000) {
      return res.status(400).json({
        message: `${fieldName} is too long (max 5000 characters)`,
      });
    }

    next();
  };
};

module.exports = {
  validateObjectId,
  validateBodyFields,
  validatePagination,
  validateStringInput,
};
