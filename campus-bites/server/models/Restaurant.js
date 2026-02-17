const mongoose = require('mongoose');

/**
 * Restaurant Schema
 * Contains restaurant information and approval status
 */
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      trim: true,
      maxlength: [100, 'Restaurant name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide restaurant description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide restaurant location'],
    },
    customerCareNumber: {
      type: String,
      required: [true, 'Please provide customer care number'],
      trim: true,
    },
    logo: {
      type: String,
      default: 'https://via.placeholder.com/200x200?text=Restaurant+Logo',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    // Store individual ratings for calculation
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to calculate average rating
restaurantSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.rating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.rating = Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal
    this.totalRatings = this.ratings.length;
  }
};

// Create indexes
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ approvalStatus: 1 });
restaurantSchema.index({ name: 'text', description: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
