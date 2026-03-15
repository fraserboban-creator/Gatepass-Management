# Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hostel-gatepass-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- JWT_SECRET: Change to a secure random string
- PORT: Default is 5000
- FRONTEND_URL: Your frontend URL (default: http://localhost:3000)

Initialize database:
```bash
npm run db:init
npm run db:seed
```

Start backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Start frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Default Users

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | Password@123 |
| Warden | warden@hostel.com | Password@123 |
| Coordinator | coordinator@hostel.com | Password@123 |
| Security | security@hostel.com | Password@123 |
| Student | student@hostel.com | Password@123 |

## Project Structure

```
hostel-gatepass-system/
├── backend/          # Express.js API
├── frontend/         # Next.js application
├── database/         # SQLite database
└── docs/            # Documentation
```

## Troubleshooting

### Database Issues
- Delete `database/hostel_gatepass.db` and run `npm run db:init` again

### Port Already in Use
- Change PORT in backend `.env` file
- Update NEXT_PUBLIC_API_URL in frontend `.env.local`

### CORS Errors
- Ensure FRONTEND_URL in backend `.env` matches your frontend URL
