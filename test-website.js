/**
 * Automated Website Testing Script
 * Tests all major functionality of the Hostel Gatepass Management System
 */

const axios = require('./backend/node_modules/axios').default;

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3001';

// Test credentials
const credentials = {
  admin: { email: 'admin@hostel.com', password: 'Password@123' },
  warden: { email: 'warden@hostel.com', password: 'Password@123' },
  coordinator: { email: 'coordinator@hostel.com', password: 'Password@123' },
  security: { email: 'security@hostel.com', password: 'Password@123' },
  student: { email: 'student@hostel.com', password: 'Password@123' }
};

let tokens = {};
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}${message ? ' - ' + message : ''}`);
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testEndpoint(name, method, url, data = null, token = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    if (data) config.data = data;

    const response = await axios(config);
    const passed = response.status === expectedStatus;
    logTest(name, passed, `Status: ${response.status}`);
    return { passed, data: response.data };
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const passed = status === expectedStatus;
    logTest(name, passed, `Status: ${status}, Error: ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Test suites
async function testAuthentication() {
  console.log('\n=== TESTING AUTHENTICATION ===\n');

  // Test login for each role
  for (const [role, creds] of Object.entries(credentials)) {
    const result = await testEndpoint(
      `Login as ${role}`,
      'POST',
      '/auth/login',
      creds
    );
    if (result.passed && result.data?.data?.token) {
      tokens[role] = result.data.data.token;
    }
  }

  // Test invalid login
  await testEndpoint(
    'Login with invalid credentials',
    'POST',
    '/auth/login',
    { email: 'invalid@test.com', password: 'wrong' },
    null,
    401
  );

  // Test protected route without token
  await testEndpoint(
    'Access protected route without token',
    'GET',
    '/profile',
    null,
    null,
    401
  );
}

async function testStudentFeatures() {
  console.log('\n=== TESTING STUDENT FEATURES ===\n');

  const token = tokens.student;
  if (!token) {
    console.log('⚠️  Skipping student tests - no token');
    return;
  }

  // Test profile
  await testEndpoint('Get student profile', 'GET', '/profile', null, token);

  // Test gatepass creation
  const gatepassData = {
    destination: 'Test City',
    reason: 'Test reason',
    leave_time: new Date(Date.now() + 86400000).toISOString(),
    expected_return_time: new Date(Date.now() + 172800000).toISOString(),
    contact_number: '+1234567890'
  };
  const createResult = await testEndpoint(
    'Create gatepass',
    'POST',
    '/gatepass',
    gatepassData,
    token,
    201
  );

  // Test get student gatepasses
  await testEndpoint('Get student gatepasses', 'GET', '/gatepass/student', null, token);

  // Test get gatepass history
  await testEndpoint('Get gatepass history', 'GET', '/gatepass/history', null, token);

  // Test visitor pass creation
  const visitorData = {
    visitor_name: 'Test Visitor',
    visitor_phone: '+1234567890',
    visitor_id_type: 'passport',
    visitor_id_number: 'AB123456',
    relationship: 'Parent',
    purpose: 'Family visit',
    expected_exit_time: new Date(Date.now() + 86400000).toISOString()
  };
  await testEndpoint(
    'Create visitor pass',
    'POST',
    '/visitor-pass/student',
    visitorData,
    token,
    201
  );

  // Test get student visitor passes
  await testEndpoint('Get student visitor passes', 'GET', '/visitor-pass/student', null, token);

  // Test student analytics
  await testEndpoint('Get student analytics', 'GET', '/analytics/student', null, token);
}

async function testCoordinatorFeatures() {
  console.log('\n=== TESTING COORDINATOR FEATURES ===\n');

  const token = tokens.coordinator;
  if (!token) {
    console.log('⚠️  Skipping coordinator tests - no token');
    return;
  }

  // Test get pending gatepasses
  await testEndpoint('Get pending gatepasses', 'GET', '/gatepass/pending', null, token);

  // Test get all gatepasses
  await testEndpoint('Get all gatepasses', 'GET', '/gatepass/all', null, token);

  // Test get coordinator history
  await testEndpoint('Get coordinator history', 'GET', '/gatepass/coordinator/history', null, token);
}

async function testWardenFeatures() {
  console.log('\n=== TESTING WARDEN FEATURES ===\n');

  const token = tokens.warden;
  if (!token) {
    console.log('⚠️  Skipping warden tests - no token');
    return;
  }

  // Test get pending gatepasses
  await testEndpoint('Get warden pending gatepasses', 'GET', '/gatepass/warden/pending', null, token);

  // Test get warden analytics
  await testEndpoint('Get warden analytics', 'GET', '/analytics/warden', null, token);
}

async function testSecurityFeatures() {
  console.log('\n=== TESTING SECURITY FEATURES ===\n');

  const token = tokens.security;
  if (!token) {
    console.log('⚠️  Skipping security tests - no token');
    return;
  }

  // Test get active gatepasses
  await testEndpoint('Get active gatepasses', 'GET', '/gatepass/active', null, token);

  // Test get overdue gatepasses
  await testEndpoint('Get overdue gatepasses', 'GET', '/gatepass/overdue', null, token);

  // Test get active visitors
  await testEndpoint('Get active visitors', 'GET', '/visitor-pass/active', null, token);

  // Test get all visitor passes
  await testEndpoint('Get all visitor passes', 'GET', '/visitor-pass/all', null, token);
}

async function testAdminFeatures() {
  console.log('\n=== TESTING ADMIN FEATURES ===\n');

  const token = tokens.admin;
  if (!token) {
    console.log('⚠️  Skipping admin tests - no token');
    return;
  }

  // Test get all users
  await testEndpoint('Get all users', 'GET', '/admin/users', null, token);

  // Test get system stats
  await testEndpoint('Get system stats', 'GET', '/admin/stats', null, token);

  // Test get admin analytics
  await testEndpoint('Get admin analytics', 'GET', '/analytics/admin', null, token);

  // Test search functionality
  await testEndpoint('Search gatepasses', 'GET', '/search?q=test', null, token);
}

async function testNotifications() {
  console.log('\n=== TESTING NOTIFICATIONS ===\n');

  const token = tokens.student;
  if (!token) {
    console.log('⚠️  Skipping notification tests - no token');
    return;
  }

  // Test get notifications
  await testEndpoint('Get notifications', 'GET', '/notifications', null, token);

  // Test get unread count
  await testEndpoint('Get unread notification count', 'GET', '/notifications/unread/count', null, token);
}

async function testVisitorPassIssue() {
  console.log('\n=== TESTING VISITOR PASS VIEW ISSUE (User Reported) ===\n');

  const token = tokens.student;
  if (!token) {
    console.log('⚠️  Skipping visitor pass view test - no token');
    return;
  }

  // Get student visitor passes
  const result = await testEndpoint('Get student visitor passes', 'GET', '/visitor-pass/student', null, token);
  
  if (result.passed && result.data?.data?.passes?.length > 0) {
    const passId = result.data.data.passes[0].id;
    
    // Test get visitor pass details (for View button)
    await testEndpoint(
      'Get visitor pass details (View button)',
      'GET',
      `/visitor-pass/${passId}`,
      null,
      token
    );

    // Test QR generation (if endpoint exists)
    await testEndpoint(
      'Generate QR for visitor pass',
      'POST',
      `/visitor-pass/${passId}/qr`,
      null,
      token
    );
  } else {
    console.log('⚠️  No visitor passes found to test View functionality');
  }
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   HOSTEL GATEPASS MANAGEMENT SYSTEM - API TESTING         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE}`);
  console.log(`Frontend at: ${FRONTEND_BASE}\n`);

  try {
    await testAuthentication();
    await testStudentFeatures();
    await testCoordinatorFeatures();
    await testWardenFeatures();
    await testSecurityFeatures();
    await testAdminFeatures();
    await testNotifications();
    await testVisitorPassIssue();

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      TEST SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nTotal Tests: ${testResults.passed + testResults.failed}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);

    // Show failed tests
    const failedTests = testResults.tests.filter(t => !t.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.message}`);
      });
    }

    console.log('\n✓ Testing completed!\n');

  } catch (error) {
    console.error('\n❌ Testing failed with error:', error.message);
    console.error(error);
  }
}

// Run tests
runAllTests();
