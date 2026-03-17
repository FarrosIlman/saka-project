const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
  getAllLevels,
  getStudentLevels,
  getLevelQuestions,
  checkAnswer,
  createLevel,
  updateLevel,
  deleteLevel,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/levelController');

// Student routes (protected)
router.get('/student', protect, getStudentLevels);
router.get('/:levelNumber/questions/student', protect, getLevelQuestions);
router.post('/quiz/check-answer', protect, checkAnswer);

// Admin routes (protected + admin only)
router.get('/', protect, adminOnly, getAllLevels);
router.post('/', protect, adminOnly, createLevel);
router.put('/:levelId', protect, adminOnly, validateObjectId('levelId'), updateLevel);
router.delete('/:levelId', protect, adminOnly, validateObjectId('levelId'), deleteLevel);
router.post('/:levelId/questions', protect, adminOnly, validateObjectId('levelId'), createQuestion);
router.put('/questions/:questionId', protect, adminOnly, validateObjectId('questionId'), updateQuestion);
router.delete('/questions/:questionId', protect, adminOnly, validateObjectId('questionId'), deleteQuestion);

module.exports = router;