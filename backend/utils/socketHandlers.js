const GameSession = require('../models/GameSession');
const Couple = require('../models/Couple');

const socketHandlers = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // User joins with their ID
    socket.on('join', async (userId) => {
      try {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        
        // Join couple room if user has a partner
        const user = await require('../models/User').findById(userId).populate('coupleId');
        if (user && user.coupleId) {
          socket.join(`couple_${user.coupleId._id}`);
          
          // Notify partner that user is online
          socket.to(`couple_${user.coupleId._id}`).emit('partner_status', {
            userId,
            status: 'online'
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
        const { gameType, partnerId, coupleId } = data;
        
        const gameSession = new GameSession({
          gameType,
          players: [socket.userId],
          coupleId,
          status: 'waiting'
        });
        
        await gameSession.save();
        
        // Send invitation to partner
        const partnerSocketId = connectedUsers.get(partnerId);
        if (partnerSocketId) {
          io.to(partnerSocketId).emit('game_invitation', {
            gameSessionId: gameSession._id,
            gameType,
            inviterName: data.inviterName
          });
        }
        
        socket.emit('game_created', { gameSessionId: gameSession._id });
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
        
        // Add player to game
        if (!gameSession.players.includes(socket.userId)) {
          gameSession.players.push(socket.userId);
          gameSession.status = 'active';
          await gameSession.save();
        }
        
        socket.join(`game_${gameSessionId}`);
        
        // Notify all players that game is starting
        io.to(`game_${gameSessionId}`).emit('game_started', {
          gameSessionId,
          players: gameSession.players
        });
        
      } catch (error) {
        console.error('❌ Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Game move
    socket.on('game_move', async (data) => {
      try {
        const { gameSessionId, move } = data;
        
        // Broadcast move to other players
        socket.to(`game_${gameSessionId}`).emit('game_move', {
          playerId: socket.userId,
          move
        });
        
        // Update game session with move
        await GameSession.findByIdAndUpdate(gameSessionId, {
          $push: { moves: { playerId: socket.userId, move, timestamp: new Date() } }
        });
        
      } catch (error) {
        console.error('❌ Error processing game move:', error);
      }
    });

    // Watch together sync
    socket.on('video_sync', (data) => {
      const { coupleId, action, timestamp, videoUrl } = data;
      
      socket.to(`couple_${coupleId}`).emit('video_sync', {
        action, // play, pause, seek
        timestamp,
        videoUrl,
        syncedBy: socket.userId
      });
    });

    // Chat message
    socket.on('chat_message', async (data) => {
      try {
        const { coupleId, message, type = 'text' } = data;
        
        const chatData = {
          userId: socket.userId,
          message,
          type,
          timestamp: new Date()
        };
        
        // Broadcast to couple room
        io.to(`couple_${coupleId}`).emit('chat_message', chatData);
        
        // Add to couple's recent activities
        await Couple.findByIdAndUpdate(coupleId, {
          $push: {
            recentActivities: {
              type: 'chat',
              description: `New message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
              userId: socket.userId,
              timestamp: new Date()
            }
          }
        });
        
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

    // Disconnect handling
    socket.on('disconnect', async () => {
      try {
        console.log(`👋 User disconnected: ${socket.id}`);
        
        if (socket.userId) {
          connectedUsers.delete(socket.userId);
          
          // Notify partner that user is offline
          const user = await require('../models/User').findById(socket.userId).populate('coupleId');
          if (user && user.coupleId) {
            socket.to(`couple_${user.coupleId._id}`).emit('partner_status', {
              userId: socket.userId,
              status: 'offline'
            });
          }
        }
      } catch (error) {
        console.error('❌ Error in disconnect:', error);
      }
    });
  });

  return io;
};

module.exports = socketHandlers;