import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', {
        message: 'Connected to real-time services',
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
      this.connected = false;
      this.emit('disconnected', {
        reason,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.connected = false;
      this.emit('connection_error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time events
    this.socket.on('connected', (data) => {
      this.emit('ws_connected', data);
    });

    this.socket.on('application_status_updated', (data) => {
      this.emit('application_status_updated', data);
    });

    this.socket.on('new_job_alert', (data) => {
      this.emit('new_job_alert', data);
    });

    this.socket.on('new_job_posted_admin', (data) => {
      this.emit('new_job_posted_admin', data);
    });

    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data) => {
      this.emit('message_sent', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
      this.emit('ws_error', data);
    });

    this.socket.on('user_disconnected', (data) => {
      this.emit('user_disconnected', data);
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a job-specific room
  joinJobRoom(jobId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_job_room', jobId);
    }
  }

  // Leave a job-specific room
  leaveJobRoom(jobId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_job_room', jobId);
    }
  }

  // Update application status
  updateApplicationStatus(applicationId, status, notes = '') {
    if (this.socket && this.connected) {
      this.socket.emit('application_update', {
        applicationId,
        status,
        notes
      });
    }
  }

  // Notify about new job posting
  notifyNewJobPosted(jobId) {
    if (this.socket && this.connected) {
      this.socket.emit('new_job_posted', { jobId });
    }
  }

  // Send message to another user
  sendMessage(recipientId, message, jobId = null) {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', {
        recipientId,
        message,
        jobId
      });
    }
  }

  // Send typing indicator
  startTyping(recipientId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_start', { recipientId });
    }
  }

  // Stop typing indicator
  stopTyping(recipientId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_stop', { recipientId });
    }
  }

  // Event handler management
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
