const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Progress = require('../models/Progress');

// Get admin advanced analytics and reporting data
router.get('/advanced', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const activeUsers = await User.countDocuments({ 
      role: 'student',
      lastLogin: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const completedCount = await Progress.countDocuments({ isCompleted: true });
    
    res.json({
      summary: {
        totalUsers,
        activeUsers,
        completionRate: totalUsers > 0 ? (completedCount / (totalUsers * 10)) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Export user progress to CSV (simplified)
router.get('/export/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('username email totalXp currentStreak createdAt')
      .lean();

    const csv = 'Username,Email,Total XP,Current Streak,Date Joined\n' +
      users.map(u => `${u.username},${u.email},${u.totalXp || 0},${u.currentStreak || 0},${new Date(u.createdAt).toLocaleDateString()}`)
        .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Failed to export data', error: error.message });
  }
});

// Get student report
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const student = await User.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const progress = await Progress.find({ userId: req.params.studentId }).lean();

    res.json({
      student: {
        username: student.username,
        email: student.email,
        totalXp: student.totalXp,
        currentStreak: student.currentStreak
      },
      performance: {
        levelsAttempted: progress.length,
        levelsCompleted: progress.filter(p => p.isCompleted).length,
        averageScore: progress.length > 0 ? (progress.reduce((sum, p) => sum + p.score, 0) / progress.length).toFixed(2) : 0,
        totalXpEarned: progress.reduce((sum, p) => sum + p.xpEarned, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching student report:', error);
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
});

module.exports = router;
