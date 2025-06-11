const User = require('../models/User');
const Couple = require('../models/Couple');
const Activity = require('../models/Activity');

// Connect with partner using couple code
const connectWithPartner = async (req, res) => {
  try {
    const { coupleCode } = req.body;
    const currentUser = req.user;

    console.log(`User ${currentUser.name} trying to connect with code: ${coupleCode}`);

    // Find partner by couple code
    const partner = await User.findOne({ coupleCode: coupleCode.toUpperCase() });
    if (!partner) {
      return res.status(404).json({ message: 'Invalid couple code' });
    }

    // Check if trying to connect with self
    if (partner._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    // Check if current user is already connected
    if (currentUser.partnerId) {
      return res.status(400).json({ message: 'You are already connected with a partner' });
    }

    // Check if partner is already connected
    if (partner.partnerId) {
      return res.status(400).json({ message: 'This person is already connected with someone else' });
    }

    // Create couple relationship
    const couple = new Couple({
      user1: currentUser._id,
      user2: partner._id,
      relationshipStart: new Date(),
      milestones: [{
        title: 'First Connection',
        description: 'Connected on PairPlay',
        date: new Date(),
        type: 'first_message'
      }]
    });

    await couple.save();

    // Update both users with couple information
    await User.findByIdAndUpdate(currentUser._id, {
      coupleId: couple._id,
      partnerId: partner._id
    });

    await User.findByIdAndUpdate(partner._id, {
      coupleId: couple._id,
      partnerId: currentUser._id
    });

    // Add connection activity
    await couple.addActivity({
      type: 'connection',
      description: `${currentUser.name} and ${partner.name} are now connected! 💕`,
      userId: currentUser._id,
      icon: '💑'
    }, req.io);

    // Emit real-time updates to both users
    if (req.io) {
      // Notify both users about the connection
      req.io.to(`user_${currentUser._id}`).emit('partner_connected', {
        partner: {
          id: partner._id,
          name: partner.name,
          avatar: partner.avatar,
          isOnline: partner.isOnline
        },
        coupleId: couple._id
      });

      req.io.to(`user_${partner._id}`).emit('partner_connected', {
        partner: {
          id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          isOnline: currentUser.isOnline
        },
        coupleId: couple._id
      });

      // Join both users to couple room
      const currentUserSocket = req.io.sockets.sockets.get(currentUser.socketId);
      const partnerSocket = req.io.sockets.sockets.get(partner.socketId);
      
      if (currentUserSocket) {
        currentUserSocket.join(`couple_${couple._id}`);
      }
      if (partnerSocket) {
        partnerSocket.join(`couple_${couple._id}`);
      }
    }

    console.log(`Successfully connected ${currentUser.name} and ${partner.name}`);

    res.json({
      message: 'Successfully connected with your partner!',
      couple: {
        id: couple._id,
        partner: {
          id: partner._id,
          name: partner.name,
          avatar: partner.avatar,
          isOnline: partner.isOnline
        }
      }
    });
  } catch (error) {
    console.error('Connect partner error:', error);
    res.status(500).json({ message: 'Failed to connect with partner', error: error.message });
  }
};

// Get couple information
const getCoupleInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('coupleId partnerId');
    
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId)
      .populate('user1', 'name email avatar isOnline lastSeen')
      .populate('user2', 'name email avatar isOnline lastSeen');

    // Calculate updated stats
    couple.stats.daysTogether = couple.daysTogetherCalculated;
    await couple.save();

    res.json({
      couple: {
        id: couple._id,
        relationshipStart: couple.relationshipStart,
        anniversaryDate: couple.anniversaryDate,
        stats: couple.stats,
        milestones: couple.milestones,
        partner: user.partnerId,
        isConnected: true,
        recentActivities: couple.recentActivities
      }
    });
  } catch (error) {
    console.error('Get couple info error:', error);
    res.status(500).json({ message: 'Failed to get couple information', error: error.message });
  }
};

// Add milestone
const addMilestone = async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId);
    
    couple.milestones.push({
      title,
      description,
      date: new Date(date),
      type: type || 'custom'
    });

    await couple.save();

    // Add activity and broadcast
    await couple.addActivity({
      type: 'milestone',
      description: `Added milestone: ${title}`,
      userId: req.user._id,
      icon: '🎉'
    }, req.io);

    res.json({
      message: 'Milestone added successfully',
      milestone: couple.milestones[couple.milestones.length - 1]
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ message: 'Failed to add milestone', error: error.message });
  }
};

// Update couple settings
const updateCoupleSettings = async (req, res) => {
  try {
    const { anniversaryDate, isPublic, allowNotifications } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const updateData = {};
    if (anniversaryDate) updateData.anniversaryDate = new Date(anniversaryDate);
    if (isPublic !== undefined) updateData['settings.isPublic'] = isPublic;
    if (allowNotifications !== undefined) updateData['settings.allowNotifications'] = allowNotifications;

    const couple = await Couple.findByIdAndUpdate(
      user.coupleId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Couple settings updated successfully',
      settings: couple.settings
    });
  } catch (error) {
    console.error('Update couple settings error:', error);
    res.status(500).json({ message: 'Failed to update couple settings', error: error.message });
  }
};

// Disconnect couple (break up)
const disconnectCouple = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId);
    const partnerId = user.partnerId;

    // Remove couple references from both users
    await User.findByIdAndUpdate(user._id, {
      $unset: { coupleId: 1, partnerId: 1 }
    });

    await User.findByIdAndUpdate(partnerId, {
      $unset: { coupleId: 1, partnerId: 1 }
    });

    // Mark couple as inactive (don't delete for data preservation)
    await Couple.findByIdAndUpdate(couple._id, {
      'settings.isActive': false,
      disconnectedAt: new Date()
    });

    // Emit disconnection to both users
    if (req.io) {
      req.io.to(`couple_${couple._id}`).emit('partner_disconnected');
    }

    res.json({ message: 'Couple relationship ended successfully' });
  } catch (error) {
    console.error('Disconnect couple error:', error);
    res.status(500).json({ message: 'Failed to disconnect couple', error: error.message });
  }
};

module.exports = {
  connectWithPartner,
  getCoupleInfo,
  addMilestone,
  updateCoupleSettings,
  disconnectCouple
};