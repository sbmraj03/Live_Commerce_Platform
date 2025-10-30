const connectDB = require('../config/database');
const Product = require('../models/Product');
const Session = require('../models/Session');

const seedProducts = [
  // 🖥️ Electronics
  {
    name: 'Boat Rockerz 450 Headphones',
    description: 'Wireless Bluetooth on-ear headphones with deep bass and 15-hour battery life',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    stock: 60
  },
  {
    name: 'Noise ColorFit Pulse 2 Smartwatch',
    description: '1.8-inch display smartwatch with SpO2, heart rate monitor, and 10-day battery life',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    stock: 45
  },
  {
    name: 'Mi Power Bank 3i 10000mAh',
    description: 'Fast charging 18W dual output power bank for mobiles and gadgets',
    price: 1099,
    image: 'https://images.unsplash.com/photo-1580894894513-379946c58b83?w=500',
    category: 'Electronics',
    stock: 80
  },

  // 📚 Books
  {
    name: 'Atomic Habits (Paperback)',
    description: 'James Clear’s bestselling guide on building good habits and breaking bad ones',
    price: 499,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
    category: 'Books',
    stock: 120
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel',
    price: 399,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500',
    category: 'Books',
    stock: 100
  },

  // 🏋️ Sports
  {
    name: 'Nivia Storm Football',
    description: 'Durable rubberized football ideal for training and outdoor play',
    price: 899,
    image: 'https://images.unsplash.com/photo-1593032457869-7c66f3a75d5b?w=500',
    category: 'Sports',
    stock: 50
  },
  {
    name: 'Strauss Yoga Mat 6mm',
    description: 'Non-slip, high-density yoga mat for home workouts and meditation',
    price: 749,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'Sports',
    stock: 70
  },

  // 💄 Beauty
  {
    name: 'Mamaearth Ubtan Face Wash',
    description: 'Natural face wash with turmeric and saffron for glowing skin',
    price: 299,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
    category: 'Beauty',
    stock: 100
  },
  {
    name: 'Plum Green Tea Night Gel',
    description: 'Oil-free night cream that hydrates and clears acne-prone skin',
    price: 575,
    image: 'https://images.unsplash.com/photo-1589987607627-616cac5c55b9?w=500',
    category: 'Beauty',
    stock: 85
  },

  // 👗 Fashion / Other
  {
    name: 'Allen Solly Men’s Casual Shirt',
    description: 'Slim-fit cotton shirt perfect for office or casual wear',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
    category: 'Fashion',
    stock: 40
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Session.deleteMany({});

    console.log('📦 Seeding products...');
    const products = await Product.insertMany(seedProducts);
    console.log(`✅ ${products.length} products created`);

    console.log('🎥 Creating sample session...');
    const session = await Session.create({
      title: 'Diwali Dhamaka Sale 2025',
      description: 'Exclusive festive deals on top Indian lifestyle products',
      products: products.slice(0, 4).map(p => p._id),
      status: 'scheduled',
      hostName: 'Shubham Kumar'
    });
    console.log('✅ Sample session created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Data:');
    console.log('- Products:', products.length);
    console.log('- Sessions:', 1);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
