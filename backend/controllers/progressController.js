const Progress = require('../models/Progress');
const Level = require('../models/Level');
const { checkAndUnlockAchievementsUtil } = require('./leaderboardController');

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

    // Update score if it's higher
    if (score > currentLevel.highScore) {
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

    // Check and unlock achievements
    let unlockedAchievements = [];
    try {
      unlockedAchievements = await checkAndUnlockAchievementsUtil(req.user._id);
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Don't fail the request if achievement check fails
    }

    res.json({
      message: 'Level completed successfully',
      progress,
      unlockedAchievements,
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