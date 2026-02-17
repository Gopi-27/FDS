const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

/**
 * Test Login Credentials
 * This script tests if the seeded passwords work correctly
 */

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    const testCredentials = [
      { email: 'admin@campus.edu', password: 'admin123', role: 'Admin' },
      { email: 'student@campus.edu', password: 'student123', role: 'Student' },
      { email: 'restaurant@campus.edu', password: 'restaurant123', role: 'Restaurant' },
    ];

    console.log('🧪 Testing Login Credentials...\n');
    console.log('┌─────────────┬──────────────────────────┬──────────────┐');
    console.log('│ Role        │ Email                    │ Status       │');
    console.log('├─────────────┼──────────────────────────┼──────────────┤');

    for (const cred of testCredentials) {
      const user = await User.findOne({ email: cred.email }).select('+password');
      
      if (!user) {
        console.log(`│ ${cred.role.padEnd(11)} │ ${cred.email.padEnd(24)} │ ❌ Not Found │`);
        continue;
      }

      const isMatch = await user.matchPassword(cred.password);
      const status = isMatch ? '✅ Valid   ' : '❌ Invalid ';
      console.log(`│ ${cred.role.padEnd(11)} │ ${cred.email.padEnd(24)} │ ${status} │`);

      // Additional debugging
      if (!isMatch) {
        console.log(`│   → Stored password starts with: ${user.password.substring(0, 10)}...`);
      }
    }

    console.log('└─────────────┴──────────────────────────┴──────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testLogin();
