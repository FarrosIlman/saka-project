const express = require('express');
const router = express.Router();
const {
  getLevelComments,
  createComment,
  addReply,
  markHelpful,
  deleteComment,
  deleteReply,
  getAllCommentsForAdmin,
  bulkDeleteComments,
} = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateObjectId, validateStringInput } = require('../middleware/validationMiddleware');

// Admin moderation routes
router.get('/admin/all', protect, adminOnly, getAllCommentsForAdmin);
router.post('/admin/bulk-delete', protect, adminOnly, bulkDeleteComments);

// Public / Student comment routes
router.get('/level/:levelId', getLevelComments);
router.post('/', protect, validateStringInput('content'), createComment);
router.post('/:commentId/reply', protect, validateObjectId('commentId'), validateStringInput('content'), addReply);
router.put('/:commentId/helpful', protect, validateObjectId('commentId'), markHelpful);
router.delete('/:commentId', protect, validateObjectId('commentId'), deleteComment);
router.delete('/:commentId/reply/:replyId', protect, validateObjectId('commentId'), validateObjectId('replyId'), deleteReply);

module.exports = router;
