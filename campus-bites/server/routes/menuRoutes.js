const express = require('express');
const router = express.Router();
const {
  getMenuByRestaurant,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getMyMenuItems,
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/menu/restaurant/:restaurantId
 * @desc    Get all menu items for a specific restaurant
 * @access  Public
 */
router.get('/restaurant/:restaurantId', getMenuByRestaurant);

/**
 * @route   GET /api/menu/my/items
 * @desc    Get menu items for current restaurant owner
 * @access  Private (Restaurant)
 */
router.get('/my/items', protect, authorize('restaurant'), getMyMenuItems);

/**
 * @route   GET /api/menu/:id
 * @desc    Get single menu item by ID
 * @access  Public
 */
router.get('/:id', getMenuItemById);

/**
 * @route   POST /api/menu
 * @desc    Create new menu item
 * @access  Private (Restaurant or Admin)
 */
router.post('/', protect, authorize('restaurant', 'admin'), createMenuItem);

/**
 * @route   PUT /api/menu/:id
 * @desc    Update menu item
 * @access  Private (Restaurant Owner or Admin)
 */
router.put('/:id', protect, authorize('restaurant', 'admin'), updateMenuItem);

/**
 * @route   DELETE /api/menu/:id
 * @desc    Delete menu item
 * @access  Private (Restaurant Owner or Admin)
 */
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteMenuItem);

/**
 * @route   PATCH /api/menu/:id/availability
 * @desc    Toggle menu item availability
 * @access  Private (Restaurant)
 */
router.patch('/:id/availability', protect, authorize('restaurant', 'admin'), toggleAvailability);

module.exports = router;
