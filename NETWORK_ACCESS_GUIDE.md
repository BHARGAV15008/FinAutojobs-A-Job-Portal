# Network Access Guide

## Overview
This guide explains how to access the FinAutoJobs application from other devices on your network, not just localhost.

## Quick Setup

### 1. **Automatic Setup**
```bash
# Run the setup script which will show network URLs
./setup-dev.sh

# Start the development server
npm run dev
```

### 2. **Manual Network Configuration**

#### **Find Your Local IP Address**
```bash
# On Linux/Mac
hostname -I | awk '{print $1}'

# Alternative method
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig | findstr "IPv4"
```

## Network Configuration

### **Frontend Configuration**
The frontend is configured to:
- Bind to `0.0.0.0:3000` (accepts connections from any IP)
- Automatically detect the current host and use it for API calls
- Support proxy configuration for API requests

### **Backend Configuration**
The backend is configured to:
- Bind to `0.0.0.0:5000` (accepts connections from any IP)
- Allow CORS for local network IP ranges
- Display network access URLs on startup

### **CORS Configuration**
The backend automatically allows:
- `localhost` and `127.0.0.1`
- Private network ranges:
  - `192.168.x.x` (most home networks)
  - `10.x.x.x` (corporate networks)
  - `172.16.x.x - 172.31.x.x` (Docker/VPN networks)

## Access URLs

### **Local Access (Same Computer)**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api/health
```

### **Network Access (Other Devices)**
Replace `YOUR_IP` with your actual local IP address:
```
Frontend: http://YOUR_IP:3000
Backend:  http://YOUR_IP:5000
API:      http://YOUR_IP:5000/api/health
```

### **Example Network URLs**
```
Frontend: http://192.168.1.100:3000
Backend:  http://192.168.1.100:5000
API:      http://192.168.1.100:5000/api/health
```

## Testing Network Access

### **1. Check Server Status**
```bash
# Test backend health from another device
curl http://YOUR_IP:5000/api/health

# Expected response:
{
  "status": "OK",
  "message": "FinAutoJobs API is running",
  "timestamp": "2025-01-10T04:59:00.000Z"
}
```

### **2. Test Frontend Access**
Open a web browser on another device and navigate to:
```
http://YOUR_IP:3000
```

### **3. Verify API Communication**
Check browser console for API configuration:
```javascript
🔧 API Configuration: {
  host: "192.168.1.100",
  apiUrl: "http://192.168.1.100:5000/api",
  socketUrl: "http://192.168.1.100:5000",
  env: undefined
}
```

## Firewall Configuration

### **Linux (UFW)**
```bash
# Allow ports 3000 and 5000
sudo ufw allow 3000
sudo ufw allow 5000

# Check status
sudo ufw status
```

### **Linux (iptables)**
```bash
# Allow ports 3000 and 5000
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

### **Windows Firewall**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Create new inbound rules for ports 3000 and 5000
4. Allow connections for both TCP ports

### **macOS**
```bash
# Check if firewall is enabled
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If enabled, add rules (usually not needed for development)
```

## Mobile Device Access

### **Same WiFi Network**
1. Connect your mobile device to the same WiFi network
2. Open browser and navigate to `http://YOUR_IP:3000`
3. The app should work exactly like on desktop

### **Mobile Testing Tips**
- Use Chrome DevTools for mobile debugging
- Test touch interactions and responsive design
- Verify all dashboard features work on mobile

## Troubleshooting

### **Common Issues**

#### **1. Cannot Connect from Other Devices**
```bash
# Check if services are running
netstat -tlnp | grep :3000
netstat -tlnp | grep :5000

# Check firewall status
sudo ufw status
```

#### **2. CORS Errors**
Check backend logs for CORS messages:
```
✅ CORS allowed origin: http://192.168.1.100:3000
❌ CORS blocked origin: http://some-blocked-origin
```

#### **3. API Calls Failing**
Check browser console for API configuration and errors:
```javascript
// Should show network IP, not localhost
🔧 API Configuration: {
  host: "192.168.1.100",
  apiUrl: "http://192.168.1.100:5000/api"
}
```

#### **4. Port Already in Use**
```bash
# Find what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process if needed
kill -9 PID
```

### **Debug Commands**

#### **Test Network Connectivity**
```bash
# From another device, test if ports are open
telnet YOUR_IP 3000
telnet YOUR_IP 5000

# Or use nmap
nmap -p 3000,5000 YOUR_IP
```

#### **Check Server Logs**
```bash
# Backend logs will show:
🚀 FinAutoJobs API Server running on port 5000
🌐 Network Access:
   📱 Local: http://localhost:5000
   🌍 Network: http://192.168.1.100:5000
   📊 Health check: http://192.168.1.100:5000/api/health
📡 Server accessible from any device on the network
```

## Production Considerations

### **Security Notes**
- Network access is intended for development only
- In production, use proper domain names and SSL certificates
- Configure proper firewall rules for production environments
- Use environment variables for production API URLs

### **Performance Tips**
- Network access may be slightly slower than localhost
- Use WiFi 5GHz for better performance
- Consider using a development proxy for better caching

## Environment Variables

### **Frontend (.env)**
```env
# Override automatic IP detection
VITE_API_URL=http://192.168.1.100:5000/api

# Custom backend port
VITE_BACKEND_PORT=5000
```

### **Backend (.env)**
```env
# Bind to specific interface (optional)
HOST=0.0.0.0
PORT=5000

# Frontend URL for CORS
FRONTEND_URL=http://192.168.1.100:3000
```

## Advanced Configuration

### **Custom Network Setup**
```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
```

### **Docker Network Access**
```dockerfile
# Expose ports in Dockerfile
EXPOSE 3000 5000

# Run with port mapping
docker run -p 3000:3000 -p 5000:5000 finautojobs
```

## Testing Checklist

- [ ] Backend starts and shows network URLs
- [ ] Frontend accessible via network IP
- [ ] API calls work from network access
- [ ] Dashboard navigation works
- [ ] Authentication works across network
- [ ] Real-time features (Socket.IO) work
- [ ] Mobile devices can access the app
- [ ] Firewall allows necessary ports
- [ ] CORS allows network origins

## Support

If you encounter issues with network access:

1. Check the console logs for configuration details
2. Verify firewall settings
3. Test connectivity with curl or telnet
4. Check CORS configuration in backend logs
5. Ensure both frontend and backend are using network IPs

The application should work identically whether accessed via localhost or network IP!
