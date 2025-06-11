const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const Quiz = require('../models/Quiz');
const Couple = require('../models/Couple');

// All routes are protected
router.use(verifyToken);

// Create custom quiz
router.post('/custom', async (req, res) => {
  try {
    const { title, description, category, difficulty, questions } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const quiz = new Quiz({
      coupleId: user.coupleId,
      creatorId: req.user._id,
      title,
      description,
      category: category || 'custom',
      difficulty: difficulty || 'medium',
      type: 'custom',
      questions
    });

    await quiz.save();

    // Add activity
    const couple = await Couple.findById(user.coupleId);
    await couple.addActivity({
      type: 'quiz',
      description: `Created a new quiz: "${title}"`,
      userId: req.user._id,
      icon: '🧠'
    });

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
});

// Get quizzes for couple
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const query = { coupleId: user.coupleId, isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    const quizzes = await Quiz.find(query)
      .populate('creatorId', 'name avatar')
      .sort({ createdAt: -1 });

    // Add stats to each quiz
    const quizzesWithStats = quizzes.map(quiz => ({
      ...quiz.toObject(),
      stats: quiz.getStats()
    }));

    res.json({ quizzes: quizzesWithStats });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Failed to get quizzes', error: error.message });
  }
});

// Get single quiz
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creatorId', 'name avatar')
      .populate('completions.userId', 'name avatar');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check access
    const user = await require('../models/User').findById(req.user._id);
    if (quiz.coupleId.toString() !== user.coupleId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ 
      quiz: {
        ...quiz.toObject(),
        stats: quiz.getStats()
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Failed to get quiz', error: error.message });
  }
});

// Submit quiz answers
router.post('/:id/submit', async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.answer === question.correctAnswer;
      const points = isCorrect ? question.points : 0;
      
      totalPoints += question.points;
      earnedPoints += points;
      
      return {
        questionIndex: index,
        answer: answer.answer,
        isCorrect,
        points
      };
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    // Add completion
    quiz.completions.push({
      userId: req.user._id,
      answers: processedAnswers,
      score: earnedPoints,
      percentage,
      timeSpent,
      completedAt: new Date()
    });

    await quiz.save();

    // Update couple stats
    const user = await require('../models/User').findById(req.user._id);
    const couple = await Couple.findById(user.coupleId);
    await couple.updateStats('quizzesCompleted');

    // Add activity
    await couple.addActivity({
      type: 'quiz',
      description: `Completed "${quiz.title}" - Scored ${percentage}%`,
      userId: req.user._id,
      icon: '🧠',
      metadata: {
        quizId: quiz._id,
        score: percentage
      }
    });

    res.json({
      message: 'Quiz submitted successfully',
      result: {
        score: earnedPoints,
        totalPoints,
        percentage,
        answers: processedAnswers
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
});

// Get quiz results
router.get('/:id/results', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('completions.userId', 'name avatar');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check access
    const user = await require('../models/User').findById(req.user._id);
    if (quiz.coupleId.toString() !== user.coupleId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      results: quiz.completions,
      stats: quiz.getStats()
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Failed to get quiz results', error: error.message });
  }
});

// Delete quiz
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the creator
    if (quiz.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own quizzes' });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
});

module.exports = router;