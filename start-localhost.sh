#!/bin/bash

echo "🏠 Starting FinAutoJobs (Localhost Only)"
echo "========================================"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   sudo service mongodb start"
    echo "   or"
    echo "   brew services start mongodb/brew/mongodb-community (Mac)"
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
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ FinAutoJobs is now running!"
echo "================================"
echo "📱 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Health: http://localhost:5000/api/health"
echo ""
echo "💡 To stop the servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 For network access, run: ./manual-setup.sh"
echo ""

# Wait for user to stop
wait
