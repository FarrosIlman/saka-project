const Badge = require('../models/Badge');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Gamification Controller for badges, streaks, achievements

exports.getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user.id });
    
    const badgeStats = {
      total: badges.length,
      unlocked: badges.filter(b => b.isUnlocked).length,
      badges,
    };

    res.status(200).json({
      success: true,
      ...badgeStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching badges' });
  }
};

exports.checkAndAwardBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findById(userId);
    const badges = await Badge.find({ user: userId });

    const completedLevels = 5; // To fetch from Progress
    let badgesAwarded = [];

    // First Blood: Complete first level
    const firstBlood = badges.find(b => b.badgeType === 'first_blood');
    if (!firstBlood?.isUnlocked && completedLevels >= 1) {
      await Badge.findByIdAndUpdate(firstBlood?._id || null, {
        isUnlocked: true,
        unlockedAt: new Date(),
        points: 10,
      }, { upsert: true });
      badgesAwarded.push('first_blood');
    }

    // Marathon: Complete 10 levels
    const marathon = badges.find(b => b.badgeType === 'marathon');
    if (!marathon?.isUnlocked && completedLevels >= 10) {
      await Badge.findByIdAndUpdate(marathon?._id || null, {
        isUnlocked: true,
        unlockedAt: new Date(),
        points: 50,
      });
      badgesAwarded.push('marathon');
    }

    if (badgesAwarded.length > 0) {
      // Award points
      user.totalPoints += badgesAwarded.length * 25;
      user.totalXP += badgesAwarded.length * 50;
      await user.save();

      // Create notification
      for (const badge of badgesAwarded) {
        await Notification.create({
          user: userId,
          type: 'achievement_unlock',
          title: `Badge Unlocked! 🏆`,
          message: `You earned the ${badge.replace(/_/g, ' ')} badge!`,
          priority: 'high',
        });
      }
    }

    res.status(200).json({
      success: true,
      badgesAwarded,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking badges' });
  }
};

exports.getStreakInfo = async (req, res) => {
  try {
    // Simplified streak calculation
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      streak: {
        current: 3,
        longest: 15,
        lastActivityDate: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching streak' });
  }
};

exports.claimDailyReward = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.totalPoints = (user.totalPoints || 0) + 10;
    user.totalXP = (user.totalXP || 0) + 25;
    user.lastLogin = new Date();
    await user.save();

    await Notification.create({
      user: req.user.id,
      type: 'reminder',
      title: 'Daily Reward Claimed! 🎁',
      message: 'You earned 10 points and 25 XP',
      priority: 'low',
    });

    res.status(200).json({
      success: true,
      message: 'Daily reward claimed',
      points: 10,
      xp: 25,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error claiming reward' });
  }
};
