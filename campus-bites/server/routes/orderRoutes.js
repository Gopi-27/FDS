const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getPlatformStats,
  getRestaurantStats,
  rateOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private (Student)
 */
router.post('/', protect, authorize('student'), createOrder);

/**
 * @route   GET /api/orders/my
 * @desc    Get current user's orders
 * @access  Private (Student)
 */
router.get('/my', protect, authorize('student'), getMyOrders);

/**
 * @route   GET /api/orders/restaurant
 * @desc    Get restaurant's orders
 * @access  Private (Restaurant)
 */
router.get('/restaurant', protect, authorize('restaurant'), getRestaurantOrders);

/**
 * @route   GET /api/orders/restaurant/stats
 * @desc    Get restaurant statistics
 * @access  Private (Restaurant)
 */
router.get('/restaurant/stats', protect, authorize('restaurant'), getRestaurantStats);

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin)
 * @access  Private (Admin)
 */
router.get('/admin/all', protect, authorize('admin'), getAllOrders);

/**
 * @route   GET /api/orders/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin)
 */
router.get('/admin/stats', protect, authorize('admin'), getPlatformStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', protect, getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Restaurant or Admin)
 */
router.put('/:id/status', protect, authorize('restaurant', 'admin'), updateOrderStatus);

/**
 * @route   POST /api/orders/:id/rate
 * @desc    Rate an order
 * @access  Private (Student)
 */
router.post('/:id/rate', protect, authorize('student'), rateOrder);

module.exports = router;
