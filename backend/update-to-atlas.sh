#!/bin/bash

echo "🔧 Updating FinAutoJobs Backend to use MongoDB Atlas..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating new .env file..."
    cp .env.atlas-template .env
    echo "✅ Created .env file with Atlas configuration"
else
    echo "📝 Backing up existing .env file..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"
    
    echo "🔄 Updating MongoDB URI in .env file..."
    
    # Update MongoDB URI
    if grep -q "MONGODB_URI=" .env; then
        sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0|' .env
        echo "✅ Updated MONGODB_URI"
    else
        echo "MONGODB_URI=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0" >> .env
        echo "✅ Added MONGODB_URI"
    fi
    
    # Update DATABASE_URL (fallback)
    if grep -q "DATABASE_URL=" .env; then
        sed -i 's|DATABASE_URL=.*|DATABASE_URL=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0|' .env
        echo "✅ Updated DATABASE_URL"
    else
        echo "DATABASE_URL=mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0" >> .env
        echo "✅ Added DATABASE_URL"
    fi
fi

echo ""
echo "🎉 Configuration updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test the connection: npm run dev"
echo "2. Check health endpoint: curl http://localhost:5000/api/health"
echo "3. Verify database connection in the logs"
echo ""
echo "🔍 Your MongoDB Atlas configuration:"
echo "   Database: finautojobs"
echo "   Cluster: cluster0.nvq1gwn.mongodb.net"
echo "   User: hiddenshadow032025_db_user"
echo ""
echo "⚠️  Note: Make sure your IP address is whitelisted in MongoDB Atlas"
echo "   Go to: MongoDB Atlas → Network Access → Add IP Address → Add Current IP"
