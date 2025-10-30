const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/products';

const testProductAPIs = async () => {
  try {
    console.log('🧪 Testing Product APIs...\n');

    // Test 1: Get all products
    console.log('1️⃣ Testing GET all products...');
    const allProducts = await axios.get(BASE_URL);
    console.log(`✅ Found ${allProducts.data.count} products\n`);

    // Test 2: Get single product
    if (allProducts.data.data.length > 0) {
      const productId = allProducts.data.data[0]._id;
      console.log('2️⃣ Testing GET single product...');
      const singleProduct = await axios.get(`${BASE_URL}/${productId}`);
      console.log(`✅ Product: ${singleProduct.data.data.name}\n`);
    }

    // Test 3: Create product
    console.log('3️⃣ Testing CREATE product...');
    const newProduct = await axios.post(BASE_URL, {
      name: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      image: 'https://via.placeholder.com/500',
      category: 'Other',
      stock: 10
    });
    console.log(`✅ Created: ${newProduct.data.data.name}\n`);

    // Test 4: Update product
    console.log('4️⃣ Testing UPDATE product...');
    const updatedProduct = await axios.put(`${BASE_URL}/${newProduct.data.data._id}`, {
      price: 89.99
    });
    console.log(`✅ Updated price to: $${updatedProduct.data.data.price}\n`);

    // Test 5: Delete product
    console.log('5️⃣ Testing DELETE product...');
    await axios.delete(`${BASE_URL}/${newProduct.data.data._id}`);
    console.log('✅ Product deleted\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testProductAPIs();