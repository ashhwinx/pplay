const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const Couple = require('../models/Couple');

// All routes are protected
router.use(verifyToken);

// Start watch session
router.post('/start', async (req, res) => {
  try {
    const { videoUrl, title, description, platform } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    // Create watch session data
    const watchSession = {
      videoUrl,
      title,
      description,
      platform: platform || 'custom',
      startedBy: req.user._id,
      startedAt: new Date(),
      participants: [req.user._id]
    };

    // Update couple stats
    const couple = await Couple.findById(user.coupleId);
    await couple.updateStats('moviesWatched');

    // Add activity
    await couple.addActivity({
      type: 'watch',
      description: `Started watching "${title}"`,
      userId: req.user._id,
      icon: '📺',
      metadata: {
        videoUrl,
        title,
        platform
      }
    });

    // Notify partner via socket
    if (req.io) {
      req.io.to(`couple_${user.coupleId}`).emit('watch_session_started', {
        session: watchSession,
        startedBy: { name: user.name, avatar: user.avatar }
      });
    }

    res.status(201).json({
      message: 'Watch session started successfully',
      session: watchSession
    });
  } catch (error) {
    console.error('Start watch session error:', error);
    res.status(500).json({ message: 'Failed to start watch session', error: error.message });
  }
});

// Sync video playback
router.post('/sync', async (req, res) => {
  try {
    const { action, timestamp, videoUrl } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    // Broadcast sync event to partner
    if (req.io) {
      req.io.to(`couple_${user.coupleId}`).emit('video_sync', {
        action, // 'play', 'pause', 'seek'
        timestamp,
        videoUrl,
        syncedBy: req.user._id,
        syncedByName: user.name
      });
    }

    res.json({ message: 'Sync event sent successfully' });
  } catch (error) {
    console.error('Video sync error:', error);
    res.status(500).json({ message: 'Failed to sync video', error: error.message });
  }
});

// Get watch history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId);
    
    // Get watch activities from recent activities
    const watchActivities = couple.recentActivities
      .filter(activity => activity.type === 'watch')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice((page - 1) * limit, page * limit);

    res.json({
      watchHistory: watchActivities,
      totalPages: Math.ceil(couple.recentActivities.filter(a => a.type === 'watch').length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({ message: 'Failed to get watch history', error: error.message });
  }
});

// Add to watch list
router.post('/watchlist', async (req, res) => {
  try {
    const { videoUrl, title, description, platform, thumbnail } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    // For now, we'll store watchlist in couple's metadata
    // In a production app, you might want a separate WatchList model
    const couple = await Couple.findById(user.coupleId);
    
    if (!couple.watchList) {
      couple.watchList = [];
    }

    couple.watchList.push({
      videoUrl,
      title,
      description,
      platform,
      thumbnail,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await couple.save();

    res.status(201).json({
      message: 'Added to watch list successfully',
      watchList: couple.watchList
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Failed to add to watch list', error: error.message });
  }
});

// Get watch list
router.get('/watchlist', async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId)
      .populate('watchList.addedBy', 'name avatar');

    res.json({
      watchList: couple.watchList || []
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Failed to get watch list', error: error.message });
  }
});

// Remove from watch list
router.delete('/watchlist/:index', async (req, res) => {
  try {
    const { index } = req.params;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId);
    
    if (couple.watchList && couple.watchList[index]) {
      couple.watchList.splice(index, 1);
      await couple.save();
    }

    res.json({
      message: 'Removed from watch list successfully',
      watchList: couple.watchList
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Failed to remove from watch list', error: error.message });
  }
});

module.exports = router;