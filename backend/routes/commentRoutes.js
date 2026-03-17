const express = require('express');
const router = express.Router();
const {
  getLevelComments,
  createComment,
  addReply,
  markHelpful,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId, validateStringInput } = require('../middleware/validationMiddleware');

router.get('/level/:levelId', validateObjectId('levelId'), getLevelComments);
router.post('/', protect, validateStringInput('content'), createComment);
router.post('/:commentId/reply', protect, validateObjectId('commentId'), validateStringInput('content'), addReply);
router.put('/:commentId/helpful', protect, validateObjectId('commentId'), markHelpful);
router.delete('/:commentId', protect, validateObjectId('commentId'), deleteComment);

module.exports = router;
