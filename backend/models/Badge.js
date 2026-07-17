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
        'first_blood', 'speedster', 'perfectionist', 'marathon', 
        'champion', 'legend', 'streak_7', 'streak_30', 
        'teacher', 'consistent', 'night_owl', 'early_bird',
        'sharpshooter', 'unstoppable', 'scholar', 'weekend_warrior',
        'flawless_week', 'polyglot', 'treasure_hunter', 'point_hoarder',
        'revival'
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
