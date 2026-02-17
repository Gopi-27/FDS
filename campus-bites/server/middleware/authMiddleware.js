const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 * This middleware checks if the user is authenticated
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password').populate('restaurant');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found - Token invalid');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized - Token invalid or expired');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - No token provided');
  }
});

module.exports = { protect };
