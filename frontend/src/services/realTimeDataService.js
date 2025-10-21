class RealTimeDataService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscribers = new Map();
    this.cache = new Map();
    this.baseURL = process.env.REACT_APP_DATABASE_URL || 'http://localhost:5000';
    this.wsURL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.ws && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsURL);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected to database server');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Authenticate WebSocket connection
          this.ws.send(JSON.stringify({
            type: 'auth',
            token: token
          }));

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected from database server');
          this.isConnected = false;
          this.attemptReconnect(token);
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    switch (data.type) {
      case 'auth_success':
        console.log('✅ WebSocket authenticated successfully');
        break;

      case 'auth_error':
        console.error('❌ WebSocket authentication failed:', data.message);
        break;

      case 'dashboard_updated':
        this.updateCache('dashboard', data.data);
        this.emit('dashboard_updated', data.data);
        break;

      case 'notification':
        this.emit('notification_received', data.data);
        break;

      case 'application_updated':
        this.emit('application_updated', data.data);
        break;

      case 'job_analytics_updated':
        this.emit('job_analytics_updated', data.data);
        break;

      case 'initial_data':
        this.updateCache('dashboard', data.data);
        this.emit('initial_data_received', data.data);
        break;

      case 'event':
        this.emit(data.event, data.data);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  // Attempt to reconnect WebSocket
  attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    setTimeout(() => {
      this.connect(token).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  // Subscribe to real-time events
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Subscribe to WebSocket events if connected
    if (this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        event: eventType
      }));
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  // Emit events to subscribers
  emit(eventType, data) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Cache management
  updateCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
    return null;
  }

  // API methods with real-time integration
  async getDashboardData(userRole = 'applicant') {
    try {
      // Check cache first
      const cached = this.getFromCache('dashboard');
      if (cached) {
        return cached;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/dashboard/${userRole}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.updateCache('dashboard', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async getAnalytics(timeRange = '30d', metric = 'all') {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/analytics?timeRange=${timeRange}&metric=${metric}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getRealTimeMetrics() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/realtime/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch real-time metrics');
      }
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  async updateProfileCompleteness() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/api/profile/completeness`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update profile completeness');
      }
    } catch (error) {
      console.error('Error updating profile completeness:', error);
      throw error;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      hasWebSocket: !!this.ws
    };
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Get database info
  async getDatabaseInfo() {
    try {
      const response = await fetch(`${this.baseURL}/api/database/info`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get database info:', error);
      throw error;
    }
  }
}

// Create singleton instance
const realTimeDataService = new RealTimeDataService();

export default realTimeDataService;
