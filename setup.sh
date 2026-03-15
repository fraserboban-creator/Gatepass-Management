#!/bin/bash

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Hostel Gatepass Management System - Setup Script   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "  → Copying .env.example to .env"
    cp .env.example .env
fi

echo "  → Installing backend dependencies..."
npm install

echo "  → Initializing database..."
npm run db:init

echo "  → Seeding database with sample data..."
npm run db:seed

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env.local" ]; then
    echo "  → Copying .env.example to .env.local"
    cp .env.example .env.local
fi

echo "  → Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                  Setup Complete! ✓                    ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open browser: http://localhost:3000"
echo ""
echo "Default credentials:"
echo "  Student: student@hostel.com / Password@123"
echo "  Coordinator: coordinator@hostel.com / Password@123"
echo "  Warden: warden@hostel.com / Password@123"
echo ""
