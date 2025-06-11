const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['personal', 'relationship', 'preferences', 'future', 'fun', 'custom'],
    default: 'custom'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['ai-generated', 'custom'],
    default: 'custom'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'open-ended'],
      default: 'multiple-choice'
    },
    options: [String], // For multiple choice
    correctAnswer: String, // For scoring
    points: {
      type: Number,
      default: 1
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  completions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionIndex: Number,
      answer: String,
      isCorrect: Boolean,
      points: Number
    }],
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number // in seconds
  }]
}, {
  timestamps: true
});

// Calculate quiz statistics
quizSchema.methods.getStats = function() {
  const completions = this.completions;
  if (completions.length === 0) return null;
  
  const scores = completions.map(c => c.percentage);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  return {
    totalCompletions: completions.length,
    averageScore: Math.round(avgScore),
    highestScore,
    lowestScore,
    lastCompleted: completions[completions.length - 1].completedAt
  };
};

module.exports = mongoose.model('Quiz', quizSchema);