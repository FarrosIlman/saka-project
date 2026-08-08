const express = require('express');
const router = express.Router();
const { getProfile, updatePassword, updateProfile, updatePreferences, updateStatus, getAllUsers, completeTutorial, getUserCount } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route
router.get('/count', getUserCount);

// Protected routes - require authentication
router.get('/profile', protect, getProfile);
router.post('/update-password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/status', protect, updateStatus);
router.put('/tutorial-complete', protect, completeTutorial);

// Admin routes
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
