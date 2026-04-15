# Hostel Gatepass Management System
## Detailed Project Presentation

**Project Title:** Hostel Gatepass Management System
**Team Members:** Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke

---

# PART 1 — PROJECT OVERVIEW & PROBLEM STATEMENT
### Presented by: pavan ghaywat 

## 1.1 Introduction

The Hostel Gatepass Management System is a full-stack web application designed to digitize and automate the process of managing student movement in and out of a hostel. In most educational institutions, this process is still done manually — students fill paper forms, coordinators sign them, wardens approve them, and security guards check them at the gate. This is slow, error-prone, and impossible to track or audit.

Our system replaces this entire paper-based workflow with a secure, role-based digital platform that handles everything from gatepass requests to QR code scanning at the gate.

---

## 1.2 Problem Statement

In traditional hostel management:

- Students submit handwritten leave applications that can be lost or forged
- Coordinators and wardens have no centralized view of pending approvals
- Security guards have no reliable way to verify if a student has permission to leave
- There is no automatic tracking of students who don't return on time (overdue)
- Visitors entering the hostel are not properly logged or tracked
- Admins have no data or analytics on student movement patterns
- Emergency communication to all hostel residents is slow and unreliable

---

## 1.3 Proposed Solution

We built a web-based system with the following core capabilities:

- **Digital gatepass requests** — students submit requests online with destination, reason, and expected return time
- **Two-step approval workflow** — coordinator approves first, then warden gives final approval
- **QR code verification** — approved gatepasses generate an encrypted QR code that security scans at the gate
- **Visitor pass management** — visitors are registered, tracked, and logged on entry and exit
- **Overdue detection** — the system automatically flags students who haven't returned by their expected time
- **Analytics dashboards** — role-specific charts and reports on gatepass trends
- **Emergency alerts** — admin can broadcast urgent messages to all hostel residents
- **AI Admin Assistant** — admin can give natural language commands to manage the system

---

## 1.4 System Architecture Overview

The system follows a standard **3-tier architecture**:

```
┌─────────────────────────────────────┐
│           FRONTEND (Client)          │
│   Next.js 14 — runs on port 3000    │
│   React 18, Tailwind CSS            │
└──────────────┬──────────────────────┘
               │ HTTP REST API (JSON)
               │ Authorization: Bearer <JWT>
┌──────────────▼──────────────────────┐
│           BACKEND (Server)           │
│   Node.js + Express.js              │
│   runs on port 5000                 │
│   Controllers → Services → Models   │
└──────────────┬──────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────┐
│           DATABASE                   │
│   SQLite (hostel_gatepass.db)       │
│   8 tables, indexed for performance │
└─────────────────────────────────────┘
```

---

## 1.5 User Roles in the System

The system has 5 distinct roles, each with different permissions:

| Role | Who They Are | What They Can Do |
|------|-------------|-----------------|
| **Student** | Hostel resident | Submit gatepass requests, view history, generate QR code, register visitors |
| **Coordinator** | Floor/block coordinator | Review and approve/reject student gatepass requests (first level) |
| **Warden** | Hostel warden | Give final approval, manage all students, view full analytics |
| **Security** | Gate security guard | Scan QR codes at gate, log entry/exit, manage visitor passes |
| **Admin** | System administrator | Full access — user management, AI assistant, emergency alerts, all analytics |

---

## 1.6 Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend framework | Next.js 14 | App Router, server-side rendering, fast page loads |
| Backend framework | Express.js | Lightweight, flexible, large ecosystem |
| Database | SQLite | Simple file-based DB, no server needed, perfect for this scale |
| Authentication | JWT + Google OAuth | Stateless, secure, supports both email/password and Google login |
| QR encryption | Node.js crypto | Prevents QR forgery — each QR is hashed and expires |
| AI integration | Gemini/OpenAI/Groq | Configurable — works with any major AI provider |
| Testing | Jest + fast-check | Unit tests + property-based testing for correctness guarantees |

---

---

# PART 2 — DATABASE DESIGN & BACKEND ARCHITECTURE
### Presented by: shayan khan 

## 2.1 Database Design

The system uses **SQLite** as its database, managed through the `sql.js` library in Node.js. The database file is stored at `database/hostel_gatepass.db`. The schema consists of **8 tables**, each carefully designed with proper relationships and indexes.

---

## 2.2 Entity Relationship Overview

```
users ──────────────────────────────────────────────┐
  │                                                  │
  ├──< gatepasses >──< approvals                     │
  │         │                                        │
  │         ├──< qr_codes                            │
  │         └──< logs                                │
  │                                                  │
  ├──< notifications                                 │
  ├──< visitor_passes                                │
  ├──< ai_command_history                            │
  └──< ai_audit_logs                                 │
```

---

## 2.3 Table-by-Table Explanation

### Table 1: `users`
Stores all system users regardless of role.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment primary key |
| email | VARCHAR UNIQUE | Login email |
| password_hash | VARCHAR | bcrypt hashed password |
| role | VARCHAR | student / coordinator / warden / security / admin |
| full_name | VARCHAR | Display name |
| phone | VARCHAR | Contact number |
| student_id | VARCHAR UNIQUE | Student enrollment number |
| hostel_block | VARCHAR | Which block they live in |
| room_number | VARCHAR | Room number |
| profile_picture | VARCHAR | URL to uploaded photo |
| is_active | BOOLEAN | Soft delete / deactivate |

---

### Table 2: `gatepasses`
The core table — every leave request is stored here.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| student_id | FK → users | Which student made the request |
| destination | VARCHAR | Where they are going |
| reason | TEXT | Why they are going |
| leave_time | DATETIME | When they plan to leave |
| expected_return_time | DATETIME | When they plan to return |
| actual_exit_time | DATETIME | When security logged their exit |
| actual_return_time | DATETIME | When security logged their return |
| status | VARCHAR | pending → coordinator_approved → approved → completed / rejected / overdue |
| is_overdue | BOOLEAN | Auto-flagged if not returned on time |
| coordinator_id | FK → users | Who approved at coordinator level |
| warden_id | FK → users | Who gave final approval |

**Status Flow:**
```
pending → coordinator_approved → approved → completed
                                          → overdue
       → rejected (at any stage)
```

---

### Table 3: `approvals`
Audit trail of every approval or rejection action.

| Column | Description |
|--------|-------------|
| gatepass_id | Which gatepass was acted on |
| approver_id | Who took the action |
| approver_role | coordinator or warden |
| action | approved or rejected |
| comments | Optional reason/note |

---

### Table 4: `qr_codes`
Stores generated QR codes for approved gatepasses.

| Column | Description |
|--------|-------------|
| gatepass_id | One QR per gatepass (UNIQUE) |
| qr_data | Encrypted payload |
| qr_hash | Hash for verification |
| is_used | Prevents QR reuse |
| expires_at | QR expires at return time |

---

### Table 5: `logs`
Entry/exit logs recorded by security when scanning QR.

| Column | Description |
|--------|-------------|
| gatepass_id | Which gatepass was scanned |
| student_id | Which student |
| security_id | Which security guard scanned |
| log_type | exit or entry |
| timestamp | When it happened |
| location | Gate location |

---

### Table 6: `notifications`
In-app notifications for all users.

| Column | Description |
|--------|-------------|
| user_id | Who receives the notification |
| gatepass_id | Related gatepass (optional) |
| title | Short heading |
| message | Full message |
| type | info / success / warning / error |
| is_read | Read/unread status |

---

### Table 7: `visitor_passes`
Tracks all visitors entering the hostel.

| Column | Description |
|--------|-------------|
| visitor_name | Full name of visitor |
| visitor_phone | Contact number |
| visitor_id_type | passport / national_id / driving_license / student_id / other |
| visitor_id_number | ID document number |
| relationship | Relation to student (parent, friend, etc.) |
| purpose | Reason for visit |
| student_id | Which student they are visiting |
| entry_time | When they entered |
| expected_exit_time | When they should leave |
| actual_exit_time | When they actually left |
| status | pending → approved → active → exited / overdue |
| pass_id | Unique pass identifier |

---

### Tables 8 & 9: `ai_command_history` & `ai_audit_logs`
Track every AI assistant command for security and auditing.

- `ai_command_history` — stores the command text, parsed action, confidence score, execution status, and whether confirmation was required
- `ai_audit_logs` — records every access attempt, command execution, rate limit violation, and auth failure

---

## 2.4 Backend Architecture — MVC Pattern

The backend follows the **MVC (Model-View-Controller)** pattern:

```
Request → Route → Middleware → Controller → Service → Model → Database
                                                    ↓
                                              Response (JSON)
```

### Folder Structure Explained

| Folder | Purpose |
|--------|---------|
| `routes/` | Defines URL paths and maps them to controllers |
| `middleware/` | Auth checks, rate limiting, error handling — runs before controllers |
| `controllers/` | Receives HTTP request, calls service, sends response |
| `services/` | Business logic — the "brain" of each feature |
| `models/` | Direct database queries — SQL lives here |
| `config/` | Database connection, JWT settings, constants |
| `utils/` | Reusable helpers — encryption, validation, date formatting |

---

## 2.5 Middleware Stack

Every API request passes through this chain:

```
1. helmet()          → Sets secure HTTP headers
2. cors()            → Allows only frontend URL to call the API
3. express.json()    → Parses JSON request body
4. apiLimiter        → Rate limits to 100 requests per 15 minutes
5. authMiddleware    → Verifies JWT token
6. roleMiddleware    → Checks if user's role has permission
7. Controller        → Handles the actual request
8. errorHandler      → Catches any unhandled errors
```

---

---

# PART 3 — AUTHENTICATION, QR SYSTEM & SECURITY
### Presented by: Fraser Boban

## 3.1 Authentication System

The system supports two methods of login:

### Method 1: Email & Password (JWT)

```
User submits email + password
        ↓
Backend finds user by email in DB
        ↓
bcryptjs compares submitted password with stored hash
        ↓
If match → jsonwebtoken signs a JWT token (expires in 7 days)
        ↓
Token returned to frontend → stored in localStorage
        ↓
Every subsequent API request sends: Authorization: Bearer <token>
        ↓
authMiddleware verifies token on every protected route
```

**Why JWT?**
- Stateless — server doesn't need to store sessions
- Self-contained — token carries user ID and role
- Secure — signed with a secret key, tamper-proof

---

### Method 2: Google OAuth

```
User clicks "Login with Google"
        ↓
@react-oauth/google opens Google consent screen
        ↓
Google returns an ID token to the frontend
        ↓
Frontend sends ID token to backend (/api/auth/google)
        ↓
google-auth-library verifies the token with Google's servers
        ↓
Backend finds or creates user in DB
        ↓
Returns our own JWT token — same flow as email/password from here
```

---

## 3.2 Role-Based Access Control (RBAC)

After authentication, every route is protected by `roleMiddleware.js`. This checks the user's role from the JWT and compares it against the allowed roles for that route.

Example:
```
GET /api/gatepass/pending  →  allowed: ['coordinator', 'warden']
POST /api/admin/users      →  allowed: ['admin']
POST /api/qr/verify        →  allowed: ['security']
```

If a student tries to access the admin panel, they get a `403 Forbidden` response immediately.

---

## 3.3 QR Code System — How It Works

The QR system is one of the most important features. It ensures that only students with a genuinely approved gatepass can exit the hostel.

### Step 1 — QR Generation
```
Student's gatepass gets final approval from warden
        ↓
Student clicks "Generate QR" on their dashboard
        ↓
Backend creates an encrypted payload:
  {
    gatepass_id: 42,
    student_id: 7,
    expires_at: "2026-04-15T18:00:00Z"
  }
        ↓
Payload is encrypted using Node.js crypto (AES encryption)
        ↓
A SHA-256 hash of the payload is stored in qr_codes table
        ↓
QR code image is generated from the encrypted string using qrcode library
        ↓
Student sees QR code on screen (also rendered with qrcode.react)
```

### Step 2 — QR Verification at Gate
```
Security guard opens scanner on their dashboard
        ↓
html5-qrcode activates device camera
        ↓
Guard scans student's QR code
        ↓
Encrypted string sent to backend (/api/qr/verify)
        ↓
Backend decrypts the payload
        ↓
Checks:
  ✓ Is the hash valid? (not tampered)
  ✓ Has it expired? (past return time = rejected)
  ✓ Has it already been used? (prevents reuse)
  ✓ Is the gatepass still in approved status?
        ↓
If all checks pass → log entry/exit in logs table
        ↓
Security sees student's full details on screen
```

### Security Guarantees
- A forged QR will fail the hash check
- An expired QR (past return time) is rejected
- A QR can only be used once per direction (exit/entry)
- QR data is encrypted — cannot be read by scanning alone

---

## 3.4 API Security Measures

### Rate Limiting
```javascript
// 100 requests per 15 minutes per IP
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```
Prevents brute force attacks and API abuse.

### AI-Specific Rate Limiting
The AI assistant has its own stricter rate limiter (`aiRateLimitMiddleware.js`) to prevent abuse of expensive AI API calls.

### Helmet.js
Sets 11 security-related HTTP headers automatically:
- `X-Content-Type-Options` — prevents MIME sniffing
- `X-Frame-Options` — prevents clickjacking
- `Strict-Transport-Security` — enforces HTTPS
- `Content-Security-Policy` — prevents XSS attacks

### CORS
Only the configured `FRONTEND_URL` is allowed to make API calls. Any other origin gets blocked.

### Input Validation
All API inputs are validated using `express-validator` before reaching the controller. Invalid data is rejected with a clear error message.

---

## 3.5 API Structure

Base URL: `http://localhost:5000/api`

| Route Group | Endpoints | Protected |
|-------------|-----------|-----------|
| `/api/auth` | POST /login, POST /register, POST /google | No (public) |
| `/api/gatepass` | POST /create, GET /history, GET /pending, POST /approve, POST /reject | Yes |
| `/api/qr` | GET /generate/:id, POST /verify | Yes |
| `/api/visitor` | POST /create, GET /list, POST /approve, POST /exit | Yes |
| `/api/admin` | GET /users, POST /users, PUT /users/:id, DELETE /users/:id | Yes (admin only) |
| `/api/ai` | POST /command, GET /history | Yes (admin only) |
| `/api/notifications` | GET /, POST /read, POST /read-all | Yes |
| `/api/emergency` | POST /create, GET /list, POST /resolve | Yes (admin only) |
| `/api/search` | GET / | Yes |

All protected routes require: `Authorization: Bearer <jwt_token>`

---

---

# PART 4 — FRONTEND, UI/UX & ADVANCED FEATURES
### Presented by: saket ghodke

## 4.1 Frontend Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 | React framework with App Router |
| React | 18 | UI component library |
| Tailwind CSS | 3.4 | Utility-first CSS styling |
| Framer Motion | 12 | Smooth animations and transitions |
| Chart.js + react-chartjs-2 | 4.4 | Analytics charts |
| Axios | 1.6 | HTTP requests to backend API |
| qrcode.react | 3.1 | Render QR codes as images |
| html5-qrcode | 2.3 | Camera-based QR scanner |
| lucide-react | latest | Icon library |
| react-hot-toast | 2.6 | Toast notifications |
| @react-oauth/google | 0.13 | Google login button |
| date-fns | 3.0 | Date formatting and manipulation |

---

## 4.2 Next.js App Router Structure

The frontend uses Next.js 14's **App Router**, where each folder inside `src/app/` becomes a URL route automatically.

```
src/app/
├── (auth)/
│   ├── login/page.js          → /login
│   └── register/page.js       → /register
├── student/
│   ├── dashboard/page.js      → /student/dashboard
│   ├── gatepass/page.js       → /student/gatepass
│   └── visitors/page.js       → /student/visitors
├── coordinator/
│   ├── dashboard/page.js      → /coordinator/dashboard
│   ├── pending/page.js        → /coordinator/pending
│   └── history/page.js        → /coordinator/history
├── warden/
│   ├── dashboard/page.js      → /warden/dashboard
│   └── analytics/page.js      → /warden/analytics
├── security/
│   └── dashboard/page.js      → /security/dashboard
├── admin/
│   ├── dashboard/page.js      → /admin/dashboard
│   ├── users/page.js          → /admin/users
│   ├── analytics/page.js      → /admin/analytics
│   └── settings/page.js       → /admin/settings
└── hod/
    └── dashboard/page.js      → /hod/dashboard
```

Each role has its own **layout.js** that wraps all pages for that role with a shared sidebar and navigation.

---

## 4.3 Role-Based Navigation

After login, the frontend reads the `role` field from the JWT token and redirects the user to their specific dashboard:

```javascript
if (role === 'student')      → /student/dashboard
if (role === 'coordinator')  → /coordinator/dashboard
if (role === 'warden')       → /warden/dashboard
if (role === 'security')     → /security/dashboard
if (role === 'admin')        → /admin/dashboard
```

A **protected route wrapper** checks for a valid token on every page load. If no token exists or it's expired, the user is redirected to `/login`.

---

## 4.4 Student Dashboard — Feature Walkthrough

**What a student sees and can do:**

1. **Submit Gatepass Request**
   - Fill in: destination, reason, leave date/time, expected return date/time, contact number
   - Form validates all fields before submission
   - On success → toast notification "Request submitted successfully"

2. **View Gatepass History**
   - Table showing all past and current requests
   - Color-coded status badges: pending (yellow), approved (green), rejected (red), overdue (orange)
   - Click any row to see full details in a modal

3. **Generate QR Code**
   - Only available for gatepasses with `approved` status
   - QR code displayed as scannable image
   - Shows expiry time

4. **Visitor Pass Management**
   - Register a visitor with their name, ID, relationship, and purpose
   - View active and past visitors

---

## 4.5 Analytics Dashboards

Each role has a dedicated analytics page with interactive charts:

### Charts Used

| Chart Type | What It Shows |
|-----------|---------------|
| Line Chart | Gatepass requests over time (daily/weekly trend) |
| Bar Chart | Approval vs rejection rates by month |
| Pie Chart | Distribution of gatepass statuses |
| Summary Cards | Total requests, pending count, approved count, overdue count |

The analytics page has a **date range picker** — users can filter data by custom start and end dates.

---

## 4.6 AI Admin Assistant

The admin dashboard includes a chat-style AI assistant interface:

```
Admin types: "Show me all overdue students from Block A"
        ↓
Frontend sends command to /api/ai/command
        ↓
AI parses the natural language → identifies action + parameters
        ↓
If action is safe → executes immediately
If action is destructive (e.g., delete user) → shows confirmation modal
        ↓
Result displayed in chat interface
        ↓
Command logged in ai_command_history table
```

**Example commands the admin can give:**
- "Approve all pending gatepasses for today"
- "Show students who haven't returned in the last 24 hours"
- "Create a new coordinator account for John Doe"
- "Send emergency alert to all students in Block B"

---

## 4.7 Emergency Alert System

Admin can broadcast emergency alerts to all hostel residents:

- **Severity levels:** Info (blue), Warning (yellow), Critical (red)
- Alert appears as a **banner** on every user's dashboard
- Admin can resolve/dismiss alerts when the situation is over
- Parents are notified via email for critical alerts (via `parentNotificationService.js`)

---

## 4.8 Notification System

Every important action triggers an in-app notification:

| Event | Who Gets Notified |
|-------|------------------|
| Student submits gatepass | Coordinator |
| Coordinator approves | Warden + Student |
| Warden approves | Student |
| Anyone rejects | Student |
| Student is overdue | Warden + Coordinator |
| Visitor arrives | Student |

Notifications appear as a **bell icon** in the navbar with an unread count badge. Clicking opens a dropdown list of all notifications with mark-as-read functionality.

---

## 4.9 UI/UX Design Highlights

- **Framer Motion** — smooth page transitions and component animations (fade in, slide up)
- **react-hot-toast** — non-intrusive toast messages for every action (success, error, loading)
- **Loading skeletons** — placeholder UI while data is being fetched (no blank screens)
- **Empty states** — friendly messages when lists are empty ("No pending requests")
- **Responsive design** — works on mobile, tablet, and desktop
- **Dark mode** — supported via Tailwind's dark mode classes
- **Confirmation dialogs** — for destructive actions like deleting a user or rejecting a gatepass

---

---

# PART 5 — TESTING, DEPLOYMENT & PROJECT OUTCOMES
### Presented by: Abhijeet Shinde

## 5.1 Testing Strategy

The project uses a two-layer testing approach to ensure correctness:

### Layer 1 — Unit & Integration Tests (Jest)

**Jest** is the test runner. Tests are written in `.test.js` files alongside the source files they test.

```bash
cd backend
npm test
# Runs all *.test.js files
```

**What is tested:**
- Auth service — register, login, token generation
- Gatepass service — create, approve, reject, status transitions
- QR service — generate, verify, expiry, reuse prevention
- Notification service — trigger on approval/rejection
- Admin controller — user CRUD operations

---

### Layer 2 — Property-Based Testing (fast-check)

**Property-Based Testing (PBT)** is an advanced testing technique where instead of writing specific test cases, you define **properties** (rules) that must always be true, and the library automatically generates hundreds of random inputs to try to break those rules.

**Files:**
- `aiCommandValidatorService.test.js`
- `aiCommandExecutorService.test.js`

**Example properties tested:**

```
Property 1: "For any valid gatepass, the QR hash must always decrypt
             to the same gatepass ID"
→ fast-check generates 1000 random gatepass IDs and verifies this

Property 2: "A gatepass status can never go from 'rejected' back to 'pending'"
→ fast-check tries all possible status transition sequences

Property 3: "An AI command with confidence score below 50 must never
             be auto-executed without confirmation"
→ fast-check generates random confidence scores and verifies behavior
```

This gives us much stronger correctness guarantees than hand-written test cases alone.

---

## 5.2 Key Services Explained

### `gatepassService.js`
Handles all business logic for gatepass operations:
- Validates that leave_time is in the future
- Validates that return_time is after leave_time
- Enforces the two-step approval chain (coordinator must approve before warden)
- Triggers notifications after each status change

### `qrService.js`
- Generates encrypted QR payload using AES encryption
- Creates SHA-256 hash stored in DB for verification
- Sets expiry to match the gatepass return time
- On verify: decrypts, checks hash, checks expiry, checks is_used flag

### `overdueService.js`
- Runs as a background job (scheduled via `backgroundJobs.js`)
- Queries all gatepasses where `expected_return_time < NOW` and `status = 'approved'`
- Marks them as `overdue`, sets `is_overdue = 1`
- Triggers email and in-app notifications to warden and coordinator

### `aiCommandExecutorService.js`
- Receives parsed AI command (action + parameters)
- Maps action to the correct service function
- For destructive actions (delete, bulk approve) → sets `requires_confirmation = true`
- Logs every execution to `ai_command_history` and `ai_audit_logs`

### `parentNotificationService.js`
- Sends email to parent/guardian when:
  - Student is overdue
  - Emergency alert is broadcast
- Uses Nodemailer with SMTP configuration

---

## 5.3 Environment Configuration

The system is configured entirely through environment variables — no hardcoded secrets.

### Backend `.env` file:

```env
# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=<strong-random-string>
JWT_EXPIRES_IN=7d

# Database
DB_PATH=../database/hostel_gatepass.db

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI (choose one)
AI_SERVICE_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
```

This means the same codebase can run in development, staging, and production just by changing the `.env` file.

---

## 5.4 Deployment

### Backend Deployment
The backend includes a `Procfile` for Heroku-style deployment:
```
web: node server.js
```

**Steps:**
1. Set all environment variables on the server
2. Run `npm run db:init` to create tables
3. Run `npm run db:seed` to create default users
4. Run `npm start` to launch the server

### Frontend Deployment
Next.js builds to a static/server bundle:
```bash
npm run build   # Creates optimized production build
npm start       # Serves the production build
```

Can be deployed to Vercel, Netlify, or any Node.js hosting.

---

## 5.5 Project Outcomes & Achievements

### What We Built
A complete, production-ready hostel management system with:

| Feature | Status |
|---------|--------|
| Multi-role authentication (JWT + Google OAuth) | ✅ Complete |
| Two-step gatepass approval workflow | ✅ Complete |
| Encrypted QR code generation and scanning | ✅ Complete |
| Visitor pass management with entry/exit logging | ✅ Complete |
| Automated overdue detection and alerts | ✅ Complete |
| In-app and email notification system | ✅ Complete |
| Analytics dashboards with interactive charts | ✅ Complete |
| Emergency alert broadcast system | ✅ Complete |
| AI-powered admin assistant | ✅ Complete |
| Property-based test suite | ✅ Complete |
| Responsive UI with animations | ✅ Complete |

---

## 5.6 Challenges Faced & How We Solved Them

| Challenge | Solution |
|-----------|----------|
| QR codes being forged or reused | AES encryption + SHA-256 hash + single-use flag |
| Two-step approval getting out of sync | Strict status machine — each transition validated in service layer |
| AI commands being too risky to auto-execute | Confidence scoring + confirmation required for destructive actions |
| SQLite not supporting concurrent writes well | Used `sql.js` with careful transaction handling |
| Google OAuth token verification | Used official `google-auth-library` to verify tokens server-side |
| Overdue detection needing to run automatically | Background job in `backgroundJobs.js` runs on a schedule |

---

## 5.7 Future Improvements

- **Mobile app** — React Native version for students and security guards
- **Push notifications** — Browser push notifications instead of only in-app
- **PostgreSQL migration** — Move from SQLite to PostgreSQL for larger scale
- **Biometric verification** — Face recognition at the gate instead of QR
- **Parent portal** — Dedicated login for parents to track their child's movement
- **SMS notifications** — Send SMS alerts in addition to email

---

## 5.8 Summary

The Hostel Gatepass Management System successfully digitizes a traditionally paper-based process. It is:

- **Secure** — JWT auth, encrypted QR codes, rate limiting, role-based access
- **Complete** — covers the full workflow from request to gate exit and return
- **Scalable** — clean MVC architecture, easy to extend with new features
- **Tested** — unit tests + property-based tests for correctness guarantees
- **User-friendly** — responsive UI, animations, toast notifications, dark mode

The system is ready for real-world deployment in any educational institution's hostel.

---

*End of Presentation*

**Team:** Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke
