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
  
  // Find the first_blood definition
  const firstBloodDef = badgeDefinitions.find(b => b.badgeType === 'first_blood');
  
  if (firstBloodDef) {
    const users = await User.find({});
    for (const user of users) {
      await Badge.findOneAndUpdate(
        { user: user._id, badgeType: 'first_blood' },
        { 
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: { current: firstBloodDef.target, target: firstBloodDef.target },
          name: firstBloodDef.name,
          description: firstBloodDef.description,
          icon: firstBloodDef.icon,
          rarity: firstBloodDef.rarity,
          points: firstBloodDef.points
        },
        { upsert: true, new: true }
      );
      console.log(`Unlocked first_blood badge for user: ${user.username}`);
    }
  }
  
  console.log('Done unlocking first_blood for all users!');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
