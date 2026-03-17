const express = require('express');
const router = express.Router();
const {
  getBadges,
  checkAndAwardBadges,
  getStreakInfo,
  claimDailyReward,
  checkDailyRewardStatus,
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');

router.get('/badges', protect, getBadges);
router.post('/check-badges/:userId', protect, validateObjectId('userId'), checkAndAwardBadges);
router.get('/streak', protect, getStreakInfo);
router.get('/daily-reward-status', protect, checkDailyRewardStatus);
router.post('/claim-daily-reward', protect, claimDailyReward);

module.exports = router;
