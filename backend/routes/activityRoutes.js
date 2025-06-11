const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const Activity = require('../models/Activity');
const Couple = require('../models/Couple');

// All routes are protected
router.use(verifyToken);

// Get recent activities for couple
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId)
      .populate('recentActivities.userId', 'name avatar');

    let activities = couple.recentActivities || [];
    
    // Filter by type if specified
    if (type) {
      activities = activities.filter(activity => activity.type === type);
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedActivities = activities.slice(startIndex, endIndex);

    res.json({
      activities: paginatedActivities,
      totalPages: Math.ceil(activities.length / limit),
      currentPage: parseInt(page),
      total: activities.length
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Failed to get activities', error: error.message });
  }
});

// Add new activity
router.post('/', async (req, res) => {
  try {
    const { type, description, icon, metadata } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const couple = await Couple.findById(user.coupleId);
    
    // Add activity to couple's recent activities
    await couple.addActivity({
      type,
      description,
      userId: req.user._id,
      icon: icon || '❤️',
      metadata
    });

    // Also create a separate Activity record for detailed tracking
    const activity = new Activity({
      coupleId: user.coupleId,
      userId: req.user._id,
      type,
      description,
      icon: icon || '❤️',
      metadata
    });

    await activity.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(`couple_${user.coupleId}`).emit('new_activity', {
        activity: {
          ...activity.toObject(),
          user: { name: user.name, avatar: user.avatar }
        }
      });
    }

    res.status(201).json({
      message: 'Activity added successfully',
      activity
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Failed to add activity', error: error.message });
  }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await Activity.aggregate([
      {
        $match: {
          coupleId: user.coupleId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get daily activity counts
    const dailyStats = await Activity.aggregate([
      {
        $match: {
          coupleId: user.coupleId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        byType: stats,
        daily: dailyStats,
        timeframe,
        totalActivities: stats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: 'Failed to get activity statistics', error: error.message });
  }
});

// Clear old activities (cleanup)
router.delete('/cleanup', async (req, res) => {
  try {
    const { olderThan = '90d' } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    // Calculate cutoff date
    const now = new Date();
    let cutoffDate;
    
    switch (olderThan) {
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '180d':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Delete old activities
    const result = await Activity.deleteMany({
      coupleId: user.coupleId,
      createdAt: { $lt: cutoffDate }
    });

    // Also clean up couple's recent activities array
    const couple = await Couple.findById(user.coupleId);
    couple.recentActivities = couple.recentActivities.filter(
      activity => new Date(activity.timestamp) >= cutoffDate
    );
    await couple.save();

    res.json({
      message: 'Old activities cleaned up successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup activities error:', error);
    res.status(500).json({ message: 'Failed to cleanup activities', error: error.message });
  }
});

module.exports = router;