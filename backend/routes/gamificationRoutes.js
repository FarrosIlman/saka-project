const express = require('express');
const router = express.Router();
const {
  getBadges,
  checkAndAwardBadges,
  getStreakInfo,
  claimDailyReward,
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/badges', protect, getBadges);
router.post('/check-badges/:userId', protect, checkAndAwardBadges);
router.get('/streak', protect, getStreakInfo);
router.post('/claim-daily-reward', protect, claimDailyReward);

module.exports = router;
