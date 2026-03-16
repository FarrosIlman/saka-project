const User = require('../models/User');
const Progress = require('../models/Progress');
const Achievement = require('../models/Achievement');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get all progress documents and populate user info
    const allProgress = await Progress.find()
      .populate('user', 'username')
      .lean()
      .exec();

    // Calculate stats for each user
    const leaderboard = allProgress
      .map((progress) => {
        const completedLevels = progress.levelProgress.filter((lp) => lp.status === 'completed').length;
        const totalScore = progress.levelProgress.reduce((sum, lp) => sum + lp.highScore, 0);
        const avgScore = completedLevels > 0 ? Math.round(totalScore / completedLevels) : 0;

        return {
          userId: progress.user._id,
          username: progress.user.username,
          completedLevels,
          avgScore,
          totalScore,
          levelProgress: progress.levelProgress,
        };
      })
      .sort((a, b) => {
        // Sort by completed levels first, then by average score
        if (b.completedLevels !== a.completedLevels) {
          return b.completedLevels - a.completedLevels;
        }
        return b.avgScore - a.avgScore;
      })
      .slice(0, Number(limit))
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    res.json({
      leaderboard,
      totalEntries: allProgress.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// @desc    Get user achievements
// @route   GET /api/achievements/:userId
// @access  Public
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const achievements = await Achievement.find({ user: userId })
      .sort({ unlockedAt: -1 })
      .lean();

    res.json({
      achievements,
      totalAchievements: achievements.length,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
};

// Utility function to check and unlock achievements (called internally)
const checkAndUnlockAchievementsUtil = async (userId) => {
  const progress = await Progress.findOne({ user: userId });
  if (!progress) {
    return [];
  }

  const unlockedAchievements = [];

  // Achievement 1: First Level (Complete Level 1)
  const firstLevelCompleted = progress.levelProgress.some(
    (lp) => lp.levelNumber === 1 && lp.status === 'completed'
  );
  if (firstLevelCompleted) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'first_level',
    });
    if (!exists) {
      const achievement = await Achievement.create({
        user: userId,
        type: 'first_level',
        name: 'First Step',
        description: 'Complete your first level',
        icon: '🎯',
        criteria: 'Complete Level 1',
      });
      unlockedAchievements.push(achievement);
    }
  }

  // Achievement 2: Perfect Score (Score 100% on any level)
  const perfectScore = progress.levelProgress.some(
    (lp) => lp.status === 'completed' && lp.highScore === 100
  );
  if (perfectScore) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'perfect_score',
    });
    if (!exists) {
      const achievement = await Achievement.create({
        user: userId,
        type: 'perfect_score',
        name: 'Perfect Score',
        description: 'Achieve 100% on a level',
        icon: '⭐',
        criteria: 'Score 100% on any level',
      });
      unlockedAchievements.push(achievement);
    }
  }

  // Achievement 3: Speedster (Complete 3 levels)
  const completedCount = progress.levelProgress.filter(
    (lp) => lp.status === 'completed'
  ).length;
  if (completedCount >= 3) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'speedster',
    });
    if (!exists) {
      const achievement = await Achievement.create({
        user: userId,
        type: 'speedster',
        name: 'Speedster',
        description: 'Complete 3 levels',
        icon: '⚡',
        criteria: 'Complete 3 levels',
      });
      unlockedAchievements.push(achievement);
    }
  }

  // Achievement 4: Challenger (Complete 5 levels)
  if (completedCount >= 5) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'challenger',
    });
    if (!exists) {
      const achievement = await Achievement.create({
        user: userId,
        type: 'challenger',
        name: 'Challenger',
        description: 'Complete 5 levels',
        icon: '🔥',
        criteria: 'Complete 5 levels',
      });
      unlockedAchievements.push(achievement);
    }
  }

  // Achievement 5: Master (Complete all levels with avg score >= 80%)
  const allLevelsCompleted = progress.levelProgress.every(
    (lp) => lp.status === 'completed'
  );
  const avgScore =
    progress.levelProgress.reduce((sum, lp) => sum + lp.highScore, 0) /
    progress.levelProgress.length;

  if (allLevelsCompleted && avgScore >= 80) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'master',
    });
    if (!exists) {
      const achievement = await Achievement.create({
        user: userId,
        type: 'master',
        name: 'Master',
        description: 'Complete all levels with avg score >= 80%',
        icon: '👑',
        criteria: 'Complete all levels with avg score ≥ 80%',
      });
      unlockedAchievements.push(achievement);
    }
  }

  // Achievement 6: Legend (Complete all levels with avg score = 100%)
  if (allLevelsCompleted && avgScore === 100) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'legend',
    });
    if (!exists) {
      const achievement = await Achievement.create({
        user: userId,
        type: 'legend',
        name: 'Legend',
        description: 'Complete all levels with perfect score',
        icon: '🌟',
        criteria: 'Complete all levels with perfect score',
      });
      unlockedAchievements.push(achievement);
    }
  }

  return unlockedAchievements;
};

// @desc    Check and unlock achievements
// @route   POST /api/achievements/check/:userId
// @access  Admin
const checkAndUnlockAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const unlockedAchievements = await checkAndUnlockAchievementsUtil(userId);
    res.json({
      newAchievements: unlockedAchievements,
      count: unlockedAchievements.length,
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Error checking achievements' });
  }
};

module.exports = {
  getLeaderboard,
  getUserAchievements,
  checkAndUnlockAchievements,
  checkAndUnlockAchievementsUtil,
};
