const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  exportProgressCSV,
  exportProgressPDF,
  exportUsersCSV,
  exportLeaderboardCSV,
} = require('../controllers/exportController');

const router = express.Router();

// Student routes - export own data
router.get('/progress/csv', protect, exportProgressCSV);
router.get('/progress/pdf', protect, exportProgressPDF);

// Admin routes - export all data
router.get('/users/csv', protect, exportUsersCSV);
router.get('/leaderboard/csv', protect, exportLeaderboardCSV);

module.exports = router;
