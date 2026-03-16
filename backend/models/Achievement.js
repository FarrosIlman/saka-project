const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['first_level', 'perfect_score', 'speedster', 'challenger', 'master', 'legend'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    criteria: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate achievements for the same user
achievementSchema.index({ user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
