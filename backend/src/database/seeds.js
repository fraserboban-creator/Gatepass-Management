const bcrypt = require('bcryptjs');
const { initDatabase, db, saveDatabase } = require('../config/database');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    await initDatabase();

    // Hash password
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // Insert users
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, role, full_name, phone, student_id, hostel_block, room_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const users = [
      ['admin@hostel.com', hashedPassword, 'admin', 'Admin User', '+1234567890', null, null, null],
      ['warden@hostel.com', hashedPassword, 'warden', 'Dr. Sarah Johnson', '+1234567891', null, null, null],
      ['coordinator@hostel.com', hashedPassword, 'coordinator', 'Prof. Michael Chen', '+1234567892', null, null, null],
      ['security@hostel.com', hashedPassword, 'security', 'Guard Rajesh Kumar', '+1234567893', null, null, null],
      ['student@hostel.com', hashedPassword, 'student', 'John Doe', '+1234567894', 'STU2024001', 'Block A', 'A-101'],
      ['jane.smith@hostel.com', hashedPassword, 'student', 'Jane Smith', '+1234567895', 'STU2024002', 'Block A', 'A-102'],
      ['bob.wilson@hostel.com', hashedPassword, 'student', 'Bob Wilson', '+1234567896', 'STU2024003', 'Block B', 'B-201'],
      ['alice.brown@hostel.com', hashedPassword, 'student', 'Alice Brown', '+1234567897', 'STU2024004', 'Block B', 'B-202']
    ];

    for (const user of users) {
      insertUser.run(...user);
    }
    saveDatabase();
    console.log('✓ Users seeded');

    // Insert sample gatepasses
    const insertGatepass = db.prepare(`
      INSERT INTO gatepasses (student_id, destination, reason, leave_time, expected_return_time, contact_number, status, coordinator_id, warden_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const gatepasses = [
      [5, 'Mumbai - Home', 'Family emergency', tomorrow.toISOString(), nextWeek.toISOString(), '+1234567894', 'approved', 3, 2],
      [6, 'City Hospital', 'Medical checkup', tomorrow.toISOString(), tomorrow.toISOString(), '+1234567895', 'coordinator_approved', 3, null],
      [7, 'Friend\'s Place', 'Weekend visit', tomorrow.toISOString(), nextWeek.toISOString(), '+1234567896', 'pending', null, null]
    ];

    for (const gatepass of gatepasses) {
      insertGatepass.run(...gatepass);
    }
    saveDatabase();
    console.log('✓ Sample gatepasses seeded');

    // Insert sample approvals
    const insertApproval = db.prepare(`
      INSERT INTO approvals (gatepass_id, approver_id, approver_role, action, comments)
      VALUES (?, ?, ?, ?, ?)
    `);

    const approvals = [
      [1, 3, 'coordinator', 'approved', 'Valid reason, approved'],
      [1, 2, 'warden', 'approved', 'Final approval granted'],
      [2, 3, 'coordinator', 'approved', 'Medical reason approved']
    ];

    for (const approval of approvals) {
      insertApproval.run(...approval);
    }
    saveDatabase();
    console.log('✓ Sample approvals seeded');

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@hostel.com / Password@123');
    console.log('Warden: warden@hostel.com / Password@123');
    console.log('Coordinator: coordinator@hostel.com / Password@123');
    console.log('Security: security@hostel.com / Password@123');
    console.log('Student: student@hostel.com / Password@123');

  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
