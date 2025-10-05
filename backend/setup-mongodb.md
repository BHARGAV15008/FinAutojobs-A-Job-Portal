# MongoDB Setup Instructions

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Steps:
1. **Create Account**: Go to https://www.mongodb.com/atlas
2. **Create Cluster**: Choose free tier (M0)
3. **Create Database User**: 
   - Username: finautojobs_user
   - Password: (generate strong password)
4. **Whitelist IP**: Add 0.0.0.0/0 for development (or your specific IP)
5. **Get Connection String**: 
   ```
   mongodb+srv://finautojobs_user:<password>@cluster0.xxxxx.mongodb.net/finautojobs?retryWrites=true&w=majority
   ```

### Update .env.local:
Replace the MONGODB_URI with your actual connection string from Atlas.

## Option 2: Local MongoDB (Current Setup)

If you prefer to keep using local MongoDB:

1. **Install MongoDB**: 
   ```bash
   # Ubuntu/Debian
   sudo apt install mongodb
   
   # Or download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**:
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Verify Connection**:
   ```bash
   mongosh mongodb://localhost:27017/finautojobs
   ```

## Current Configuration:
- The server is set up to use MongoDB Atlas (cloud)
- Fallback to local MongoDB if Atlas is not configured
- Database name: `finautojobs`
- Collections: users, jobs, applications, etc.

## Benefits of MongoDB Atlas:
✅ Always accessible (no need to start local service)
✅ Automatic backups
✅ Better security
✅ Scalable
✅ Free tier available
✅ Works from any device/network

## Benefits of Local MongoDB:
✅ No internet required
✅ Full control
✅ Faster for development
✅ No data limits
