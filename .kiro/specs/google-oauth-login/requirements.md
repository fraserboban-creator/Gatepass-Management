# Requirements Document

## Introduction

This feature adds "Sign in with Google" as an additional authentication option on the login page of the Hostel Gatepass Management System. The existing email/password login remains unchanged. A Google OAuth 2.0 flow is introduced so users can authenticate via their Google account. On first sign-in, a new user record is created automatically; on subsequent sign-ins, the existing account is retrieved. After successful authentication, users are redirected to their role-specific dashboard (`/{role}/dashboard`), consistent with the current login behaviour. The feature covers the frontend button/divider UI, the backend OAuth callback endpoint, token issuance, and account linking/creation logic.

## Glossary

- **Login_Page**: The Next.js page at `frontend/src/app/login/page.js` that renders the authentication UI.
- **Google_Button**: The "Sign in with Google" button rendered on the Login_Page.
- **OAuth_Service**: The backend service responsible for verifying Google ID tokens and resolving or creating user accounts.
- **Auth_Controller**: The Express controller at `backend/src/controllers/authController.js` that handles HTTP auth requests.
- **Auth_Routes**: The Express router at `backend/src/routes/authRoutes.js`.
- **User_Model**: The database model at `backend/src/models/userModel.js` that persists user records.
- **JWT**: The JSON Web Token issued by the backend after successful authentication.
- **Google_ID_Token**: The credential token returned by the Google Identity Services library after the user consents.
- **google_id**: A unique, stable identifier for a Google account, stored on the user record to enable account lookup.
- **Auth_Service**: The backend service at `backend/src/services/authService.js` that handles login and registration logic.

---

## Requirements

### Requirement 1: Google Sign-In Button on Login Page

**User Story:** As a user, I want to see a "Sign in with Google" button on the login page, so that I can choose Google as my authentication method without replacing the existing email/password option.

#### Acceptance Criteria

1. THE Login_Page SHALL render a Google_Button labelled "Sign in with Google" above the email/password form.
2. THE Login_Page SHALL render a visual "or" divider between the Google_Button and the email/password form.
3. WHILE the Google OAuth flow is in progress, THE Login_Page SHALL display a loading indicator on the Google_Button and disable it to prevent duplicate submissions.
4. IF the Google OAuth flow is cancelled by the user, THEN THE Login_Page SHALL return to its default state without displaying an error message.

---

### Requirement 2: Google OAuth Flow Initiation

**User Story:** As a user, I want clicking "Sign in with Google" to open the Google account selector, so that I can pick my Google account to authenticate with.

#### Acceptance Criteria

1. WHEN the user clicks the Google_Button, THE Login_Page SHALL initiate the Google OAuth 2.0 flow using the Google Identity Services JavaScript library.
2. THE Login_Page SHALL pass the configured Google Client ID to the Google Identity Services library at initialisation time.
3. IF the Google Identity Services library fails to load, THEN THE Login_Page SHALL display an error message stating that Google Sign-In is currently unavailable.

---

### Requirement 3: Backend Google Token Verification Endpoint

**User Story:** As a developer, I want a dedicated backend endpoint to verify Google ID tokens, so that the server can securely validate the user's identity before issuing a JWT.

#### Acceptance Criteria

1. THE Auth_Routes SHALL expose a `POST /auth/google` endpoint that accepts a `{ credential }` body containing a Google_ID_Token.
2. WHEN a request is received at `POST /auth/google`, THE Auth_Controller SHALL pass the credential to the OAuth_Service for verification.
3. THE OAuth_Service SHALL verify the Google_ID_Token against Google's public keys using the `google-auth-library` package.
4. IF the Google_ID_Token is invalid or expired, THEN THE Auth_Controller SHALL respond with HTTP 401 and a descriptive error message.
5. THE `POST /auth/google` endpoint SHALL be protected by the existing auth rate limiter middleware.

---

### Requirement 4: Account Resolution and Auto-Creation

**User Story:** As a new user signing in with Google for the first time, I want an account to be created automatically, so that I don't need to register separately before using Google Sign-In.

#### Acceptance Criteria

1. WHEN a valid Google_ID_Token is verified, THE OAuth_Service SHALL look up an existing user by the `google_id` field first, then fall back to matching by email address.
2. WHEN no matching user is found, THE OAuth_Service SHALL create a new user record with `role` set to `student`, `full_name` from the Google profile, `email` from the Google profile, `google_id` set to the Google account's unique identifier, and `password_hash` set to `NULL`.
3. WHEN a user is found by email but has no `google_id` stored, THE OAuth_Service SHALL update that user record to store the `google_id`, linking the Google account to the existing email/password account.
4. IF the matched user's `is_active` flag is `0`, THEN THE OAuth_Service SHALL throw an error and THE Auth_Controller SHALL respond with HTTP 403 and the message "Account is deactivated".
5. THE User_Model SHALL support a `google_id` column (TEXT, nullable, unique) on the `users` table.

---

### Requirement 5: JWT Issuance After Google Sign-In

**User Story:** As a user who signed in with Google, I want to receive a JWT just like email/password login, so that the rest of the application works identically regardless of how I authenticated.

#### Acceptance Criteria

1. WHEN account resolution succeeds, THE OAuth_Service SHALL generate a JWT with the same payload structure (`userId`, `email`, `role`) and expiry as the existing email/password login flow.
2. THE Auth_Controller SHALL respond with HTTP 200 and a JSON body of `{ success: true, data: { token, user } }`, matching the existing login response shape.

---

### Requirement 6: Frontend Post-Authentication Redirect

**User Story:** As a user who signed in with Google, I want to be redirected to my role-specific dashboard after authentication, so that my experience is consistent with email/password login.

#### Acceptance Criteria

1. WHEN the frontend receives a successful response from `POST /auth/google`, THE Login_Page SHALL store the JWT using the existing `authService` mechanism.
2. WHEN the JWT is stored, THE Login_Page SHALL redirect the user to `/{role}/dashboard` where `role` is taken from the response payload.
3. IF the `POST /auth/google` request fails, THEN THE Login_Page SHALL display the error message returned by the backend in the existing error display area.

---

### Requirement 7: Environment Configuration

**User Story:** As a developer deploying this feature, I want all Google OAuth credentials to be supplied via environment variables, so that secrets are not hard-coded in the codebase.

#### Acceptance Criteria

1. THE backend SHALL read the Google OAuth client secret from the `GOOGLE_CLIENT_SECRET` environment variable.
2. THE frontend SHALL read the Google OAuth client ID from the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable.
3. THE backend SHALL read the Google OAuth client ID from the `GOOGLE_CLIENT_ID` environment variable.
4. IF any required Google OAuth environment variable is absent at startup, THEN THE backend SHALL log a warning message identifying the missing variable.
