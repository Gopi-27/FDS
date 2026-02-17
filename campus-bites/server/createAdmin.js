const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

/**
 * Create Admin User Script
 * Creates ONLY an admin user without deleting any data
 * Safe to run even if database has existing data
 * 
 * Usage: node createAdmin.js
 */

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@campus.edu' });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\n💡 If you forgot the password, use: admin123');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: hashedPassword,
      role: 'admin',
    });

    // Success message
    console.log('\n' + '='.repeat(60));
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 Admin Credentials:\n');
    console.log('┌──────────────────────────┬──────────────────┐');
    console.log('│ Email                    │ Password         │');
    console.log('├──────────────────────────┼──────────────────┤');
    console.log('│ admin@campus.edu         │ admin123         │');
    console.log('└──────────────────────────┴──────────────────┘');
    console.log('\n🚀 You can now login as admin!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
