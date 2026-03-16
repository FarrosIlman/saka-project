const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  clearExpiredNotifications,
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get notifications
router.get('/', protect, getNotifications);
router.get('/unread/count', protect, getUnreadCount);

// Mark notifications
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Admin/Internal routes
router.post('/create', protect, createNotification);
router.delete('/cleanup/expired', protect, adminOnly, clearExpiredNotifications);

module.exports = router;
