# Weekly Report — Shayan Khan
**Project:** Hostel Gatepass Management System
**Role:** Backend Developer — Models, Services, Database Layer
**Duration:** 16 Weeks × 6 Days/Week

---

## Week 1 — Project Setup & Planning

| Day | Task |
|-----|------|
| 1 | Set up Git repository, defined branching strategy |
| 2 | Configured ESLint and Prettier for backend |
| 3 | Created `.env.example` for backend configuration |
| 4 | Set up nodemon for dev server |
| 5 | Wrote initial `server.js` entry point |
| 6 | Team code review and merge of setup branches |

---

## Week 2 — Database Layer & Authentication Foundation

| Day | Task |
|-----|------|
| 1 | Wrote `database/init.js` to create tables from schema.sql |
| 2 | Tested database initialization script |
| 3 | Wrote `database/seeds.js` — seeded admin user |
| 4 | Seeded security and student test users |
| 5 | Verified all default credentials work |
| 6 | Team review of DB layer and auth foundation |

---

## Week 3 — Authentication System (JWT + Google OAuth)

| Day | Task |
|-----|------|
| 1 | Wrote `authMiddleware.js` — JWT verification |
| 2 | Tested JWT middleware with valid/invalid tokens |
| 3 | Wrote token refresh logic in auth service |
| 4 | Wrote Google OAuth backend handler (`google-auth-library`) |
| 5 | Tested full Google OAuth login flow end-to-end |
| 6 | Team review of complete auth system |

---

## Week 4 — Gatepass Core (Student Side)

| Day | Task |
|-----|------|
| 1 | Wrote `gatepassModel.js` — createGatepass |
| 2 | Wrote `gatepassModel.js` — findByStudentId |
| 3 | Wrote `gatepassModel.js` — updateStatus |
| 4 | Wrote `gatepassModel.js` — getHistory with pagination |
| 5 | Tested gatepass history with multiple records |
| 6 | Team review of student gatepass flow |

---

## Week 5 — Gatepass Approval Workflow

| Day | Task |
|-----|------|
| 1 | Wrote `approvalModel.js` — createApproval |
| 2 | Wrote `approvalModel.js` — getByGatepassId |
| 3 | Wrote two-step approval logic (coordinator → warden) |
| 4 | Tested warden final approval updates status to `approved` |
| 5 | Wrote `gatepassService.js` — rejection with comments |
| 6 | Team review of approval workflow |

---

## Week 6 — QR Code System

| Day | Task |
|-----|------|
| 1 | Wrote `utils/encryption.js` — encrypt/decrypt QR data |
| 2 | Wrote QR hash generation using crypto |
| 3 | Wrote QR expiry logic (expires at return time) |
| 4 | Tested QR generation for approved gatepasses |
| 5 | Tested QR expiry — expired QR rejected correctly |
| 6 | Team review of QR system |

---

## Week 7 — Notification System & Email Service

| Day | Task |
|-----|------|
| 1 | Wrote `notificationModel.js` — createNotification |
| 2 | Wrote `notificationModel.js` — markAsRead |
| 3 | Wrote notification triggers in gatepass approval flow |
| 4 | Wrote `emailService.js` — SMTP setup with Nodemailer |
| 5 | Wrote `emailService.js` — sendRejectionEmail |
| 6 | Team review of notification and email system |

---

## Week 8 — Visitor Pass Management

| Day | Task |
|-----|------|
| 1 | Wrote `visitorPassModel.js` — createVisitorPass |
| 2 | Wrote `visitorPassModel.js` — updateStatus |
| 3 | Wrote visitor pass approval logic (security approves) |
| 4 | Wrote visitor entry/exit logging |
| 5 | Wrote `visitorQRModel.js` and `visitorQRService.js` |
| 6 | Team review of visitor pass system |

---

## Week 9 — Admin Panel & User Management

| Day | Task |
|-----|------|
| 1 | Wrote `adminController.js` — listUsers with pagination |
| 2 | Wrote `adminController.js` — createUser |
| 3 | Wrote `adminController.js` — updateUser |
| 4 | Wrote `adminController.js` — toggleUserActive |
| 5 | Wrote `profileController.js` — update profile |
| 6 | Team review of admin panel |

---

## Week 10 — Analytics & Reporting

| Day | Task |
|-----|------|
| 1 | Wrote `analyticsService.js` — gatepass stats by date range |
| 2 | Wrote `analyticsService.js` — overdue stats |
| 3 | Wrote `studentAnalyticsService.js` — per-student stats |
| 4 | Wrote warden analytics — hostel-wide view |
| 5 | Wrote `analyticsController.js` — student analytics endpoint |
| 6 | Team review of analytics system |

---

## Week 11 — Emergency Alert System

| Day | Task |
|-----|------|
| 1 | Wrote `emergencyAlertModel.js` — createAlert |
| 2 | Wrote `emergencyAlertModel.js` — getActiveAlerts |
| 3 | Wrote alert broadcast logic — notify all users |
| 4 | Wrote alert resolve/dismiss logic |
| 5 | Wrote `parentNotificationService.js` — notify parents on emergency |
| 6 | Team review of emergency alert system |

---

## Week 12 — AI Admin Assistant

| Day | Task |
|-----|------|
| 1 | Wrote `aiCommandParserService.js` — parse natural language to action |
| 2 | Wrote `aiCommandValidatorService.js` — validate parsed commands |
| 3 | Wrote `aiCommandExecutorService.js` — execute validated commands |
| 4 | Wrote confirmation flow for destructive commands |
| 5 | Wrote AI command history retrieval endpoint |
| 6 | Team review of AI assistant system |

---

## Week 13 — Search, Overdue Detection & Background Jobs

| Day | Task |
|-----|------|
| 1 | Wrote `searchController.js` — global search endpoint |
| 2 | Wrote search filters (by role, status, date) |
| 3 | Wrote `overdueService.js` — detect overdue gatepasses |
| 4 | Wrote `overdueService.js` — mark gatepass as overdue |
| 5 | Wrote `visitorOverdueJob.js` — detect overdue visitors |
| 6 | Team review of search and overdue systems |

---

## Week 14 — Security Hardening & Testing

| Day | Task |
|-----|------|
| 1 | Wrote `utils/validation.js` — reusable validators |
| 2 | Wrote `utils/helpers.js` — date and string helpers |
| 3 | Wrote integration test for auth flow |
| 4 | Wrote integration test for visitor pass flow |
| 5 | Ran full test suite — fixed failing tests |
| 6 | Team review of security and test results |

---

## Week 15 — Frontend Polish & UX Improvements

| Day | Task |
|-----|------|
| 1 | Reviewed all API responses for consistency |
| 2 | Fixed API response format inconsistencies |
| 3 | Wrote `add-parent-contacts.js` migration |
| 4 | Reviewed and updated `SETUP.md` |
| 5 | Wrote `DEPLOYMENT.md` — production deployment guide |
| 6 | Team review of frontend polish |

---

## Week 16 — Final Integration, Testing & Deployment

| Day | Task |
|-----|------|
| 1 | Ran full end-to-end test of student gatepass flow |
| 2 | Fixed bugs found in student flow testing |
| 3 | Ran full end-to-end test of AI assistant |
| 4 | Fixed AI assistant bugs |
| 5 | Final `npm test` — all tests passing |
| 6 | Final team review and sign-off |
