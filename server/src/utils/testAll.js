const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let testProductId = '';
let testSessionId = '';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  title: (text) => console.log(`\n${colors.cyan}${colors.bright}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`),
  test: (text) => console.log(`${colors.yellow}🧪 ${text}${colors.reset}`)
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testAll = async () => {
  try {
    log.title('🚀 LIVE COMMERCE PLATFORM - AUTOMATED TESTING');
    log.info('Testing all major features...\n');

    let passedTests = 0;
    let failedTests = 0;

    // ======================
    // 1. SERVER HEALTH CHECK
    // ======================
    log.title('1️⃣  Testing Server Health');
    try {
      log.test('Checking server connection...');
      const health = await axios.get(`${BASE_URL}/`);
      if (health.data.status === 'Running') {
        log.success('Server is running');
        passedTests++;
      }
    } catch (error) {
      log.error('Server connection failed');
      failedTests++;
    }

    await delay(500);

    // ======================
    // 2. AUTHENTICATION
    // ======================
    log.title('2️⃣  Testing Authentication');
    
    // Test Admin Login
    try {
      log.test('Testing admin login...');
      const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@livecommerce.com',
        password: 'admin123'
      });
      adminToken = loginRes.data.data.token;
      log.success('Admin login successful');
      log.info(`Token: ${adminToken.substring(0, 30)}...`);
      passedTests++;
    } catch (error) {
      log.error('Admin login failed');
      failedTests++;
    }

    // Test Get Current User
    try {
      log.test('Testing get current user...');
      const meRes = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log.success(`Logged in as: ${meRes.data.data.name} (${meRes.data.data.role})`);
      passedTests++;
    } catch (error) {
      log.error('Get current user failed');
      failedTests++;
    }

    await delay(500);

    // ======================
    // 3. PRODUCT MANAGEMENT
    // ======================
    log.title('3️⃣  Testing Product Management');

    // Test Get All Products
    try {
      log.test('Testing get all products...');
      const productsRes = await axios.get(`${BASE_URL}/api/products`);
      log.success(`Found ${productsRes.data.count} products`);
      passedTests++;
    } catch (error) {
      log.error('Get products failed');
      failedTests++;
    }

    // Test Create Product
    try {
      log.test('Testing create product...');
      const createRes = await axios.post(
        `${BASE_URL}/api/products`,
        {
          name: 'Automated Test Product',
          description: 'This product was created by automated test',
          price: 99.99,
          image: 'https://via.placeholder.com/500',
          category: 'Electronics',
          stock: 50
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      testProductId = createRes.data.data._id;
      log.success(`Product created: ${createRes.data.data.name}`);
      log.info(`Product ID: ${testProductId}`);
      passedTests++;
    } catch (error) {
      log.error('Create product failed');
      failedTests++;
    }

    // Test Update Product
    try {
      log.test('Testing update product...');
      await axios.put(
        `${BASE_URL}/api/products/${testProductId}`,
        { price: 79.99, stock: 40 },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log.success('Product updated successfully');
      passedTests++;
    } catch (error) {
      log.error('Update product failed');
      failedTests++;
    }

    // Test Get Single Product
    try {
      log.test('Testing get single product...');
      const productRes = await axios.get(`${BASE_URL}/api/products/${testProductId}`);
      log.success(`Retrieved product: ${productRes.data.data.name}`);
      passedTests++;
    } catch (error) {
      log.error('Get single product failed');
      failedTests++;
    }

    await delay(500);

    // ======================
    // 4. SESSION MANAGEMENT
    // ======================
    log.title('4️⃣  Testing Session Management');

    // Test Create Session
    try {
      log.test('Testing create session...');
      const createSessionRes = await axios.post(
        `${BASE_URL}/api/sessions`,
        {
          title: 'Automated Test Session',
          description: 'Created by automated test',
          hostName: 'Test Admin',
          products: [testProductId]
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      testSessionId = createSessionRes.data.data._id;
      log.success(`Session created: ${createSessionRes.data.data.title}`);
      log.info(`Session ID: ${testSessionId}`);
      passedTests++;
    } catch (error) {
      log.error('Create session failed');
      failedTests++;
    }

    // Test Get All Sessions
    try {
      log.test('Testing get all sessions...');
      const sessionsRes = await axios.get(`${BASE_URL}/api/sessions`);
      log.success(`Found ${sessionsRes.data.count} sessions`);
      passedTests++;
    } catch (error) {
      log.error('Get sessions failed');
      failedTests++;
    }

    // Test Start Session
    try {
      log.test('Testing start session...');
      await axios.put(
        `${BASE_URL}/api/sessions/${testSessionId}/start`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log.success('Session started successfully');
      passedTests++;
    } catch (error) {
      log.error('Start session failed');
      failedTests++;
    }

    // Test Get Live Session
    try {
      log.test('Testing get live session...');
      const liveRes = await axios.get(`${BASE_URL}/api/sessions/live/current`);
      log.success(`Live session: ${liveRes.data.data.title}`);
      passedTests++;
    } catch (error) {
      log.error('Get live session failed');
      failedTests++;
    }

    await delay(1000);

    // Test End Session
    try {
      log.test('Testing end session...');
      await axios.put(
        `${BASE_URL}/api/sessions/${testSessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log.success('Session ended successfully');
      passedTests++;
    } catch (error) {
      log.error('End session failed');
      failedTests++;
    }

    await delay(500);

    // ======================
    // 5. ANALYTICS
    // ======================
    log.title('5️⃣  Testing Analytics');

    // Test Session Analytics
    try {
      log.test('Testing session analytics...');
      const analyticsRes = await axios.get(`${BASE_URL}/api/analytics/session/${testSessionId}`);
      log.success('Analytics retrieved successfully');
      log.info(`Total Reactions: ${analyticsRes.data.data.engagement.totalReactions}`);
      log.info(`Total Questions: ${analyticsRes.data.data.engagement.totalQuestions}`);
      passedTests++;
    } catch (error) {
      log.error('Get analytics failed');
      failedTests++;
    }

    await delay(500);

    // ======================
    // 6. CLEANUP
    // ======================
    log.title('6️⃣  Cleaning Up Test Data');

    // Delete Test Session
    try {
      log.test('Deleting test session...');
      await axios.delete(
        `${BASE_URL}/api/sessions/${testSessionId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log.success('Test session deleted');
      passedTests++;
    } catch (error) {
      log.error('Delete session failed');
      failedTests++;
    }

    // Delete Test Product
    try {
      log.test('Deleting test product...');
      await axios.delete(
        `${BASE_URL}/api/products/${testProductId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log.success('Test product deleted');
      passedTests++;
    } catch (error) {
      log.error('Delete product failed');
      failedTests++;
    }

    // ======================
    // FINAL RESULTS
    // ======================
    log.title('📊 TESTING RESULTS');
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.green}✅ Passed Tests: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}❌ Failed Tests: ${failedTests}${colors.reset}`);
    console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50) + '\n');

    if (failedTests === 0) {
      log.success('🎉 ALL TESTS PASSED! Your platform is working perfectly!');
    } else {
      log.error(`⚠️  Some tests failed. Please check the errors above.`);
    }

  } catch (error) {
    log.error('Testing failed with error:');
    console.error(error.message);
  }
};

testAll();