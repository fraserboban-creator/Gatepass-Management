# Implementation Plan: AI-Powered Admin Automation Assistant

## Overview

Implement the AI Assistant feature incrementally: database tables → backend services → controller/route/middleware → frontend component → dashboard integration. Each step builds on the previous and is wired together at the end.

## Tasks

- [x] 1. Database migration - create AI tables
  - Add a new migration file `backend/src/database/migrations/004_create_ai_tables.js` following the existing `migrate.js` pattern using `db.exec` and `saveDatabase`
  - Create `ai_command_history` table with columns: id, admin_id (FK → users), command_text, parsed_data (JSON), action, confidence_score, execution_status CHECK('success','failed','pending_confirmation'), execution_result (JSON), error_message, requires_confirmation, confirmation_given, confirmed_at, executed_at, created_at
  - Create `ai_audit_logs` table with columns: id, admin_id (FK → users), command_history_id (FK → ai_command_history), event_type CHECK('access_attempt','command_execution','rate_limit_violation','auth_failure'), status CHECK('success','failure'), ip_address, user_agent, details (JSON), created_at
  - Create indexes: idx_ai_command_history_admin, idx_ai_command_history_created, idx_ai_command_history_action, idx_ai_audit_logs_admin, idx_ai_audit_logs_created, idx_ai_audit_logs_event
  - Wire the migration into `backend/src/database/migrate.js` by adding table-existence checks for both new tables (same try/catch pattern as visitor_qr_codes)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.6, 11.5_

- [x] 2. Backend - auditLoggerService
  - Create `backend/src/services/auditLoggerService.js`
  - Implement `logEvent({ adminId, commandHistoryId, eventType, status, ipAddress, userAgent, details })` — inserts a row into `ai_audit_logs` using `db.prepare`
  - Implement `getLogsForAdmin(adminId, limit = 50)` — returns audit log rows for a given admin
  - Ensure no sensitive data (passwords, tokens) is written to the details field
  - _Requirements: 9.3, 11.1, 11.2, 11.3, 11.4, 11.7_

  - [ ]* 2.1 Write unit tests for auditLoggerService
    - Test that `logEvent` inserts a row with correct fields
    - Test that sensitive fields are excluded from details
    - _Requirements: 11.7_

- [x] 3. Backend - aiCommandParserService
  - Create `backend/src/services/aiCommandParserService.js`
  - Read `AI_SERVICE_PROVIDER`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY` from `process.env`
  - Implement `parseCommand(commandText)` — main entry point; checks in-memory cache first, then calls `callAIService`
  - Implement `callAIService(commandText)` — routes to `callGemini`, `callOpenAI`, or `callGroq` based on provider env var; implements retry with exponential backoff (1s, 2s, 4s) and provider fallback
  - Implement `callGemini(commandText)`, `callOpenAI(commandText)`, `callGroq(commandText)` — each sends the prompt template from the design doc and parses the JSON response
  - Implement `getCachedResponse(hash)` / `cacheResponse(hash, response)` — in-memory Map with 1-hour TTL using SHA-256 hash of command text (use Node's built-in `crypto.createHash`)
  - Return parsed JSON: `{ action, name, email, role, room_number, user_id, confidence, parsed_command }`; include all fields (null for missing)
  - Log AI service response time via `console.log` or a metrics helper
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 14.1, 14.2, 14.3_

  - [ ]* 3.1 Write property test for parseCommand output structure
    - **Property 4: Parsed Command Structure** — for any parsed command, all required fields must be present (action, name, email, role, room_number, user_id, confidence, parsed_command)
    - **Property 5: Valid Action Types** — action must be one of the five valid values
    - **Property 6: Confidence Score Range** — confidence must be integer 0–100
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 14.1, 14.2**

  - [ ]* 3.2 Write property test for response caching
    - **Property 47: Response Caching** — identical commands within TTL window must return cached result without calling AI service again
    - **Validates: Requirements 10.6**

- [x] 4. Backend - aiCommandValidatorService
  - Create `backend/src/services/aiCommandValidatorService.js`
  - Implement `validate(parsedCommand, requestingAdminId)` — runs all validation rules and returns `{ valid: Boolean, errors: [{ field, message }] }`
  - Required fields by action: create_user needs name+email+role; update_user needs user_id + at least one of name/email/role/room_number; delete/deactivate/activate need user_id
  - Email regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
  - Role must be one of: student, coordinator, warden, security, admin
  - Room number regex: `^[A-Z]-\d{3}$`
  - For create_user: query `UserModel.findByEmail` — reject if email already exists
  - For update/delete/deactivate/activate: query `UserModel.findById` — reject if user not found
  - Self-protection: reject delete_user or deactivate_user where `parsedCommand.user_id === requestingAdminId`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.5, 9.6_

  - [ ]* 4.1 Write property test for required field validation
    - **Property 9: Required Field Validation** — missing required fields must always produce a validation error listing those fields
    - **Validates: Requirements 3.1**

  - [ ]* 4.2 Write property test for email/role/room validation
    - **Property 10: Email Format Validation** — any non-RFC-5322 email must be rejected
    - **Property 11: Valid Role Constraint** — any role outside the allowed set must be rejected
    - **Property 12: Room Number Format Validation** — any room_number not matching `[A-Z]-\d{3}` must be rejected
    - **Validates: Requirements 3.2, 3.3, 3.4**

  - [ ]* 4.3 Write property test for database constraint checks
    - **Property 13: Duplicate Email Detection** — create_user with existing email must always be rejected
    - **Property 14: User Existence Validation** — update/delete/deactivate/activate with non-existent user_id must always be rejected
    - **Property 40: Self-Deletion Prevention** — delete/deactivate targeting own account must always be rejected
    - **Validates: Requirements 3.5, 3.6, 9.6**

- [x] 5. Backend - aiCommandExecutorService
  - Create `backend/src/services/aiCommandExecutorService.js`
  - Implement `execute(parsedCommand, adminId)` — routes to the correct `UserModel` method based on action:
    - `create_user` → `AuthService.register` (same as `AdminController.createUser`)
    - `update_user` → `UserModel.update(user_id, { name, email, role, room_number })`
    - `delete_user` → `UserModel.delete(user_id)`
    - `deactivate_user` → `UserModel.deactivate(user_id)`
    - `activate_user` → `UserModel.activate(user_id)`
  - Return `{ success: Boolean, data: { userId, name, email, role, room_number } }` on success
  - Wrap each operation in a try/catch; on failure return `{ success: false, error: 'user-friendly message' }` without exposing stack traces
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.5, 7.7_

  - [ ]* 5.1 Write property test for execution result format
    - **Property 17: Execution Result Format** — every execution must return an object with a `success` boolean and relevant data or error
    - **Property 20: Transaction Rollback** — a simulated DB failure must leave no partial changes
    - **Validates: Requirements 4.7, 5.5**

- [x] 6. Backend - aiRateLimitMiddleware
  - Create `backend/src/middleware/aiRateLimitMiddleware.js`
  - Use `express-rate-limit` (already installed) with `windowMs: 60 * 60 * 1000` (1 hour) and `max: 60`
  - Set `keyGenerator` to `(req) => req.user?.id?.toString()` so limits are per admin user ID
  - Return 429 with `{ success: false, message: 'Rate limit exceeded. You can retry after <time>.' }` and set `Retry-After` header
  - Skip the limit when `req.user?.role === 'super_admin'` using the `skip` option
  - On rate limit trigger, call `auditLoggerService.logEvent` with `event_type: 'rate_limit_violation'`
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 6.1 Write property test for rate limiting
    - **Property 60: Rate Limit Enforcement** — submitting 61 requests within one hour window must result in a 429 on the 61st
    - **Property 62: Per-User Rate Limiting** — two different admin users must have independent counters
    - **Validates: Requirements 13.1, 13.3**

- [x] 7. Backend - aiAssistantController and route
  - Create `backend/src/controllers/aiAssistantController.js`
  - Implement `executeCommand(req, res, next)`:
    1. Log access attempt via `auditLoggerService.logEvent({ eventType: 'access_attempt', ... })`
    2. Validate `req.body.command` is a non-empty string ≤ 500 characters; return 400 if not
    3. Call `aiCommandParserService.parseCommand(command)`
    4. If `confidence < 70`, return 200 with `{ success: false, error: 'unclear_command', message, data: { parsed } }`
    5. Call `aiCommandValidatorService.validate(parsed, req.user.id)`
    6. If validation fails, return 400 with `{ success: false, error: 'validation_failed', details }`
    7. If action is `delete_user` or `deactivate_user`, return 200 with `{ success: false, requiresConfirmation: true, data: { parsed } }` — do NOT execute yet
    8. Call `aiCommandExecutorService.execute(parsed, req.user.id)`
    9. Insert row into `ai_command_history` with all relevant fields
    10. Log `command_execution` event via `auditLoggerService`
    11. Return `{ success: true, data: { commandId, action, result, timestamp } }`
  - Implement `confirmCommand(req, res, next)` — receives `{ commandId }`, looks up the pending history row, executes the destructive action, updates `confirmation_given`, `confirmed_at`, `execution_status`, logs confirmation separately
  - Implement `getHistory(req, res, next)` — returns last 20 `ai_command_history` rows for `req.user.id`, supports `?action=` and `?date=` query params for filtering
  - Create `backend/src/routes/aiAssistantRoutes.js` — mount `POST /ai-command`, `POST /ai-command/confirm`, `GET /ai-command/history` all behind `authenticateToken` + `authorize(ROLES.ADMIN)` + `aiRateLimitMiddleware`
  - Register the new router in `backend/src/routes/index.js` (or `adminRoutes.js`) under `/admin`
  - _Requirements: 1.6, 2.6, 3.7, 4.1–4.7, 7.1–7.7, 8.1–8.7, 9.1–9.7, 11.1–11.7, 12.1–12.7, 13.1–13.6_

  - [ ]* 7.1 Write unit tests for aiAssistantController
    - Test 500-character command length boundary (499, 500, 501 chars)
    - Test low-confidence path returns `requiresConfirmation: false` and clarification message
    - Test destructive action path returns `requiresConfirmation: true` without executing
    - Test non-admin request returns 403
    - _Requirements: 1.6, 2.6, 9.1, 12.1_

- [x] 8. Environment variable setup
  - Add the following keys to `backend/.env.example`:
    ```
    AI_SERVICE_PROVIDER=gemini
    GEMINI_API_KEY=your_gemini_api_key_here
    OPENAI_API_KEY=your_openai_api_key_here
    GROQ_API_KEY=your_groq_api_key_here
    ```
  - Add the same keys to `backend/.env` with placeholder values (do not commit real keys)
  - _Requirements: 10.1, 10.2_

- [ ] 9. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend - AIAssistantCard component
  - Create `frontend/src/components/admin/AIAssistantCard.jsx`
  - Props: `onCommandExecuted` (callback), `adminId`
  - State: `command` (string), `isLoading` (bool), `result` (object|null), `history` (array), `showConfirmation` (bool), `confirmationData` (object|null), `confirmCountdown` (number), `historyFilter` (object)
  - Render a `<textarea>` (max 500 chars) with placeholder "Create a student named..." and a character counter; disable submit when `isLoading` or empty
  - Render an "Execute" `<button>` that calls `handleExecute`; show a spinner when `isLoading`
  - `handleExecute`: POST to `/api/admin/ai-command` with JWT from `authService`; on `requiresConfirmation: true` set `showConfirmation = true` and `confirmationData`; on success/error set `result` and start a 5-second auto-dismiss timer
  - Render result feedback inline below the input: green success box or red error box with timestamp; auto-dismiss after 5 seconds
  - Render a confirmation dialog (modal) when `showConfirmation` is true: show affected user name/email/role, consequences text, a 5-second countdown before "Confirm" button activates, and a "Cancel" button; on confirm POST to `/api/admin/ai-command/confirm`
  - Render a "Command History" section: fetch from `GET /api/admin/ai-command/history` on mount; display last 20 entries (command text, action badge, timestamp, status badge) in reverse chronological order; clicking an entry expands full details
  - Render a filter row above history: `<select>` for action type and a date `<input>` for date range filtering
  - Render a suggestions dropdown: hardcode 5 example commands (create student, update user, delete user, deactivate user, activate user); show when input is focused and empty; clicking a suggestion populates the input
  - Use existing Tailwind CSS classes and `motion` from `framer-motion` consistent with the rest of the dashboard
  - _Requirements: 1.1–1.7, 6.1–6.7, 7.1–7.7, 8.1–8.7, 12.1–12.7, 15.1–15.7_

  - [ ]* 10.1 Write property test for command length constraint
    - **Property 2: Command Length Constraint** — any command > 500 chars must be rejected client-side; any ≤ 500 must be accepted
    - **Validates: Requirements 1.6**

  - [ ]* 10.2 Write property test for result feedback persistence
    - **Property 25: Result Feedback Persistence** — result feedback must remain visible for at least 5 seconds before auto-dismissing
    - **Validates: Requirements 6.7**

  - [ ]* 10.3 Write property test for confirmation countdown
    - **Property 58: Confirmation Countdown Timer** — the Confirm button must be disabled for the first 5 seconds of the dialog being open
    - **Validates: Requirements 12.6**

- [x] 11. Frontend - integrate AIAssistantCard into Admin Dashboard
  - Edit `frontend/src/app/admin/dashboard/page.js`
  - Import `AIAssistantCard` from `@/components/admin/AIAssistantCard`
  - Add `<AIAssistantCard adminId={user?.id} onCommandExecuted={fetchData} />` as a new full-width card below the stats grid and above the Recent Activity / Quick Actions row, wrapped in the same `motion.div` pattern used by other cards
  - _Requirements: 1.1, 1.5_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The confirmation flow (task 7 + task 10) is split: backend returns `requiresConfirmation: true` without executing; frontend shows the dialog and calls the `/confirm` endpoint
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
