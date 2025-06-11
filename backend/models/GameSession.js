const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  gameType: {
    type: String,
    enum: ['uno', 'memory', 'drawing', 'trivia', 'tic-tac-toe'],
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  gameData: {
    board: mongoose.Schema.Types.Mixed, // Game-specific data
    currentPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scores: {
      type: Map,
      of: Number,
      default: {}
    },
    settings: mongoose.Schema.Types.Mixed
  },
  moves: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    move: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  }
}, {
  timestamps: true
});

// Calculate game duration when completed
gameSessionSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.startedAt && !this.duration) {
    this.completedAt = new Date();
    this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  next();
});

module.exports = mongoose.model('GameSession', gameSessionSchema);