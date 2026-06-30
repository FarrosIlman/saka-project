const Badge = require('../models/Badge');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// Gamification Controller for badges, streaks, achievements

const checkAndAwardBadgesUtil = async (userId) => {
  try {
    const user = await User.findById(userId);
    const badges = await Badge.find({ user: userId });
    const progress = await Progress.findOne({ user: userId });
    
    const completedLevels = progress ? progress.levelProgress.filter(lp => lp.status === 'completed').length : 0;
    let badgesAwarded = [];

    // First Blood: Complete first level
    const firstBlood = badges.find(b => b.badgeType === 'first_blood');
    if (!firstBlood?.isUnlocked && completedLevels >= 1) {
      await Badge.findOneAndUpdate(
        { user: userId, badgeType: 'first_blood' },
        { isUnlocked: true, unlockedAt: new Date(), points: 10, rarity: 'common' },
        { upsert: true }
      );
      badgesAwarded.push('first_blood');
    }

    // Marathon: Complete 10 levels
    const marathon = badges.find(b => b.badgeType === 'marathon');
    if (!marathon?.isUnlocked && completedLevels >= 10) {
      await Badge.findOneAndUpdate(
        { user: userId, badgeType: 'marathon' },
        { isUnlocked: true, unlockedAt: new Date(), points: 50, rarity: 'rare' },
        { upsert: true }
      );
      badgesAwarded.push('marathon');
    }

    if (badgesAwarded.length > 0) {
      // Award points
      user.totalPoints = (user.totalPoints || 0) + (badgesAwarded.length * 25);
      user.totalXP = (user.totalXP || 0) + (badgesAwarded.length * 50);
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
    return badgesAwarded;
  } catch (error) {
    console.error('Error in checkAndAwardBadgesUtil:', error);
    return [];
  }
};

const updateStreakUtil = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivityDate = user.lastLogin ? new Date(user.lastLogin) : null;
  if (lastActivityDate) {
    lastActivityDate.setHours(0, 0, 0, 0);
  }

  if (!lastActivityDate) {
    user.currentStreak = 1;
    user.longestStreak = Math.max(user.longestStreak || 0, 1);
  } else {
    const diffTime = today.getTime() - lastActivityDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      user.currentStreak = (user.currentStreak || 0) + 1;
      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
    } else if (diffDays > 1) {
      user.currentStreak = 1;
    }
  }

  user.lastLogin = new Date();
  return user;
};

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
    const badgesAwarded = await checkAndAwardBadgesUtil(userId);
    const user = await User.findById(userId);

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
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      streak: {
        current: user.currentStreak || 0,
        longest: user.longestStreak || 0,
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
    
    // Check if already claimed today
    if (user.lastDailyRewardClaimed) {
      const lastClaimedDate = new Date(user.lastDailyRewardClaimed);
      const today = new Date();
      
      if (lastClaimedDate.toDateString() === today.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah claim reward hari ini. Coba besok lagi!',
          alreadyClaimed: true,
          nextClaimTime: new Date(lastClaimedDate.getTime() + 24 * 60 * 60 * 1000),
        });
      }
    }
    
    // Award points and XP
    user.totalPoints = (user.totalPoints || 0) + 10;
    user.totalXP = (user.totalXP || 0) + 25;
    user.lastDailyRewardClaimed = new Date();
    
    // Update streak
    updateStreakUtil(user);
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
      message: 'Daily reward claimed successfully',
      pointsEarned: 10,
      xpGained: 25,
      nextClaimTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Claim daily reward error:', error);
    res.status(500).json({ message: 'Error claiming reward' });
  }
};

exports.checkDailyRewardStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let canClaim = true;
    let nextClaimTime = null;
    
    if (user.lastDailyRewardClaimed) {
      const lastClaimedDate = new Date(user.lastDailyRewardClaimed);
      const today = new Date();
      
      if (lastClaimedDate.toDateString() === today.toDateString()) {
        canClaim = false;
        nextClaimTime = new Date(lastClaimedDate.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    
    res.status(200).json({
      success: true,
      canClaim,
      lastClaimedDate: user.lastDailyRewardClaimed,
      nextClaimTime,
    });
  } catch (error) {
    console.error('Check reward status error:', error);
    res.status(500).json({ message: 'Error checking reward status' });
  }
};

exports.checkAndAwardBadgesUtil = checkAndAwardBadgesUtil;
exports.updateStreakUtil = updateStreakUtil;
