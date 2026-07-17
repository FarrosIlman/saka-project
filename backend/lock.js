require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Badge = require('./models/Badge');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  await Badge.updateMany({}, { isUnlocked: false });
  console.log('Locked all badges for all users');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
