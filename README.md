# Hostel Gatepass Management System

A full-stack web application for managing student gatepasses, visitor passes, and hostel security in educational institutions. Built with Next.js on the frontend and Express.js + SQLite on the backend.

---

## Features

- **Multi-role access** — Student, Coordinator, Warden, Security, Admin
- **Gatepass workflow** — Students submit requests, coordinators and wardens approve/reject, security scans QR codes at the gate
- **Visitor pass management** — Track visitors with entry/exit logging and overdue detection
- **QR code system** — Encrypted QR codes generated for approved gatepasses, scanned by security
- **AI Admin Assistant** — Natural language commands for admin operations (powered by Gemini/OpenAI/Groq)
- **Analytics & reporting** — Dashboards with charts for gatepass trends and student activity
- **Emergency alerts** — Broadcast alerts to hostel residents
- **Email notifications** — Automated emails for approvals, rejections, and overdue alerts
- **Google OAuth** — Login with Google in addition to email/password
- **Rate limiting & audit logs** — Security-first API with request throttling and AI command audit trails

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | SQLite (via sql.js) |
| Auth | JWT, Google OAuth (`@react-oauth/google`) |
| QR | `qrcode`, `html5-qrcode`, `qrcode.react` |
| AI | Gemini / OpenAI / Groq (configurable) |
| Email | Nodemailer |
| Charts | Chart.js, react-chartjs-2 |

---

## Project Structure

```
hostel-gatepass-system/
├── backend/          # Express.js REST API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── database/
│   │   └── utils/
│   └── server.js
├── frontend/         # Next.js application
│   └── src/app/      # App Router pages (admin, coordinator, warden, security, student)
├── database/         # SQLite database file
└── docs/             # API and deployment docs
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone "https://github.com/fraserboban-creator/Gatepass-Management.git"
cd Gatepass-Management
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set at minimum:
- `JWT_SECRET` — a strong random string
- `FRONTEND_URL` — defaults to `http://localhost:3000`
- `GEMINI_API_KEY` (or OpenAI/Groq key) — if using the AI assistant

Initialize and seed the database:

```bash
npm run db:init
npm run db:seed
```

Start the server:

```bash
npm run dev   # development (nodemon)
npm start     # production
```

Backend runs on `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Start the dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Default Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | Password@123 |
| Warden | warden@hostel.com | Password@123 |
| Coordinator | coordinator@hostel.com | Password@123 |
| Security | security@hostel.com | Password@123 |
| Student | student@hostel.com | Password@123 |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| Student | Submit gatepass requests, view history, generate QR, manage visitor passes |
| Coordinator | Approve/reject gatepass requests, view analytics |
| Warden | Final approval, manage users, view all analytics |
| Security | Scan QR codes at gate, log entry/exit, manage visitor passes |
| Admin | Full system access, user management, AI assistant, emergency alerts |

---

## API Overview

Base URL: `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

Key route groups:

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, register, Google OAuth |
| `/api/gatepass` | Create, approve, reject, history |
| `/api/qr` | Generate and verify QR codes |
| `/api/visitor` | Visitor pass management |
| `/api/admin` | User management, analytics |
| `/api/ai` | AI assistant commands |
| `/api/notifications` | In-app notifications |
| `/api/emergency` | Emergency alerts |

See [`docs/API.md`](docs/API.md) for full endpoint reference.

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `DB_PATH` | Path to SQLite database |
| `FRONTEND_URL` | Allowed CORS origin |
| `SMTP_HOST/PORT/USER/PASS` | Email config (optional) |
| `AI_SERVICE_PROVIDER` | `gemini`, `openai`, or `groq` |
| `GEMINI_API_KEY` | Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GROQ_API_KEY` | Groq API key |

---

## Running Tests

```bash
cd backend
npm test
```

Tests use Jest with property-based testing via `fast-check`.

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for production deployment instructions.

---

## License

MIT
