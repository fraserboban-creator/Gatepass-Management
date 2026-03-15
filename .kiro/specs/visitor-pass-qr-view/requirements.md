# Requirements Document

## Introduction

This document specifies requirements for adding QR code functionality to the visitor pass management system. The feature will add a "View" action button to the visitor logs table that displays detailed visitor pass information with a QR code and sends notifications to security personnel. This enables security to verify visitor identity and pass details by scanning the QR code.

## Glossary

- **Visitor_Pass_System**: The existing system that manages visitor passes for hostel visitors
- **QR_Service**: The existing backend service that generates and verifies QR codes
- **View_Button**: A new action button in the visitor logs table that opens detailed pass information
- **Pass_Detail_Modal**: A modal dialog that displays complete visitor pass information with QR code
- **Security_Personnel**: Users with the "security" role who monitor and verify visitor access
- **Visitor_Pass**: A record containing visitor information, student information, and visit details
- **QR_Code**: A scannable two-dimensional barcode containing encrypted visitor pass data
- **Notification_Service**: The existing service that sends notifications to users

## Requirements

### Requirement 1: View Button in Visitor Logs Table

**User Story:** As an admin or security personnel, I want to see a "View" button for each visitor pass in the logs table, so that I can access detailed information about any visitor pass.

#### Acceptance Criteria

1. THE Visitor_Pass_System SHALL display a "View" action button in each row of the visitor logs table
2. THE View_Button SHALL be visible for all visitor pass statuses (pending, approved, rejected, active, exited, overdue)
3. WHEN the View_Button is clicked, THE Visitor_Pass_System SHALL open the Pass_Detail_Modal
4. THE View_Button SHALL be accessible to users with admin, security, and coordinator roles

### Requirement 2: Display Visitor Pass Details

**User Story:** As an admin or security personnel, I want to view complete visitor pass information in a modal, so that I can review all details about a specific visitor.

#### Acceptance Criteria

1. WHEN the Pass_Detail_Modal opens, THE Visitor_Pass_System SHALL display the visitor name, phone number, ID type, and ID number
2. THE Pass_Detail_Modal SHALL display the student name, room number, and relationship to visitor
3. THE Pass_Detail_Modal SHALL display the visit purpose, expected exit time, entry time, and actual exit time
4. THE Pass_Detail_Modal SHALL display the current pass status and pass ID
5. WHERE a visitor photo exists, THE Pass_Detail_Modal SHALL display the visitor photo
6. THE Pass_Detail_Modal SHALL provide a close button to dismiss the modal

### Requirement 3: Generate QR Code for Visitor Pass

**User Story:** As an admin or security personnel, I want to see a QR code for each visitor pass, so that security can quickly verify visitor identity.

#### Acceptance Criteria

1. WHEN the Pass_Detail_Modal opens, THE QR_Service SHALL generate a QR code for the visitor pass
2. THE QR_Code SHALL contain encrypted visitor pass data including pass ID, visitor name, student ID, and timestamp
3. THE QR_Service SHALL store the QR code data with a hash for verification in the database
4. THE Pass_Detail_Modal SHALL display the generated QR code image
5. THE QR_Code SHALL have an expiry time matching the visitor pass expected exit time
6. WHERE a QR code already exists for the pass, THE QR_Service SHALL return the existing QR code if still valid
7. WHERE an existing QR code has expired, THE QR_Service SHALL generate a new QR code

### Requirement 4: Send Notification to Security

**User Story:** As security personnel, I want to receive a notification when someone views a visitor pass with QR code, so that I am aware of visitor verification activities.

#### Acceptance Criteria

1. WHEN the Pass_Detail_Modal opens and QR code is generated, THE Notification_Service SHALL send a notification to all Security_Personnel
2. THE notification SHALL include the visitor name, student name, room number, and pass ID
3. THE notification SHALL have type "info" and title "Visitor Pass Viewed"
4. THE Notification_Service SHALL create a notification record for each security user in the database

### Requirement 5: Verify QR Code

**User Story:** As security personnel, I want to scan and verify visitor pass QR codes, so that I can confirm visitor identity and pass validity.

#### Acceptance Criteria

1. WHEN a QR_Code is scanned, THE QR_Service SHALL decrypt the QR code data
2. THE QR_Service SHALL verify the QR code hash matches the stored hash in the database
3. IF the QR_Code has expired, THEN THE QR_Service SHALL return an error message "QR code has expired"
4. IF the QR_Code hash is invalid, THEN THE QR_Service SHALL return an error message "Invalid QR code"
5. WHEN verification succeeds, THE QR_Service SHALL return the complete visitor pass details
6. THE QR_Service SHALL verify the visitor pass status is approved, active, or exited before allowing verification
7. IF the visitor pass status is pending or rejected, THEN THE QR_Service SHALL return an error message "Visitor pass is not approved"

### Requirement 6: API Endpoints for QR Code Operations

**User Story:** As a frontend developer, I want API endpoints for QR code generation and verification, so that I can integrate QR functionality into the user interface.

#### Acceptance Criteria

1. THE Visitor_Pass_System SHALL provide a POST endpoint at /api/visitor-pass/:id/qr for generating QR codes
2. THE Visitor_Pass_System SHALL provide a POST endpoint at /api/visitor-pass/qr/verify for verifying QR codes
3. WHEN the generate endpoint is called, THE Visitor_Pass_System SHALL return the QR code image, encrypted data, and expiry time
4. WHEN the verify endpoint is called with valid QR data, THE Visitor_Pass_System SHALL return the visitor pass details
5. THE generate endpoint SHALL require authentication and authorization for admin, security, or coordinator roles
6. THE verify endpoint SHALL require authentication and authorization for security role
7. IF the visitor pass does not exist, THEN THE Visitor_Pass_System SHALL return a 404 error with message "Visitor pass not found"

### Requirement 7: Download QR Code

**User Story:** As an admin or security personnel, I want to download the QR code as an image, so that I can print or share it for verification purposes.

#### Acceptance Criteria

1. THE Pass_Detail_Modal SHALL provide a "Download QR Code" button
2. WHEN the download button is clicked, THE Visitor_Pass_System SHALL download the QR code as a PNG image file
3. THE downloaded file SHALL be named with the format "visitor-pass-qr-{pass_id}.png"
4. THE QR_Code image SHALL have sufficient resolution for printing and scanning (minimum 300x300 pixels)

