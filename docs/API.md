# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "student",
  "phone": "+1234567890",
  "student_id": "STU2024001",
  "hostel_block": "Block A",
  "room_number": "A-101"
}
```

#### POST /auth/login
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "student",
      "full_name": "John Doe"
    }
  }
}
```

### Gatepass Management

#### POST /gatepass/create
Create new gatepass (Student only)

**Request:**
```json
{
  "destination": "Home - Mumbai",
  "reason": "Family emergency",
  "leave_time": "2026-03-15T10:00:00Z",
  "expected_return_time": "2026-03-17T18:00:00Z",
  "contact_number": "+1234567890"
}
```

#### GET /gatepass/history
Get gatepass history (Student)

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 20)

#### GET /gatepass/pending
Get pending requests (Coordinator/Warden)

#### POST /gatepass/approve
Approve gatepass (Coordinator/Warden)

**Request:**
```json
{
  "gatepass_id": 1,
  "comments": "Approved"
}
```

#### POST /gatepass/reject
Reject gatepass (Coordinator/Warden)

**Request:**
```json
{
  "gatepass_id": 1,
  "comments": "Insufficient reason"
}
```

### QR System

#### GET /qr/generate/:gatepass_id
Generate QR code for approved gatepass

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,...",
    "qr_data": "encrypted_string",
    "expires_at": "2026-03-17T18:00:00Z"
  }
}
```

#### POST /qr/verify
Verify QR code (Security only)

**Request:**
```json
{
  "qr_data": "encrypted_string",
  "log_type": "exit"
}
```

### Admin

#### GET /admin/users
Get all users (Admin/Warden)

**Query Parameters:**
- page: Page number
- limit: Items per page
- role: Filter by role

#### POST /admin/users
Create new user (Admin only)

#### GET /admin/analytics
Get system analytics (Admin/Warden)

**Query Parameters:**
- start_date: Start date (ISO format)
- end_date: End date (ISO format)

## Error Responses

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
