const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

/**
 * @desc    Get all approved restaurants
 * @route   GET /api/restaurants
 * @access  Public
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const { search, location, category } = req.query;

  // Build query
  let query = { approvalStatus: 'approved' };

  if (search) {
    query.$text = { $search: search };
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (category) {
    query.categories = { $in: [category] };
  }

  const restaurants = await Restaurant.find(query)
    .populate('owner', 'name email')
    .sort({ rating: -1, createdAt: -1 });

  res.json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

/**
 * @desc    Get single restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  res.json({
    success: true,
    data: restaurant,
  });
});

/**
 * @desc    Get restaurant by owner (current user)
 * @route   GET /api/restaurants/my/profile
 * @access  Private (Restaurant)
 */
const getMyRestaurant = asyncHandler(async (req, res) => {
  if (req.user.role !== 'restaurant') {
    res.status(403);
    throw new Error('Only restaurant owners can access this route');
  }

  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant profile not found');
  }

  res.json({
    success: true,
    data: restaurant,
  });
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private (Restaurant Owner or Admin)
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this restaurant');
  }

  // Update restaurant
  restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Restaurant updated successfully',
    data: restaurant,
  });
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private (Admin only)
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Delete all menu items for this restaurant
  await MenuItem.deleteMany({ restaurant: req.params.id });

  // Delete the restaurant
  await restaurant.deleteOne();

  res.json({
    success: true,
    message: 'Restaurant and associated menu items deleted successfully',
  });
});

/**
 * @desc    Approve restaurant (Admin only)
 * @route   PUT /api/restaurants/:id/approve
 * @access  Private (Admin)
 */
const approveRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  restaurant.approvalStatus = 'approved';
  await restaurant.save();

  res.json({
    success: true,
    message: 'Restaurant approved successfully',
    data: restaurant,
  });
});

/**
 * @desc    Reject restaurant (Admin only)
 * @route   PUT /api/restaurants/:id/reject
 * @access  Private (Admin)
 */
const rejectRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  restaurant.approvalStatus = 'rejected';
  await restaurant.save();

  res.json({
    success: true,
    message: 'Restaurant rejected',
    data: restaurant,
  });
});

/**
 * @desc    Get pending restaurants (Admin only)
 * @route   GET /api/restaurants/admin/pending
 * @access  Private (Admin)
 */
const getPendingRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ approvalStatus: 'pending' })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

/**
 * @desc    Rate a restaurant
 * @route   POST /api/restaurants/:id/rate
 * @access  Private (Student)
 */
const rateRestaurant = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a valid rating between 1 and 5');
  }

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Check if user already rated
  const existingRatingIndex = restaurant.ratings.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingRatingIndex !== -1) {
    // Update existing rating
    restaurant.ratings[existingRatingIndex].rating = rating;
    restaurant.ratings[existingRatingIndex].createdAt = Date.now();
  } else {
    // Add new rating
    restaurant.ratings.push({
      user: req.user._id,
      rating,
    });
  }

  // Recalculate average rating
  restaurant.calculateAverageRating();
  await restaurant.save();

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      rating: restaurant.rating,
      totalRatings: restaurant.totalRatings,
    },
  });
});

module.exports = {
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  rejectRestaurant,
  getPendingRestaurants,
  rateRestaurant,
};
