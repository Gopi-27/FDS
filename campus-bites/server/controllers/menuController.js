const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Get menu items by restaurant
 * @route   GET /api/menu/restaurant/:restaurantId
 * @access  Public
 */
const getMenuByRestaurant = asyncHandler(async (req, res) => {
  const { category, type, search } = req.query;

  // Check if restaurant exists and is open
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  if (!restaurant.isOpen) {
    res.status(403);
    throw new Error('Restaurant is currently closed');
  }

  // Build query
  let query = { restaurant: req.params.restaurantId };

  if (category) {
    query.category = category;
  }

  if (type) {
    query.type = type;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const menuItems = await MenuItem.find(query)
    .populate('restaurant', 'name location')
    .sort({ category: 1, name: 1 });

  res.json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});

/**
 * @desc    Get single menu item by ID
 * @route   GET /api/menu/:id
 * @access  Public
 */
const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('restaurant', 'name location');

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  res.json({
    success: true,
    data: menuItem,
  });
});

/**
 * @desc    Create menu item
 * @route   POST /api/menu
 * @access  Private (Restaurant)
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, type, image, restaurantId } = req.body;

  // Validation
  if (!name || !price || !category || !type) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Determine restaurant ID
  let targetRestaurantId = restaurantId;
  
  // If user is restaurant owner, use their restaurant
  if (req.user.role === 'restaurant') {
    if (!req.user.restaurant) {
      res.status(400);
      throw new Error('Restaurant not found for this user');
    }
    targetRestaurantId = req.user.restaurant._id || req.user.restaurant;
  }

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(targetRestaurantId);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Check if restaurant is approved
  if (restaurant.approvalStatus !== 'approved') {
    res.status(403);
    throw new Error('Restaurant must be approved before adding menu items');
  }

  // Check ownership (unless admin)
  if (req.user.role === 'restaurant' && restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to add menu items to this restaurant');
  }

  // Create menu item
  const menuItem = await MenuItem.create({
    restaurant: targetRestaurantId,
    name,
    description,
    price,
    category,
    type,
    image,
  });

  // Update restaurant categories if new
  if (!restaurant.categories.includes(category)) {
    restaurant.categories.push(category);
    await restaurant.save();
  }

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem,
  });
});

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 * @access  Private (Restaurant Owner or Admin)
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  let menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Check ownership (unless admin)
  if (req.user.role === 'restaurant') {
    const userRestaurantId = req.user.restaurant._id || req.user.restaurant;
    if (menuItem.restaurant._id.toString() !== userRestaurantId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this menu item');
    }
  }

  // Update menu item
  menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem,
  });
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 * @access  Private (Restaurant Owner or Admin)
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Check ownership (unless admin)
  if (req.user.role === 'restaurant') {
    const userRestaurantId = req.user.restaurant._id || req.user.restaurant;
    if (menuItem.restaurant._id.toString() !== userRestaurantId.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this menu item');
    }
  }

  await menuItem.deleteOne();

  res.json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});

/**
 * @desc    Toggle menu item availability
 * @route   PATCH /api/menu/:id/availability
 * @access  Private (Restaurant)
 */
const toggleAvailability = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Check ownership
  if (req.user.role === 'restaurant') {
    const userRestaurantId = req.user.restaurant._id || req.user.restaurant;
    if (menuItem.restaurant._id.toString() !== userRestaurantId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this menu item');
    }
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  res.json({
    success: true,
    message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
    data: menuItem,
  });
});

/**
 * @desc    Get menu items for restaurant owner's restaurant
 * @route   GET /api/menu/my/items
 * @access  Private (Restaurant)
 */
const getMyMenuItems = asyncHandler(async (req, res) => {
  if (req.user.role !== 'restaurant') {
    res.status(403);
    throw new Error('Only restaurant owners can access this route');
  }

  if (!req.user.restaurant) {
    res.status(400);
    throw new Error('Restaurant not found for this user');
  }

  const restaurantId = req.user.restaurant._id || req.user.restaurant;

  const menuItems = await MenuItem.find({ restaurant: restaurantId })
    .populate('restaurant', 'name location')
    .sort({ category: 1, name: 1 });

  res.json({
    success: true,
    count: menuItems.length,
    data: menuItems,
  });
});

module.exports = {
  getMenuByRestaurant,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getMyMenuItems,
};
