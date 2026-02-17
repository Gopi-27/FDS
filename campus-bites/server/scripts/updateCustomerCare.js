const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

// Dummy customer care numbers
const dummyNumbers = [
  '9876543210',
  '9876543211',
  '9876543212',
  '9876543213',
  '9876543214',
  '9876543215',
  '9876543216',
  '9876543217',
  '9876543218',
  '9876543219',
  '9876543220',
  '9876543221',
  '9876543222',
  '9876543223',
  '9876543224',
  '9876543225'
];

const updateCustomerCare = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all restaurants without customer care number
    const restaurants = await Restaurant.find({
      $or: [
        { customerCareNumber: { $exists: false } },
        { customerCareNumber: null },
        { customerCareNumber: '' }
      ]
    });

    console.log(`Found ${restaurants.length} restaurants without customer care number`);

    // Update each restaurant with a dummy number
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      const dummyNumber = dummyNumbers[i % dummyNumbers.length];
      
      restaurant.customerCareNumber = dummyNumber;
      await restaurant.save();
      
      console.log(`Updated ${restaurant.name} with customer care number: ${dummyNumber}`);
    }

    console.log('✅ Successfully updated all restaurants with customer care numbers');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating customer care numbers:', error);
    process.exit(1);
  }
};

updateCustomerCare();
