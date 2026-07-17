const Level = require('../models/Level');
const Question = require('../models/Question');
const Progress = require('../models/Progress');

// @desc    Get all levels (for admin content management)
// @route   GET /api/levels
// @access  Admin
const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.find()
      .populate('questions')
      .sort({ levelNumber: 1 });

    res.json(levels);
  } catch (error) {
    console.error('Get all levels error:', error);
    res.status(500).json({ message: 'Error fetching levels' });
  }
};

// @desc    Get all levels for student (without correct answers)
// @route   GET /api/levels/student
// @access  Protected (Student)
const getStudentLevels = async (req, res) => {
  try {
    const levels = await Level.find()
      .select('levelNumber title theme phase imageUrl')
      .sort({ levelNumber: 1 });

    // Get user's progress
    const progress = await Progress.findOne({ user: req.user._id });

    const levelsWithProgress = levels.map((level) => {
      const levelProgress = progress?.levelProgress.find(
        (lp) => lp.levelNumber === level.levelNumber
      );

      return {
        _id: level._id,
        levelNumber: level.levelNumber,
        title: level.title,
        theme: level.theme,
        phase: level.phase || 1,
        imageUrl: level.imageUrl,
        status: levelProgress?.status || 'locked',
        highScore: levelProgress?.highScore || 0,
      };
    });

    res.json(levelsWithProgress);
  } catch (error) {
    console.error('Get student levels error:', error);
    res.status(500).json({ message: 'Error fetching levels' });
  }
};

// @desc    Get questions for a level (student view - no correct answers)
// @route   GET /api/levels/:levelNumber/questions/student
// @access  Protected (Student)
const getLevelQuestions = async (req, res) => {
  try {
    const { levelNumber } = req.params;

    const level = await Level.findOne({ levelNumber: Number(levelNumber) });

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Check if user has access to this level
    const progress = await Progress.findOne({ user: req.user._id });
    const levelProgress = progress?.levelProgress.find(
      (lp) => lp.levelNumber === Number(levelNumber)
    );

    if (!levelProgress || levelProgress.status === 'locked') {
      return res.status(403).json({ message: 'Level is locked' });
    }

    // Get questions without correct answers
    const questions = await Question.find({ level: Number(levelNumber) })
      .select('-correctAnswer')
      .lean();

    res.json({
      level: {
        levelNumber: level.levelNumber,
        title: level.title,
        theme: level.theme,
        phase: level.phase || 1,
        imageUrl: level.imageUrl,
      },
      questions,
    });
  } catch (error) {
    console.error('Get level questions error:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
};

// @desc    Check answer
// @route   POST /api/quiz/check-answer
// @access  Protected (Student)
const checkAnswer = async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!questionId || !selectedOption) {
      return res.status(400).json({ message: 'Question ID and selected option are required' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer.toLowerCase() === selectedOption.toLowerCase();

    res.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
    });
  } catch (error) {
    console.error('Check answer error:', error);
    res.status(500).json({ message: 'Error checking answer' });
  }
};

// @desc    Create new level
// @route   POST /api/levels
// @access  Admin
const createLevel = async (req, res) => {
  try {
    const { levelNumber, title, theme, phase, imageUrl } = req.body;

    // Validate input
    if (!levelNumber || !title || !theme || !imageUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if level number already exists
    const existingLevel = await Level.findOne({ levelNumber });
    if (existingLevel) {
      return res.status(400).json({ message: 'Level number already exists' });
    }

    const level = await Level.create({
      levelNumber,
      title,
      theme,
      phase: phase || 1,
      imageUrl,
      questions: [],
    });

    // Add this level to all existing student progress documents
    const students = await Progress.find();
    for (const studentProgress of students) {
      const hasLevel = studentProgress.levelProgress.some(
        (lp) => lp.levelNumber === levelNumber
      );
      
      if (!hasLevel) {
        studentProgress.levelProgress.push({
          levelNumber,
          status: 'locked',
          highScore: 0,
        });
        await studentProgress.save();
      }
    }

    res.status(201).json(level);
  } catch (error) {
    console.error('Create level error:', error);
    res.status(500).json({ message: 'Error creating level' });
  }
};

// @desc    Update level
// @route   PUT /api/levels/:levelId
// @access  Admin
const updateLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { title, theme, phase, imageUrl } = req.body;

    const level = await Level.findById(levelId);

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    if (title) level.title = title;
    if (theme) level.theme = theme;
    if (phase) level.phase = phase;
    if (imageUrl) level.imageUrl = imageUrl;

    await level.save();

    res.json(level);
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({ message: 'Error updating level' });
  }
};

// @desc    Delete level
// @route   DELETE /api/levels/:levelId
// @access  Admin
const deleteLevel = async (req, res) => {
  try {
    const { levelId } = req.params;

    const level = await Level.findById(levelId);

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Delete all questions for this level
    await Question.deleteMany({ level: level.levelNumber });

    // Remove from all progress documents
    await Progress.updateMany(
      {},
      { $pull: { levelProgress: { levelNumber: level.levelNumber } } }
    );

    // Delete level
    await Level.deleteOne({ _id: levelId });

    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Delete level error:', error);
    res.status(500).json({ message: 'Error deleting level' });
  }
};

// @desc    Create question for a level
// @route   POST /api/levels/:levelId/questions
// @access  Admin
const createQuestion = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { questionText, imageUrl, options, correctAnswer } = req.body;

    const level = await Level.findById(levelId);

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Validate input
    if (!questionText || !imageUrl || !options || !correctAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
      return res.status(400).json({ message: 'Options must be an array of 3-4 items' });
    }

    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be one of the options' });
    }

    const question = await Question.create({
      level: level.levelNumber,
      questionText,
      imageUrl,
      options,
      correctAnswer,
    });

    // Add question to level
    level.questions.push(question._id);
    await level.save();

    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:questionId
// @access  Admin
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionText, imageUrl, options, correctAnswer } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (questionText) question.questionText = questionText;
    if (imageUrl) question.imageUrl = imageUrl;
    
    if (options) {
      if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
        return res.status(400).json({ message: 'Options must be an array of 3-4 items' });
      }
      question.options = options;
    }
    
    if (correctAnswer) {
      if (!question.options.includes(correctAnswer)) {
        return res.status(400).json({ message: 'Correct answer must be one of the options' });
      }
      question.correctAnswer = correctAnswer;
    }

    await question.save();

    res.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:questionId
// @access  Admin
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Remove from level
    await Level.updateOne(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );

    // Delete question
    await Question.deleteOne({ _id: questionId });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
};

module.exports = {
  getAllLevels,
  getStudentLevels,
  getLevelQuestions,
  checkAnswer,
  createLevel,
  updateLevel,
  deleteLevel,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};