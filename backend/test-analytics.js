const { initDatabase, db } = require('./src/config/database');

async function testAnalytics() {
  await initDatabase();
  
  console.log('\n=== Testing Analytics ===\n');
  
  // Test 1: Count all gatepasses
  const totalGatepasses = db.prepare('SELECT COUNT(*) as count FROM gatepasses').get();
  console.log('Total Gatepasses:', totalGatepasses.count);
  
  // Test 2: Get stats by status
  const stats = db.prepare('SELECT status, COUNT(*) as count FROM gatepasses GROUP BY status').all();
  console.log('\nGatepass Stats by Status:');
  stats.forEach(stat => {
    console.log(`  ${stat.status}: ${stat.count}`);
  });
  
  // Test 3: Get all gatepasses
  const allGatepasses = db.prepare('SELECT id, status, destination FROM gatepasses').all();
  console.log('\nAll Gatepasses:');
  allGatepasses.forEach(gp => {
    console.log(`  ID: ${gp.id}, Status: ${gp.status}, Destination: ${gp.destination}`);
  });
  
  // Test 4: Count users
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log('\nTotal Users:', totalUsers.count);
  
  process.exit(0);
}

testAnalytics().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
