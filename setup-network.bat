@echo off
REM =============================================================================
REM FinAutoJobs Network Setup Script for Windows
REM =============================================================================

echo 🌐 FinAutoJobs Network Setup
echo ============================

REM Get the machine's IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set MACHINE_IP=%%a
    goto :found_ip
)

:found_ip
REM Remove leading spaces
set MACHINE_IP=%MACHINE_IP: =%

if "%MACHINE_IP%"=="" (
    echo ❌ Could not detect machine IP address. Please configure manually.
    pause
    exit /b 1
)

echo 📍 Detected machine IP: %MACHINE_IP%
echo.

REM Configure Frontend
echo 🔧 Configuring Frontend...
cd frontend

REM Create network-specific .env file
(
echo # =============================================================================
echo # FinAutoJobs Frontend - Network Configuration ^(Auto-generated^)
echo # =============================================================================
echo # Generated on: %date% %time%
echo # Machine IP: %MACHINE_IP%
echo.
echo # API Configuration for Network Access
echo VITE_API_URL=http://%MACHINE_IP%:5000/api
echo VITE_BACKEND_URL=http://%MACHINE_IP%:5000
echo.
echo VITE_APP_NAME=FinAutoJobs
echo VITE_APP_VERSION=1.0.0
echo.
echo # Authentication
echo VITE_JWT_EXPIRES_IN=7d
echo.
echo # File Upload Configuration
echo VITE_MAX_FILE_SIZE=5242880
echo VITE_ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
echo.
echo # Feature Flags
echo VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
echo VITE_ENABLE_FILE_UPLOADS=true
echo VITE_ENABLE_SOCIAL_LOGIN=true
echo VITE_ENABLE_PREMIUM_FEATURES=false
echo.
echo # Development Settings
echo VITE_NODE_ENV=development
echo VITE_DEBUG=true
echo.
echo # Social Login ^(Optional^)
echo VITE_GOOGLE_CLIENT_ID=your-google-client-id
echo VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
echo.
echo # Analytics ^(Optional^)
echo VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
) > .env

echo ✅ Frontend configured for network access
cd ..

REM Configure Backend
echo 🔧 Configuring Backend...
cd backend

REM Create network-specific .env file
(
echo # =============================================================================
echo # FinAutoJobs Backend - Network Configuration ^(Auto-generated^)
echo # =============================================================================
echo # Generated on: %date% %time%
echo # Machine IP: %MACHINE_IP%
echo.
echo # Database Configuration
echo MONGODB_URI=mongodb://localhost:27017/finautojobs
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo HOST=0.0.0.0
echo.
echo # Frontend URL Configuration
echo FRONTEND_URL=http://%MACHINE_IP%:3000
echo.
echo # CORS Origins - Allow network access
echo CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://%MACHINE_IP%:3000,http://localhost:5173,http://%MACHINE_IP%:5173
echo.
echo # Session ^& JWT Configuration
echo SESSION_SECRET=finautojobs-network-session-secret-2024
echo JWT_SECRET=finautojobs-network-jwt-secret-2024
echo JWT_REFRESH_SECRET=finautojobs-network-refresh-secret-2024
echo JWT_EXPIRES_IN=24h
echo.
echo # Email Configuration
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USER=your-email@gmail.com
echo EMAIL_PASS=your-app-password
echo EMAIL_FROM="FinAutoJobs" ^<no-reply@finautojobs.com^>
echo.
echo # File Upload Configuration
echo UPLOAD_PATH=./uploads
echo MAX_FILE_SIZE=10485760
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # WebSocket Configuration
echo WEBSOCKET_ENABLED=true
echo.
echo # OAuth Configuration ^(Optional^)
echo GOOGLE_CLIENT_ID=your-google-client-id
echo GOOGLE_CLIENT_SECRET=your-google-client-secret
echo MICROSOFT_CLIENT_ID=your-microsoft-client-id
echo MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
) > .env

echo ✅ Backend configured for network access
cd ..

REM Create startup script
(
echo @echo off
echo echo 🚀 Starting FinAutoJobs for Network Access
echo echo ==========================================
echo.
echo echo 🔧 Starting Backend...
echo cd backend
echo start "FinAutoJobs Backend" cmd /k "npm run dev"
echo cd ..
echo.
echo timeout /t 5 /nobreak ^> nul
echo.
echo echo 🎨 Starting Frontend...
echo cd frontend
echo start "FinAutoJobs Frontend" cmd /k "npm run dev -- --host 0.0.0.0"
echo cd ..
echo.
echo echo.
echo echo ✅ FinAutoJobs is now running!
echo echo ================================
echo echo 📱 Local Access:
echo echo    Frontend: http://localhost:3000
echo echo    Backend:  http://localhost:5000
echo echo.
echo echo 🌐 Network Access:
echo echo    Frontend: http://%MACHINE_IP%:3000
echo echo    Backend:  http://%MACHINE_IP%:5000
echo echo.
echo echo 💡 Close the terminal windows to stop the servers
echo echo.
echo pause
) > start-network.bat

echo.
echo 🎉 Network setup complete!
echo =========================
echo.
echo 📋 Next Steps:
echo 1. Make sure MongoDB is running
echo.
echo 2. Start the application:
echo    start-network.bat
echo.
echo 3. Access from other devices on your network:
echo    http://%MACHINE_IP%:3000
echo.
echo 4. Make sure Windows Firewall allows connections on ports 3000 and 5000
echo.
echo 📝 Configuration files created:
echo    ✅ frontend\.env ^(network configuration^)
echo    ✅ backend\.env ^(network configuration^)
echo    ✅ start-network.bat ^(startup script^)
echo.
pause