# Weekly Report — Fraser Boban
**Project:** Hostel Gatepass Management System
**Role:** Backend Developer — Routes, Middleware, API Integration
**Duration:** 16 Weeks × 6 Days/Week

---

## Week 1 — Project Setup & Planning

| Day | Task |
|-----|------|
| 1 | Installed Node.js, initialized Express backend project |
| 2 | Set up folder structure: controllers, models, routes, services |
| 3 | Integrated Helmet and CORS middleware in `app.js` |
| 4 | Configured rate limiting middleware (`rateLimitMiddleware.js`) |
| 5 | Configured error handling middleware (`errorMiddleware.js`) |
| 6 | Tested server startup and middleware chain |

---

## Week 2 — Database Layer & Authentication Foundation

| Day | Task |
|-----|------|
| 1 | Integrated `sql.js` for SQLite in Node.js |
| 2 | Wrote `database/migrate.js` for future migrations |
| 3 | Wrote seed data for warden and coordinator users |
| 4 | Tested all seed data inserts |
| 5 | Wrote `config/constants.js` — roles, statuses |
| 6 | Fixed seed script bugs found in review |

---

## Week 3 — Authentication System (JWT + Google OAuth)

| Day | Task |
|-----|------|
| 1 | Set up auth routes (`/api/auth/register`, `/api/auth/login`) |
| 2 | Wired auth routes into main router |
| 3 | Added input validation with `express-validator` |
| 4 | Tested Google token verification flow |
| 5 | Fixed CORS issues with Google OAuth redirect |
| 6 | Fixed token expiry handling on frontend |

---

## Week 4 — Gatepass Core (Student Side)

| Day | Task |
|-----|------|
| 1 | Set up gatepass routes (`/api/gatepass`) |
| 2 | Wired gatepass routes into main router |
| 3 | Added validation for leave_time and return_time |
| 4 | Tested pagination logic |
| 5 | Fixed date formatting issues in queries |
| 6 | Fixed validation bugs found in review |

---

## Week 5 — Gatepass Approval Workflow

| Day | Task |
|-----|------|
| 1 | Set up approval routes (`/api/gatepass/approve`, `/api/gatepass/reject`) |
| 2 | Added role guard — coordinator only for first approval |
| 3 | Tested coordinator approval updates status to `coordinator_approved` |
| 4 | Tested rejection flow sets status to `rejected` |
| 5 | Tested full two-step approval chain |
| 6 | Fixed status transition bugs |

---

## Week 6 — QR Code System

| Day | Task |
|-----|------|
| 1 | Set up QR routes (`/api/qr/generate`, `/api/qr/verify`) |
| 2 | Wired QR routes into main router |
| 3 | Added role guard — security only for verify |
| 4 | Tested QR verification with valid hash |
| 5 | Tested used QR — reuse rejected correctly |
| 6 | Fixed encryption edge cases |

---

## Week 7 — Notification System & Email Service

| Day | Task |
|-----|------|
| 1 | Set up notification routes (`/api/notifications`) |
| 2 | Wired notification routes into main router |
| 3 | Tested notification created on approval |
| 4 | Configured SMTP env variables |
| 5 | Tested email sending in dev with test SMTP |
| 6 | Fixed email template formatting |

---

## Week 8 — Visitor Pass Management

| Day | Task |
|-----|------|
| 1 | Set up visitor routes (`/api/visitor`) |
| 2 | Wired visitor routes into main router |
| 3 | Added role guard — security for approval |
| 4 | Tested entry log creation on approval |
| 5 | Tested visitor QR generation |
| 6 | Fixed visitor pass status transitions |

---

## Week 9 — Admin Panel & User Management

| Day | Task |
|-----|------|
| 1 | Set up admin routes (`/api/admin`) |
| 2 | Added role guard — admin only for user creation |
| 3 | Tested admin create user for all roles |
| 4 | Tested user activate/deactivate |
| 5 | Wrote `profileService.js` — profile update logic |
| 6 | Fixed pagination bugs in user list |

---

## Week 10 — Analytics & Reporting

| Day | Task |
|-----|------|
| 1 | Set up analytics routes (`/api/admin/analytics`) |
| 2 | Tested analytics queries with date filters |
| 3 | Tested student analytics queries |
| 4 | Tested warden analytics queries |
| 5 | Tested all analytics endpoints |
| 6 | Fixed date range query bugs |

---

## Week 11 — Emergency Alert System

| Day | Task |
|-----|------|
| 1 | Set up emergency routes (`/api/emergency`) |
| 2 | Wired emergency routes into main router |
| 3 | Tested alert creation and notification trigger |
| 4 | Tested alert resolve updates status |
| 5 | Tested parent notification email |
| 6 | Fixed alert broadcast edge cases |

---

## Week 12 — AI Admin Assistant

| Day | Task |
|-----|------|
| 1 | Set up AI routes (`/api/ai`) |
| 2 | Integrated Gemini API via axios |
| 3 | Tested Gemini API response parsing |
| 4 | Tested confirmation dialog before execution |
| 5 | Tested audit log creation on each command |
| 6 | Fixed Gemini API error handling |

---

## Week 13 — Search, Overdue Detection & Background Jobs

| Day | Task |
|-----|------|
| 1 | Set up search routes (`/api/search`) |
| 2 | Tested search with various queries |
| 3 | Integrated overdue check in `backgroundJobs.js` |
| 4 | Tested overdue detection with past return times |
| 5 | Tested visitor overdue detection |
| 6 | Fixed search query performance issues |

---

## Week 14 — Security Hardening & Testing

| Day | Task |
|-----|------|
| 1 | Reviewed all routes for missing auth guards |
| 2 | Tested rate limiter under simulated load |
| 3 | Wrote integration test for gatepass create → approve |
| 4 | Wrote integration test for admin user CRUD |
| 5 | Fixed security issues found in audit |
| 6 | Merged all security fixes |

---

## Week 15 — Frontend Polish & UX Improvements

| Day | Task |
|-----|------|
| 1 | Wrote missing API error messages |
| 2 | Tested all API endpoints one final time |
| 3 | Tested parent contact data migration |
| 4 | Updated `API.md` with all endpoints |
| 5 | Wrote Procfile for backend deployment |
| 6 | Fixed remaining UI inconsistencies |

---

## Week 16 — Final Integration, Testing & Deployment

| Day | Task |
|-----|------|
| 1 | Ran full end-to-end test of approval workflow |
| 2 | Fixed bugs found in approval flow testing |
| 3 | Ran full end-to-end test of analytics |
| 4 | Fixed analytics chart rendering bugs |
| 5 | Deployed backend to production server |
| 6 | Updated README with production URLs |
