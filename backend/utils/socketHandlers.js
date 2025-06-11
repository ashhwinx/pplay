const GameSession = require('../models/GameSession');
const Couple = require('../models/Couple');
const User = require('../models/User');

const socketHandlers = (io) => {
  const connectedUsers = new Map(); // userId -> socketId
  const userSockets = new Map(); // socketId -> userId

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // User joins with their ID
    socket.on('join', async (userId) => {
      try {
        // Store user-socket mapping
        connectedUsers.set(userId, socket.id);
        userSockets.set(socket.id, userId);
        socket.userId = userId;
        
        // Update user's socket ID and online status
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true,
          lastSeen: new Date()
        });
        
        // Join user to their personal room
        socket.join(`user_${userId}`);
        
        // Join couple room if user has a partner
        const user = await User.findById(userId).populate('coupleId partnerId');
        if (user && user.coupleId) {
          socket.join(`couple_${user.coupleId._id}`);
          
          // Notify partner that user is online
          socket.to(`couple_${user.coupleId._id}`).emit('partner_status', {
            userId,
            status: 'online',
            user: {
              id: user._id,
              name: user.name,
              avatar: user.avatar
            }
          });
        }
        
        console.log(`✅ User ${userId} joined successfully`);
      } catch (error) {
        console.error('❌ Error in join:', error);
      }
    });

    // Game invitation
    socket.on('invite_game', async (data) => {
      try {
        const { gameType, partnerId, coupleId, inviterName } = data;
        
        const gameSession = new GameSession({
          gameType,
          players: [socket.userId],
          coupleId,
          status: 'waiting',
          gameData: {
            settings: {},
            scores: new Map([[socket.userId, 0]]),
            currentPlayer: socket.userId
          }
        });
        
        await gameSession.save();
        
        // Send invitation to partner
        io.to(`user_${partnerId}`).emit('game_invitation', {
          gameSessionId: gameSession._id,
          gameType,
          inviterName,
          inviterId: socket.userId
        });
        
        socket.emit('game_created', { gameSessionId: gameSession._id });
        
        console.log(`🎮 Game invitation sent from ${socket.userId} to ${partnerId}`);
      } catch (error) {
        console.error('❌ Error creating game:', error);
        socket.emit('error', { message: 'Failed to create game' });
      }
    });

    // Join game
    socket.on('join_game', async (data) => {
      try {
        const { gameSessionId } = data;
        const gameSession = await GameSession.findById(gameSessionId);
        
        if (!gameSession) {
          socket.emit('error', { message: 'Game session not found' });
          return;
        }
        
        // Add player to game if not already in
        if (!gameSession.players.includes(socket.userId)) {
          gameSession.players.push(socket.userId);
          gameSession.gameData.scores.set(socket.userId, 0);
        }
        
        // Start game if both players joined
        if (gameSession.players.length === 2) {
          gameSession.status = 'active';
          gameSession.startedAt = new Date();
        }
        
        await gameSession.save();
        
        socket.join(`game_${gameSessionId}`);
        
        // Notify all players in the game
        io.to(`game_${gameSessionId}`).emit('game_joined', {
          gameSessionId,
          playerId: socket.userId,
          status: gameSession.status,
          players: gameSession.players
        });
        
        if (gameSession.status === 'active') {
          io.to(`game_${gameSessionId}`).emit('game_started', {
            gameSessionId,
            players: gameSession.players,
            currentPlayer: gameSession.gameData.currentPlayer
          });
        }
        
        console.log(`🎮 User ${socket.userId} joined game ${gameSessionId}`);
      } catch (error) {
        console.error('❌ Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Game move
    socket.on('game_move', async (data) => {
      try {
        const { gameSessionId, move } = data;
        
        const gameSession = await GameSession.findById(gameSessionId);
        if (!gameSession) {
          socket.emit('error', { message: 'Game session not found' });
          return;
        }
        
        // Validate it's player's turn
        if (gameSession.gameData.currentPlayer.toString() !== socket.userId) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }
        
        // Add move to game
        gameSession.moves.push({
          playerId: socket.userId,
          move,
          timestamp: new Date()
        });
        
        // Switch turns
        const currentPlayerIndex = gameSession.players.findIndex(
          p => p.toString() === socket.userId
        );
        const nextPlayerIndex = (currentPlayerIndex + 1) % gameSession.players.length;
        gameSession.gameData.currentPlayer = gameSession.players[nextPlayerIndex];
        
        await gameSession.save();
        
        // Broadcast move to all players in the game
        io.to(`game_${gameSessionId}`).emit('game_move', {
          gameSessionId,
          move,
          playerId: socket.userId,
          nextPlayer: gameSession.gameData.currentPlayer
        });
        
        console.log(`🎮 Game move made in ${gameSessionId} by ${socket.userId}`);
      } catch (error) {
        console.error('❌ Error processing game move:', error);
        socket.emit('error', { message: 'Failed to make move' });
      }
    });

    // End game
    socket.on('end_game', async (data) => {
      try {
        const { gameSessionId, winner, finalScores } = data;
        
        const gameSession = await GameSession.findById(gameSessionId);
        if (!gameSession) {
          socket.emit('error', { message: 'Game session not found' });
          return;
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
        if (couple) {
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
          }, io);
        }
        
        // Notify all players
        io.to(`game_${gameSessionId}`).emit('game_ended', {
          gameSessionId,
          winner,
          finalScores
        });
        
        console.log(`🎮 Game ${gameSessionId} ended, winner: ${winner}`);
      } catch (error) {
        console.error('❌ Error ending game:', error);
        socket.emit('error', { message: 'Failed to end game' });
      }
    });

    // Watch together sync
    socket.on('video_sync', async (data) => {
      try {
        const { coupleId, action, timestamp, videoUrl } = data;
        
        // Broadcast to partner in couple room
        socket.to(`couple_${coupleId}`).emit('video_sync', {
          action, // play, pause, seek
          timestamp,
          videoUrl,
          syncedBy: socket.userId
        });
        
        console.log(`📺 Video sync: ${action} by ${socket.userId} in couple ${coupleId}`);
      } catch (error) {
        console.error('❌ Error syncing video:', error);
      }
    });

    // Chat message
    socket.on('chat_message', async (data) => {
      try {
        const { coupleId, message, type = 'text' } = data;
        
        const user = await User.findById(socket.userId);
        
        const chatData = {
          userId: socket.userId,
          user: {
            name: user.name,
            avatar: user.avatar
          },
          message,
          type,
          timestamp: new Date()
        };
        
        // Broadcast to couple room
        io.to(`couple_${coupleId}`).emit('chat_message', chatData);
        
        // Add to couple's recent activities
        const couple = await Couple.findById(coupleId);
        if (couple) {
          await couple.addActivity({
            type: 'chat',
            description: `New message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            userId: socket.userId,
            icon: '💬'
          }, io);
        }
        
        console.log(`💬 Chat message from ${socket.userId} in couple ${coupleId}`);
      } catch (error) {
        console.error('❌ Error sending chat message:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { coupleId, isTyping } = data;
      socket.to(`couple_${coupleId}`).emit('typing', {
        userId: socket.userId,
        isTyping
      });
    });

    // Gift sent
    socket.on('gift_sent', async (data) => {
      try {
        const { coupleId, giftData } = data;
        
        // Broadcast gift to partner
        socket.to(`couple_${coupleId}`).emit('gift_received', {
          gift: giftData,
          from: socket.userId
        });
        
        console.log(`🎁 Gift sent by ${socket.userId} in couple ${coupleId}`);
      } catch (error) {
        console.error('❌ Error sending gift:', error);
      }
    });

    // Journal entry added
    socket.on('journal_added', async (data) => {
      try {
        const { coupleId, journalData } = data;
        
        // Broadcast to partner
        socket.to(`couple_${coupleId}`).emit('journal_updated', {
          journal: journalData,
          author: socket.userId
        });
        
        console.log(`📖 Journal entry added by ${socket.userId} in couple ${coupleId}`);
      } catch (error) {
        console.error('❌ Error adding journal entry:', error);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      try {
        console.log(`👋 User disconnected: ${socket.id}`);
        
        const userId = userSockets.get(socket.id);
        if (userId) {
          // Update user offline status
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null
          });
          
          // Notify partner that user is offline
          const user = await User.findById(userId).populate('coupleId');
          if (user && user.coupleId) {
            socket.to(`couple_${user.coupleId._id}`).emit('partner_status', {
              userId,
              status: 'offline'
            });
          }
          
          // Clean up mappings
          connectedUsers.delete(userId);
          userSockets.delete(socket.id);
        }
      } catch (error) {
        console.error('❌ Error in disconnect:', error);
      }
    });
  });

  return io;
};

module.exports = socketHandlers;