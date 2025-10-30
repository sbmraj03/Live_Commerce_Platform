const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testSessionAPIs = async () => {
  try {
    console.log('🧪 Testing Session APIs...\n');

    // Get all products first
    const productsRes = await axios.get(`${BASE_URL}/products`);
    const products = productsRes.data.data;
    const productIds = products.slice(0, 2).map(p => p._id);

    // Test 1: Create session
    console.log('1️⃣ Testing CREATE session...');
    const newSession = await axios.post(`${BASE_URL}/sessions`, {
      title: 'Test Live Session',
      description: 'Testing session management',
      hostName: 'Test Host',
      products: productIds
    });
    console.log(`✅ Created session: ${newSession.data.data.title}`);
    console.log(`   Status: ${newSession.data.data.status}`);
    console.log(`   Products: ${newSession.data.data.products.length}\n`);

    const sessionId = newSession.data.data._id;

    // Test 2: Get all sessions
    console.log('2️⃣ Testing GET all sessions...');
    const allSessions = await axios.get(`${BASE_URL}/sessions`);
    console.log(`✅ Found ${allSessions.data.count} sessions\n`);

    // Test 3: Get single session
    console.log('3️⃣ Testing GET single session...');
    const singleSession = await axios.get(`${BASE_URL}/sessions/${sessionId}`);
    console.log(`✅ Session: ${singleSession.data.data.title}\n`);

    // Test 4: Start session
    console.log('4️⃣ Testing START session...');
    const startedSession = await axios.put(`${BASE_URL}/sessions/${sessionId}/start`);
    console.log(`✅ Session started. Status: ${startedSession.data.data.status}\n`);

    // Test 5: Get live session
    console.log('5️⃣ Testing GET live session...');
    const liveSession = await axios.get(`${BASE_URL}/sessions/live/current`);
    console.log(`✅ Live session: ${liveSession.data.data.title}\n`);

    // Test 6: End session
    console.log('6️⃣ Testing END session...');
    const endedSession = await axios.put(`${BASE_URL}/sessions/${sessionId}/end`);
    console.log(`✅ Session ended. Status: ${endedSession.data.data.status}\n`);

    // Test 7: Delete session
    console.log('7️⃣ Testing DELETE session...');
    await axios.delete(`${BASE_URL}/sessions/${sessionId}`);
    console.log('✅ Session deleted\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testSessionAPIs();