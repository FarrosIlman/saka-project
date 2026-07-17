require('dotenv').config();
const mongoose = require('mongoose');
const Level = require('./models/Level');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const newLevels = [
      {
        levelNumber: 4,
        title: 'Daily Routines',
        theme: 'Describing what you do every day',
        phase: 2,
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80',
        questions: []
      },
      {
        levelNumber: 5,
        title: 'Ordering Food',
        theme: 'Restaurant conversations',
        phase: 2,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
        questions: []
      },
      {
        levelNumber: 6,
        title: 'Giving Directions',
        theme: 'Asking and giving directions',
        phase: 3,
        imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&q=80',
        questions: []
      },
      {
        levelNumber: 7,
        title: 'Job Interview',
        theme: 'Professional speaking skills',
        phase: 3,
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80',
        questions: []
      }
    ];

    for (const levelData of newLevels) {
      await Level.findOneAndUpdate(
        { levelNumber: levelData.levelNumber }, 
        levelData, 
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    console.log('Seed completed for Phase 2 and 3!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
