const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class RealtimeManager {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.userSockets = new Map(); // userId -> socket.id mapping
    this.leaderboardUsers = new Set(); // Users watching leaderboard

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  setupAuthentication() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✓ User connected: ${socket.userId} (Socket: ${socket.id})`);
      this.userSockets.set(socket.userId, socket.id);

      // Update user online status in database
      User.findByIdAndUpdate(socket.userId, { status: 'online' }).catch(() => {});

      // Real-time leaderboard
      socket.on('join-leaderboard', () => {
        socket.join('leaderboard');
        this.leaderboardUsers.add(socket.userId);
        console.log(`User ${socket.userId} joined leaderboard (${this.leaderboardUsers.size} watching)`);
      });

      socket.on('leave-leaderboard', () => {
        socket.leave('leaderboard');
        this.leaderboardUsers.delete(socket.userId);
        console.log(`User ${socket.userId} left leaderboard (${this.leaderboardUsers.size} watching)`);
      });

      // Real-time notifications
      socket.on('subscribe-notifications', (userId) => {
        socket.join(`notifications:${userId}`);
        console.log(`Subscribed to notifications for ${userId}`);
      });

      socket.on('unsubscribe-notifications', (userId) => {
        socket.leave(`notifications:${userId}`);
      });

      // User status update
      socket.on('user-status', async (status) => {
        await User.findByIdAndUpdate(socket.userId, { status });
        socket.broadcast.emit('user-status-changed', {
          userId: socket.userId,
          status: status,
        });
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`✗ User disconnected: ${socket.userId}`);
        this.userSockets.delete(socket.userId);
        this.leaderboardUsers.delete(socket.userId);

        // Set user offline status
        User.findByIdAndUpdate(socket.userId, { status: 'offline' }).catch(() => {});
      });

      // Client heartbeat
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  // Broadcast real-time updates
  broadcastLeaderboardUpdate(updatedUser) {
    if (this.leaderboardUsers.size > 0) {
      this.io.to('leaderboard').emit('leaderboard-updated', {
        user: updatedUser,
        timestamp: new Date(),
      });
    }
  }

  // Send real-time notification
  sendNotification(userId, notification) {
    this.io.to(`notifications:${userId}`).emit('new-notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  // Broadcast to all connected users
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  // Get leaderboard watchers count
  getLeaderboardWatchersCount() {
    return this.leaderboardUsers.size;
  }
}

module.exports = RealtimeManager;
