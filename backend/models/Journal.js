const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  mood: {
    type: String,
    enum: ['happy', 'excited', 'romantic', 'fun', 'grateful', 'missing', 'sad', 'angry'],
    default: 'happy'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  images: [{
    url: String,
    caption: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['love', 'like', 'laugh', 'wow', 'sad', 'angry'],
      default: 'love'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
journalSchema.index({ coupleId: 1, createdAt: -1 });
journalSchema.index({ authorId: 1, createdAt: -1 });
journalSchema.index({ tags: 1 });

module.exports = mongoose.model('Journal', journalSchema);