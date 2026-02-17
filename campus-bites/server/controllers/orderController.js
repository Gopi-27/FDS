const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Student)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { items, restaurantId, paymentMethod } = req.body;

  // Validation
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Order must contain at least one item');
  }

  if (!restaurantId) {
    res.status(400);
    throw new Error('Restaurant ID is required');
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error('Payment method is required');
  }

  // Verify restaurant exists and is approved
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  if (restaurant.approvalStatus !== 'approved') {
    res.status(403);
    throw new Error('Cannot order from unapproved restaurant');
  }

  if (!restaurant.isOpen) {
    res.status(403);
    throw new Error('Restaurant is currently closed and not accepting orders');
  }

  // Validate and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    
    if (!menuItem) {
      res.status(404);
      throw new Error(`Menu item ${item.menuItem} not found`);
    }

    if (!menuItem.isAvailable) {
      res.status(400);
      throw new Error(`${menuItem.name} is currently unavailable`);
    }

    if (menuItem.restaurant.toString() !== restaurantId) {
      res.status(400);
      throw new Error('All items must be from the same restaurant');
    }

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    });

    totalAmount += menuItem.price * item.quantity;
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    restaurant: restaurantId,
    items: orderItems,
    totalAmount,
    paymentMethod,
    status: 'Placed',
    paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Completed',
  });

  // Populate order details
  await order.populate('user', 'name email');
  await order.populate('restaurant', 'name location');
  await order.populate('items.menuItem');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/my
 * @access  Private (Student)
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('restaurant', 'name location logo')
    .populate('items.menuItem', 'name image')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get restaurant's orders
 * @route   GET /api/orders/restaurant
 * @access  Private (Restaurant)
 */
const getRestaurantOrders = asyncHandler(async (req, res) => {
  if (req.user.role !== 'restaurant') {
    res.status(403);
    throw new Error('Only restaurant owners can access this route');
  }

  if (!req.user.restaurant) {
    res.status(400);
    throw new Error('Restaurant not found for this user');
  }

  const restaurantId = req.user.restaurant._id || req.user.restaurant;

  const { status } = req.query;
  let query = { restaurant: restaurantId };

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name image')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('restaurant', 'name location logo')
    .populate('items.menuItem');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  const userRestaurantId = req.user.restaurant?._id || req.user.restaurant;
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isRestaurantOwner = req.user.role === 'restaurant' && 
    order.restaurant._id.toString() === userRestaurantId?.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isRestaurantOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Restaurant)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Please provide order status');
  }

  const validStatuses = ['Placed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (req.user.role === 'restaurant') {
    const userRestaurantId = req.user.restaurant._id || req.user.restaurant;
    if (order.restaurant.toString() !== userRestaurantId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }
  } else if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only restaurant owners or admins can update order status');
  }

  // Define valid status transitions
  const statusHierarchy = {
    'Placed': ['Preparing', 'Cancelled'],
    'Preparing': ['Ready'],
    'Ready': ['Completed'],
    'Completed': [],
    'Cancelled': []
  };

  // Validate status transition
  const currentStatus = order.status;
  const allowedTransitions = statusHierarchy[currentStatus] || [];

  if (!allowedTransitions.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status transition. Cannot change from "${currentStatus}" to "${status}". ` +
      `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'None (order is final)'}`
    );
  }

  order.status = status;
  await order.save();

  await order.populate('user', 'name email');
  await order.populate('restaurant', 'name location');

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private (Admin)
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('restaurant', 'name location')
    .populate('items.menuItem', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * @desc    Get platform statistics (Admin only)
 * @route   GET /api/orders/admin/stats
 * @access  Private (Admin)
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  // Total orders
  const totalOrders = await Order.countDocuments();

  // Completed orders count
  const completedOrders = await Order.countDocuments({ status: 'Completed' });

  // Total revenue
  const revenueResult = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  // Top restaurants by orders
  const topRestaurants = await Order.aggregate([
    { $group: { _id: '$restaurant', orderCount: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { orderCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurantInfo'
      }
    },
    { $unwind: '$restaurantInfo' }
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      recentOrders,
      topRestaurants,
    },
  });
});

/**
 * @desc    Get restaurant statistics
 * @route   GET /api/orders/restaurant/stats
 * @access  Private (Restaurant)
 */
const getRestaurantStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'restaurant') {
    res.status(403);
    throw new Error('Only restaurant owners can access this route');
  }

  if (!req.user.restaurant) {
    res.status(400);
    throw new Error('Restaurant not found for this user');
  }

  const restaurantId = req.user.restaurant._id || req.user.restaurant;

  // Total orders
  const totalOrders = await Order.countDocuments({ restaurant: restaurantId });

  // Completed orders count
  const completedOrders = await Order.countDocuments({ 
    restaurant: restaurantId, 
    status: 'Completed' 
  });

  // Total revenue
  const revenueResult = await Order.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Recent orders
  const recentOrders = await Order.find({ restaurant: restaurantId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  // Popular items
  const popularItems = await Order.aggregate([
    { $match: { restaurant: restaurantId } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItem',
        name: { $first: '$items.name' },
        totalOrders: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalOrders: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      recentOrders,
      popularItems,
    },
  });
});

/**
 * @desc    Rate an order and update restaurant rating
 * @route   POST /api/orders/:id/rate
 * @access  Private (Student who placed the order)
 */
const rateOrder = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a valid rating between 1 and 5');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only rate your own orders');
  }

  // Check if order is completed
  if (order.status !== 'Completed') {
    res.status(400);
    throw new Error('You can only rate completed orders');
  }

  // Check if already rated
  if (order.rating) {
    res.status(400);
    throw new Error('You have already rated this order');
  }

  // Update order with rating
  order.rating = rating;
  order.review = review || '';
  order.ratedAt = new Date();
  await order.save();

  // Update restaurant rating
  const Restaurant = require('../models/Restaurant');
  const restaurant = await Restaurant.findById(order.restaurant);

  if (restaurant) {
    // Add rating to restaurant's ratings array
    restaurant.ratings.push({
      user: req.user._id,
      rating: rating,
      createdAt: new Date(),
    });

    // Recalculate average rating
    const totalRatings = restaurant.ratings.length;
    const sumRatings = restaurant.ratings.reduce((sum, r) => sum + r.rating, 0);
    restaurant.rating = (sumRatings / totalRatings).toFixed(1);
    restaurant.totalRatings = totalRatings;

    await restaurant.save();
  }

  res.json({
    success: true,
    message: 'Thank you for your rating!',
    data: order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getPlatformStats,
  getRestaurantStats,
  rateOrder,
};
