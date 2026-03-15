export const troubleshootingGuide = [
  {
    id: 1,
    category: 'Gatepass',
    problem: 'I cannot create a gatepass',
    solution: 'Ensure you have filled in all required fields: destination, reason, leave time, and expected return time. Also check that your account is active and you have the student role.',
    keywords: ['gatepass', 'create', 'cannot', 'error', 'form']
  },
  {
    id: 2,
    category: 'Gatepass',
    problem: 'My gatepass was rejected',
    solution: 'Check the coordinator comments in your gatepass history. Common reasons include incomplete information, invalid dates, or policy violations. Contact your coordinator for clarification.',
    keywords: ['gatepass', 'rejected', 'denied', 'why', 'reason']
  },
  {
    id: 3,
    category: 'Gatepass',
    problem: 'My gatepass is still pending',
    solution: 'Gatepass approval typically takes 24-48 hours. First it goes to the coordinator, then to the warden. Check your notifications for updates. If it\'s been longer, contact your coordinator.',
    keywords: ['gatepass', 'pending', 'approval', 'waiting', 'how long']
  },
  {
    id: 4,
    category: 'Gatepass',
    problem: 'I cannot download my QR code',
    solution: 'QR codes are only available after your gatepass is fully approved by both coordinator and warden. Once approved, go to your gatepass details and click "Download QR Code".',
    keywords: ['qr', 'code', 'download', 'cannot', 'not available']
  },
  {
    id: 5,
    category: 'Visitor Pass',
    problem: 'Visitor not allowed entry',
    solution: 'Ensure a visitor pass is created and approved before the visitor arrives. The pass must be in "approved" status. Security will verify the pass at the gate. If rejected, check the rejection reason.',
    keywords: ['visitor', 'pass', 'entry', 'denied', 'not allowed']
  },
  {
    id: 6,
    category: 'Visitor Pass',
    problem: 'How do I create a visitor pass',
    solution: 'Go to Student Dashboard > Visitor Pass section. Fill in visitor details (name, phone, ID), relationship, purpose, and expected exit time. Submit for approval. Coordinator/Warden will review and approve.',
    keywords: ['visitor', 'pass', 'create', 'how', 'steps']
  },
  {
    id: 7,
    category: 'Visitor Pass',
    problem: 'My visitor pass was rejected',
    solution: 'Check the rejection reason in your visitor pass history. Common reasons include incomplete visitor information, invalid ID, or policy violations. Create a new pass with correct information.',
    keywords: ['visitor', 'pass', 'rejected', 'denied', 'why']
  },
  {
    id: 8,
    category: 'Account',
    problem: 'I forgot my password',
    solution: 'Go to the login page and click "Forgot Password". Enter your email address. You will receive a password reset link. Follow the instructions to create a new password.',
    keywords: ['password', 'forgot', 'reset', 'login', 'cannot access']
  },
  {
    id: 9,
    category: 'Account',
    problem: 'I cannot login',
    solution: 'Verify your email and password are correct. Check if your account is active (not deactivated). If you forgot your password, use the password reset option. Clear browser cache and try again.',
    keywords: ['login', 'cannot', 'error', 'credentials', 'access denied']
  },
  {
    id: 10,
    category: 'Account',
    problem: 'How do I update my profile',
    solution: 'Go to Settings > Profile. You can update your phone number, hostel block, and room number. Some fields like email and student ID cannot be changed. Contact admin for those changes.',
    keywords: ['profile', 'update', 'edit', 'settings', 'information']
  },
  {
    id: 11,
    category: 'Notifications',
    problem: 'I am not receiving notifications',
    solution: 'Check your notification bell icon in the top-right corner. Ensure notifications are enabled in your browser settings. Check your email for email notifications. Refresh the page to see new notifications.',
    keywords: ['notifications', 'not receiving', 'missing', 'alerts', 'bell']
  },
  {
    id: 12,
    category: 'Approval',
    problem: 'How long does approval take',
    solution: 'Gatepass approval typically takes 24-48 hours. Visitor pass approval is usually faster (2-4 hours). You will receive notifications when your request is approved or rejected.',
    keywords: ['approval', 'time', 'how long', 'duration', 'wait']
  },
  {
    id: 13,
    category: 'Security',
    problem: 'How do I scan a QR code',
    solution: 'Go to Security Dashboard > Scanner. Click "Scan QR Code" and allow camera access. Point your camera at the QR code. The system will automatically verify the code and show visitor details.',
    keywords: ['scan', 'qr', 'code', 'security', 'camera']
  },
  {
    id: 14,
    category: 'Security',
    problem: 'How do I record visitor entry/exit',
    solution: 'Go to Security Dashboard > Walk-in Visitors. Scan the visitor pass QR code. Click "Record Entry" when visitor arrives. Click "Record Exit" when visitor leaves. The system will update automatically.',
    keywords: ['entry', 'exit', 'record', 'visitor', 'security']
  },
  {
    id: 15,
    category: 'Admin',
    problem: 'How do I manage users',
    solution: 'Go to Admin Dashboard > User Management. You can add new users, edit existing users, activate/deactivate accounts, and manage roles. Click on a user to view or edit their details.',
    keywords: ['users', 'manage', 'admin', 'add', 'edit', 'delete']
  },
  {
    id: 16,
    category: 'Analytics',
    problem: 'How do I view analytics',
    solution: 'Go to your Dashboard > Analytics section. You can view statistics, charts, and reports. Use date filters to view data for specific periods. Export data if needed.',
    keywords: ['analytics', 'statistics', 'charts', 'reports', 'data']
  },
  {
    id: 17,
    category: 'General',
    problem: 'How do I navigate the application',
    solution: 'Use the left sidebar to navigate between different sections. The sidebar shows different options based on your role (Student, Coordinator, Warden, Security, Admin). Click on any option to go to that page.',
    keywords: ['navigate', 'sidebar', 'menu', 'how', 'where']
  },
  {
    id: 18,
    category: 'General',
    problem: 'What is my role and what can I do',
    solution: 'Your role determines what features you can access. Students can create gatepasses and visitor passes. Coordinators and Wardens approve requests. Security manages entry/exit. Admins manage the system.',
    keywords: ['role', 'permissions', 'access', 'what can i do', 'features']
  },
  {
    id: 19,
    category: 'Technical',
    problem: 'The page is not loading',
    solution: 'Try refreshing the page (F5 or Ctrl+R). Clear your browser cache and cookies. Check your internet connection. Try using a different browser. If the problem persists, contact support.',
    keywords: ['loading', 'page', 'error', 'not working', 'blank']
  },
  {
    id: 20,
    category: 'Technical',
    problem: 'I see an error message',
    solution: 'Read the error message carefully as it usually describes the problem. Try the suggested solution. If the error persists, note the error code and contact support with the details.',
    keywords: ['error', 'message', 'problem', 'issue', 'bug']
  }
];

export const contactOptions = [
  {
    id: 1,
    name: 'Contact Warden',
    description: 'Reach out to the hostel warden for general inquiries and issues',
    icon: '👨‍💼',
    action: 'contact_warden'
  },
  {
    id: 2,
    name: 'Contact Coordinator',
    description: 'Contact the gatepass coordinator for approval-related questions',
    icon: '📋',
    action: 'contact_coordinator'
  },
  {
    id: 3,
    name: 'Report a Problem',
    description: 'Report a bug or technical issue to the support team',
    icon: '🐛',
    action: 'report_problem'
  }
];
