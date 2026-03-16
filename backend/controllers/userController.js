const User = require('../models/User');
const Progress = require('../models/Progress');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user progress
    const progress = await Progress.findOne({ user: req.user.id });

    // Calculate stats from levelProgress array
    let totallevelsCompleted = 0;
    let totalScore = 0;
    
    if (progress && progress.levelProgress && progress.levelProgress.length > 0) {
      const completedLevels = progress.levelProgress.filter(lp => lp.status === 'completed');
      totallevelsCompleted = completedLevels.length;
      
      if (completedLevels.length > 0) {
        const sumScore = completedLevels.reduce((sum, level) => sum + (level.highScore || 0), 0);
        totalScore = Math.round(sumScore / completedLevels.length);
      }
    }

    const profileData = {
      ...user._doc,
      totallevelsCompleted,
      averageScore: totalScore,
      streak: 0, // TODO: Implement streak calculation
      createdAt: user.createdAt,
    };

    res.json(profileData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update user password
// @route   POST /api/user/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    // Check new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { email, username, bio, fullName, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken (if trying to change it)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (email) {
      user.email = email;
    }
    if (bio) {
      user.bio = bio;
    }
    if (fullName) {
      user.fullName = fullName;
    }
    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully', user: await User.findById(user.id).select('-password') });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { language, theme, notificationsEnabled, emailNotifications, soundEnabled } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update preferences
    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;
    if (notificationsEnabled !== undefined) user.preferences.notificationsEnabled = notificationsEnabled;
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (soundEnabled !== undefined) user.preferences.soundEnabled = soundEnabled;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
};

// @desc    Update user status (online/offline/away)
// @route   PUT /api/user/status
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    if (status === 'online') {
      user.lastLogin = new Date();
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      status: user.status,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search, limit = 20, page = 1 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

module.exports = {
  getProfile,
  updatePassword,
  updateProfile,
  updatePreferences,
  updateStatus,
  getAllUsers,
};
