const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const Gift = require('../models/Gift');
const Couple = require('../models/Couple');

// All routes are protected
router.use(verifyToken);

// Send gift
router.post('/send', async (req, res) => {
  try {
    const { type, emoji, message, deliveryType, scheduledFor } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId || !user.partnerId) {
      return res.status(404).json({ message: 'No partner found' });
    }

    const gift = new Gift({
      coupleId: user.coupleId,
      senderId: req.user._id,
      receiverId: user.partnerId,
      type,
      emoji,
      message,
      deliveryType: deliveryType || 'immediate',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null
    });

    await gift.save();

    // Update couple stats
    const couple = await Couple.findById(user.coupleId);
    await couple.updateStats('giftsExchanged');

    // Add activity
    await couple.addActivity({
      type: 'gift',
      description: `Sent a ${type} gift`,
      userId: req.user._id,
      icon: emoji,
      metadata: {
        giftId: gift._id
      }
    });

    // Emit real-time notification if immediate
    if (deliveryType === 'immediate' && req.io) {
      req.io.to(`couple_${user.coupleId}`).emit('gift_received', {
        gift: {
          ...gift.toObject(),
          sender: { name: user.name, avatar: user.avatar }
        }
      });
    }

    res.status(201).json({
      message: 'Gift sent successfully',
      gift
    });
  } catch (error) {
    console.error('Send gift error:', error);
    res.status(500).json({ message: 'Failed to send gift', error: error.message });
  }
});

// Get gifts for couple
router.get('/', async (req, res) => {
  try {
    const { type, status, sent, received } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    let query = { coupleId: user.coupleId };
    
    // Filter by type
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Filter by sent/received
    if (sent === 'true') query.senderId = req.user._id;
    if (received === 'true') query.receiverId = req.user._id;

    const gifts = await Gift.find(query)
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ gifts });
  } catch (error) {
    console.error('Get gifts error:', error);
    res.status(500).json({ message: 'Failed to get gifts', error: error.message });
  }
});

// Open gift
router.post('/:id/open', async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);
    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    // Check if user is the receiver
    if (gift.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only open gifts sent to you' });
    }

    // Update gift status
    gift.isOpened = true;
    gift.openedAt = new Date();
    gift.status = 'opened';

    await gift.save();

    res.json({ message: 'Gift opened successfully', gift });
  } catch (error) {
    console.error('Open gift error:', error);
    res.status(500).json({ message: 'Failed to open gift', error: error.message });
  }
});

// React to gift
router.post('/:id/react', async (req, res) => {
  try {
    const { emoji, message } = req.body;
    
    const gift = await Gift.findById(req.params.id);
    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    // Check if user is the receiver
    if (gift.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only react to gifts sent to you' });
    }

    gift.reaction = {
      emoji,
      message,
      timestamp: new Date()
    };

    await gift.save();

    // Notify sender via socket
    if (req.io) {
      const user = await require('../models/User').findById(req.user._id);
      req.io.to(`couple_${gift.coupleId}`).emit('gift_reaction', {
        giftId: gift._id,
        reaction: gift.reaction,
        from: { name: user.name, avatar: user.avatar }
      });
    }

    res.json({ message: 'Reaction added successfully', reaction: gift.reaction });
  } catch (error) {
    console.error('React to gift error:', error);
    res.status(500).json({ message: 'Failed to react to gift', error: error.message });
  }
});

// Get gift statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const stats = await Gift.aggregate([
      { $match: { coupleId: user.coupleId } },
      {
        $group: {
          _id: null,
          totalGifts: { $sum: 1 },
          giftsSent: {
            $sum: { $cond: [{ $eq: ['$senderId', user._id] }, 1, 0] }
          },
          giftsReceived: {
            $sum: { $cond: [{ $eq: ['$receiverId', user._id] }, 1, 0] }
          },
          giftTypes: { $push: '$type' }
        }
      }
    ]);

    const giftTypeStats = await Gift.aggregate([
      { $match: { coupleId: user.coupleId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: stats[0] || { totalGifts: 0, giftsSent: 0, giftsReceived: 0 },
      giftTypes: giftTypeStats
    });
  } catch (error) {
    console.error('Get gift stats error:', error);
    res.status(500).json({ message: 'Failed to get gift statistics', error: error.message });
  }
});

module.exports = router;