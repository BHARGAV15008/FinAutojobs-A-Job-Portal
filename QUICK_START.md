# 🚀 FinAutoJobs Quick Start Guide

Since the automatic IP detection failed, here are your setup options:

## 🏠 Option 1: Localhost Setup (Recommended for Testing)

**Quick and easy - works immediately on your machine:**

```bash
./setup-localhost.sh
./start-localhost.sh
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🌐 Option 2: Network Setup (For Multi-Device Access)

**Allows access from other devices on your network:**

```bash
./manual-setup.sh
# (You'll be prompted to enter your IP address)
./start-network.sh
```

**To find your IP address:**
```bash
# Try these commands:
ip a
ifconfig
nmcli device show
# Or check your network settings in system preferences
```

## 🔍 Option 3: Check Current Configuration

```bash
./check-config.sh
```

## 📋 Prerequisites

Before running any setup, make sure:

1. **MongoDB is installed and running:**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # CentOS/RHEL
   sudo systemctl start mongod
   
   # Or try
   sudo service mongodb start
   ```

2. **Node.js dependencies are installed:**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

## 🎯 Recommended Flow

1. **Start with localhost setup** (easiest):
   ```bash
   ./setup-localhost.sh
   ./start-localhost.sh
   ```

2. **Test the application** at http://localhost:3000

3. **If you need network access**, run:
   ```bash
   ./manual-setup.sh
   ```

## 🔧 Troubleshooting

### MongoDB Issues:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

### Port Issues:
```bash
# Check if ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill processes on ports if needed
sudo fuser -k 3000/tcp
sudo fuser -k 5000/tcp
```

### Permission Issues:
```bash
# Make scripts executable
chmod +x *.sh
```

## 🚀 Deployment Options

Once your app is working locally, check out the deployment guides:

- **Backend:** `deployment/render-backend.md`
- **Frontend:** `deployment/netlify-frontend.md`
- **Database:** MongoDB Atlas (free tier)

## 📞 Need Help?

1. Check the logs in your terminal
2. Verify MongoDB is running
3. Ensure all dependencies are installed
4. Check firewall settings for network access

---

**Choose your setup option and get started! 🎉**