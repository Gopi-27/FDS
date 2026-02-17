const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (student or restaurant)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, restaurantData } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Validate role
  if (!['student', 'restaurant', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role specified');
  }

  // Create user first (without restaurant reference for restaurant owners)
  const user = await User.create({
    name,
    email,
    password,
    role,
    restaurant: null, // Will be set after restaurant creation for restaurant role
  });

  // For restaurant registration, create restaurant profile AFTER user creation
  let restaurantId = null;
  if (role === 'restaurant') {
    if (!restaurantData || !restaurantData.name || !restaurantData.description || !restaurantData.location || !restaurantData.customerCareNumber) {
      // Delete the user if restaurant data is invalid
      await User.findByIdAndDelete(user._id);
      res.status(400);
      throw new Error('Please provide all restaurant details including customer care number');
    }

    try {
      // Create restaurant with the user as owner
      const restaurant = await Restaurant.create({
        name: restaurantData.name,
        description: restaurantData.description,
        location: restaurantData.location,
        customerCareNumber: restaurantData.customerCareNumber,
        logo: restaurantData.logo || undefined,
        categories: restaurantData.categories || [],
        owner: user._id, // Set owner to the newly created user
        approvalStatus: 'pending',
      });

      restaurantId = restaurant._id;

      // Update user with restaurant reference
      user.restaurant = restaurantId;
      await user.save();
    } catch (error) {
      // If restaurant creation fails, delete the user to maintain data integrity
      await User.findByIdAndDelete(user._id);
      res.status(400);
      throw new Error(`Restaurant creation failed: ${error.message}`);
    }
  }

  if (user) {
    res.status(201).json({
      success: true,
      message: role === 'restaurant' 
        ? 'Restaurant registered successfully. Awaiting admin approval.' 
        : 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: restaurantId,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check if user exists (include password for comparison)
  const user = await User.findOne({ email }).select('+password').populate('restaurant');

  if (user && (await user.matchPassword(password))) {
    // Check if restaurant and if it's approved
    if (user.role === 'restaurant') {
      if (!user.restaurant) {
        res.status(403);
        throw new Error('Restaurant profile not found');
      }
      if (user.restaurant.approvalStatus === 'pending') {
        res.status(403);
        throw new Error('Restaurant registration is pending admin approval');
      }
      if (user.restaurant.approvalStatus === 'rejected') {
        res.status(403);
        throw new Error('Restaurant registration was rejected');
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('restaurant');

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurant: user.restaurant,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
