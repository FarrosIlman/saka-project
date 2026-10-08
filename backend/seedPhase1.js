require('dotenv').config();
const mongoose = require('mongoose');
const Level = require('./models/Level');
const Question = require('./models/Question');
const User = require('./models/User');
const Progress = require('./models/Progress');

const phase1Levels = [
  {
    levelNumber: 4,
    title: 'Giving and Asking Opinions',
    theme: 'Healthy Food',
    phase: 1,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&auto=format',
    questions: [
      {
        questionText: "Rani: What do you think about eating healthy food?\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&auto=format',
        options: [
          "I agree with your opinion, and that's a good idea.",
          "I think eating healthy food is very important. What about you?",
          "In my opinion, students should eat junk food every day.",
          "What do you think about this issue?"
        ],
        correctAnswer: "I think eating healthy food is very important. What about you?"
      },
      {
        questionText: "Rani: I agree. In my opinion, we should eat more vegetables and fruit.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=400&fit=crop&auto=format',
        options: [
          "That's true. Do you think we should stop eating fast food?",
          "That's too bad. More vegetables and fruit can make us sick.",
          "That's not totally right. Vegetables are not good for us.",
          "I disagree with you. We have to ignore vegetables and fruit every day."
        ],
        correctAnswer: "That's true. Do you think we should stop eating fast food?"
      },
      {
        questionText: "Rani: Not completely. I think we can eat fast food sometimes, but not too often.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&h=400&fit=crop&auto=format',
        options: [
          "I am fine with that. Go on!",
          "There is a fast food store near our school, that's amazing!",
          "I agree with you. What healthy food do you usually eat?",
          "I enjoy ice cream, milk, and everything this summer."
        ],
        correctAnswer: "I agree with you. What healthy food do you usually eat?"
      },
      {
        questionText: "Rani: I usually eat vegetables, eggs, fruit, and fish. How about you?\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&h=400&fit=crop&auto=format',
        options: [
          "I like homemade food.",
          "I don't think so.",
          "I agree with you.",
          "I disagree, sorry."
        ],
        correctAnswer: "I like homemade food."
      },
      {
        questionText: "Rani: That sounds interesting. Why do you like homemade food?\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop&auto=format',
        options: [
          "What do you think about homemade food? Do you enjoy it?",
          "That's a brilliant idea. I'll call my mom to make homemade food.",
          "I think it is healthier because we can choose the ingredients.",
          "In my opinion, as teenagers, we can create new habits and trends."
        ],
        correctAnswer: "I think it is healthier because we can choose the ingredients."
      },
      {
        questionText: "Rani: That's a good point. So, what is your opinion about drinking enough water?\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&auto=format',
        options: [
          "I think it is not enough for our health.",
          "From my point of view, we can skip it and choose soda.",
          "I think it is also crucial. We should drink enough water every day.",
          "In my opinion, drinking enough water is not needed. Humans do not need water."
        ],
        correctAnswer: "I think it is also crucial. We should drink enough water every day."
      },
      {
        questionText: "Rani: I agree. A healthy diet and enough water can help us stay healthy.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=600&h=400&fit=crop&auto=format',
        options: [
          "So, we are in the same boat.",
          "I disagree, thanks.",
          "You made a mistake.",
          "I don't believe it. You have your own opinion."
        ],
        correctAnswer: "So, we are in the same boat."
      }
    ]
  },
  {
    levelNumber: 5,
    title: 'Agreeing and Disagreeing',
    theme: 'Social Media',
    phase: 1,
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop&auto=format',
    questions: [
      {
        questionText: "Andi: I think social media is very useful for students.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&auto=format',
        options: [
          "What do you think about social media?",
          "I am afraid. How about creating new social media and playing games?",
          "In my opinion, parents should educate their children at home.",
          "I agree. We can use it to find information and learn new things."
        ],
        correctAnswer: "I agree. We can use it to find information and learn new things."
      },
      {
        questionText: "Andi: Exactly. We can also communicate with friends easily.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&auto=format',
        options: [
          "That's true, but I think social media also has negative effects.",
          "Not really, students can manage their money in their bank accounts.",
          "I disagree with your opinion. We do not need to communicate with others.",
          "Yeah, having a lot of followers can make us popular."
        ],
        correctAnswer: "That's true, but I think social media also has negative effects."
      },
      {
        questionText: "Andi: I agree with you. Some students spend too much time on social media.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&h=400&fit=crop&auto=format',
        options: [
          "Not really, it can destroy their dreams in a short time.",
          "Yes, using social media in an excessive way can bring negative effects.",
          "I see your point, but we like it and it's okay to use it excessively.",
          "Not bad, students enjoy their free time and can relax."
        ],
        correctAnswer: "Yes, using social media in an excessive way can bring negative effects."
      },
      {
        questionText: "Andi: I don't completely agree. I think social media itself is not the problem. The problem is how we use it.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=600&h=400&fit=crop&auto=format',
        options: [
          "That's true, but students always have a lot of homework.",
          "What do you think about that? It's great, right?",
          "What is the problem? I think everything is okay on social media.",
          "That's a good point. So, you mean we should use social media wisely?"
        ],
        correctAnswer: "That's a good point. So, you mean we should use social media wisely?"
      },
      {
        questionText: "Andi: Yes. We can set a time limit and choose useful content. Social media can be useful if we use it responsibly.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop&auto=format',
        options: [
          "I can't agree more.",
          "I am fine, thanks.",
          "I am afraid you are making a mistake.",
          "Are you okay?"
        ],
        correctAnswer: "I can't agree more."
      }
    ]
  },
  {
    levelNumber: 6,
    title: 'Compare and Contrast',
    theme: 'Junk Food vs. Healthy Food',
    phase: 1,
    imageUrl: 'https://images.unsplash.com/photo-1628191139360-4083564d03fd?w=800&h=400&fit=crop&auto=format',
    questions: [
      {
        questionText: "Raka: What are you having for lunch?\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format',
        options: [
          "I brought a chicken salad from home. What about you?",
          "How about your breakfast?",
          "It looks nice, what's that?",
          "I bought a new laptop. How about you?"
        ],
        correctAnswer: "I brought a chicken salad from home. What about you?"
      },
      {
        questionText: "Raka: This is a giant burger. I love junk food. It's so tasty and cheap.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&auto=format',
        options: [
          "Wow, that's good news! Congratulations!",
          "My parents said that a good meal can make us happy.",
          "It does look good. But I don't like junk food.",
          "It is amazing, let's buy more junk food then."
        ],
        correctAnswer: "It does look good. But I don't like junk food."
      },
      {
        questionText: "Raka: Why do you choose salad? Preparing a salad takes a lot of time in the morning, whereas buying a burger from the canteen is super fast and easy.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&auto=format',
        options: [
          "Not really. The most important thing is that we have to eat in the morning.",
          "I do agree, eating salad is not healthy and too complicated.",
          "I disagree, junk food is delicious and cheap.",
          "You have a point, but too much fast food just makes you feel sleepy."
        ],
        correctAnswer: "You have a point, but too much fast food just makes you feel sleepy."
      },
      {
        questionText: "Raka: I can't deny that. I always feel tired after eating a big burger. Maybe I should start eating better, similar to what you're doing.\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&h=400&fit=crop&auto=format',
        options: [
          "You can start slowly!",
          "You can't do that!",
          "You will fail if you try it.",
          "You can buy it at the store."
        ],
        correctAnswer: "You can start slowly!"
      },
      {
        questionText: "Raka: How do I start?\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=400&fit=crop&auto=format',
        options: [
          "You can drink mineral water and do more intense exercise every day.",
          "Some healthy foods are expensive, but maybe you can afford them.",
          "You can eat junk food as much as you want and never sleep early.",
          "Some fast food can be made healthier if you choose the right menu."
        ],
        correctAnswer: "Some fast food can be made healthier if you choose the right menu."
      },
      {
        questionText: "Raka: Good idea. Let's both try bringing a healthy lunch tomorrow!\nYou: …………",
        imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&h=400&fit=crop&auto=format',
        options: [
          "Okay, that's great!",
          "No, thanks.",
          "What are you saying?",
          "Are you serious? No, thanks."
        ],
        correctAnswer: "Okay, that's great!"
      }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🔗 Connected to MongoDB for Phase 1 Seeding');

    for (const levelData of phase1Levels) {
      const { questions, ...levelInfo } = levelData;

      // Upsert the level to prevent duplicates if run multiple times
      const level = await Level.findOneAndUpdate(
        { levelNumber: levelInfo.levelNumber },
        levelInfo,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Delete old questions for this level to avoid duplicate questions on re-seed
      await Question.deleteMany({ level: level.levelNumber });

      const questionDocs = [];
      for (const q of questions) {
        const question = await Question.create({
          ...q,
          level: level.levelNumber,
        });
        questionDocs.push(question._id);
      }

      level.questions = questionDocs;
      await level.save();

      console.log(`✅ Seeded Level ${level.levelNumber}: ${level.title} with ${questions.length} questions.`);
    }

    // Now let's ensure these new levels exist in all student's progress arrays!
    const students = await User.find({ role: 'student' });

    for (const student of students) {
      let progress = await Progress.findOne({ user: student._id });
      if (progress) {
        for (const level of phase1Levels) {
          const levelExists = progress.levelProgress.some(lp => lp.levelNumber === level.levelNumber);
          if (!levelExists) {
            progress.levelProgress.push({
              levelNumber: level.levelNumber,
              status: level.levelNumber === 1 ? 'unlocked' : 'locked',
              highScore: 0
            });
          }
        }
        // sort by levelNumber just in case
        progress.levelProgress.sort((a, b) => a.levelNumber - b.levelNumber);
        await progress.save();
      }
    }
    console.log(`✅ Updated progress for ${students.length} existing students to include Phase 1 levels.`);

    console.log('🎉 Phase 1 Seeding Complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  });
