# Implementation Plan: Visitor Pass QR View Feature

## Overview

This implementation adds QR code functionality to the visitor pass management system. The feature enables security personnel to verify visitor identity through QR code scanning and provides a "View" button in visitor logs to display detailed pass information with generated QR codes.

The implementation extends the existing visitor pass system with:
- Database schema for visitor QR codes
- Backend QR generation and verification service
- Frontend modal for viewing pass details with QR code
- Security scanner page for QR verification
- Entry/Exit control flow
- Notification integration

## Tasks

- [x] 1. Set up database schema for visitor QR codes
  - Create migration file for visitor_qr_codes table
  - Add indexes for visitor_pass_id and qr_hash columns
  - Run migration to update database schema
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 2. Implement backend visitor QR service
  - [x] 2.1 Create VisitorQRModel with database operations
    - Implement create, findByPassId, findByHash, and isValid methods
    - Add proper error handling for database operations
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [x] 2.2 Create VisitorQRService for QR generation and verification
    - Implement generate method to create QR codes for visitor passes
    - Implement verify method to decrypt and validate QR codes
    - Use existing encryption utilities for payload encryption
    - Generate QR code images using qrcode library
    - Handle QR expiry based on expected_exit_time
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 2.3 Write unit tests for VisitorQRService
    - Test QR generation for valid visitor passes
    - Test QR verification with valid and invalid data
    - Test expiry validation
    - Test error handling for missing passes
    - _Requirements: 3.1, 5.1, 5.2_

- [ ] 3. Add API endpoints for visitor pass QR operations
  - [x] 3.1 Add generateQR endpoint to visitorPassController
    - Create POST /api/visitor-pass/:id/qr endpoint
    - Validate pass exists and user has permission
    - Call VisitorQRService.generate to create QR code
    - Send notification to security personnel
    - Return QR code image, encrypted data, and expiry time
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 6.1, 6.3, 6.5, 6.7_
  
  - [x] 3.2 Add verifyQR endpoint to visitorPassController
    - Create POST /api/visitor-pass/qr/verify endpoint
    - Validate user has security role
    - Call VisitorQRService.verify to validate QR code
    - Return visitor pass details on success
    - Handle errors for invalid/expired QR codes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.2, 6.4, 6.6, 6.7_
  
  - [x] 3.3 Add entry and exit endpoints to visitorPassController
    - Enhance existing recordEntry endpoint to work with pass_id
    - Enhance existing recordExit endpoint to work with pass_id
    - Update visitor pass status appropriately
    - Send notifications to relevant users
    - _Requirements: 6.3, 6.4_
  
  - [x] 3.4 Update visitor pass routes
    - Add routes for new QR endpoints
    - Apply authentication and role-based middleware
    - Ensure proper error handling middleware
    - _Requirements: 6.1, 6.2, 6.5, 6.6_

- [ ] 4. Checkpoint - Test backend API endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement frontend visitor pass detail modal
  - [x] 5.1 Create VisitorPassDetailModal component
    - Create modal component with proper state management
    - Implement fetchPassDetails method to get pass data and QR code
    - Display visitor information (name, phone, ID type, ID number, photo)
    - Display student information (name, room number, relationship)
    - Display visit details (purpose, times, status, pass ID)
    - Display generated QR code image
    - Add close button and proper modal animations
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1_
  
  - [x] 5.2 Add downloadQRCode functionality to modal
    - Implement download button for QR code
    - Generate PNG file with proper naming (visitor-pass-qr-{pass_id}.png)
    - Ensure QR code has sufficient resolution (minimum 300x300 pixels)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 5.3 Add error handling and loading states to modal
    - Display loading spinner while fetching data
    - Show error messages for failed API calls
    - Handle network errors gracefully
    - _Requirements: 2.1, 3.1_

- [ ] 6. Add View button to visitor logs table
  - [x] 6.1 Update VisitorLogs component with View action column
    - Add "View" button column to visitor logs table
    - Implement handleViewPass click handler
    - Pass visitor pass ID to modal component
    - Show modal when View button is clicked
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 6.2 Integrate VisitorPassDetailModal into VisitorLogs
    - Import and render modal component
    - Manage modal open/close state
    - Pass selected pass ID to modal
    - _Requirements: 1.3, 2.1_

- [ ] 7. Implement security QR scanner component
  - [ ] 7.1 Create VisitorQRScanner component
    - Integrate html5-qrcode library for camera access
    - Implement startScanner and stopScanner methods
    - Handle QR code scan success and errors
    - Display camera preview and scan feedback
    - Add proper cleanup on component unmount
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 7.2 Add camera permission handling
    - Request camera permissions
    - Display helpful error messages for permission denied
    - Provide fallback UI when camera unavailable
    - _Requirements: 5.1_

- [ ] 8. Create security visitor scanner page
  - [ ] 8.1 Create SecurityVisitorScanner page component
    - Create page at /security/visitor-scanner
    - Integrate VisitorQRScanner component
    - Implement handleScan to verify QR with backend
    - Display scanned visitor pass details
    - Show entry/exit action buttons after successful scan
    - Add "Scan Another" button to reset state
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 8.2 Implement entry/exit controls
    - Add "Mark Entry" button to record visitor entry
    - Add "Mark Exit" button to record visitor exit
    - Call appropriate API endpoints
    - Update UI after successful entry/exit recording
    - Display success/error messages
    - _Requirements: 5.5, 6.3, 6.4_
  
  - [ ]* 8.3 Add error handling and validation
    - Display error messages for invalid QR codes
    - Handle expired QR codes with clear messaging
    - Validate pass status before allowing entry/exit
    - Show appropriate messages for rejected/pending passes
    - _Requirements: 5.3, 5.4, 5.7_

- [ ] 9. Add navigation link for security scanner
  - Update security layout navigation to include visitor scanner link
  - Add icon and label for visitor scanner page
  - Ensure proper routing and access control
  - _Requirements: 1.4_

- [ ] 10. Implement notification service for visitor pass views
  - [ ] 10.1 Add notifySecurityVisitorView method to NotificationService
    - Create method to send notifications to all security personnel
    - Include visitor name, student name, room number, and pass ID
    - Set notification type to "info" and title to "Visitor Pass Viewed"
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 10.2 Integrate notification calls in QR generation endpoint
    - Call notification service after successful QR generation
    - Handle notification errors gracefully without blocking QR generation
    - _Requirements: 4.1_

- [ ] 11. Final checkpoint - Integration testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation builds on existing QR infrastructure used for gatepasses
- Security scanner uses html5-qrcode library for cross-browser camera support
- QR codes are encrypted using existing encryption utilities
- Notifications leverage existing notification service infrastructure
