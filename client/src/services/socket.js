import { io } from 'socket.io-client';

// Socket endpoint for realtime events
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Lightweight wrapper around socket.io-client
class SocketService {
  constructor() {
    this.socket = null;
  }

  // Create a single shared connection
  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  // Close and reset the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Safe emit
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Safe on
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Safe off
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();