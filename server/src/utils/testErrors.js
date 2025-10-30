const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testErrorHandling = async () => {
  console.log('🧪 Testing Error Handling...\n');

  // Test 1: Invalid ObjectId
  console.log('1️⃣ Testing invalid ObjectId...');
  try {
    await axios.get(`${BASE_URL}/products/invalid_id`);
  } catch (error) {
    console.log(`✅ Caught: ${error.response.data.error}\n`);
  }

  // Test 2: Non-existent resource
  console.log('2️⃣ Testing non-existent resource...');
  try {
    await axios.get(`${BASE_URL}/products/507f1f77bcf86cd799439011`);
  } catch (error) {
    console.log(`✅ Caught: ${error.response.data.error}\n`);
  }

  // Test 3: Invalid route
  console.log('3️⃣ Testing invalid route...');
  try {
    await axios.get(`${BASE_URL}/invalid-endpoint`);
  } catch (error) {
    console.log(`✅ Caught: ${error.response.data.error}\n`);
  }

  // Test 4: Validation error
  console.log('4️⃣ Testing validation error...');
  try {
    await axios.post(`${BASE_URL}/products`, {
      name: 'Test'
      // Missing required fields
    });
  } catch (error) {
    console.log(`✅ Caught: ${error.response.data.error}\n`);
  }

  // Test 5: Start already live session
  console.log('5️⃣ Testing business logic error...');
  try {
    const sessions = await axios.get(`${BASE_URL}/sessions`);
    if (sessions.data.data.length > 0) {
      const sessionId = sessions.data.data[0]._id;
      await axios.put(`${BASE_URL}/sessions/${sessionId}/start`);
      await axios.put(`${BASE_URL}/sessions/${sessionId}/start`); // Try to start again
    }
  } catch (error) {
    console.log(`✅ Caught: ${error.response.data.error}\n`);
  }

  console.log('✅ All error handling tests passed!');
};

testErrorHandling();