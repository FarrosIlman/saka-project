const Progress = require('../models/Progress');
const Level = require('../models/Level');
const User = require('../models/User');
const { checkAndUnlockAchievementsUtil } = require('./leaderboardController');
const { checkAndAwardBadgesUtil, updateStreakUtil } = require('./gamificationController');

// @desc    Get user's progress
// @route   GET /api/progress
// @access  Protected (Student)
const getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      // Create progress if doesn't exist
      const levels = await Level.find().sort({ levelNumber: 1 });
      const levelProgress = levels.map((level, index) => ({
        levelNumber: level.levelNumber,
        status: index === 0 ? 'unlocked' : 'locked',
        highScore: 0,
      }));

      progress = await Progress.create({
        user: req.user._id,
        levelProgress,
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
};

// @desc    Complete a level and update progress
// @route   POST /api/progress/complete-level
// @access  Protected (Student)
const completeLevel = async (req, res) => {
  try {
    const { levelNumber, score } = req.body;

    if (!levelNumber || score === undefined) {
      return res.status(400).json({ message: 'Level number and score are required' });
    }

    let progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Find the level progress
    const levelIndex = progress.levelProgress.findIndex(
      (lp) => lp.levelNumber === Number(levelNumber)
    );

    if (levelIndex === -1) {
      return res.status(404).json({ message: 'Level not found in progress' });
    }

    const currentLevel = progress.levelProgress[levelIndex];

    let pointsToAdd = 0;
    let xpToAdd = 0;

    // Update score if it's higher and calculate rewards based on the difference
    if (score > currentLevel.highScore) {
      const scoreDiff = score - (currentLevel.highScore || 0);
      
      // Rebalancing: 100% score = 10 points (scoreDiff / 10)
      pointsToAdd = Math.round(scoreDiff / 10);
      // Rebalancing: 100% score = 20 XP (scoreDiff / 5)
      xpToAdd = Math.round(scoreDiff / 5);

      currentLevel.highScore = score;
    }

    // Mark as completed
    currentLevel.status = 'completed';

    // Unlock next level
    const nextLevelIndex = levelIndex + 1;
    if (nextLevelIndex < progress.levelProgress.length) {
      const nextLevel = progress.levelProgress[nextLevelIndex];
      if (nextLevel.status === 'locked') {
        nextLevel.status = 'unlocked';
      }
    }

    await progress.save();
    
    let streakData = { increased: false, current: 0 };
    // Update user stats (streak, XP, points)
    const user = await User.findById(req.user._id);
    if (user) {
      const { updatedUser, streakIncreased } = updateStreakUtil(user);
      streakData.increased = streakIncreased;
      streakData.current = updatedUser.currentStreak;
      
      if (xpToAdd > 0) user.totalXP = (user.totalXP || 0) + xpToAdd;
      if (pointsToAdd > 0) user.totalPoints = (user.totalPoints || 0) + pointsToAdd;

      // Update Daily Quests
      if (user.dailyQuests && user.dailyQuests.length > 0) {
        // Check "complete_quiz" quest
        const completeQuest = user.dailyQuests.find(q => q.questType === 'complete_quiz');
        if (completeQuest && !completeQuest.isCompleted) {
          completeQuest.progress += 1;
          if (completeQuest.progress >= completeQuest.target) {
            completeQuest.progress = completeQuest.target;
            completeQuest.isCompleted = true;
          }
        }

        // Check "perfect_score" quest
        const perfectQuest = user.dailyQuests.find(q => q.questType === 'perfect_score');
        if (perfectQuest && !perfectQuest.isCompleted && score === 100) {
          perfectQuest.progress += 1;
          if (perfectQuest.progress >= perfectQuest.target) {
            perfectQuest.progress = perfectQuest.target;
            perfectQuest.isCompleted = true;
          }
        }
      }

      await user.save();
    }

    // Check and unlock achievements & badges
    let unlockedAchievements = [];
    let badgesAwarded = [];
    try {
      unlockedAchievements = await checkAndUnlockAchievementsUtil(req.user._id);
      badgesAwarded = await checkAndAwardBadgesUtil(req.user._id);
    } catch (achievementError) {
      console.error('Error checking achievements/badges:', achievementError);
    }

    res.json({
      message: 'Level completed successfully',
      progress,
      unlockedAchievements,
      badgesAwarded,
      streakData,
    });
  } catch (error) {
    console.error('Complete level error:', error);
    res.status(500).json({ message: 'Error completing level' });
  }
};

module.exports = {
  getProgress,
  completeLevel,
};