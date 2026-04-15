# Design Document: AI-Powered Admin Automation Assistant

## Overview

The AI-Powered Admin Automation Assistant enables administrators to manage users through natural language commands in the Admin Dashboard. Instead of navigating multiple forms, admins issue commands like "Create a student named Rahul Sharma with email rahul@gmail.com and room A-101" which the system parses, validates, executes, and provides feedback on.

### Key Features
- Natural language command interface in Admin Dashboard
- Multi-provider AI service integration (Gemini, OpenAI, Groq)
- Command validation and execution against backend
- Comprehensive command history and audit logging
- Admin-only access with security controls
- Rate limiting and error handling
- Confirmation dialogs for destructive operations

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js/React)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AI Assistant Card Component                             │   │
│  │  - Input field with autocomplete                         │   │
│  │  - Execute button                                        │   │
│  │  - Loading state                                         │   │
│  │  - Result feedback (success/error)                       │   │
│  │  - Command history display                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AI Assistant Endpoint (/api/admin/ai-command)           │   │
│  │  - Authentication & Authorization                        │   │
│  │  - Rate limiting                                         │   │
│  │  - Command routing                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Command Parser Service                                  │   │
│  │  - AI service integration (Gemini/OpenAI/Groq)          │   │
│  │  - Response parsing & confidence scoring                 │   │
│  │  - Fallback logic & retry mechanism                      │   │
│  │  - Response caching                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Command Validator Service                               │   │
│  │  - Field validation (email, role, room format)           │   │
│  │  - Database constraint checks                            │   │
│  │  - Business rule validation                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Command Executor Service                                │   │
│  │  - Route to appropriate user management endpoint         │   │
│  │  - Handle execution results                              │   │
│  │  - Transaction management                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Audit Logger Service                                    │   │
│  │  - Log all commands and results                          │   │
│  │  - Track access attempts                                 │   │
│  │  - Monitor rate limit violations                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                            │
│  - users table (existing)                                       │
│  - ai_command_history table (new)                               │
│  - ai_audit_logs table (new)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Command Submission**: Admin enters natural language command in UI
2. **Parsing**: Command sent to AI service for parsing into structured JSON
3. **Validation**: Parsed command validated against business rules
4. **Execution**: Validated command routed to appropriate backend endpoint
5. **Persistence**: Result stored in database and command history
6. **Feedback**: Result displayed to admin with success/error details

---

## Components and Interfaces

### Frontend Component: AIAssistantCard

**Location**: `frontend/src/components/admin/AIAssistantCard.jsx`

**Props**:
- `onCommandExecuted`: Callback when command completes
- `adminId`: Current admin user ID

**State**:
- `command`: Current input text
- `isLoading`: Processing state
- `result`: Last execution result (success/error)
- `history`: Array of recent commands
- `suggestions`: Autocomplete suggestions
- `showConfirmation`: Confirmation dialog visibility
- `confirmationData`: Details for destructive operation confirmation

**Key Methods**:
- `handleCommandChange()`: Update input, trigger autocomplete
- `handleExecute()`: Submit command to backend
- `handleConfirm()`: Confirm destructive operation
- `handleCancel()`: Cancel operation
- `handleHistoryClick()`: Display full command details
- `filterHistory()`: Search/filter history by action or date

### Backend API Endpoint

**Route**: `POST /api/admin/ai-command`

**Authentication**: JWT token required, admin role required

**Request Body**:
```json
{
  "command": "Create a student named Rahul Sharma with email rahul@gmail.com and room A-101"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "commandId": "cmd_123",
    "action": "create_user",
    "result": {
      "userId": 42,
      "name": "Rahul Sharma",
      "email": "rahul@gmail.com",
      "role": "student",
      "room_number": "A-101"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Validation Error)**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**Response (Low Confidence)**:
```json
{
  "success": false,
  "error": "Unclear command",
  "data": {
    "parsed": {
      "action": "create_user",
      "name": "Rahul Sharma",
      "email": null,
      "confidence": 65
    },
    "message": "I understood you want to create a student named Rahul Sharma, but I'm missing the email address. Please provide it."
  }
}
```

---

## Data Models

### AI Command History Table

```sql
CREATE TABLE ai_command_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  command_text TEXT NOT NULL,
  parsed_data JSON NOT NULL,
  action VARCHAR(50) NOT NULL,
  confidence_score INTEGER,
  execution_status VARCHAR(20) CHECK(execution_status IN ('success', 'failed', 'pending_confirmation')),
  execution_result JSON,
  error_message TEXT,
  requires_confirmation BOOLEAN DEFAULT 0,
  confirmation_given BOOLEAN DEFAULT 0,
  confirmed_at DATETIME,
  executed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_command_history_admin ON ai_command_history(admin_id);
CREATE INDEX idx_ai_command_history_created ON ai_command_history(created_at);
CREATE INDEX idx_ai_command_history_action ON ai_command_history(action);
```

### AI Audit Logs Table

```sql
CREATE TABLE ai_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  command_history_id INTEGER,
  event_type VARCHAR(50) NOT NULL CHECK(event_type IN ('access_attempt', 'command_execution', 'rate_limit_violation', 'auth_failure')),
  status VARCHAR(20) CHECK(status IN ('success', 'failure')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (command_history_id) REFERENCES ai_command_history(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_audit_logs_admin ON ai_audit_logs(admin_id);
CREATE INDEX idx_ai_audit_logs_created ON ai_audit_logs(created_at);
CREATE INDEX idx_ai_audit_logs_event ON ai_audit_logs(event_type);
```

---

## AI Service Integration

### Supported Providers

1. **Gemini** (Google)
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
   - Auth: API key in header
   - Response format: Structured JSON in content

2. **OpenAI**
   - Endpoint: `https://api.openai.com/v1/chat/completions`
   - Auth: Bearer token
   - Model: `gpt-3.5-turbo` or `gpt-4`
   - Response format: Message content with JSON

3. **Groq**
   - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
   - Auth: Bearer token
   - Model: `mixtral-8x7b-32768`
   - Response format: Message content with JSON

### Command Parser Service

**Location**: `backend/src/services/aiCommandParserService.js`

**Key Methods**:
- `parseCommand(command, adminId)`: Main parsing method
- `callAIService(command)`: Route to appropriate AI provider
- `parseResponse(response, provider)`: Extract JSON from provider response
- `validateConfidence(parsed)`: Check confidence score
- `getCachedResponse(commandHash)`: Check response cache
- `cacheResponse(commandHash, response)`: Store in cache

**Prompt Template**:
```
You are an admin command parser for a hostel management system. Parse the following natural language command into a structured JSON object.

Command: "{command}"

Extract the following information:
- action: one of [create_user, update_user, delete_user, deactivate_user, activate_user]
- name: full name (required for create/update)
- email: email address (required for create/update)
- role: one of [student, coordinator, warden, security, admin]
- room_number: hostel room (format: A-101, B-205, etc.)
- user_id: user ID (required for update/delete/deactivate/activate)

Return ONLY valid JSON with all fields (use null for missing values):
{
  "action": "...",
  "name": "...",
  "email": "...",
  "role": "...",
  "room_number": "...",
  "user_id": null,
  "confidence": 0-100
}
```

### Fallback Logic

```
Primary Provider (from env) → Secondary Provider → Tertiary Provider → Error
```

If primary fails:
1. Retry with exponential backoff (1s, 2s, 4s)
2. Switch to secondary provider
3. If all fail, return error to user

### Response Caching

- Cache key: SHA256 hash of command text
- TTL: 1 hour
- Storage: In-memory with optional Redis support
- Invalidation: Manual clear on service restart

---

## Command Validator Service

**Location**: `backend/src/services/aiCommandValidatorService.js`

**Validation Rules**:

1. **Required Fields by Action**:
   - `create_user`: name, email, role (room_number optional)
   - `update_user`: user_id, at least one of (name, email, role, room_number)
   - `delete_user`: user_id
   - `deactivate_user`: user_id
   - `activate_user`: user_id

2. **Email Validation**: RFC 5322 compliant regex
   ```regex
   ^[^\s@]+@[^\s@]+\.[^\s@]+$
   ```

3. **Role Validation**: Must be one of [student, coordinator, warden, security, admin]

4. **Room Number Validation**: Format `[A-Z]-\d{3}` (e.g., A-101, B-205)

5. **Database Constraints**:
   - For `create_user`: Email must not exist
   - For `update_user`/`delete_user`/`deactivate_user`/`activate_user`: User ID must exist
   - Cannot delete/deactivate own account

**Validation Result**:
```json
{
  "valid": true/false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Command Executor Service

**Location**: `backend/src/services/aiCommandExecutorService.js`

**Execution Flow**:

1. **Route Command**: Map action to backend endpoint
2. **Call Endpoint**: Use existing user management endpoints
3. **Handle Response**: Extract result data
4. **Transaction Management**: Rollback on failure
5. **Return Result**: Success/failure with details

**Action Routing**:
- `create_user` → `POST /api/admin/users`
- `update_user` → `PUT /api/admin/users/:id`
- `delete_user` → `DELETE /api/admin/users/:id`
- `deactivate_user` → `PUT /api/admin/users/:id/deactivate`
- `activate_user` → `PUT /api/admin/users/:id/activate`

---

## Error Handling Strategy

### Error Categories

1. **Parsing Errors** (Low Confidence < 70)
   - User-friendly message explaining what was understood
   - Prompt for missing/unclear fields
   - Suggest example commands

2. **Validation Errors**
   - Highlight problematic field
   - Explain validation rule
   - Suggest correction

3. **Execution Errors**
   - User-friendly error message
   - Avoid technical details
   - Suggest retry or alternative action

4. **Service Unavailability**
   - Inform user AI service is temporarily unavailable
   - Suggest retry in a few moments
   - Provide manual alternative

5. **Rate Limit Exceeded**
   - Inform user of limit (60 commands/hour)
   - Show when they can retry
   - Suggest checking command history

### Error Response Format

```json
{
  "success": false,
  "error": "error_type",
  "message": "User-friendly error message",
  "details": {
    "field": "field_name",
    "suggestion": "Suggested correction"
  }
}
```

---

## Security Implementation

### Authentication & Authorization

1. **Endpoint Protection**:
   - All AI Assistant endpoints require JWT token
   - Token verified via `authenticateToken` middleware
   - User must have `admin` role via `authorize('admin')` middleware

2. **Session Management**:
   - Expired tokens rejected
   - User must re-authenticate
   - Session timeout: 24 hours (configurable)

3. **Self-Protection**:
   - Admins cannot delete/deactivate their own account
   - Check: `if (userId === req.user.id) reject`

### Rate Limiting

**Location**: `backend/src/middleware/aiRateLimitMiddleware.js`

- **Limit**: 60 commands per hour per admin
- **Tracking**: Redis or in-memory store with admin ID as key
- **Reset**: Hourly window
- **Exemption**: Super-admin role (configurable)
- **Response**: 429 Too Many Requests with retry-after header

### Audit Logging

**Logged Events**:
- Access attempts (success/failure)
- Command execution (with parsed data)
- Rate limit violations
- Authentication failures

**Log Fields**:
- admin_id, timestamp, ip_address, user_agent
- event_type, status, details (JSON)
- Excludes: passwords, sensitive tokens

**Retention**: 90 days (configurable)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Loading State During Processing

*For any* command submission, while the command is being processed by the AI service, the UI SHALL display a loading indicator and disable the execute button.

**Validates: Requirements 1.4**

### Property 2: Command Length Constraint

*For any* command input, commands exceeding 500 characters SHALL be rejected, and commands of 500 characters or fewer SHALL be accepted.

**Validates: Requirements 1.6**

### Property 3: AI Service Integration

*For any* command, the system SHALL attempt to send it to the configured AI service provider (Gemini, OpenAI, or Groq) and parse the response into the expected JSON structure.

**Validates: Requirements 2.1, 2.4**

### Property 4: Parsed Command Structure

*For any* parsed command, the returned JSON object SHALL contain all required fields (action, name, email, role, room_number, user_id, confidence) with appropriate values or null.

**Validates: Requirements 2.2, 2.4, 2.5, 14.1, 14.2**

### Property 5: Valid Action Types

*For any* parsed command, the action field SHALL be one of: create_user, update_user, delete_user, deactivate_user, activate_user.

**Validates: Requirements 2.3**

### Property 6: Confidence Score Range

*For any* parsed command, the confidence score SHALL be an integer between 0 and 100 inclusive.

**Validates: Requirements 2.5**

### Property 7: Low Confidence Flagging

*For any* command with confidence score below 70, the system SHALL flag it for manual review and display a clarification message to the admin.

**Validates: Requirements 2.6, 7.1**

### Property 8: Command Variation Handling

*For any* set of semantically equivalent commands (e.g., "Create a student" vs "Add a new student"), the parser SHALL produce equivalent parsed structures with similar confidence scores.

**Validates: Requirements 2.7**

### Property 9: Required Field Validation

*For any* parsed command, if required fields for the action type are missing, the validator SHALL reject the command and return an error listing the missing fields.

**Validates: Requirements 3.1**

### Property 10: Email Format Validation

*For any* email field in a parsed command, if the email does not match RFC 5322 format, the validator SHALL reject it with an error message.

**Validates: Requirements 3.2**

### Property 11: Valid Role Constraint

*For any* role field in a parsed command, if the role is not one of [student, coordinator, warden, security, admin], the validator SHALL reject it.

**Validates: Requirements 3.3**

### Property 12: Room Number Format Validation

*For any* room_number field in a parsed command, if it does not match the hostel naming convention (e.g., A-101, B-205), the validator SHALL reject it.

**Validates: Requirements 3.4**

### Property 13: Duplicate Email Detection

*For any* create_user command where the email already exists in the database, the validator SHALL reject the command with a duplicate email error.

**Validates: Requirements 3.5**

### Property 14: User Existence Validation

*For any* update_user, delete_user, deactivate_user, or activate_user command where the user_id does not exist in the database, the validator SHALL reject the command.

**Validates: Requirements 3.6**

### Property 15: Validation Result Format

*For any* validation operation, the result SHALL include a success status and, if validation fails, an array of error objects with field and message properties.

**Validates: Requirements 3.7**

### Property 16: Backend Execution on Valid Command

*For any* command that passes validation, the system SHALL route it to the appropriate backend endpoint and execute the corresponding operation.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 17: Execution Result Format

*For any* executed command, the system SHALL return a result object with status (success/failure) and relevant data (user details for create/update, confirmation for delete/deactivate).

**Validates: Requirements 4.7**

### Property 18: Database Persistence

*For any* successful backend operation, the corresponding data SHALL be persisted in the database and retrievable in subsequent queries.

**Validates: Requirements 5.1**

### Property 19: Timestamp Recording

*For any* new user created via AI command, the created_at timestamp SHALL be recorded; for any user updated, the updated_at timestamp SHALL be recorded.

**Validates: Requirements 5.2, 5.3**

### Property 20: Transaction Rollback

*For any* failed database operation, any partial changes SHALL be rolled back, leaving the database in its pre-operation state.

**Validates: Requirements 5.5**

### Property 21: Operation Logging

*For any* executed command, a log entry SHALL be created in the database containing the command text, parsed data, execution result, and timestamp.

**Validates: Requirements 5.6, 11.1**

### Property 22: Success Message Display

*For any* successful command execution, the UI SHALL display a success message containing the user name, email, role, and room number (if applicable).

**Validates: Requirements 6.1, 6.2**

### Property 23: Error Message Display

*For any* failed command execution, the UI SHALL display an error message explaining the reason for failure in user-friendly language.

**Validates: Requirements 6.3**

### Property 24: Result Feedback Timestamp

*For any* command result displayed to the admin, the feedback SHALL include the timestamp of when the operation was executed.

**Validates: Requirements 6.6**

### Property 25: Result Feedback Persistence

*For any* result feedback displayed to the admin, it SHALL remain visible for at least 5 seconds before auto-dismissing.

**Validates: Requirements 6.7**

### Property 26: Clarification Message for Low Confidence

*For any* command with low confidence, the system SHALL display a clarification message explaining what was understood and requesting confirmation or correction.

**Validates: Requirements 7.1, 7.2**

### Property 27: Missing Field Prompting

*For any* command with missing required fields, the system SHALL prompt the admin to provide the missing information with field names and examples.

**Validates: Requirements 7.3**

### Property 28: Invalid Data Highlighting

*For any* command with invalid data (e.g., invalid email), the system SHALL identify the problematic field and suggest a correction.

**Validates: Requirements 7.4**

### Property 29: Service Unavailability Handling

*For any* command when the AI service is unavailable, the system SHALL display a user-friendly error message and suggest retry options.

**Validates: Requirements 7.6**

### Property 30: Error Message Sanitization

*For any* error message displayed to the admin, it SHALL NOT contain technical details, API error codes, or stack traces.

**Validates: Requirements 7.7**

### Property 31: Command History Display

*For any* admin viewing the AI Assistant, the command history section SHALL display the last 20 executed commands in reverse chronological order.

**Validates: Requirements 8.2**

### Property 32: History Entry Completeness

*For any* command history entry, it SHALL display the command text, action type, timestamp, and execution status (success/failure).

**Validates: Requirements 8.3**

### Property 33: History Search/Filter

*For any* search query on command history, the system SHALL return only commands matching the action type or date range criteria.

**Validates: Requirements 8.5**

### Property 34: History Persistence

*For any* executed command, a history entry SHALL be persisted in the database and remain accessible for audit purposes.

**Validates: Requirements 8.6**

### Property 35: History Access Control

*For any* non-admin user attempting to access command history, the system SHALL deny access and return a 403 Forbidden error.

**Validates: Requirements 8.7**

### Property 36: Non-Admin Access Denial

*For any* non-admin user attempting to access the AI Assistant endpoint, the system SHALL deny access and return a 403 Forbidden error.

**Validates: Requirements 9.1, 9.2**

### Property 37: Access Attempt Logging

*For any* access attempt to the AI Assistant (successful or failed), the system SHALL log the attempt with admin ID, timestamp, and IP address.

**Validates: Requirements 9.3**

### Property 38: Session Expiration Handling

*For any* command submitted with an expired authentication token, the system SHALL reject the command and require re-authentication.

**Validates: Requirements 9.4**

### Property 39: Permission Validation Before Execution

*For any* command execution, the system SHALL verify the admin user's permissions before proceeding with the operation.

**Validates: Requirements 9.5**

### Property 40: Self-Deletion Prevention

*For any* delete_user or deactivate_user command targeting the admin's own account, the system SHALL reject the command with an error message.

**Validates: Requirements 9.6**

### Property 41: Secure Token Usage

*For any* API call from the AI Assistant, the request SHALL include a valid JWT authentication token in the Authorization header.

**Validates: Requirements 9.7**

### Property 42: Multi-Provider Support

*For any* configured AI service provider (Gemini, OpenAI, or Groq), the system SHALL successfully parse commands using that provider's API.

**Validates: Requirements 10.1**

### Property 43: Provider Configuration

*For any* change to the AI_SERVICE_PROVIDER environment variable, the system SHALL use the newly configured provider for subsequent commands.

**Validates: Requirements 10.2**

### Property 44: Provider Response Handling

*For any* AI service provider, the system SHALL correctly parse the response format and extract the JSON command structure.

**Validates: Requirements 10.3**

### Property 45: Fallback Logic

*For any* command when the primary AI service fails, the system SHALL attempt the secondary provider, and if that fails, the tertiary provider.

**Validates: Requirements 10.4**

### Property 46: Retry with Exponential Backoff

*For any* transient failure from an AI service, the system SHALL retry with exponential backoff (1s, 2s, 4s) before switching providers.

**Validates: Requirements 10.5**

### Property 47: Response Caching

*For any* identical command submitted multiple times, the system SHALL return the cached response for subsequent submissions within the TTL window.

**Validates: Requirements 10.6**

### Property 48: Performance Monitoring

*For any* AI service call, the system SHALL log the response time and include it in performance metrics.

**Validates: Requirements 10.7**

### Property 49: Comprehensive Command Logging

*For any* executed command, the log entry SHALL include command text, parsed data, execution result, admin user ID, timestamp, and IP address.

**Validates: Requirements 11.1, 11.2**

### Property 50: Success/Failure Recording

*For any* command execution, the log entry SHALL record whether the command succeeded or failed.

**Validates: Requirements 11.3**

### Property 51: Error Details Logging

*For any* failed command, the log entry SHALL include the error message and reason for failure.

**Validates: Requirements 11.4**

### Property 52: Log Accessibility

*For any* admin user, executed command logs SHALL be stored in the database and accessible through an admin audit interface.

**Validates: Requirements 11.5**

### Property 53: Sensitive Data Exclusion

*For any* log entry, it SHALL NOT contain sensitive data such as passwords or authentication tokens.

**Validates: Requirements 11.7**

### Property 54: Destructive Operation Confirmation

*For any* delete_user or deactivate_user command, the system SHALL display a confirmation dialog before execution.

**Validates: Requirements 12.1**

### Property 55: Confirmation Dialog Content

*For any* confirmation dialog, it SHALL display the affected user's name, email, and role.

**Validates: Requirements 12.2**

### Property 56: Confirmation Requirement

*For any* destructive operation, the operation SHALL NOT proceed unless the admin explicitly clicks "Confirm".

**Validates: Requirements 12.4**

### Property 57: Cancellation Prevents Changes

*For any* destructive operation where the admin clicks "Cancel", no changes SHALL be made to the database.

**Validates: Requirements 12.5**

### Property 58: Confirmation Countdown Timer

*For any* confirmation dialog, the "Confirm" button SHALL be disabled for 5 seconds before becoming active.

**Validates: Requirements 12.6**

### Property 59: Confirmation Logging

*For any* destructive operation, the confirmation action SHALL be logged separately from the command execution.

**Validates: Requirements 12.7**

### Property 60: Rate Limit Enforcement

*For any* admin user, the system SHALL limit command submissions to 60 per hour.

**Validates: Requirements 13.1**

### Property 61: Rate Limit Response

*For any* command submitted when the admin has exceeded the rate limit, the system SHALL return a 429 error with a message indicating when they can retry.

**Validates: Requirements 13.2**

### Property 62: Per-User Rate Limiting

*For any* two different admin users, their rate limit counters SHALL be tracked independently.

**Validates: Requirements 13.3**

### Property 63: Rate Limit Reset

*For any* admin user, the rate limit counter SHALL reset every hour.

**Validates: Requirements 13.4**

### Property 64: Rate Limit Violation Logging

*For any* rate limit violation, the system SHALL log the violation for security monitoring.

**Validates: Requirements 13.5**

### Property 65: Elevated Admin Exemption

*For any* admin user with elevated privileges (super-admin), the rate limit SHALL NOT apply.

**Validates: Requirements 13.6**

### Property 66: JSON Structure Validation

*For any* parsed command, the returned JSON SHALL include all specified fields (action, name, email, role, room_number, user_id, confidence, parsed_command).

**Validates: Requirements 14.1, 14.2**

### Property 67: JSON Validity

*For any* command parser response, the returned data SHALL be valid JSON that can be parsed without errors.

**Validates: Requirements 14.3**

### Property 68: Invalid JSON Error Response

*For any* invalid JSON structure from the parser, the system SHALL return an error response indicating the parsing failure.

**Validates: Requirements 14.4**

### Property 69: Autocomplete Suggestions

*For any* partial command text entered by the admin, the system SHALL display relevant autocomplete suggestions.

**Validates: Requirements 15.1, 15.3**

### Property 70: Suggestion Selection

*For any* autocomplete suggestion selected by the admin, the input field SHALL be populated with the full command text.

**Validates: Requirements 15.4**

### Property 71: Custom Command Support

*For any* custom command entered by the admin, the system SHALL NOT block or interfere with the input, allowing full command submission.

**Validates: Requirements 15.7**

---

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions:

1. **Component Tests** (React Testing Library):
   - AIAssistantCard renders correctly
   - Input field accepts text up to 500 characters
   - Execute button triggers command submission
   - Loading state displays during processing
   - Success/error messages display correctly
   - History entries display with all required fields
   - Confirmation dialog shows for destructive operations
   - Autocomplete suggestions appear and work

2. **Service Tests** (Jest):
   - Command parser extracts all required fields
   - Validator rejects invalid emails, roles, room numbers
   - Validator detects duplicate emails
   - Validator detects non-existent user IDs
   - Executor routes commands to correct endpoints
   - Audit logger records all required fields
   - Rate limiter correctly tracks and enforces limits
   - Error messages are user-friendly (no technical details)

3. **Integration Tests**:
   - Full command flow: parse → validate → execute → log
   - Database persistence of command history
   - Database persistence of audit logs
   - Authentication and authorization checks
   - Session expiration handling

4. **Edge Cases**:
   - Empty command string
   - Command with special characters
   - Very long command (>500 chars)
   - Concurrent command submissions
   - AI service timeout/failure
   - Database connection failure
   - Invalid JWT token
   - Expired JWT token

### Property-Based Testing Approach

Property-based tests verify universal properties across many generated inputs:

**Configuration**:
- Minimum 100 iterations per property test
- Use fast-check library for JavaScript
- Tag format: `Feature: ai-admin-assistant, Property {number}: {property_text}`

**Property Test Examples**:

1. **Property 4: Parsed Command Structure**
   - Generate random commands
   - Parse each command
   - Verify all required fields exist in output
   - Verify fields have correct types

2. **Property 10: Email Format Validation**
   - Generate random valid and invalid emails
   - Validate each email
   - Verify valid emails pass, invalid emails fail

3. **Property 13: Duplicate Email Detection**
   - Create a user with email X
   - Generate create_user command with email X
   - Verify validator rejects it

4. **Property 18: Database Persistence**
   - Generate random user data
   - Execute create_user command
   - Query database for the user
   - Verify all fields match

5. **Property 60: Rate Limit Enforcement**
   - Submit 60 commands from same admin
   - Verify all succeed
   - Submit 61st command
   - Verify it fails with 429 error

6. **Property 71: Custom Command Support**
   - Generate random custom command text
   - Submit to system
   - Verify system attempts to parse it (doesn't reject)

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: All testable acceptance criteria
- **Integration Tests**: Critical user workflows
- **E2E Tests**: Full command submission flow in browser

---

## Error Handling

### Error Scenarios

| Scenario | Response | User Message |
|----------|----------|--------------|
| Low confidence parse | 400 Bad Request | "I'm not sure I understood correctly. You want to [parsed action]. Please confirm or rephrase." |
| Missing required field | 400 Bad Request | "I need the [field name] to complete this action. For example: [example]" |
| Invalid email | 400 Bad Request | "The email '[email]' doesn't look right. Please check the format." |
| Duplicate email | 400 Bad Request | "A user with email '[email]' already exists. Try a different email." |
| User not found | 400 Bad Request | "I couldn't find a user with ID [id]. Please check the ID." |
| AI service unavailable | 503 Service Unavailable | "The AI service is temporarily unavailable. Please try again in a moment." |
| Rate limit exceeded | 429 Too Many Requests | "You've reached the command limit (60/hour). You can try again at [time]." |
| Unauthorized access | 403 Forbidden | "You don't have permission to use the AI Assistant." |
| Invalid token | 401 Unauthorized | "Your session has expired. Please log in again." |
| Database error | 500 Internal Server Error | "Something went wrong. Please try again later." |

---

## Configuration

### Environment Variables

```bash
# AI Service Configuration
AI_SERVICE_PROVIDER=gemini  # Options: gemini, openai, groq
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
GROQ_API_KEY=your_key

# Rate Limiting
AI_RATE_LIMIT_COMMANDS=60
AI_RATE_LIMIT_WINDOW_HOURS=1
AI_RATE_LIMIT_EXEMPT_ROLE=super_admin

# Caching
AI_RESPONSE_CACHE_TTL_MINUTES=60
AI_RESPONSE_CACHE_ENABLED=true

# Logging
AI_AUDIT_LOG_RETENTION_DAYS=90
AI_LOG_LEVEL=info

# Timeouts
AI_SERVICE_TIMEOUT_MS=30000
AI_RETRY_MAX_ATTEMPTS=3
```

---

## Deployment Considerations

1. **Database Migrations**: Run migrations to create new tables
2. **Environment Setup**: Configure AI service API keys
3. **Rate Limiting**: Set up Redis if using distributed rate limiting
4. **Monitoring**: Set up alerts for AI service failures
5. **Logging**: Configure log aggregation for audit logs
6. **Backup**: Ensure command history and audit logs are backed up

