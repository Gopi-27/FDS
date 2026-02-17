const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  rejectRestaurant,
  getPendingRestaurants,
  rateRestaurant,
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/restaurants
 * @desc    Get all approved restaurants
 * @access  Public
 */
router.get('/', getRestaurants);

/**
 * @route   GET /api/restaurants/my/profile
 * @desc    Get current user's restaurant profile
 * @access  Private (Restaurant)
 */
router.get('/my/profile', protect, authorize('restaurant'), getMyRestaurant);

/**
 * @route   GET /api/restaurants/admin/pending
 * @desc    Get pending restaurants for approval
 * @access  Private (Admin)
 */
router.get('/admin/pending', protect, authorize('admin'), getPendingRestaurants);

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get single restaurant by ID
 * @access  Public
 */
router.get('/:id', getRestaurantById);

/**
 * @route   PUT /api/restaurants/:id
 * @desc    Update restaurant
 * @access  Private (Restaurant Owner or Admin)
 */
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurant);

/**
 * @route   DELETE /api/restaurants/:id
 * @desc    Delete restaurant
 * @access  Private (Admin)
 */
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

/**
 * @route   PUT /api/restaurants/:id/approve
 * @desc    Approve restaurant
 * @access  Private (Admin)
 */
router.put('/:id/approve', protect, authorize('admin'), approveRestaurant);

/**
 * @route   PUT /api/restaurants/:id/reject
 * @desc    Reject restaurant
 * @access  Private (Admin)
 */
router.put('/:id/reject', protect, authorize('admin'), rejectRestaurant);

/**
 * @route   POST /api/restaurants/:id/rate
 * @desc    Rate a restaurant
 * @access  Private (Student)
 */
router.post('/:id/rate', protect, authorize('student'), rateRestaurant);

module.exports = router;
