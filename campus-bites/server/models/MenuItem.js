const mongoose = require('mongoose');

/**
 * MenuItem Schema
 * Contains food items for each restaurant
 */
const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Menu item must belong to a restaurant'],
    },
    name: {
      type: String,
      required: [true, 'Please provide menu item name'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide item price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide item category'],
      enum: {
        values: [
          'Pizza',
          'Burger',
          'Biryani',
          'Pasta',
          'Dessert',
          'Beverage',
          'Salad',
          'Sandwich',
          'Chinese',
          'Indian',
          'Continental',
          'Other',
        ],
        message: 'Please select a valid category',
      },
    },
    type: {
      type: String,
      required: [true, 'Please specify if item is veg or non-veg'],
      enum: {
        values: ['veg', 'non-veg'],
        message: 'Type must be either veg or non-veg',
      },
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Food+Item',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
menuItemSchema.index({ restaurant: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
