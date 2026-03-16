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

router.get('/level/:levelId', getLevelComments);
router.post('/', protect, createComment);
router.post('/:commentId/reply', protect, addReply);
router.put('/:commentId/helpful', protect, markHelpful);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
