@echo off
echo ╔═══════════════════════════════════════════════════════╗
echo ║   Hostel Gatepass Management System - Setup Script   ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

if not exist ".env" (
    echo   → Copying .env.example to .env
    copy .env.example .env
)

echo   → Installing backend dependencies...
call npm install

echo   → Initializing database...
call npm run db:init

echo   → Seeding database with sample data...
call npm run db:seed

cd ..

REM Setup Frontend
echo.
echo 📦 Setting up Frontend...
cd frontend

if not exist ".env.local" (
    echo   → Copying .env.example to .env.local
    copy .env.example .env.local
)

echo   → Installing frontend dependencies...
call npm install

cd ..

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                  Setup Complete! ✓                    ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo To start the application:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:3000
echo.
echo Default credentials:
echo   Student: student@hostel.com / Password@123
echo   Coordinator: coordinator@hostel.com / Password@123
echo   Warden: warden@hostel.com / Password@123
echo.
pause
