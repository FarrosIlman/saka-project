import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Realtime Server');
      this.emit('connection-status-changed', true);
      this.emit('client-connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Realtime Server');
      this.emit('connection-status-changed', false);
      this.emit('client-disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket Error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Register event listeners
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unregister event listeners
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Real-time leaderboard updates
  joinLeaderboard() {
    this.emit('join-leaderboard');
  }

  leaveLeaderboard() {
    this.emit('leave-leaderboard');
  }

  // Real-time notifications
  subscribeToNotifications(userId) {
    this.emit('subscribe-notifications', userId);
  }

  unsubscribeFromNotifications(userId) {
    this.emit('unsubscribe-notifications', userId);
  }

  // User online status
  setUserStatus(status) {
    this.emit('user-status', status);
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
