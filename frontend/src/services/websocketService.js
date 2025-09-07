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

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';
      
    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: true
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
      this.reconnectAttempts++;
      
      // Emit connection error with retry information
      this.emit('connection_error', {
        error: error.message,
        reconnectAttempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        timestamp: new Date().toISOString()
      });
      
      // If max attempts reached, stop trying
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached. Stopping reconnection.');
        this.emit('max_reconnect_attempts_reached', {
          message: 'Unable to connect to real-time services. Please refresh the page.',
          timestamp: new Date().toISOString()
        });
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected to WebSocket server after ${attemptNumber} attempts`);
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('reconnected', {
        message: 'Reconnected to real-time services',
        attemptNumber,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error);
      this.emit('reconnect_error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed');
      this.connected = false;
      this.emit('reconnect_failed', {
        message: 'Failed to reconnect to real-time services',
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
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null
    };
  }

  // Manual retry connection
  retryConnection(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log('🔄 Manually retrying WebSocket connection...');
      this.reconnectAttempts = 0; // Reset attempts for manual retry
      this.connect(token);
    } else {
      console.warn('⚠️ Cannot retry: Max reconnection attempts already reached');
    }
  }

  // Reset connection state
  resetConnectionState() {
    this.reconnectAttempts = 0;
    this.connected = false;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
