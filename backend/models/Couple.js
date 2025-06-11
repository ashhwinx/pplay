const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationshipStart: {
    type: Date,
    default: Date.now
  },
  anniversaryDate: {
    type: Date
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['first_message', 'first_call', 'first_meeting', 'anniversary', 'custom'],
      default: 'custom'
    }
  }],
  stats: {
    daysTogether: {
      type: Number,
      default: 0
    },
    gamesPlayed: {
      type: Number,
      default: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0
    },
    memoriesShared: {
      type: Number,
      default: 0
    },
    giftsExchanged: {
      type: Number,
      default: 0
    },
    moviesWatched: {
      type: Number,
      default: 0
    }
  },
  recentActivities: [{
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    icon: {
      type: String,
      default: '❤️'
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowNotifications: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  disconnectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate days together
coupleSchema.virtual('daysTogetherCalculated').get(function() {
  const now = new Date();
  const start = this.relationshipStart;
  const diffTime = Math.abs(now - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Update stats automatically
coupleSchema.methods.updateStats = function(statType, increment = 1) {
  if (this.stats[statType] !== undefined) {
    this.stats[statType] += increment;
  }
  this.stats.daysTogether = this.daysTogetherCalculated;
  return this.save();
};

// Add activity and broadcast to both users
coupleSchema.methods.addActivity = function(activityData, io) {
  this.recentActivities.unshift({
    ...activityData,
    timestamp: new Date()
  });
  
  // Keep only last 50 activities
  if (this.recentActivities.length > 50) {
    this.recentActivities = this.recentActivities.slice(0, 50);
  }
  
  // Broadcast to couple room if socket.io is available
  if (io) {
    io.to(`couple_${this._id}`).emit('new_activity', {
      activity: this.recentActivities[0]
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Couple', coupleSchema);