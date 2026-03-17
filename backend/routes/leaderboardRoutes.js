const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');
const {
  getLeaderboard,
  getUserAchievements,
  checkAndUnlockAchievements,
} = require('../controllers/leaderboardController');

// Public routes
router.get('/leaderboard', getLeaderboard);
router.get('/achievements/:userId', validateObjectId('userId'), getUserAchievements);

// Admin only
router.post('/achievements/check/:userId', protect, adminOnly, validateObjectId('userId'), checkAndUnlockAchievements);

module.exports = router;
