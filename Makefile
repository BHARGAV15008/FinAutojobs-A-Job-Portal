# ============================================================================
# FinAutoJobs - Makefile for Easy Deployment
# ============================================================================
# Usage:
#   make install     - Install all dependencies
#   make build       - Build frontend for production
#   make dev         - Run in development mode
#   make start       - Start production server
#   make deploy      - Full deployment (install + build + start)
#   make clean       - Clean all node_modules and build files
#   make logs        - Show backend logs
#   make health      - Check backend health
#   make stop        - Stop backend server
# ============================================================================

.PHONY: help install build dev start deploy clean logs health stop test lint

# Default target
help:
	@echo "FinAutoJobs - Available Commands:"
	@echo ""
	@echo "  make install     - Install all dependencies (backend + frontend)"
	@echo "  make build       - Build frontend for production"
	@echo "  make dev         - Run in development mode (both apps)"
	@echo "  make start       - Start production server"
	@echo "  make deploy      - Full deployment (install + build + start)"
	@echo "  make clean       - Remove node_modules and build files"
	@echo "  make logs        - Show backend logs (live)"
	@echo "  make health      - Check if backend is running"
	@echo "  make stop        - Stop backend server"
	@echo "  make test        - Run all tests"
	@echo "  make lint        - Run linters"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@npm run install:all
	@echo "✅ Installation complete!"

# Build frontend
build:
	@echo "🏗️  Building frontend..."
	@npm run build
	@echo "✅ Build complete!"

# Development mode
dev:
	@echo "🔧 Starting development mode..."
	@npm run dev

# Start production
start:
	@echo "🚀 Starting production server..."
	@npm run start:production

# Full deployment
deploy:
	@echo "🚀 Full deployment starting..."
	@npm run deploy

# Clean everything
clean:
	@echo "🧹 Cleaning node_modules and build files..."
	@rm -rf backend/node_modules frontend/node_modules frontend/dist node_modules
	@rm -f .backend.pid
	@echo "✅ Cleaned!"

# Show logs
logs:
	@echo "📋 Showing backend logs..."
	@tail -f backend/logs/*.log 2>/dev/null || echo "No logs found"

# Health check
health:
	@echo "💚 Checking backend health..."
	@curl -s http://localhost:5000/api/health | jq '.' || echo "Backend not responding"

# Stop backend
stop:
	@echo "🛑 Stopping backend server..."
	@if [ -f .backend.pid ]; then \
		kill $$(cat .backend.pid) && rm .backend.pid && echo "✅ Backend stopped"; \
	else \
		echo "⚠️  No PID file found. Backend may not be running."; \
	fi

# Run tests
test:
	@echo "🧪 Running tests..."
	@npm run test

# Run linters
lint:
	@echo "🔍 Running linters..."
	@npm run lint
