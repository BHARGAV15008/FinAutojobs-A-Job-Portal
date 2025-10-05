#!/bin/bash

echo "🚀 Starting FinAutoJobs for Network Access"
echo "=========================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    exit 1
fi

# Start backend in background
echo "🔧 Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 8

# Start frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ FinAutoJobs is now running!"
echo "================================"
echo "📱 Local Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🌐 Network Access:"
echo "   Frontend: http://192.168.41.134:3000"
echo "   Backend:  http://192.168.41.134:5000"
echo "   API Health: http://192.168.41.134:5000/api/health"
echo ""
echo "📱 Access from mobile/other devices:"
echo "   Connect to same WiFi and visit: http://192.168.41.134:3000"
echo ""
echo "💡 To stop the servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
