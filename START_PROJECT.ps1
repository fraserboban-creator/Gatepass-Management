# Hostel Gatepass Management System - One-Click Starter (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File START_PROJECT.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Hostel Gatepass Management System - Starting...     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install backend dependencies if needed
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Install frontend dependencies if needed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Initialize database if needed
if (-not (Test-Path "database\hostel_gatepass.db")) {
    Write-Host "Initializing database..." -ForegroundColor Yellow
    Set-Location backend
    npm run db:init
    npm run db:seed
    Set-Location ..
    Write-Host "✓ Database initialized with default users" -ForegroundColor Green
    Write-Host ""
}

# Start backend
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ Project Started Successfully!                     ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║   Backend:  http://localhost:5000                     ║" -ForegroundColor Green
Write-Host "║   Frontend: http://localhost:3000                     ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║   Opening browser in 5 seconds...                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Wait and open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "✓ Browser opened! Login with:" -ForegroundColor Green
Write-Host "  Email: admin@hostel.com" -ForegroundColor Yellow
Write-Host "  Password: Password@123" -ForegroundColor Yellow
Write-Host ""
