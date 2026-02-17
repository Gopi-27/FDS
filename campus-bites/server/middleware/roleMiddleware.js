/**
 * Role-based access control middleware
 * This middleware checks if the authenticated user has the required role(s)
 */

/**
 * Check if user has required role
 * @param  {...string} roles - Allowed roles
 * @returns middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

/**
 * Check if restaurant owner is accessing their own data
 */
const checkRestaurantOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      // Admins can access any restaurant
      return next();
    }

    if (req.user.role !== 'restaurant') {
      res.status(403);
      throw new Error('Only restaurant owners can perform this action');
    }

    // Check if the restaurant belongs to the user
    const restaurantId = req.params.restaurantId || req.params.id;
    
    if (!req.user.restaurant) {
      res.status(403);
      throw new Error('Restaurant not found for this user');
    }

    if (req.user.restaurant._id.toString() !== restaurantId && 
        req.user.restaurant.toString() !== restaurantId) {
      res.status(403);
      throw new Error('Not authorized to access this restaurant');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authorize, checkRestaurantOwnership };
