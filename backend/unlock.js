require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Badge = require('./models/Badge');
const badgeDefinitions = require('./utils/badgeDefinitions');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  const users = await User.find({});
  for (const user of users) {
    for (const def of badgeDefinitions) {
      await Badge.findOneAndUpdate(
        { user: user._id, badgeType: def.badgeType },
        { 
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: { current: def.target, target: def.target },
          name: def.name,
          description: def.description,
          icon: def.icon,
          rarity: def.rarity,
          points: def.points
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Unlocked all badges for user: ${user.username}`);
  }
  
  console.log('Done!');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
