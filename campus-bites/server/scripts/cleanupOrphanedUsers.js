const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const cleanupOrphanedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find restaurant users without a restaurant reference
    const orphanedUsers = await User.find({
      role: 'restaurant',
      restaurant: null
    });

    console.log(`Found ${orphanedUsers.length} orphaned restaurant users`);

    if (orphanedUsers.length > 0) {
      // Delete orphaned users
      for (const user of orphanedUsers) {
        console.log(`Deleting orphaned user: ${user.email}`);
        await User.findByIdAndDelete(user._id);
      }
      console.log('✅ Successfully cleaned up orphaned restaurant users');
    } else {
      console.log('✅ No orphaned users found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up orphaned users:', error);
    process.exit(1);
  }
};

cleanupOrphanedUsers();
