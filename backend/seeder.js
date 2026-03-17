const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Level = require('./models/Level');
const Question = require('./models/Question');
const Progress = require('./models/Progress');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Level.deleteMany();
    await Question.deleteMany();
    await Progress.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });

    // Create sample student users
    const student1 = await User.create({
      username: 'student1',
      password: await bcrypt.hash('student123', 10),
      role: 'student',
    });

    const student2 = await User.create({
      username: 'student2',
      password: await bcrypt.hash('student123', 10),
      role: 'student',
    });

    console.log('👥 Created sample student users');

    // Create 5 levels with questions
    const levelsData = [
      {
        levelNumber: 1,
        title: 'Restaurant Basics',
        theme: 'Dining & Food',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&auto=format',
        questions: [
          {
            questionText: 'What do you say when you want to order food?',
            imageUrl: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop&auto=format',
            options: ['Can I have the menu', 'Give me food', 'I want eat', 'Food here'],
            correctAnswer: 'Can I have the menu',
          },
          {
            questionText: 'How do you ask for the check?',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format',
            options: ['Check please', 'Money now', 'Pay here', 'Bill time'],
            correctAnswer: 'Check please',
          },
          {
            questionText: 'What do you say when the food is delicious?',
            imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop&auto=format',
            options: ['This is delicious', 'Good eat', 'Tasty food', 'Nice meal'],
            correctAnswer: 'This is delicious',
          },
          {
            questionText: 'How do you request a glass of water?',
            imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&auto=format',
            options: ['Can I have water', 'Water give', 'I need drink', 'Thirsty here'],
            correctAnswer: 'Can I have water',
          },
          {
            questionText: 'What do you say when making a reservation?',
            imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format',
            options: ['I would like to make a reservation', 'Book table', 'Need seat', 'Reserve now'],
            correctAnswer: 'I would like to make a reservation',
          },
        ],
      },
      {
        levelNumber: 2,
        title: 'Travel & Directions',
        theme: 'Getting Around',
        imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&auto=format',
        questions: [
          {
            questionText: 'How do you ask for directions?',
            imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=400&fit=crop&auto=format',
            options: ['Where is the station', 'Station here', 'Find place', 'Go where'],
            correctAnswer: 'Where is the station',
          },
          {
            questionText: 'What do you say when you are lost?',
            imageUrl: 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=600&h=400&fit=crop&auto=format',
            options: ['I am lost', 'No know place', 'Where me', 'Lost here'],
            correctAnswer: 'I am lost',
          },
          {
            questionText: 'How do you ask about public transportation?',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&auto=format',
            options: ['How do I get to the airport', 'Airport way', 'Go there how', 'Transport where'],
            correctAnswer: 'How do I get to the airport',
          },
          {
            questionText: 'What do you say when buying a train ticket?',
            imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&h=400&fit=crop&auto=format',
            options: ['One ticket to London', 'Ticket give', 'Go London', 'Buy here'],
            correctAnswer: 'One ticket to London',
          },
          {
            questionText: 'How do you ask about taxi fare?',
            imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop&auto=format',
            options: ['How much to downtown', 'Money what', 'Price tell', 'Cost here'],
            correctAnswer: 'How much to downtown',
          },
        ],
      },
      {
        levelNumber: 3,
        title: 'Shopping Essentials',
        theme: 'Retail & Commerce',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&auto=format',
        questions: [
          {
            questionText: 'How do you ask about the price?',
            imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop&auto=format',
            options: ['How much is this', 'Price what', 'Cost tell', 'Money how'],
            correctAnswer: 'How much is this',
          },
          {
            questionText: 'What do you say when trying on clothes?',
            imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop&auto=format',
            options: ['Can I try this on', 'Wear this', 'Test clothes', 'Put on now'],
            correctAnswer: 'Can I try this on',
          },
          {
            questionText: 'How do you ask for a different size?',
            imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop&auto=format',
            options: ['Do you have this in large', 'Size change', 'Big one', 'Other size'],
            correctAnswer: 'Do you have this in large',
          },
          {
            questionText: 'What do you say when paying?',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format',
            options: ['Can I pay by card', 'Card use', 'Money here', 'Payment now'],
            correctAnswer: 'Can I pay by card',
          },
          {
            questionText: 'How do you ask for a refund?',
            imageUrl: 'https://images.unsplash.com/photo-1554224311-beee2b91d3b7?w=600&h=400&fit=crop&auto=format',
            options: ['I would like a refund', 'Money back', 'Return this', 'Give money'],
            correctAnswer: 'I would like a refund',
          },
        ],
      },
      {
        levelNumber: 4,
        title: 'Business Communication',
        theme: 'Professional Settings',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop&auto=format',
        questions: [
          {
            questionText: 'How do you introduce yourself professionally?',
            imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop&auto=format',
            options: ['My name is John Smith', 'I am John', 'John here', 'Call me John'],
            correctAnswer: 'My name is John Smith',
          },
          {
            questionText: 'What do you say in a meeting?',
            imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&auto=format',
            options: ['I would like to add', 'Say something', 'Talk now', 'Me speak'],
            correctAnswer: 'I would like to add',
          },
          {
            questionText: 'How do you schedule an appointment?',
            imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop&auto=format',
            options: ['Can we meet on Monday', 'Monday see', 'Meet time', 'Monday good'],
            correctAnswer: 'Can we meet on Monday',
          },
          {
            questionText: 'What do you say when answering the phone?',
            imageUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&h=400&fit=crop&auto=format',
            options: ['Good morning this is ABC Company', 'Hello company', 'Phone answer', 'Yes speaking'],
            correctAnswer: 'Good morning this is ABC Company',
          },
          {
            questionText: 'How do you send professional emails?',
            imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop&auto=format',
            options: ['Dear Mr. Johnson', 'Hi person', 'Hello you', 'Hey there'],
            correctAnswer: 'Dear Mr. Johnson',
          },
        ],
      },
      {
        levelNumber: 5,
        title: 'Healthcare & Emergencies',
        theme: 'Medical Situations',
        imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=400&fit=crop&auto=format',
        questions: [
          {
            questionText: 'How do you describe symptoms to a doctor?',
            imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop&auto=format',
            options: ['I have a headache', 'Head hurt', 'Pain here', 'Sick feeling'],
            correctAnswer: 'I have a headache',
          },
          {
            questionText: 'What do you say in an emergency?',
            imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop&auto=format',
            options: ['I need help immediately', 'Help now', 'Emergency here', 'Quick come'],
            correctAnswer: 'I need help immediately',
          },
          {
            questionText: 'How do you ask for medicine?',
            imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&h=400&fit=crop&auto=format',
            options: ['Can I have pain medication', 'Medicine give', 'Drug need', 'Pills here'],
            correctAnswer: 'Can I have pain medication',
          },
          {
            questionText: 'What do you say when making a doctor appointment?',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&auto=format',
            options: ['I need to see a doctor', 'Doctor visit', 'Check me', 'Appointment make'],
            correctAnswer: 'I need to see a doctor',
          },
          {
            questionText: 'How do you ask about allergies?',
            imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&h=400&fit=crop&auto=format',
            options: ['Are you allergic to anything', 'Allergy have', 'Bad reaction', 'Cannot eat what'],
            correctAnswer: 'Are you allergic to anything',
          },
        ],
      },
    ];

    // Create levels and questions
    for (const levelData of levelsData) {
      const { questions, ...levelInfo } = levelData;
      
      const level = await Level.create(levelInfo);
      
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
      
      console.log(`✅ Created Level ${level.levelNumber}: ${level.title} with ${questions.length} questions`);
    }

    // Create progress for students
    const levels = await Level.find().sort({ levelNumber: 1 });
    
    for (const student of [student1, student2]) {
      const levelProgress = levels.map((level, index) => ({
        levelNumber: level.levelNumber,
        status: index === 0 ? 'unlocked' : 'locked',
        highScore: 0,
      }));

      await Progress.create({
        user: student._id,
        levelProgress,
      });
      
      console.log(`📊 Created progress for ${student.username}`);
    }

    console.log('\n✅ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
