# 🏢 Hostel Gatepass Management System

A comprehensive full-stack web application for digitizing and streamlining the gatepass approval process in hostels. Built with modern technologies and featuring real-time notifications, parent alerts, dark mode, and advanced analytics.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-v24.14.0-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Parent Notification System](#parent-notification-system)
- [Dark Mode](#dark-mode)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Hostel Gatepass Management System is a modern, full-featured application that replaces traditional paper-based gatepass systems with a digital solution. It streamlines the entire workflow from gatepass creation to approval, QR code generation, and exit/entry tracking, while keeping parents informed in real-time.

### Key Highlights

- ✅ **5 User Roles** with role-based access control
- ✅ **Two-tier Approval Workflow** (Coordinator → Warden)
- ✅ **QR Code Generation** for approved gatepasses
- ✅ **Parent Notification System** via email/SMS
- ✅ **Real-time Notifications** for all users
- ✅ **Complete Dark Mode** across all pages
- ✅ **Advanced Analytics** with charts and statistics
- ✅ **Search & Filter** capabilities
- ✅ **Activity Logging** for security tracking
- ✅ **Responsive Design** for all devices

---

## ✨ Features

### Core Features

#### 1. Digital Gatepass Management
- Create gatepass requests with destination, reason, and time details
- Upload enrollment number for tracking
- View gatepass history with status filters
- Download QR codes for approved gatepasses
- Delete pending requests

#### 2. Multi-level Approval System
- **Coordinator Approval**: First level review
- **Warden Approval**: Final authorization
- Comments and rejection reasons
- Approval history tracking
- Email notifications at each stage

#### 3. QR Code System
- Automatic QR code generation on approval
- Secure QR code verification
- Camera-based scanning
- File upload scanning option
- Exit and return time tracking

#### 4. Parent Notification System 📧
- **Automatic Email Alerts** when student exits hostel
- **Return Notifications** when student returns
- Professional HTML email templates
- Detailed information (time, destination, reason, contact)
- SMS integration ready (Twilio, AWS SNS, MSG91)

#### 5. Modern Notification System 🔔
Built with TypeScript for type safety and reliability.

**Features:**
- Bell icon with animated unread count badge
- Smooth dropdown panel with animations
- Date-based grouping (Today/Yesterday/This Week/Earlier)
- Mark as read (individual and all)
- Auto-refresh every 30 seconds
- Toast popup notifications for new alerts
- Loading skeletons for better UX
- Empty state with helpful message
- Notification types: info, success, warning, error
- Complete dark mode support
- Responsive design (mobile-friendly)

**Components:**
- `NotificationBell.tsx` - Bell icon with badge
- `NotificationDropdown.tsx` - Dropdown panel
- `NotificationItem.tsx` - Individual notification
- `ToastNotification.tsx` - Toast popup
- `ToastContainer.tsx` - Toast provider
- `NotificationSkeleton.tsx` - Loading state

**Technical Details:**
- TypeScript for type safety
- React Context API for toast management
- Custom hooks (`useNotifications`, `useToast`)
- Lucide React icons
- Tailwind CSS animations
- Custom scrollbar styling

#### 6. Complete Dark Mode 🌙
- Toggle between light and dark themes
- Persistent theme preference
- All pages fully styled
- Smooth transitions
- Reduced eye strain

#### 7. Advanced Analytics 📊
- Interactive bar and pie charts
- User distribution statistics
- Gatepass status breakdown
- Top destinations tracking
- Date range filtering
- Export capabilities

#### 8. Global Search & Advanced Filters 🔍
Professional search system available on every page.

**Search Capabilities:**
- Real-time search across gatepasses, users, and logs
- Debounced input (300ms) for optimal performance
- Search by: name, ID, destination, reason, email, phone
- Instant results as you type
- Click result to navigate directly

**Advanced Filters:**
- Status filter (Pending, Approved, Rejected, Completed)
- Date range picker (From/To dates)
- User type filter (Student, Coordinator, Warden, Security, Admin)
- Hostel block filter (A, B, C, D)
- Room number search
- Gatepass type filter (Local, Home, Medical, Emergency)

**UI Features:**
- Modern, clean design (SaaS dashboard style)
- Filter button with active count badge
- Smooth animations and transitions
- Loading states and empty states
- Clear all filters button
- Responsive design (mobile-friendly)
- Complete dark mode support

**Technical Details:**
- TypeScript for type safety
- Reusable components
- Backend API integration
- Database search optimization
- Result limiting (50 max)
- Keyboard shortcuts (ESC to close)

### User-Specific Features

#### Students
- Create gatepass requests
- View request history
- Download QR codes
- Track approval status
- Delete pending requests
- View profile information

#### Coordinators
- Review pending requests
- Approve/reject with comments
- View all gatepasses
- Analytics dashboard
- Recent history tracking

#### Wardens
- Final approval authority
- View coordinator-approved requests
- System-wide analytics
- Comprehensive reporting

#### Security Personnel
- QR code scanning (camera/upload)
- Mark exit/return times
- View recent logs
- Student verification
- Activity tracking

#### Administrators
- Complete user management
- Add/edit/delete users
- Activate/deactivate accounts
- Parent contact management
- System analytics
- Activity monitoring

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.35 (React)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **QR Code**: html5-qrcode
- **Charts**: Custom SVG-based charts

### Backend
- **Runtime**: Node.js v24.14.0
- **Framework**: Express.js
- **Database**: SQLite (sql.js)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **QR Generation**: qrcode
- **Email**: nodemailer
- **Security**: helmet, express-rate-limit

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Editor**: VS Code (recommended)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Pages   │  │Components│  │ Contexts │  │  Utils  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                    REST API (HTTP)
                          │
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Routes  │  │Controllers│ │ Services │  │  Models ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │   Email  │  │    QR    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                          │
                    SQLite Database
                          │
┌─────────────────────────────────────────────────────────┐
│                    Database Tables                       │
│  • users  • gatepasses  • approvals  • qr_codes         │
│  • logs   • notifications                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- Node.js v24.14.0 or higher
- npm (comes with Node.js)
- Git (optional)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hostel-gatepass-system
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Initialize Database

```bash
cd ../backend
npm run db:init
npm run db:seed
```

This creates the database and adds sample users:
- Admin: admin@hostel.com / admin123
- Coordinator: coordinator@hostel.com / coord123
- Warden: warden@hostel.com / warden123
- Security: security@hostel.com / security123
- Student: student@hostel.com / student123

### Step 5: Add Parent Contact Fields (Migration)

```bash
npm run db:add-parent-contacts
```

---

## ⚙️ Configuration

### Backend Configuration

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database
DB_PATH=../database/hostel_gatepass.db

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional - for parent notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Configuration

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Email Setup (Optional)

For Gmail:
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password in SMTP_PASS

For other providers:
- Get SMTP credentials from your email provider
- Update SMTP_HOST, SMTP_PORT accordingly

---

## 🚀 Usage

### Starting the Application

#### Option 1: Using Scripts (Windows)

```bash
# Run setup script
setup.bat
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | Password@123 |
| Coordinator | coordinator@hostel.com | Password@123 |
| Warden | warden@hostel.com | Password@123 |
| Security | security@hostel.com | Password@123 |
| Student | student@hostel.com | Password@123 |

---

## 👥 User Roles

### 1. Student
**Permissions:**
- Create gatepass requests
- View own gatepass history
- Download QR codes
- Delete pending requests
- View profile

**Workflow:**
1. Login → Dashboard
2. Create New Gatepass
3. Fill details (destination, reason, time, enrollment number)
4. Submit for approval
5. Wait for coordinator approval
6. Wait for warden approval
7. Download QR code
8. Show QR at gate

### 2. Coordinator
**Permissions:**
- View pending gatepass requests
- Approve/reject requests
- Add comments
- View all gatepasses
- Access analytics

**Workflow:**
1. Login → Dashboard
2. View Pending Requests
3. Review student details
4. Approve or Reject with comments
5. View history and analytics

### 3. Warden
**Permissions:**
- Final approval authority
- View coordinator-approved requests
- Approve/reject requests
- System-wide analytics
- View all gatepasses

**Workflow:**
1. Login → Dashboard
2. View Coordinator-Approved Requests
3. Final review
4. Approve or Reject
5. Monitor analytics

### 4. Security
**Permissions:**
- Scan QR codes
- Mark exit/return times
- View recent logs
- Verify student identity

**Workflow:**
1. Login → Scanner
2. Scan QR code (camera or upload)
3. Verify student details
4. Mark Exit (first scan)
5. Mark Return (second scan)
6. View logs

### 5. Admin
**Permissions:**
- Complete system access
- User management (CRUD)
- Activate/deactivate users
- Parent contact management
- System analytics
- View all activities

**Workflow:**
1. Login → Dashboard
2. Manage Users
3. Add/Edit/Delete users
4. Configure parent contacts
5. Monitor system analytics

---

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login user and get JWT token

**Request:**
```json
{
  "email": "student@hostel.com",
  "password": "student123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "email": "student@hostel.com",
      "role": "student",
      "full_name": "John Doe"
    }
  }
}
```

### Gatepass Endpoints

#### POST /api/gatepass
Create new gatepass (Student only)

**Request:**
```json
{
  "destination": "City Mall",
  "reason": "Shopping",
  "leave_time": "2026-03-13T18:00:00",
  "expected_return_time": "2026-03-13T21:00:00",
  "contact_number": "+1234567890",
  "enrollment_number": "EN2024001"
}
```

#### GET /api/gatepass/history
Get student's gatepass history

**Query Parameters:**
- `status`: pending, coordinator_approved, approved, rejected, completed
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### POST /api/gatepass/:id/approve
Approve or reject gatepass

**Request:**
```json
{
  "action": "approve",
  "comments": "Approved for valid reason"
}
```

#### POST /api/gatepass/:id/exit
Mark student exit (Security only)

#### POST /api/gatepass/:id/return
Mark student return (Security only)

#### DELETE /api/gatepass/:id
Delete pending gatepass (Student only)

### QR Code Endpoints

#### GET /api/qr/generate/:id
Generate QR code for approved gatepass

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### POST /api/qr/verify
Verify QR code

**Request:**
```json
{
  "qrData": "encrypted-qr-data"
}
```

### Admin Endpoints

#### GET /api/admin/users
Get all users (with optional role filter)

#### POST /api/admin/users
Create new user

#### PATCH /api/admin/users/:id
Update user details

#### DELETE /api/admin/users/:id
Delete user

#### GET /api/admin/analytics
Get system analytics

### Notification Endpoints

#### GET /api/notifications
Get user notifications

#### PUT /api/notifications/:id/read
Mark notification as read

#### PUT /api/notifications/read-all
Mark all notifications as read

---

## 📧 Parent Notification System

### Overview
Automatically sends email/SMS notifications to parents when students exit or return to hostel.

### Setup

1. **Add Parent Contact Information:**
   - Login as Admin
   - Go to User Management
   - Edit student profile
   - Add parent name, email, and phone
   - Save changes

2. **Configure Email Service:**
   - Edit `backend/.env`
   - Add SMTP credentials (see Configuration section)
   - Restart backend server

3. **Test:**
   - Create and approve a gatepass
   - Security scans QR code for exit
   - Parent receives exit notification email
   - Security scans QR code for return
   - Parent receives return notification email

### Email Templates

**Exit Notification:**
- Subject: "Student Exit Alert - [Student Name]"
- Contains: Exit time, destination, reason, expected return, contact number
- Color-coded with orange highlight for expected return time

**Return Notification:**
- Subject: "Student Return Alert - [Student Name]"
- Contains: Return time, exit time, destination
- Green-themed for safe return confirmation

### SMS Integration

SMS support is ready but requires gateway setup:

**Supported Providers:**
- Twilio (Global)
- AWS SNS (Global)
- MSG91 (India)
- Fast2SMS (India)

See `PARENT_NOTIFICATION_SYSTEM.md` for integration code.

---

## 🌙 Dark Mode

### Features
- Complete dark mode coverage across all pages
- Toggle button in header (🌙/☀️ icon)
- Persistent theme preference (localStorage)
- Smooth transitions between themes
- All components styled (tables, modals, forms, badges)

### Usage
1. Click moon icon (🌙) in header to enable dark mode
2. Click sun icon (☀️) to return to light mode
3. Theme preference automatically saved

### Customization

Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',    // Blue
      secondary: '#10B981',  // Green
      warning: '#F59E0B',    // Yellow
      danger: '#EF4444',     // Red
    },
  },
}
```

---

## 📸 Screenshots

### Light Mode
- Login Page
- Student Dashboard
- Gatepass Creation
- QR Code Display
- Admin User Management

### Dark Mode
- All pages with dark theme
- Improved readability
- Modern appearance

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Won't Start
**Error:** `Port 5000 already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

#### 2. Frontend Build Errors
**Error:** `Module not found`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 3. Database Not Found
**Error:** `ENOENT: no such file or directory`

**Solution:**
```bash
cd backend
npm run db:init
npm run db:seed
```

#### 4. Email Not Sending
**Possible Causes:**
- SMTP credentials not configured
- Using regular password instead of app password (Gmail)
- Firewall blocking SMTP port

**Solution:**
- Verify SMTP settings in `.env`
- Use app password for Gmail
- Check firewall settings

#### 5. QR Scanner Not Working
**Possible Causes:**
- Camera permissions not granted
- Browser doesn't support camera API

**Solution:**
- Grant camera permissions
- Use file upload option
- Try different browser (Chrome recommended)

#### 6. Dark Mode Not Persisting
**Solution:**
- Clear browser cache
- Check localStorage is enabled
- Verify ThemeProvider is wrapping app

---

## 📚 Additional Documentation

- `LOADER_USAGE_GUIDE.md` - Beautiful 3D cube loader documentation
- `GLOBAL_SEARCH_GUIDE.md` - Complete search system documentation
- `SEARCH_QUICK_START.md` - Quick start guide for search
- `SEARCH_SYSTEM_COMPLETE.md` - Search implementation summary
- `SEARCH_VISUAL_GUIDE.md` - Visual design reference for search
- `STUDENT_PORTAL_REFACTOR_PLAN.md` - Student portal refactoring plan
- `NOTIFICATION_SYSTEM_GUIDE.md` - Complete notification system documentation
- `NOTIFICATION_QUICK_START.md` - Quick start guide for notifications
- `NOTIFICATION_SYSTEM_COMPLETE.md` - Notification implementation summary
- `PARENT_NOTIFICATION_SYSTEM.md` - Parent notification setup guide
- `NEW_FEATURES.md` - Detailed feature documentation
- `FEATURES_QUICK_START.md` - Quick reference guide
- `LATEST_UPDATES.md` - Recent changes and updates
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `DARK_MODE_IMPROVEMENTS.md` - Dark mode enhancements

---

## 🧪 Testing

### Manual Testing

1. **Authentication:**
   - Test login with all roles
   - Verify JWT token generation
   - Test logout functionality

2. **Gatepass Workflow:**
   - Create gatepass as student
   - Approve as coordinator
   - Approve as warden
   - Generate QR code
   - Scan QR code as security
   - Mark exit and return

3. **Parent Notifications:**
   - Add parent email to student
   - Complete gatepass workflow
   - Verify exit email received
   - Verify return email received

4. **Dark Mode:**
   - Toggle theme on all pages
   - Verify persistence
   - Check all components

5. **Notifications:**
   - Create gatepass
   - Check coordinator notification
   - Approve and check warden notification
   - Verify student notification
   - Test mark as read functionality
   - Verify toast notifications appear
   - Test mark all as read
   - Check date grouping
   - Verify auto-refresh (wait 30 seconds)
   - Test dark mode styling

### API Testing

Use Postman or curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@hostel.com","password":"student123"}'

# Create Gatepass
curl -X POST http://localhost:5000/api/gatepass \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination":"City Mall","reason":"Shopping",...}'
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use ES6+ syntax
- Follow Airbnb JavaScript Style Guide
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js community
- Tailwind CSS for utility-first CSS
- All open-source contributors

---

## 📞 Support

For issues, questions, or suggestions:

- Create an issue on GitHub
- Email: support@example.com
- Documentation: See docs folder

---

## 🗺️ Roadmap

### Version 2.1 (Planned)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] WhatsApp integration
- [ ] Parent portal
- [ ] Multi-language support

### Version 2.2 (Planned)
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF, Excel)
- [ ] Bulk operations
- [ ] Email templates customization
- [ ] SMS gateway integration

### Version 3.0 (Future)
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Real-time updates (WebSockets)
- [ ] Machine learning for pattern detection
- [ ] Biometric authentication

---

## 📊 Project Statistics

- **Total Files**: 100+
- **Lines of Code**: 10,000+
- **API Endpoints**: 25+
- **User Roles**: 5
- **Database Tables**: 6
- **Features**: 15+

---

## 🎯 Project Status

- **Version**: 2.0
- **Status**: ✅ Production Ready
- **Last Updated**: March 13, 2026
- **Maintained**: Yes

---

## 💡 Tips & Best Practices

1. **Security:**
   - Change default passwords immediately
   - Use strong JWT secret in production
   - Enable HTTPS in production
   - Regularly update dependencies

2. **Performance:**
   - Use pagination for large datasets
   - Implement caching where appropriate
   - Optimize images and assets
   - Monitor database queries

3. **Maintenance:**
   - Regular database backups
   - Monitor error logs
   - Keep dependencies updated
   - Test before deploying

4. **User Experience:**
   - Provide clear error messages
   - Add loading indicators
   - Implement form validation
   - Ensure mobile responsiveness

---

**Made with ❤️ for better hostel management**

---

## Quick Links

- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Parent Notifications](#parent-notification-system)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

**⭐ If you find this project useful, please consider giving it a star!**
