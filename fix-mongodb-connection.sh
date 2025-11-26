#!/bin/bash

# MongoDB Atlas Connection Fix for Node.js v25
# This script helps diagnose and fix SSL/TLS issues

echo "🔧 MongoDB Atlas Connection Fixer"
echo "=================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📌 Current Node.js version: $NODE_VERSION"

# Extract major version
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')

if [ "$NODE_MAJOR" -ge 22 ]; then
    echo "⚠️  Node.js $NODE_VERSION detected (v22+)"
    echo "   Node.js v22+ has stricter TLS requirements"
    echo ""
    echo "🔧 Recommended fixes:"
    echo ""
    echo "Option 1: Use Node.js LTS (Recommended)"
    echo "  $ nvm install 20"
    echo "  $ nvm use 20"
    echo "  $ cd backend && npm run dev"
    echo ""
    echo "Option 2: Use legacy OpenSSL provider"
    echo "  $ export NODE_OPTIONS='--openssl-legacy-provider'"
    echo "  $ cd backend && npm run dev"
    echo ""
    echo "Option 3: Disable TLS verification (Development only)"
    echo "  $ export NODE_TLS_REJECT_UNAUTHORIZED=0"
    echo "  $ cd backend && npm run dev"
    echo ""
fi

# Check if MongoDB Atlas IP whitelist includes current IP
echo "🌐 Checking your current IP address..."
CURRENT_IP=$(curl -s https://api.ipify.org)
echo "   Your IP: $CURRENT_IP"
echo ""
echo "📋 MongoDB Atlas Checklist:"
echo "   1. ✓ Add $CURRENT_IP to IP whitelist"
echo "   2. ✓ Or use 0.0.0.0/0 for testing (allow all)"
echo "   3. ✓ Check database user credentials"
echo "   4. ✓ Verify network access settings"
echo ""

# Test MongoDB connection
echo "🧪 Testing MongoDB connection..."
cd backend 2>/dev/null || cd .

if [ -f ".env.development" ]; then
    echo "✓ Found .env.development"
    
    # Try with TLS workaround
    echo ""
    echo "Attempting connection with TLS workaround..."
    NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
    import('mongoose').then(mongoose => {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://technogenius1500_db_user:kaCi2YhDO3EqGAWr@cluster0.4vnlmzp.mongodb.net/finautojobs?appName=Cluster0';
        console.log('Connecting to MongoDB...');
        mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            tls: true
        }).then(() => {
            console.log('✅ Connection successful!');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Connection failed:', err.message);
            process.exit(1);
        });
    });
    " 2>&1
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ MongoDB connection works with TLS workaround!"
        echo ""
        echo "🚀 Start your backend with:"
        echo "   $ export NODE_TLS_REJECT_UNAUTHORIZED=0"
        echo "   $ cd backend && npm run dev"
    fi
else
    echo "❌ .env.development not found"
fi

echo ""
echo "📚 For permanent fix, update MongoDB Atlas settings:"
echo "   1. Go to https://cloud.mongodb.com"
echo "   2. Select your cluster"
echo "   3. Network Access → Add IP Address → Add Current IP"
echo "   4. Database Access → Verify user has read/write permissions"
