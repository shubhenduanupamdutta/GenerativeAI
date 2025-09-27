const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { generateToken, generateRefreshToken, verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Helper function to handle validation errors
const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ApiError(400, errorMessages);
  }
};

// Register new user
const register = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { email, username, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, 'User with this email already exists');
    }
    if (existingUser.username === username) {
      throw new ApiError(409, 'Username is already taken');
    }
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    email,
    username,
    password,
    firstName,
    lastName,
    emailVerificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // Generate tokens
  const accessToken = generateToken({ id: user._id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user._id });

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '7d',
      },
    },
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { email, password, rememberMe = false } = req.body;

  // Find user by email or username
  const user = await User.findByEmailOrUsername(email).select('+password +loginAttempts +lockUntil');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new ApiError(423, 'Account is temporarily locked due to too many failed login attempts');
  }

  // Check if account is active
  if (user.status !== 'active') {
    throw new ApiError(401, 'Account is not active. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new ApiError(401, 'Invalid credentials');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLoginAt = new Date();
  user.lastActiveAt = new Date();
  await user.save();

  // Generate tokens
  const tokenExpiry = rememberMe ? '30d' : '7d';
  const accessToken = generateToken({ id: user._id, email: user.email }, tokenExpiry);
  const refreshToken = generateRefreshToken({ id: user._id });

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: tokenExpiry,
      },
    },
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just return success
  
  logger.info(`User logged out: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Refresh access token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateToken({ id: user._id, email: user.email });

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: '7d',
      },
    });
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  // Update user
  user.emailVerified = true;
  user.status = 'active';
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.info(`Email verified for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

// Resend verification email
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.emailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // TODO: Send verification email

  res.json({
    success: true,
    message: 'Verification email sent successfully',
  });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal that user doesn't exist
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // TODO: Send password reset email

  logger.info(`Password reset requested for user: ${user.email}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { token, password } = req.body;

  // Hash the token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset successful for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password reset successful',
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

// Delete account
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Soft delete - mark as inactive
  user.status = 'inactive';
  user.deletedAt = new Date();
  await user.save();

  logger.info(`Account deleted for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  deleteAccount,
};