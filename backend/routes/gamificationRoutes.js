const express = require('express');
const router = express.Router();
const {
  getBadges,
  checkAndAwardBadges,
  getStreakInfo,
  claimDailyReward,
  checkDailyRewardStatus,
  getLeaderboard,
  getDailyQuests,
  claimQuestReward,
  getHeartStatus,
  deductHeart,
  refillHearts,
  practiceToHeal,
  watchAdToHeal
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');

router.get('/badges', protect, getBadges);
router.post('/check-badges/:userId', protect, validateObjectId('userId'), checkAndAwardBadges);
router.get('/streak', protect, getStreakInfo);
router.get('/daily-reward-status', protect, checkDailyRewardStatus);
router.post('/claim-daily-reward', protect, claimDailyReward);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/quests', protect, getDailyQuests);
router.post('/quests/claim', protect, claimQuestReward);

router.get('/hearts/status', protect, getHeartStatus);
router.post('/hearts/deduct', protect, deductHeart);
router.post('/hearts/refill', protect, refillHearts);
router.post('/hearts/practice-heal', protect, practiceToHeal);
router.post('/hearts/watch-ad-heal', protect, watchAdToHeal);

module.exports = router;
