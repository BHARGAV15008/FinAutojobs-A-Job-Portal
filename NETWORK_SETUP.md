# 🌐 FinAutoJobs Network Setup Guide

This guide will help you configure FinAutoJobs to work across your local network and prepare it for deployment.

## 📋 Quick Setup (Recommended)

### For Linux/Mac:
```bash
# Make the script executable and run it
chmod +x setup-network.sh
./setup-network.sh

# Start the application
./start-network.sh
```

### For Windows:
```cmd
# Run the setup script
setup-network.bat

# Start the application
start-network.bat
```

## 🔧 Manual Setup

### 1. Find Your Machine's IP Address

**Linux:**
```bash
hostname -I | awk '{print $1}'
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

**Windows:**
```cmd
ipconfig | findstr IPv4
```

### 2. Configure Frontend

Copy the network configuration:
```bash
cd frontend
cp .env.network .env
```

Edit `frontend/.env` and replace `YOUR_MACHINE_IP` with your actual IP:
```env
VITE_API_URL=http://192.168.1.100:5000/api
VITE_BACKEND_URL=http://192.168.1.100:5000
```

### 3. Configure Backend

Copy the network configuration:
```bash
cd backend
cp .env.network .env
```

Edit `backend/.env` and replace `YOUR_MACHINE_IP` with your actual IP:
```env
FRONTEND_URL=http://192.168.1.100:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.100:3000,http://localhost:5173,http://192.168.1.100:5173
```

### 4. Start the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

## 🌍 Access URLs

After setup, your application will be accessible at:

- **Local Access:**
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000

- **Network Access:**
  - Frontend: http://YOUR_IP:3000
  - Backend: http://YOUR_IP:5000

## 🔥 Firewall Configuration

### Linux (UFW):
```bash
sudo ufw allow 3000
sudo ufw allow 5000
```

### Linux (iptables):
```bash
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
```

### Windows:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Create new inbound rules for ports 3000 and 5000

### Mac:
```bash
# Mac firewall is usually disabled by default
# If enabled, add rules in System Preferences > Security & Privacy > Firewall
```

## 🗄️ Database Configuration

### Local MongoDB:
The default configuration uses local MongoDB. Make sure it's running:

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Mac:**
```bash
brew services start mongodb/brew/mongodb-community
```

**Windows:**
```cmd
net start MongoDB
```

### Network MongoDB:
If your MongoDB is on another machine, update the `MONGODB_URI`:
```env
MONGODB_URI=mongodb://192.168.1.200:27017/finautojobs
```

## 🚀 Production Deployment

### 1. Use Production Configuration Files

**Frontend:**
```bash
cd frontend
cp .env.production.new .env.production
# Edit and update with your production URLs
```

**Backend:**
```bash
cd backend
cp .env.production.new .env.production
# Edit and update with your production configuration
```

### 2. Popular Deployment Platforms

#### Render (Backend):
1. Connect your GitHub repository
2. Set environment variables from `.env.production.new`
3. Use MongoDB Atlas for database

#### Netlify (Frontend):
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

#### Vercel (Frontend):
1. Connect your GitHub repository
2. Framework preset: Vite
3. Add environment variables

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check `CORS_ORIGINS` in backend `.env`
   - Ensure your IP is included in allowed origins

2. **Connection Refused:**
   - Check if backend is running on `0.0.0.0:5000`
   - Verify firewall settings
   - Ensure MongoDB is running

3. **API Not Found:**
   - Verify `VITE_API_URL` in frontend `.env`
   - Check backend routes are properly mounted

4. **WebSocket Connection Failed:**
   - Ensure `VITE_BACKEND_URL` is correct
   - Check if WebSocket is enabled in backend

### Debug Commands:

```bash
# Check if ports are open
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Test API connectivity
curl http://YOUR_IP:5000/api/health

# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"
```

## 📱 Mobile Access

To access from mobile devices on the same network:

1. Ensure your mobile device is on the same WiFi network
2. Open browser and navigate to: `http://YOUR_IP:3000`
3. If using HTTPS in production, ensure SSL certificates are valid

## 🔐 Security Considerations

### Development:
- Use strong, unique secrets in `.env` files
- Never commit real credentials to version control
- Use `.env.local` for sensitive local configuration

### Production:
- Use HTTPS for all connections
- Implement proper authentication and authorization
- Use environment variables for all secrets
- Enable rate limiting and security headers
- Use MongoDB Atlas or secure database hosting

## 📞 Support

If you encounter issues:

1. Check the console logs in both frontend and backend
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)
4. Check network connectivity between devices

## 🎯 Next Steps

After successful network setup:

1. Test all functionality across different devices
2. Set up production deployment
3. Configure monitoring and logging
4. Implement backup strategies
5. Set up CI/CD pipelines

---

**Happy coding! 🚀**