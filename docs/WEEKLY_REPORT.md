# Hostel Gatepass Management System — 16-Week Development Report

**Project:** Hostel Gatepass Management System  
**Team Size:** 5 Members  
**Duration:** 16 Weeks × 6 Days/Week  

## Team Members
| # | Name |
|---|------|
| 1 | Shayan Khan |
| 2 | Fraser Boban |
| 3 | Abhijeet Shinde |
| 4 | Pavan Ghaywat |
| 5 | Saket Ghodke |

---

## Week 1 — Project Setup & Planning

**Focus:** Environment setup, project scaffolding, database schema design

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Set up Git repository, defined branching strategy | Installed Node.js, initialized Express backend project | Installed Next.js 14, configured Tailwind CSS | Designed initial database schema (users table) | Wrote project requirements document |
| 2 | Configured ESLint and Prettier for backend | Set up folder structure: controllers, models, routes, services | Configured Next.js App Router structure | Designed gatepasses table schema | Created project timeline and milestone plan |
| 3 | Created `.env.example` for backend configuration | Integrated Helmet and CORS middleware in `app.js` | Set up frontend folder structure (admin, student, coordinator pages) | Designed approvals and logs tables | Reviewed and finalized schema with team |
| 4 | Set up nodemon for dev server | Configured rate limiting middleware (`rateLimitMiddleware.js`) | Created base layout components in Next.js | Designed QR codes and notifications tables | Documented API endpoint plan |
| 5 | Wrote initial `server.js` entry point | Configured error handling middleware (`errorMiddleware.js`) | Set up Tailwind config and PostCSS | Designed visitor_passes table schema | Set up docs folder and initial `SETUP.md` draft |
| 6 | Team code review and merge of setup branches | Tested server startup and middleware chain | Verified frontend dev server runs correctly | Finalized `schema.sql` with all indexes | Updated project plan based on review feedback |

---

## Week 2 — Database Layer & Authentication Foundation

**Focus:** Database initialization, user model, auth service setup

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `database/init.js` to create tables from schema.sql | Integrated `sql.js` for SQLite in Node.js | Created login page UI in Next.js | Wrote `userModel.js` — createUser, findByEmail | Set up JWT config (`config/jwt.js`) |
| 2 | Tested database initialization script | Wrote `database/migrate.js` for future migrations | Created register page UI with form validation | Wrote `userModel.js` — findById, updateUser | Wrote `authService.js` — register logic with bcrypt |
| 3 | Wrote `database/seeds.js` — seeded admin user | Wrote seed data for warden and coordinator users | Built reusable Input and Button components | Wrote `userModel.js` — listUsers, deleteUser | Wrote `authService.js` — login logic, JWT generation |
| 4 | Seeded security and student test users | Tested all seed data inserts | Built form error display component | Wrote `config/database.js` — DB connection singleton | Wrote `authController.js` — register endpoint |
| 5 | Verified all default credentials work | Wrote `config/constants.js` — roles, statuses | Integrated axios in frontend, set up API base URL | Tested DB connection and query helpers | Wrote `authController.js` — login endpoint |
| 6 | Team review of DB layer and auth foundation | Fixed seed script bugs found in review | Tested login/register UI against mock data | Reviewed and merged model code | Tested JWT generation and verified token structure |

---

## Week 3 — Authentication System (JWT + Google OAuth)

**Focus:** Complete auth flow, role middleware, Google OAuth integration

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `authMiddleware.js` — JWT verification | Set up auth routes (`/api/auth/register`, `/api/auth/login`) | Integrated `@react-oauth/google` in frontend | Wrote `roleMiddleware.js` — role-based access control | Tested register API with Postman |
| 2 | Tested JWT middleware with valid/invalid tokens | Wired auth routes into main router | Built Google login button component | Tested role middleware for all 5 roles | Tested login API and token response |
| 3 | Wrote token refresh logic in auth service | Added input validation with `express-validator` | Stored JWT token in localStorage on login | Fixed role check edge cases | Wrote auth error response helpers |
| 4 | Wrote Google OAuth backend handler (`google-auth-library`) | Tested Google token verification flow | Built protected route wrapper in Next.js | Wrote user session context in React | Integrated Google OAuth endpoint in backend routes |
| 5 | Tested full Google OAuth login flow end-to-end | Fixed CORS issues with Google OAuth redirect | Built role-based redirect after login (student/admin/etc.) | Wrote logout function — clear token | Wrote `profileController.js` — get profile endpoint |
| 6 | Team review of complete auth system | Fixed token expiry handling on frontend | Tested all role redirects after login | Reviewed and merged auth middleware | Verified Google OAuth works in dev environment |

---

## Week 4 — Gatepass Core (Student Side)

**Focus:** Gatepass creation, student dashboard, gatepass history

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `gatepassModel.js` — createGatepass | Set up gatepass routes (`/api/gatepass`) | Built student dashboard page layout | Wrote gatepass status constants | Wrote `gatepassService.js` — create gatepass logic |
| 2 | Wrote `gatepassModel.js` — findByStudentId | Wired gatepass routes into main router | Built gatepass creation form (destination, reason, dates) | Wrote `gatepassModel.js` — findById | Wrote `gatepassController.js` — create endpoint |
| 3 | Wrote `gatepassModel.js` — updateStatus | Added validation for leave_time and return_time | Built date/time picker components | Wrote `gatepassModel.js` — listAll with filters | Tested gatepass creation API |
| 4 | Wrote `gatepassModel.js` — getHistory with pagination | Tested pagination logic | Built gatepass history table component | Wrote status badge component (pending/approved/rejected) | Wrote `gatepassController.js` — history endpoint |
| 5 | Tested gatepass history with multiple records | Fixed date formatting issues in queries | Integrated gatepass history API in student dashboard | Wrote gatepass detail modal component | Tested history pagination on frontend |
| 6 | Team review of student gatepass flow | Fixed validation bugs found in review | Polished student dashboard UI | Reviewed model queries for performance | Verified full create → view history flow |

---

## Week 5 — Gatepass Approval Workflow (Coordinator & Warden)

**Focus:** Approval/rejection flow, coordinator and warden dashboards

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `approvalModel.js` — createApproval | Set up approval routes (`/api/gatepass/approve`, `/api/gatepass/reject`) | Built coordinator dashboard page | Wrote `gatepassModel.js` — getPendingForCoordinator | Wrote `gatepassService.js` — coordinator approve logic |
| 2 | Wrote `approvalModel.js` — getByGatepassId | Added role guard — coordinator only for first approval | Built pending requests list component | Wrote `gatepassModel.js` — getPendingForWarden | Wrote `gatepassService.js` — warden approve logic |
| 3 | Wrote two-step approval logic (coordinator → warden) | Tested coordinator approval updates status to `coordinator_approved` | Built approve/reject action buttons with comment input | Wrote `gatepassModel.js` — getApprovedGatepasses | Wrote `gatepassController.js` — approve endpoint |
| 4 | Tested warden final approval updates status to `approved` | Tested rejection flow sets status to `rejected` | Built warden dashboard page | Wrote approval history component | Wrote `gatepassController.js` — reject endpoint |
| 5 | Wrote `gatepassService.js` — rejection with comments | Tested full two-step approval chain | Integrated approval API calls in coordinator dashboard | Built coordinator history page | Tested reject flow with comments |
| 6 | Team review of approval workflow | Fixed status transition bugs | Polished coordinator and warden UI | Reviewed approval model queries | Verified end-to-end approval chain works |

---

## Week 6 — QR Code System

**Focus:** QR generation, encryption, security scanning

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `utils/encryption.js` — encrypt/decrypt QR data | Set up QR routes (`/api/qr/generate`, `/api/qr/verify`) | Built QR code display component using `qrcode.react` | Wrote `qrModel.js` — createQRCode | Wrote `qrService.js` — generate QR logic |
| 2 | Wrote QR hash generation using crypto | Wired QR routes into main router | Built QR scanner component using `html5-qrcode` | Wrote `qrModel.js` — findByGatepassId | Wrote `qrService.js` — verify QR logic |
| 3 | Wrote QR expiry logic (expires at return time) | Added role guard — security only for verify | Integrated QR display in student approved gatepass view | Wrote `qrModel.js` — markAsUsed | Wrote `qrController.js` — generate endpoint |
| 4 | Tested QR generation for approved gatepasses | Tested QR verification with valid hash | Built security dashboard with QR scanner | Wrote `logModel.js` — createLog (exit/entry) | Wrote `qrController.js` — verify endpoint |
| 5 | Tested QR expiry — expired QR rejected correctly | Tested used QR — reuse rejected correctly | Integrated QR scan result display (student info, gatepass details) | Tested log creation on scan | Tested full scan → log flow |
| 6 | Team review of QR system | Fixed encryption edge cases | Polished security dashboard UI | Reviewed log model | Verified QR system end-to-end |

---

## Week 7 — Notification System & Email Service

**Focus:** In-app notifications, email notifications, background jobs

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `notificationModel.js` — createNotification | Set up notification routes (`/api/notifications`) | Built notification bell icon component | Wrote `notificationModel.js` — getByUserId | Wrote `notificationService.js` — create notification |
| 2 | Wrote `notificationModel.js` — markAsRead | Wired notification routes into main router | Built notification dropdown list component | Wrote `notificationModel.js` — markAllRead | Wrote `notificationService.js` — notify on approval |
| 3 | Wrote notification triggers in gatepass approval flow | Tested notification created on approval | Built unread count badge on bell icon | Wrote `notificationModel.js` — deleteOld | Wrote `notificationService.js` — notify on rejection |
| 4 | Wrote `emailService.js` — SMTP setup with Nodemailer | Configured SMTP env variables | Built notification settings toggle in profile | Wrote email templates for approval/rejection | Wrote `emailService.js` — sendApprovalEmail |
| 5 | Wrote `emailService.js` — sendRejectionEmail | Tested email sending in dev with test SMTP | Integrated notification API in frontend | Wrote `backgroundJobs.js` — overdue check job | Wrote `emailService.js` — sendOverdueAlert |
| 6 | Team review of notification and email system | Fixed email template formatting | Polished notification UI | Reviewed background job scheduling | Tested overdue email alert trigger |

---

## Week 8 — Visitor Pass Management

**Focus:** Visitor pass creation, approval, entry/exit logging

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `visitorPassModel.js` — createVisitorPass | Set up visitor routes (`/api/visitor`) | Built visitor pass creation form (student side) | Wrote `visitorPassModel.js` — findById | Wrote `visitorPassService.js` — create pass logic |
| 2 | Wrote `visitorPassModel.js` — updateStatus | Wired visitor routes into main router | Built visitor pass list component | Wrote `visitorPassModel.js` — listByStudent | Wrote `visitorPassController.js` — create endpoint |
| 3 | Wrote visitor pass approval logic (security approves) | Added role guard — security for approval | Built security visitor management page | Wrote `visitorPassModel.js` — listActive | Wrote `visitorPassController.js` — approve endpoint |
| 4 | Wrote visitor entry/exit logging | Tested entry log creation on approval | Built visitor entry/exit action buttons | Wrote `visitorOverdueJob.js` — overdue detection | Wrote `visitorPassController.js` — log exit endpoint |
| 5 | Wrote `visitorQRModel.js` and `visitorQRService.js` | Tested visitor QR generation | Built visitor QR display component | Tested overdue detection job | Tested full visitor pass flow |
| 6 | Team review of visitor pass system | Fixed visitor pass status transitions | Polished visitor management UI | Reviewed overdue job logic | Verified visitor pass end-to-end |

---

## Week 9 — Admin Panel & User Management

**Focus:** Admin dashboard, user CRUD, system settings

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `adminController.js` — listUsers with pagination | Set up admin routes (`/api/admin`) | Built admin dashboard page layout | Wrote `userModel.js` — adminListUsers with filters | Wrote admin user management page |
| 2 | Wrote `adminController.js` — createUser | Added role guard — admin only for user creation | Built create user modal with role selector | Wrote `userModel.js` — adminUpdateUser | Wrote admin user table with search and filter |
| 3 | Wrote `adminController.js` — updateUser | Tested admin create user for all roles | Built edit user modal | Wrote `userModel.js` — adminDeleteUser | Wrote `adminController.js` — deleteUser |
| 4 | Wrote `adminController.js` — toggleUserActive | Tested user activate/deactivate | Built user status toggle in admin table | Wrote bulk user operations logic | Wrote admin settings page |
| 5 | Wrote `profileController.js` — update profile | Wrote `profileService.js` — profile update logic | Built profile settings page for all roles | Wrote profile picture upload with Multer | Tested profile update API |
| 6 | Team review of admin panel | Fixed pagination bugs in user list | Polished admin UI with Framer Motion animations | Reviewed user model admin queries | Verified admin CRUD operations |

---

## Week 10 — Analytics & Reporting

**Focus:** Analytics service, charts, role-specific dashboards

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `analyticsService.js` — gatepass stats by date range | Set up analytics routes (`/api/admin/analytics`) | Built analytics page layout with Chart.js | Wrote `analyticsService.js` — approval rate stats | Wrote `analyticsController.js` — main analytics endpoint |
| 2 | Wrote `analyticsService.js` — overdue stats | Tested analytics queries with date filters | Built line chart for gatepass trends | Wrote `analyticsService.js` — role-wise breakdown | Wrote `analyticsController.js` — export endpoint |
| 3 | Wrote `studentAnalyticsService.js` — per-student stats | Tested student analytics queries | Built bar chart for approval/rejection rates | Wrote `analyticsService.js` — visitor pass stats | Wrote coordinator analytics endpoint |
| 4 | Wrote warden analytics — hostel-wide view | Tested warden analytics queries | Built pie chart for status distribution | Wrote analytics date range picker component | Wrote HOD analytics page |
| 5 | Wrote `analyticsController.js` — student analytics endpoint | Tested all analytics endpoints | Integrated all charts in respective dashboards | Wrote analytics summary cards (total, pending, approved) | Tested analytics with real seeded data |
| 6 | Team review of analytics system | Fixed date range query bugs | Polished charts with Chart.js styling | Reviewed analytics service performance | Verified all dashboard analytics display correctly |

---

## Week 11 — Emergency Alert System

**Focus:** Emergency alert creation, broadcast, and display

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `emergencyAlertModel.js` — createAlert | Set up emergency routes (`/api/emergency`) | Built emergency alert creation form (admin) | Wrote `emergencyAlertModel.js` — listAlerts | Wrote `emergencyAlertService.js` — create alert |
| 2 | Wrote `emergencyAlertModel.js` — getActiveAlerts | Wired emergency routes into main router | Built emergency alert banner component | Wrote `emergencyAlertModel.js` — resolveAlert | Wrote `emergencyAlertController.js` — create endpoint |
| 3 | Wrote alert broadcast logic — notify all users | Tested alert creation and notification trigger | Built alert list in admin dashboard | Wrote `emergencyAlertModel.js` — getByType | Wrote `emergencyAlertController.js` — list endpoint |
| 4 | Wrote alert resolve/dismiss logic | Tested alert resolve updates status | Built alert resolve button in admin panel | Wrote alert severity levels (info, warning, critical) | Wrote `emergencyAlertController.js` — resolve endpoint |
| 5 | Wrote `parentNotificationService.js` — notify parents on emergency | Tested parent notification email | Built emergency alert display on student dashboard | Wrote alert history view | Tested full emergency alert flow |
| 6 | Team review of emergency alert system | Fixed alert broadcast edge cases | Polished emergency alert UI with color-coded severity | Reviewed alert model queries | Verified alerts appear on all role dashboards |

---

## Week 12 — AI Admin Assistant

**Focus:** AI command parsing, validation, execution, audit logging

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `aiCommandParserService.js` — parse natural language to action | Set up AI routes (`/api/ai`) | Built AI assistant chat UI in admin dashboard | Wrote `ai_command_history` table migration | Wrote `aiAssistantController.js` — command endpoint |
| 2 | Wrote `aiCommandValidatorService.js` — validate parsed commands | Integrated Gemini API via axios | Built command input box with send button | Wrote `ai_audit_logs` table migration | Wrote `auditLoggerService.js` — log AI events |
| 3 | Wrote `aiCommandExecutorService.js` — execute validated commands | Tested Gemini API response parsing | Built AI response display component | Wrote `aiCommandValidatorService.js` — confidence scoring | Wrote `aiRateLimitMiddleware.js` — AI-specific rate limit |
| 4 | Wrote confirmation flow for destructive commands | Tested confirmation dialog before execution | Built confirmation modal component | Wrote `aiCommandExecutorService.js` — user management actions | Tested AI command for creating a user |
| 5 | Wrote AI command history retrieval endpoint | Tested audit log creation on each command | Built AI command history table in admin panel | Wrote `aiCommandExecutorService.js` — gatepass actions | Tested AI command for approving gatepasses |
| 6 | Team review of AI assistant system | Fixed Gemini API error handling | Polished AI chat UI with loading states | Reviewed audit log queries | Verified AI commands execute correctly with audit trail |

---

## Week 13 — Search, Overdue Detection & Background Jobs

**Focus:** Global search, overdue gatepass/visitor detection, scheduled jobs

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `searchController.js` — global search endpoint | Set up search routes (`/api/search`) | Built global search bar component | Wrote search query across users, gatepasses, visitors | Wrote search result display component |
| 2 | Wrote search filters (by role, status, date) | Tested search with various queries | Built search results page with tabs | Wrote search pagination logic | Tested search API with multiple filters |
| 3 | Wrote `overdueService.js` — detect overdue gatepasses | Integrated overdue check in `backgroundJobs.js` | Built overdue alerts section in warden dashboard | Wrote `overdueController.js` — list overdue endpoint | Wrote overdue status update logic |
| 4 | Wrote `overdueService.js` — mark gatepass as overdue | Tested overdue detection with past return times | Built overdue badge on gatepass list | Wrote overdue notification trigger | Tested overdue email notification |
| 5 | Wrote `visitorOverdueJob.js` — detect overdue visitors | Tested visitor overdue detection | Built overdue visitor list in security dashboard | Wrote overdue visitor notification | Tested full overdue detection pipeline |
| 6 | Team review of search and overdue systems | Fixed search query performance issues | Polished overdue UI indicators | Reviewed background job scheduling | Verified overdue detection runs correctly |

---

## Week 14 — Security Hardening & Testing

**Focus:** Input validation, rate limiting, property-based tests, integration tests

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Wrote `utils/validation.js` — reusable validators | Reviewed all routes for missing auth guards | Wrote frontend form validation for all forms | Wrote `aiCommandValidatorService.test.js` — PBT with fast-check | Audited all API endpoints for role guards |
| 2 | Wrote `utils/helpers.js` — date and string helpers | Tested rate limiter under simulated load | Wrote input sanitization for all form fields | Wrote `aiCommandExecutorService.test.js` — PBT with fast-check | Tested all validation rules |
| 3 | Wrote integration test for auth flow | Wrote integration test for gatepass create → approve | Wrote frontend error boundary components | Wrote property tests for QR encryption/decryption | Wrote integration test for QR scan flow |
| 4 | Wrote integration test for visitor pass flow | Wrote integration test for admin user CRUD | Wrote loading skeleton components | Wrote property tests for gatepass status transitions | Wrote integration test for notification flow |
| 5 | Ran full test suite — fixed failing tests | Fixed security issues found in audit | Wrote 404 and error pages | Reviewed all test coverage | Fixed property test edge cases |
| 6 | Team review of security and test results | Merged all security fixes | Polished error handling UI | Reviewed test suite completeness | Verified all tests pass with `npm test` |

---

## Week 15 — Frontend Polish & UX Improvements

**Focus:** Animations, responsive design, accessibility, UX refinements

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Reviewed all API responses for consistency | Wrote missing API error messages | Added Framer Motion page transition animations | Wrote responsive Tailwind classes for mobile | Wrote `react-hot-toast` notifications for all actions |
| 2 | Fixed API response format inconsistencies | Tested all API endpoints one final time | Added loading spinners to all async actions | Made all tables horizontally scrollable on mobile | Tested toast notifications for all user actions |
| 3 | Wrote `add-parent-contacts.js` migration | Tested parent contact data migration | Built profile picture upload UI with preview | Made dashboard cards responsive | Wrote empty state components for all lists |
| 4 | Reviewed and updated `SETUP.md` | Updated `API.md` with all endpoints | Added dark mode support (Tailwind dark classes) | Tested responsive layout on multiple screen sizes | Wrote confirmation dialogs for destructive actions |
| 5 | Wrote `DEPLOYMENT.md` — production deployment guide | Wrote Procfile for backend deployment | Polished all dashboard pages with consistent spacing | Wrote print stylesheet for gatepass PDF view | Tested all pages on mobile viewport |
| 6 | Team review of frontend polish | Fixed remaining UI inconsistencies | Final UX review across all role dashboards | Reviewed responsive design on all pages | Verified all toast and animation flows |

---

## Week 16 — Final Integration, Testing & Deployment

**Focus:** End-to-end testing, bug fixes, deployment, final documentation

| Day | Shayan Khan | Fraser Boban | Abhijeet Shinde | Pavan Ghaywat | Saket Ghodke |
|-----|-------------|--------------|-----------------|---------------|--------------|
| 1 | Ran full end-to-end test of student gatepass flow | Ran full end-to-end test of approval workflow | Ran full end-to-end test of QR scan flow | Ran full end-to-end test of visitor pass flow | Ran full end-to-end test of admin panel |
| 2 | Fixed bugs found in student flow testing | Fixed bugs found in approval flow testing | Fixed bugs found in QR scan testing | Fixed bugs found in visitor pass testing | Fixed bugs found in admin panel testing |
| 3 | Ran full end-to-end test of AI assistant | Ran full end-to-end test of analytics | Ran full end-to-end test of emergency alerts | Ran full end-to-end test of notifications | Ran full end-to-end test of search and overdue |
| 4 | Fixed AI assistant bugs | Fixed analytics chart rendering bugs | Fixed emergency alert display bugs | Fixed notification mark-as-read bugs | Fixed search filter bugs |
| 5 | Final `npm test` — all tests passing | Deployed backend to production server | Deployed frontend to production | Ran `npm run db:init` and `npm run db:seed` on production | Verified all features work on production URL |
| 6 | Final team review and sign-off | Updated README with production URLs | Wrote final project summary | Archived development branches | Delivered completed Hostel Gatepass Management System |

---

## Summary

| Week | Theme |
|------|-------|
| 1 | Project Setup & Planning |
| 2 | Database Layer & Authentication Foundation |
| 3 | Authentication System (JWT + Google OAuth) |
| 4 | Gatepass Core (Student Side) |
| 5 | Gatepass Approval Workflow |
| 6 | QR Code System |
| 7 | Notification System & Email Service |
| 8 | Visitor Pass Management |
| 9 | Admin Panel & User Management |
| 10 | Analytics & Reporting |
| 11 | Emergency Alert System |
| 12 | AI Admin Assistant |
| 13 | Search, Overdue Detection & Background Jobs |
| 14 | Security Hardening & Testing |
| 15 | Frontend Polish & UX Improvements |
| 16 | Final Integration, Testing & Deployment |
