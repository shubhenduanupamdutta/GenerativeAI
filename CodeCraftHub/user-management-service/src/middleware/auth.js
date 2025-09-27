const jwt = require('jsonwebtoken');
const { ApiError, asyncHandler } = require('./errorHandler');
const User = require('../models/User');
const config = require('../config');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Verify JWT token
const verifyToken = (token, secret = config.jwt.secret) => {
  return jwt.verify(token, secret);
};

// Authentication middleware
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new ApiError(401, 'Token is valid but user not found');
    }

    if (user.status !== 'active') {
      throw new ApiError(401, 'Account is not active');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    throw error;
  }
});

// Authorization middleware - check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Access denied. Please authenticate.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Access denied. Insufficient permissions.');
    }

    next();
  };
};

// Check if user owns the resource or is admin
const checkOwnership = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      throw new ApiError(400, 'Resource user ID not provided');
    }

    // Allow access if user owns the resource or is admin
    if (req.user.userId !== resourceUserId && req.user.role !== 'admin') {
      throw new ApiError(403, 'Access denied. You can only access your own resources.');
    }

    next();
  });
};

// Optional authentication - doesn't throw error if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }

  next();
});

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticate,
  authorize,
  checkOwnership,
  optionalAuth,
};