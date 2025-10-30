const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';

const testAuth = async () => {
  try {
    console.log('🧪 Testing Authentication...\n');

    // Test 1: Register
    console.log('1️⃣ Testing user registration...');
    try {
      const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        password: 'test123'
      });
      console.log('✅ User registered successfully');
      console.log(`   Token: ${registerRes.data.data.token.substring(0, 20)}...\n`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠️  User might already exist\n');
      } else {
        throw error;
      }
    }

    // Test 2: Login as admin
    console.log('2️⃣ Testing admin login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@livecommerce.com',
      password: 'admin123'
    });
    adminToken = loginRes.data.data.token;
    console.log('✅ Admin logged in successfully');
    console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);

    // Test 3: Get current user (protected route)
    console.log('3️⃣ Testing protected route (get me)...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Got current user:', meRes.data.data.email, '\n');

    // Test 4: Try to access protected route without token
    console.log('4️⃣ Testing access without token...');
    try {
      await axios.post(`${BASE_URL}/products`, {
        name: 'Test',
        description: 'Test',
        price: 99,
        image: 'https://via.placeholder.com/500',
        category: 'Other'
      });
      console.log('❌ Should have failed!\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly blocked unauthorized access\n');
      }
    }

    // Test 5: Access protected route with admin token
    console.log('5️⃣ Testing admin access to create product...');
    const productRes = await axios.post(
      `${BASE_URL}/products`,
      {
        name: 'Auth Test Product',
        description: 'Product created with authentication',
        price: 149.99,
        image: 'https://via.placeholder.com/500',
        category: 'Electronics',
        stock: 20
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Product created with admin token');
    console.log(`   Product: ${productRes.data.data.name}\n`);

    console.log('✅ All authentication tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testAuth();