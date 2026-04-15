@echo off
REM Hostel Gatepass Management System - One-Click Starter
REM This script starts both backend and frontend automatically

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Hostel Gatepass Management System - Starting...     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Check if backend node_modules exist, if not install
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo ✓ Backend dependencies installed
    echo.
)

REM Check if frontend node_modules exist, if not install
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo ✓ Frontend dependencies installed
    echo.
)

REM Initialize database if it doesn't exist
if not exist "database\hostel_gatepass.db" (
    echo Initializing database...
    cd backend
    call npm run db:init
    call npm run db:seed
    cd ..
    echo ✓ Database initialized with default users
    echo.
)

REM Start backend in a new window
echo Starting Backend Server (Port 5000)...
start "Hostel Gatepass - Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak

REM Start frontend in a new window
echo Starting Frontend Server (Port 3000)...
start "Hostel Gatepass - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   ✓ Project Started Successfully!                     ║
echo ║                                                        ║
echo ║   Backend:  http://localhost:5000                     ║
echo ║   Frontend: http://localhost:3000                     ║
echo ║                                                        ║
echo ║   Opening browser in 5 seconds...                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Wait 5 seconds then open browser
timeout /t 5 /nobreak

REM Open the app in default browser
start http://localhost:3000

echo.
echo ✓ Browser opened! Login with:
echo   Email: admin@hostel.com
echo   Password: Password@123
echo.
echo Press any key to close this window...
pause
