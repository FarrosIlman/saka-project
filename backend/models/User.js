const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    // Profile Information
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    },
    fullName: {
      type: String,
      default: '',
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    // Preferences & Settings
    preferences: {
      language: {
        type: String,
        enum: ['en', 'id', 'fr'],
        default: 'id',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // Status & Activity
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Statistics
    totalXP: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);