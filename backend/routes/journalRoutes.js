const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const Journal = require('../models/Journal');
const Couple = require('../models/Couple');

// All routes are protected
router.use(verifyToken);

// Create new journal entry
router.post('/new', async (req, res) => {
  try {
    const { title, content, mood, tags, isPrivate } = req.body;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const journal = new Journal({
      coupleId: user.coupleId,
      authorId: req.user._id,
      title,
      content,
      mood: mood || 'happy',
      tags: tags || [],
      isPrivate: isPrivate || false
    });

    await journal.save();

    // Update couple stats
    const couple = await Couple.findById(user.coupleId);
    await couple.updateStats('memoriesShared');
    
    // Add activity
    await couple.addActivity({
      type: 'journal',
      description: `Added a new memory: "${title}"`,
      userId: req.user._id,
      icon: '📖'
    });

    res.status(201).json({
      message: 'Journal entry created successfully',
      journal
    });
  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ message: 'Failed to create journal entry', error: error.message });
  }
});

// Get journal entries for couple
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, mood, tags, author } = req.query;
    
    const user = await require('../models/User').findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const query = { coupleId: user.coupleId };
    
    // Add filters
    if (mood) query.mood = mood;
    if (tags) query.tags = { $in: tags.split(',') };
    if (author) query.authorId = author;

    const journals = await Journal.find(query)
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Journal.countDocuments(query);

    res.json({
      journals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({ message: 'Failed to get journal entries', error: error.message });
  }
});

// Get single journal entry
router.get('/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id)
      .populate('authorId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('reactions.userId', 'name avatar');

    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check if user has access to this journal
    const user = await require('../models/User').findById(req.user._id);
    if (journal.coupleId.toString() !== user.coupleId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ journal });
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(500).json({ message: 'Failed to get journal entry', error: error.message });
  }
});

// Add reaction to journal entry
router.post('/:id/react', async (req, res) => {
  try {
    const { type } = req.body;
    
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Remove existing reaction from this user
    journal.reactions = journal.reactions.filter(
      reaction => reaction.userId.toString() !== req.user._id.toString()
    );

    // Add new reaction
    journal.reactions.push({
      userId: req.user._id,
      type,
      timestamp: new Date()
    });

    await journal.save();

    res.json({ message: 'Reaction added successfully', reactions: journal.reactions });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Failed to add reaction', error: error.message });
  }
});

// Add comment to journal entry
router.post('/:id/comment', async (req, res) => {
  try {
    const { content } = req.body;
    
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    journal.comments.push({
      userId: req.user._id,
      content,
      timestamp: new Date()
    });

    await journal.save();

    const populatedJournal = await Journal.findById(req.params.id)
      .populate('comments.userId', 'name avatar');

    res.json({ 
      message: 'Comment added successfully', 
      comments: populatedJournal.comments 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

// Update journal entry
router.put('/:id', async (req, res) => {
  try {
    const { title, content, mood, tags, isPrivate } = req.body;
    
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check if user is the author
    if (journal.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own journal entries' });
    }

    // Update fields
    if (title) journal.title = title;
    if (content) journal.content = content;
    if (mood) journal.mood = mood;
    if (tags) journal.tags = tags;
    if (isPrivate !== undefined) journal.isPrivate = isPrivate;

    await journal.save();

    res.json({ message: 'Journal entry updated successfully', journal });
  } catch (error) {
    console.error('Update journal error:', error);
    res.status(500).json({ message: 'Failed to update journal entry', error: error.message });
  }
});

// Delete journal entry
router.delete('/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check if user is the author
    if (journal.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own journal entries' });
    }

    await Journal.findByIdAndDelete(req.params.id);

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({ message: 'Failed to delete journal entry', error: error.message });
  }
});

module.exports = router;