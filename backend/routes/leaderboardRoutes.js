const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getLeaderboard,
  getUserAchievements,
  checkAndUnlockAchievements,
} = require('../controllers/leaderboardController');

// Public routes
router.get('/leaderboard', getLeaderboard);
router.get('/achievements/:userId', getUserAchievements);

// Admin only
router.post('/achievements/check/:userId', protect, adminOnly, checkAndUnlockAchievements);

module.exports = router;
