const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeType: {
      type: String,
      enum: [
        'first_blood', // First level completed
        'speedster', // Complete level in under 5 minutes
        'perfectionist', // Score 100 on 5 levels
        'marathon', // Complete 10 levels
        'champion', // Reach top 10 leaderboard
        'legend', // Complete all levels
        'streak_7', // 7 day streak
        'streak_30', // 30 day streak
        'teacher', // Help 5 students
        'consistent', // Daily login for 30 days
      ],
      required: true,
    },
    name: String,
    description: String,
    icon: String,
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    progress: {
      current: { type: Number, default: 0 },
      target: { type: Number, default: 1 },
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: Date,
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

badgeSchema.index({ user: 1, badgeType: 1 });

module.exports = mongoose.model('Badge', badgeSchema);
