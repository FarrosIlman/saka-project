const User = require('../models/User');
const Progress = require('../models/Progress');
const Level = require('../models/Level');
const Notification = require('../models/Notification');

// @desc    Get comprehensive user analytics
// @route   GET /api/analytics/user
// @access  Private
exports.getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const progress = await Progress.findOne({ user: req.user.id }).populate('levelProgress');
    const levels= await Level.countDocuments();

    // Calculate statistics
    const completedLevels = progress?.levelProgress?.filter(lp => lp.status === 'completed') || [];
    const totalScore = completedLevels.reduce((sum, lp) => sum + (lp.highScore || 0), 0);
    const avgScore = completedLevels.length > 0 ? Math.round(totalScore / completedLevels.length) : 0;

    // Score distribution
    const scoreDistribution = completedLevels.map(lp => ({
      level: lp.levelNumber,
      score: lp.highScore,
    }));

    // Time spent (mock data)
    const timeSpent = completedLevels.length * 15; // 15 minutes per level

    // Streak calculation
    const streak = calculateStreak(progress?.levelProgress || []);

    res.status(200).json({
      success: true,
      analytics: {
        // Overall Stats
        totalLevelsCompleted: completedLevels.length,
        totalLevels: levels,
        progressPercentage: Math.round((completedLevels.length / levels) * 100),
        averageScore: avgScore,
        totalScore,
        timeSpentMinutes: timeSpent,
        
        // Engagement
        currentStreak: streak.current,
        longestStreak: streak.longest,
        lastActivityDate: progress?.updatedAt,
        
        // Points & XP
        totalXP: user.totalXP || 0,
        totalPoints: user.totalPoints || 0,
        pointsThisWeek: calculateWeeklyPoints(progress?.levelProgress || []),
        
        // Score Distribution
        scoreDistribution,
        
        // Level Status
        levelStatus: progress?.levelProgress || [],
        
        // Ranking
        userRank: await calculateUserRank(user._id),
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalLevels = await Level.countDocuments();

    // Active users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });

    // Completion rate
    const progressRecords = await Progress.find();
    const totalProgressRecords = progressRecords.length;
    const completedLevelCounts = progressRecords.map(p => 
      p.levelProgress?.filter(lp => lp.status === 'completed').length || 0
    );
    const avgCompletionRate = totalProgressRecords > 0 
      ? Math.round((completedLevelCounts.reduce((a, b) => a + b, 0) / (totalProgressRecords * totalLevels)) * 100)
      : 0;

    // Average score
    const avgScores = progressRecords.map(p => {
      const completed = p.levelProgress?.filter(lp => lp.status === 'completed') || [];
      return completed.length > 0 
        ? completed.reduce((sum, lp) => sum + (lp.highScore || 0), 0) / completed.length
        : 0;
    });
    const overallAvgScore = avgScores.length > 0 
      ? Math.round(avgScores.reduce((a, b) => a + b, 0) / avgScores.length)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          admins: totalAdmins,
          active: activeUsers,
        },
        content: {
          totalLevels,
        },
        engagement: {
          avgCompletionRate,
          avgScore: overallAvgScore,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// @desc    Get leaderboard with analytics
// @route   GET /api/analytics/leaderboard
// @access  Private
exports.getLeaderboardAnalytics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const leaderboard = await Progress.find()
      .populate('user')
      .sort({ 'levelProgress': -1 })
      .lean();

    const ranked = leaderboard
      .map((prog) => {
        const completed = prog.levelProgress?.filter(lp => lp.status === 'completed') || [];
        const totalScore = completed.reduce((sum, lp) => sum + (lp.highScore || 0), 0);
        const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;

        return {
          user: prog.user,
          completedLevels: completed.length,
          avgScore,
          totalScore,
          totalXP: prog.user?.totalXP || 0,
        };
      })
      .sort((a, b) => {
        if (a.completedLevels !== b.completedLevels) {
          return b.completedLevels - a.completedLevels;
        }
        return b.avgScore - a.avgScore;
      })
      .slice(0, limit)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

    res.status(200).json({
      success: true,
      leaderboard: ranked,
    });
  } catch (error) {
    console.error('Get leaderboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

// @desc    Award points/XP to user
// @route   POST /api/analytics/award-points
// @access  Private/Admin
exports.awardPoints = async (req, res) => {
  try {
    const { userId, points, xpAmount, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.totalPoints = (user.totalPoints || 0) + points;
    user.totalXP = (user.totalXP || 0) + xpAmount;
    await user.save();

    // Create notification
    await Notification.create({
      user: userId,
      type: 'score_milestone',
      title: 'Points Awarded! 🎉',
      message: `You earned ${points} points for ${reason}`,
      priority: 'high',
    });

    res.status(200).json({
      success: true,
      message: 'Points awarded',
      user,
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper Functions
function calculateStreak(levelProgress) {
  let current = 0;
  let longest = 0;

  for (const lp of levelProgress) {
    if (lp.status === 'completed') {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return { current, longest };
}

function calculateWeeklyPoints(levelProgress) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = levelProgress.filter(
    lp => lp.status === 'completed' && new Date(lp.completedDate) > weekAgo
  );
  return thisWeek.length * 100; // 100 points per level
}

async function calculateUserRank(userId) {
  const userProgress = await Progress.findOne({ user: userId });
  const userCompleted = userProgress?.levelProgress?.filter(lp => lp.status === 'completed').length || 0;

  const allProgress = await Progress.find().lean();
  const betterThan = allProgress.filter(p => {
    const completed = p.levelProgress?.filter(lp => lp.status === 'completed').length || 0;
    return completed > userCompleted;
  }).length;

  return betterThan + 1;
}
