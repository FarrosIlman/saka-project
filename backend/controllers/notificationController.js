const Notification = require('../models/Notification');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;

    let query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error marking notification' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error deleting notification' });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create notification (internal use / admin)
// @route   POST /api/notifications/create
// @access  Private (should be internal API call)
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data = {}, priority = 'medium', icon = 'info' } = req.body;

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      priority,
      icon,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created',
      notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error creating notification' });
  }
};

// @desc    Clear expired notifications
// @route   DELETE /api/notifications/cleanup/expired
// @access  Private (admin only)
exports.clearExpiredNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'Expired notifications cleared',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear expired error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
