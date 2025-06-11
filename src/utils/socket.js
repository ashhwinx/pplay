import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.userId = null;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.userId = userId;
    const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    console.log('Connecting to socket server:', serverUrl);
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Join with user ID
      if (userId) {
        this.socket.emit('join', userId);
        console.log('Joined socket with user ID:', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Re-register all listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      console.log('Emitting event:', event, data);
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Game-specific methods
  inviteToGame(gameData) {
    this.emit('invite_game', {
      ...gameData,
      inviterName: gameData.inviterName || 'Your partner'
    });
  }

  joinGame(gameSessionId) {
    this.emit('join_game', { gameSessionId });
  }

  makeGameMove(gameSessionId, move) {
    this.emit('game_move', { gameSessionId, move });
  }

  endGame(gameSessionId, winner, finalScores) {
    this.emit('end_game', { gameSessionId, winner, finalScores });
  }

  // Watch together methods
  syncVideo(coupleId, action, timestamp, videoUrl) {
    this.emit('video_sync', { coupleId, action, timestamp, videoUrl });
  }

  // Chat methods
  sendChatMessage(coupleId, message, type = 'text') {
    this.emit('chat_message', { coupleId, message, type });
  }

  sendTyping(coupleId, isTyping) {
    this.emit('typing', { coupleId, isTyping });
  }

  // Gift methods
  sendGift(coupleId, giftData) {
    this.emit('gift_sent', { coupleId, giftData });
  }

  // Journal methods
  addJournalEntry(coupleId, journalData) {
    this.emit('journal_added', { coupleId, journalData });
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;