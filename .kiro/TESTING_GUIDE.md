# Testing Guide: Walk-in Visitor Feature

## Quick Start

### 1. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

### 2. Login as Security Personnel
```
Email: security@hostel.com
Password: Password@123
```

### 3. Navigate to Walk-in Visitors
- Click "Walk-in Visitors" (🚶) in the sidebar
- You should see:
  - Visitor statistics cards (Today's Visitors, Active Visitors, Visitors Left, Overdue Visitors)
  - Walk-in Visitor Pass form
  - Visitor Logs table

## Test Scenarios

### Scenario 1: Create a Walk-in Visitor Pass
1. Scroll to "Walk-in Visitor Pass" section
2. Fill in the form:
   - **Visitor Name**: John Smith
   - **Visitor Phone**: +1234567890
   - **ID Type**: National ID
   - **ID Number**: 123456789
   - **Relationship**: Friend
   - **Student ID**: 1 (or any valid student ID)
   - **Purpose of Visit**: Meeting for project discussion
   - **Expected Exit Time**: Set to 2 hours from now
3. Click "Create Walk-in Pass"
4. Should see success message: "Walk-in visitor pass created successfully!"

### Scenario 2: View Visitor Logs
1. Scroll to "Visitor Logs" section
2. Should see a table with columns:
   - Visitor Name
   - Student Name
   - Room
   - Purpose
   - Entry Time
   - Exit Time
   - Status
3. Click "Refresh" button to reload logs
4. Logs should update without errors

### Scenario 3: Check Visitor Statistics
1. At the top of the page, view the statistics cards:
   - **Today's Visitors**: Total count of visitors
   - **Active Visitors**: Currently in hostel
   - **Visitors Left**: Exited the hostel
   - **Overdue Visitors**: Exceeded expected exit time

## Expected Behavior

✅ **Walk-in Visitor Pass Creation**
- Form accepts all required fields
- Pass is created with "approved" status (no approval workflow)
- Student receives notification
- Pass appears in visitor logs

✅ **Visitor Logs Display**
- Loads without errors
- Shows all visitor records
- Displays correct status for each visitor
- Refresh button works properly

✅ **Statistics**
- Updates in real-time
- Shows accurate counts
- Reflects newly created passes

## Troubleshooting

### Issue: "Failed to load visitor logs"
**Solution**: 
- Ensure backend is running on port 5000
- Check that you're logged in as security personnel
- Verify the API endpoint is accessible: `http://localhost:5000/api/visitor-pass/all`

### Issue: Form submission fails
**Solution**:
- Ensure all required fields are filled
- Verify student ID exists in the system
- Check browser console for detailed error messages

### Issue: Statistics not updating
**Solution**:
- Click the refresh button on the statistics cards
- Wait a few seconds for the data to load
- Check network tab in browser developer tools

## API Endpoints Used

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| GET | `/api/visitor-pass/all` | Security, Admin | Fetch all visitor logs |
| POST | `/api/visitor-pass/create-security` | Security | Create walk-in visitor pass |
| GET | `/api/visitor-pass/stats/today` | Security, Admin | Get today's statistics |

## Default Test Users

| Role | Email | Password |
|------|-------|----------|
| Security | security@hostel.com | Password@123 |
| Admin | admin@hostel.com | Password@123 |
| Student | student@hostel.com | Password@123 |

## Notes

- Walk-in visitor passes created by security are automatically approved
- No approval workflow is required for security-created passes
- Students receive notifications when visitors arrive
- Visitor logs are accessible only to security and admin roles
