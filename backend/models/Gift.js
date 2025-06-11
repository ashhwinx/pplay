const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['hug', 'kiss', 'flowers', 'heart', 'coffee', 'star', 'custom'],
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: [true, 'Gift message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  deliveryType: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate'
  },
  scheduledFor: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'opened'],
    default: 'pending'
  },
  reaction: {
    emoji: String,
    message: String,
    timestamp: Date
  },
  isOpened: {
    type: Boolean,
    default: false
  },
  openedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-deliver immediate gifts
giftSchema.pre('save', function(next) {
  if (this.isNew && this.deliveryType === 'immediate') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
  }
  next();
});

// Index for better query performance
giftSchema.index({ coupleId: 1, createdAt: -1 });
giftSchema.index({ receiverId: 1, status: 1 });
giftSchema.index({ scheduledFor: 1, status: 1 });

module.exports = mongoose.model('Gift', giftSchema);