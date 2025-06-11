const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['game', 'quiz', 'journal', 'gift', 'watch', 'chat', 'connection', 'milestone'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '❤️'
  },
  metadata: {
    gameType: String,
    quizId: mongoose.Schema.Types.ObjectId,
    journalId: mongoose.Schema.Types.ObjectId,
    giftId: mongoose.Schema.Types.ObjectId,
    score: Number,
    duration: Number
  }
}, {
  timestamps: true
});

// Index for better query performance
activitySchema.index({ coupleId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);