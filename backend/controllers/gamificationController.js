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
      badgesAwarded.push({ id: 'first_blood', points: 10 });
    }

    // Marathon: Complete 10 levels
    const marathon = badges.find(b => b.badgeType === 'marathon');
    if (!marathon?.isUnlocked && completedLevels >= 10) {
      await Badge.findOneAndUpdate(
        { user: userId, badgeType: 'marathon' },
        { isUnlocked: true, unlockedAt: new Date(), points: 50, rarity: 'rare' },
        { upsert: true }
      );
      badgesAwarded.push({ id: 'marathon', points: 50 });
    }

    if (badgesAwarded.length > 0) {
      const totalBadgePoints = badgesAwarded.reduce((sum, b) => sum + b.points, 0);
      user.totalPoints = (user.totalPoints || 0) + totalBadgePoints;
      user.totalXP = (user.totalXP || 0) + (badgesAwarded.length * 50);
      await user.save();

      // Create notification
      for (const badge of badgesAwarded) {
        await Notification.create({
          user: userId,
          type: 'achievement_unlock',
          title: `Badge Unlocked!`,
          message: `You earned the ${badge.id.replace(/_/g, ' ')} badge!`,
          priority: 'high',
        });
      }
    }
    return badgesAwarded.map(b => b.id);
  } catch (error) {
    console.error('Error in checkAndAwardBadgesUtil:', error);
    return [];
  }
};

const updateStreakUtil = (user) => {
  let streakIncreased = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivityDate = user.lastLogin ? new Date(user.lastLogin) : null;
  if (lastActivityDate) {
    lastActivityDate.setHours(0, 0, 0, 0);
  }

  if (!lastActivityDate) {
    user.currentStreak = 1;
    streakIncreased = true;
    user.longestStreak = Math.max(user.longestStreak || 0, 1);
  } else {
    const diffTime = today.getTime() - lastActivityDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      user.currentStreak = (user.currentStreak || 0) + 1;
      streakIncreased = true;
      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
    } else if (diffDays > 1) {
      user.currentStreak = 1;
      streakIncreased = true; // Started a new streak
    }
  }

  user.lastLogin = new Date();
  return { updatedUser: user, streakIncreased };
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
    
    // Check if 24 hours have passed since last claim
    if (user.lastDailyRewardClaimed) {
      const lastClaimedDate = new Date(user.lastDailyRewardClaimed);
      const today = new Date();
      const timeSinceLastClaim = today.getTime() - lastClaimedDate.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (timeSinceLastClaim < twentyFourHours) {
        return res.status(400).json({
          success: false,
          message: 'Anda harus menunggu 24 jam sejak klaim terakhir!',
          alreadyClaimed: true,
          nextClaimTime: new Date(lastClaimedDate.getTime() + twentyFourHours),
        });
      }
    }
    
    // Award points and XP
    user.totalPoints = (user.totalPoints || 0) + 2;
    user.totalXP = (user.totalXP || 0) + 25;
    user.lastDailyRewardClaimed = new Date();
    
    // Update streak
    updateStreakUtil(user);
    await user.save();

    await Notification.create({
      user: req.user.id,
      type: 'reminder',
      title: 'Daily Reward Claimed! 🎁',
      message: 'You earned 2 points and 25 XP',
      priority: 'low',
    });

    res.status(200).json({
      success: true,
      message: 'Daily reward claimed successfully',
      pointsEarned: 2,
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
      const timeSinceLastClaim = today.getTime() - lastClaimedDate.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (timeSinceLastClaim < twentyFourHours) {
        canClaim = false;
        nextClaimTime = new Date(lastClaimedDate.getTime() + twentyFourHours);
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

exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'student' })
      .sort({ totalXP: -1 })
      .limit(10)
      .select('username totalXP totalPoints currentStreak avatar _id');
    
    res.status(200).json({
      success: true,
      leaderboard: topUsers,
    });
  } catch (error) {
    console.error('Check leaderboard error:', error);
    res.status(500).json({ message: 'Error checking leaderboard' });
  }
};

exports.checkAndAwardBadgesUtil = checkAndAwardBadgesUtil;
exports.updateStreakUtil = updateStreakUtil;

// Daily Quests

const generateDailyQuests = () => {
  return [
    { questType: 'login', title: 'Login Hari Ini', target: 1, rewardXP: 10, progress: 1, isCompleted: true, isClaimed: false },
    { questType: 'complete_quiz', title: 'Selesaikan 2 Kuis', target: 2, rewardXP: 30, progress: 0, isCompleted: false, isClaimed: false },
    { questType: 'perfect_score', title: 'Skor 100% di 1 Kuis', target: 1, rewardXP: 50, progress: 0, isCompleted: false, isClaimed: false }
  ];
};

exports.getDailyQuests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = user.lastQuestReset ? new Date(user.lastQuestReset) : null;
    if (lastReset) { lastReset.setHours(0, 0, 0, 0); }

    // Reset quests if it's a new day
    if (!lastReset || today.getTime() > lastReset.getTime()) {
      user.dailyQuests = generateDailyQuests();
      user.lastQuestReset = new Date();
      await user.save();
    } else {
      let updated = false;
      const loginQuest = user.dailyQuests.find(q => q.questType === 'login');
      if (loginQuest && !loginQuest.isCompleted) {
        loginQuest.progress = 1;
        loginQuest.isCompleted = true;
        updated = true;
      }
      if (updated) await user.save();
    }

    res.status(200).json({
      success: true,
      quests: user.dailyQuests
    });
  } catch (error) {
    console.error('Error fetching daily quests:', error);
    res.status(500).json({ message: 'Error fetching daily quests' });
  }
};

exports.claimQuestReward = async (req, res) => {
  try {
    const { questId } = req.body;
    const user = await User.findById(req.user.id);
    
    const quest = user.dailyQuests.find(q => q._id.toString() === questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (!quest.isCompleted) {
      return res.status(400).json({ message: 'Quest not completed yet' });
    }

    if (quest.isClaimed) {
      return res.status(400).json({ message: 'Quest reward already claimed' });
    }

    quest.isClaimed = true;
    user.totalXP = (user.totalXP || 0) + quest.rewardXP;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Quest reward claimed successfully',
      xpGained: quest.rewardXP,
      quests: user.dailyQuests
    });
  } catch (error) {
    console.error('Error claiming quest:', error);
    res.status(500).json({ message: 'Error claiming quest reward' });
  }
};

// Hearts System
const HEART_REGEN_TIME_MS = 60 * 60 * 1000; // 1 hour

const checkHeartRegen = (user) => {
  if (user.hearts == null) user.hearts = 5;
  if (!user.lastHeartRegen) user.lastHeartRegen = Date.now();

  if (user.hearts >= 5) {
    user.lastHeartRegen = Date.now();
    return false;
  }
  
  const now = Date.now();
  const timePassed = now - new Date(user.lastHeartRegen).getTime();
  const heartsToAdd = Math.floor(timePassed / HEART_REGEN_TIME_MS);
  
  if (heartsToAdd > 0) {
    user.hearts = Math.min(5, user.hearts + heartsToAdd);
    user.lastHeartRegen = new Date(now - (timePassed % HEART_REGEN_TIME_MS));
    return true;
  }
  return false;
};

exports.getHeartStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const updated = checkHeartRegen(user);
    if (updated) await user.save();
    
    let nextRegenTime = null;
    if (user.hearts < 5) {
      nextRegenTime = new Date(new Date(user.lastHeartRegen).getTime() + HEART_REGEN_TIME_MS);
    }

    res.status(200).json({
      success: true,
      hearts: user.hearts,
      nextRegenTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching heart status' });
  }
};

exports.deductHeart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    checkHeartRegen(user);

    if (user.hearts <= 0) {
      return res.status(400).json({ message: 'No hearts left', hearts: 0 });
    }

    if (user.hearts === 5) {
      user.lastHeartRegen = Date.now();
    }
    
    user.hearts -= 1;
    await user.save();

    res.status(200).json({
      success: true,
      hearts: user.hearts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deducting heart' });
  }
};

exports.refillHearts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const REFILL_COST = 50;
    
    if (user.hearts >= 5) {
      return res.status(400).json({ message: 'Hearts are already full' });
    }
    
    if ((user.totalPoints || 0) < REFILL_COST) {
      return res.status(400).json({ message: 'Not enough points' });
    }
    
    user.totalPoints -= REFILL_COST;
    user.hearts = 5;
    user.lastHeartRegen = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Hearts refilled successfully',
      hearts: user.hearts,
      totalPoints: user.totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: 'Error refilling hearts' });
  }
};

exports.practiceToHeal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.hearts >= 5) {
      return res.status(400).json({ message: 'Hearts are already full' });
    }

    const today = new Date();
    const isSameDay = user.lastPracticeDate && 
      user.lastPracticeDate.toDateString() === today.toDateString();

    let practiceCount = isSameDay ? (user.practiceCountToday || 0) : 0;

    if (practiceCount >= 3) {
      return res.status(400).json({ message: 'You have reached the practice limit for today (3/3).' });
    }

    user.hearts += 1;
    user.practiceCountToday = practiceCount + 1;
    user.lastPracticeDate = today;
    
    if (user.hearts === 5) {
      user.lastHeartRegen = Date.now();
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Practice successful! 1 Heart recovered.',
      hearts: user.hearts,
      practiceCountToday: user.practiceCountToday
    });
  } catch (error) {
    console.error('Error practice to heal:', error);
    res.status(500).json({ message: 'Error recovering heart' });
  }
};

exports.watchAdToHeal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.hearts >= 5) {
      return res.status(400).json({ message: 'Hearts are already full' });
    }

    user.hearts += 1;
    
    if (user.hearts === 5) {
      user.lastHeartRegen = Date.now();
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Ad watched! 1 Heart recovered.',
      hearts: user.hearts
    });
  } catch (error) {
    console.error('Error watch ad to heal:', error);
    res.status(500).json({ message: 'Error recovering heart' });
  }
};
