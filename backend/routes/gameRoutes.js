const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const GameSession = require('../models/GameSession');
const Couple = require('../models/Couple');
const User = require('../models/User');

// All routes are protected
router.use(verifyToken);

// Create game session
router.post('/create', async (req, res) => {
  try {
    const { gameType, settings } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.coupleId || !user.partnerId) {
      return res.status(404).json({ message: 'No partner found' });
    }

    const gameSession = new GameSession({
      coupleId: user.coupleId,
      gameType,
      players: [req.user._id],
      gameData: {
        settings: settings || {},
        scores: new Map([[req.user._id.toString(), 0]]),
        currentPlayer: req.user._id
      }
    });

    await gameSession.save();

    // Emit invitation to partner via socket
    if (req.io) {
      req.io.to(`user_${user.partnerId}`).emit('game_invitation', {
        gameSessionId: gameSession._id,
        gameType,
        inviter: { 
          id: user._id,
          name: user.name, 
          avatar: user.avatar 
        }
      });
    }

    res.status(201).json({
      message: 'Game session created successfully',
      gameSession: {
        id: gameSession._id,
        gameType: gameSession.gameType,
        status: gameSession.status,
        players: gameSession.players
      }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Failed to create game session', error: error.message });
  }
});

// Join game session
router.post('/:id/join', async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    // Check if user is part of the couple
    const user = await User.findById(req.user._id);
    if (gameSession.coupleId.toString() !== user.coupleId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add player if not already in
    if (!gameSession.players.includes(req.user._id)) {
      gameSession.players.push(req.user._id);
      gameSession.gameData.scores.set(req.user._id.toString(), 0);
    }

    // Start game if both players joined
    if (gameSession.players.length === 2) {
      gameSession.status = 'active';
      gameSession.startedAt = new Date();
      gameSession.gameData.currentPlayer = gameSession.players[0];
    }

    await gameSession.save();

    // Notify all players via socket
    if (req.io) {
      req.io.to(`couple_${gameSession.coupleId}`).emit('game_joined', {
        gameSessionId: gameSession._id,
        player: { 
          id: user._id,
          name: user.name, 
          avatar: user.avatar 
        },
        status: gameSession.status,
        players: gameSession.players
      });

      if (gameSession.status === 'active') {
        req.io.to(`couple_${gameSession.coupleId}`).emit('game_started', {
          gameSessionId: gameSession._id,
          players: gameSession.players,
          currentPlayer: gameSession.gameData.currentPlayer
        });
      }
    }

    res.json({
      message: 'Joined game successfully',
      gameSession: {
        id: gameSession._id,
        gameType: gameSession.gameType,
        status: gameSession.status,
        players: gameSession.players,
        currentPlayer: gameSession.gameData.currentPlayer
      }
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ message: 'Failed to join game', error: error.message });
  }
});

// Make game move
router.post('/:id/move', async (req, res) => {
  try {
    const { move } = req.body;
    
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    // Check if it's player's turn
    if (gameSession.gameData.currentPlayer.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Not your turn' });
    }

    // Add move
    gameSession.moves.push({
      playerId: req.user._id,
      move,
      timestamp: new Date()
    });

    // Switch turns
    const currentPlayerIndex = gameSession.players.findIndex(
      p => p.toString() === req.user._id.toString()
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameSession.players.length;
    gameSession.gameData.currentPlayer = gameSession.players[nextPlayerIndex];

    await gameSession.save();

    // Broadcast move to other players via socket
    if (req.io) {
      req.io.to(`couple_${gameSession.coupleId}`).emit('game_move', {
        gameSessionId: gameSession._id,
        move,
        playerId: req.user._id,
        nextPlayer: gameSession.gameData.currentPlayer
      });
    }

    res.json({
      message: 'Move made successfully',
      gameSession: {
        id: gameSession._id,
        currentPlayer: gameSession.gameData.currentPlayer,
        moves: gameSession.moves
      }
    });
  } catch (error) {
    console.error('Make move error:', error);
    res.status(500).json({ message: 'Failed to make move', error: error.message });
  }
});

// End game
router.post('/:id/end', async (req, res) => {
  try {
    const { winner, finalScores } = req.body;
    
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    gameSession.status = 'completed';
    gameSession.winner = winner;
    gameSession.completedAt = new Date();
    
    if (finalScores) {
      gameSession.gameData.scores = new Map(Object.entries(finalScores));
    }

    await gameSession.save();

    // Update couple stats
    const couple = await Couple.findById(gameSession.coupleId);
    await couple.updateStats('gamesPlayed');

    // Add activity
    const winnerUser = await User.findById(winner);
    await couple.addActivity({
      type: 'game',
      description: `${winnerUser.name} won ${gameSession.gameType}!`,
      userId: winner,
      icon: '🎮',
      metadata: {
        gameType: gameSession.gameType,
        duration: gameSession.duration
      }
    }, req.io);

    // Notify players via socket
    if (req.io) {
      req.io.to(`couple_${gameSession.coupleId}`).emit('game_ended', {
        gameSessionId: gameSession._id,
        winner: winnerUser.name,
        finalScores
      });
    }

    res.json({
      message: 'Game ended successfully',
      gameSession: {
        id: gameSession._id,
        status: gameSession.status,
        winner: gameSession.winner,
        finalScores: Object.fromEntries(gameSession.gameData.scores)
      }
    });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ message: 'Failed to end game', error: error.message });
  }
});

// Get game history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10, gameType } = req.query;
    
    const user = await User.findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const query = { 
      coupleId: user.coupleId,
      status: 'completed'
    };
    
    if (gameType) query.gameType = gameType;

    const games = await GameSession.find(query)
      .populate('players', 'name avatar')
      .populate('winner', 'name avatar')
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GameSession.countDocuments(query);

    res.json({
      games,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ message: 'Failed to get game history', error: error.message });
  }
});

// Get game statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.coupleId) {
      return res.status(404).json({ message: 'No couple relationship found' });
    }

    const stats = await GameSession.aggregate([
      { $match: { coupleId: user.coupleId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          gamesWon: {
            $sum: { $cond: [{ $eq: ['$winner', user._id] }, 1, 0] }
          },
          gameTypes: { $push: '$gameType' },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    const gameTypeStats = await GameSession.aggregate([
      { $match: { coupleId: user.coupleId, status: 'completed' } },
      { $group: { _id: '$gameType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || { totalGames: 0, gamesWon: 0, totalDuration: 0 };
    result.winRate = result.totalGames > 0 ? Math.round((result.gamesWon / result.totalGames) * 100) : 0;
    result.gameTypes = gameTypeStats;

    res.json({ stats: result });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ message: 'Failed to get game statistics', error: error.message });
  }
});

module.exports = router;