#!/bin/bash

echo "🧪 Testing Backend Startup"
echo "=========================="

cd backend

echo "📋 Environment check:"
echo "NODE_ENV: $NODE_ENV"
echo "MongoDB URI: $(grep MONGODB_URI .env | cut -d'=' -f2)"
echo ""

echo "🔧 Starting backend..."
node server.js