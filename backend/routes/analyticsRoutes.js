const express = require('express');
const router = express.Router();
const {
  getUserAnalytics,
  getDashboardStats,
  getLeaderboardAnalytics,
  awardPoints,
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User Analytics
router.get('/user', protect, getUserAnalytics);
router.post('/award-points', protect, adminOnly, awardPoints);

// Dashboard (admin)
router.get('/dashboard', protect, adminOnly, getDashboardStats);

// Leaderboard Analytics
router.get('/leaderboard', protect, getLeaderboardAnalytics);

module.exports = router;
