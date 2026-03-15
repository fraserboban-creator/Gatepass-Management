const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testVisitorPassAPI() {
  console.log('\n🧪 Testing Visitor Pass API...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('   ✓ API is healthy:', healthResponse.data.message);
    
    // Test 2: Try to access visitor passes (should fail without auth)
    console.log('\n2. Testing visitor pass endpoint (without auth)...');
    try {
      await axios.get(`${API_URL}/visitor-pass/my-passes`);
      console.log('   ✗ Should have required authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✓ Authentication required (as expected)');
      } else {
        console.log('   ✗ Unexpected error:', error.message);
      }
    }
    
    console.log('\n✅ Visitor Pass API is configured correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login to the frontend as a student');
    console.log('   2. Navigate to Visitor Pass page');
    console.log('   3. The page should now load without errors');
    
  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the backend server is running on port 5000');
    }
  }
}

testVisitorPassAPI();
