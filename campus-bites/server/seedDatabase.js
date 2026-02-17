const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

/**
 * Database Seeding Script
 * Creates: 1 admin, 1 student, 1 restaurant with owner
 * 
 * IMPORTANT: This script uses plain passwords.
 * The User model's pre-save hook automatically hashes them with bcrypt.
 * 
 * Usage: node seedDatabase.js
 */

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // ========== CLEAR EXISTING DATA ==========
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    console.log('✅ Data cleared');

    // ========== CREATE USERS ==========
    console.log('\n👥 Creating users...');

    // NOTE: Passwords are plain text here.
    // The User model's pre-save hook will automatically hash them with bcrypt.
    // DO NOT manually hash here, or you'll get double-hashing!

    // 1. Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // 2. Student User
    const student = await User.create({
      name: 'John Student',
      email: 'student@campus.edu',
      password: 'student123', // Will be hashed by pre-save hook
      role: 'student',
    });
    console.log(`✅ Student created: ${student.email}`);

    // 3. Restaurant Owner User (create first, without restaurant link)
    const restaurantOwner = await User.create({
      name: 'Pizza Owner',
      email: 'restaurant@campus.edu',
      password: 'restaurant123', // Will be hashed by pre-save hook
      role: 'restaurant',
      restaurant: null, // Will be set after restaurant creation
    });
    console.log(`✅ Restaurant owner created: ${restaurantOwner.email}`);

    // 4. Create Restaurant (with owner reference)
    const restaurant = await Restaurant.create({
      name: 'Campus Pizza',
      description: 'Best pizza on campus! Fresh ingredients, quick service.',
      location: 'Central Campus, Building A',
      categories: ['Pizza', 'Italian', 'Fast Food'],
      logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      owner: restaurantOwner._id, // Set owner immediately
      approvalStatus: 'approved', // Pre-approved so they can login immediately
      rating: 4.5,
      totalRatings: 0,
    });
    console.log(`✅ Restaurant created: ${restaurant.name}`);

    // 5. Update restaurant owner with restaurant reference
    restaurantOwner.restaurant = restaurant._id;
    await restaurantOwner.save();
    console.log('✅ Restaurant linked to owner');

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 LOGIN CREDENTIALS:\n');
    console.log('┌─────────────┬──────────────────────────┬──────────────────┐');
    console.log('│ Role        │ Email                    │ Password         │');
    console.log('├─────────────┼──────────────────────────┼──────────────────┤');
    console.log('│ Admin       │ admin@campus.edu         │ admin123         │');
    console.log('│ Student     │ student@campus.edu       │ student123       │');
    console.log('│ Restaurant  │ restaurant@campus.edu    │ restaurant123    │');
    console.log('└─────────────┴──────────────────────────┴──────────────────┘');
    console.log('\n📝 Restaurant Details:');
    console.log(`   Name: ${restaurant.name}`);
    console.log(`   Status: ${restaurant.approvalStatus}`);
    console.log(`   Location: ${restaurant.location}`);
    console.log('\n🚀 You can now start the server and login!');
    console.log('   Backend: npm run dev');
    console.log('   Frontend: npm start\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
