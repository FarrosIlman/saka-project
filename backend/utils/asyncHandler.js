/**
 * Async handler to wrap async route functions and pass errors to Express error handling middleware.
 * Eliminates the need for repetitive try-catch blocks in controllers.
 * 
 * @param {Function} fn - Async express middleware/controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
