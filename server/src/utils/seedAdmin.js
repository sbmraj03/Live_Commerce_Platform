const connectDB = require('../config/database');
const { User } = require('../models');

const seedAdmin = async () => {
  try {
    await connectDB();

    console.log('🔑 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@livecommerce.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@livecommerce.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Email:', admin.email);
    console.log('🔒 Password: admin123');
    console.log('\n⚠️  Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();