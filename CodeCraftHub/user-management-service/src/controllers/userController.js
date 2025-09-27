const { validationResult } = require('express-validator');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Helper function to handle validation errors
const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ApiError(400, errorMessages);
  }
};

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(filter)
    .select('-password -emailVerificationToken -passwordResetToken')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    },
  });
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

// Update current user
const updateCurrentUser = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const allowedFields = [
    'firstName',
    'lastName',
    'bio',
    'phone',
    'location',
    'preferences',
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  logger.info(`User profile updated: ${user.email}`);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
});

// Delete current user
const deleteCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Soft delete
  user.status = 'inactive';
  user.deletedAt = new Date();
  await user.save();

  logger.info(`User account deleted: ${user.email}`);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// Get user by ID (admin only)
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId })
    .select('-password -emailVerificationToken -passwordResetToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

// Update user (admin only)
const updateUser = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { userId } = req.params;

  const allowedFields = [
    'firstName',
    'lastName',
    'bio',
    'phone',
    'location',
    'status',
    'preferences',
    'subscription',
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findOneAndUpdate(
    { userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  logger.info(`User updated by admin: ${user.email}`);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user,
    },
  });
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Soft delete
  user.status = 'inactive';
  user.deletedAt = new Date();
  await user.save();

  logger.info(`User deleted by admin: ${user.email}`);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// Update user status (admin only)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const user = await User.findOneAndUpdate(
    { userId },
    { status },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  logger.info(`User status updated: ${user.email} -> ${status}`);

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: {
      user,
    },
  });
});

// Search users
const searchUsers = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { q: query, skills, interests, level } = req.query;

  // Build search filter
  const filter = {
    status: 'active',
    emailVerified: true,
    'preferences.privacy.profileVisibility': { $in: ['public'] },
  };

  if (query) {
    filter.$or = [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
    ];
  }

  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    filter['learningProfile.skills.name'] = { $in: skillsArray };
  }

  if (interests) {
    const interestsArray = Array.isArray(interests) ? interests : [interests];
    filter['learningProfile.interests'] = { $in: interestsArray };
  }

  if (level) {
    filter['learningProfile.currentLevel'] = level;
  }

  const users = await User.find(filter)
    .select('userId username firstName lastName avatar bio learningProfile.currentLevel learningProfile.skills learningProfile.interests location createdAt')
    .sort({ lastActiveAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    },
  });
});

// Get public profile
const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({
    userId,
    status: 'active',
    'preferences.privacy.profileVisibility': { $in: ['public'] },
  }).select('userId username firstName lastName avatar bio learningProfile location createdAt');

  if (!user) {
    throw new ApiError(404, 'User not found or profile is private');
  }

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

// Get user preferences
const getUserPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('preferences');

  res.json({
    success: true,
    data: {
      preferences: user.preferences,
    },
  });
});

// Update user preferences
const updateUserPreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { preferences },
    { new: true, runValidators: true }
  ).select('preferences');

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences,
    },
  });
});

// Get learning profile
const getLearningProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('learningProfile');

  res.json({
    success: true,
    data: {
      learningProfile: user.learningProfile,
    },
  });
});

// Update learning profile
const updateLearningProfile = asyncHandler(async (req, res) => {
  const { learningProfile } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { learningProfile },
    { new: true, runValidators: true }
  ).select('learningProfile');

  res.json({
    success: true,
    message: 'Learning profile updated successfully',
    data: {
      learningProfile: user.learningProfile,
    },
  });
});

// Add skill
const addSkill = asyncHandler(async (req, res) => {
  const { name, level = 'beginner' } = req.body;

  if (!name) {
    throw new ApiError(400, 'Skill name is required');
  }

  const user = await User.findById(req.user._id);

  // Check if skill already exists
  const existingSkill = user.learningProfile.skills.find(skill => skill.name === name);
  if (existingSkill) {
    throw new ApiError(400, 'Skill already exists');
  }

  user.learningProfile.skills.push({ name, level });
  await user.save();

  res.json({
    success: true,
    message: 'Skill added successfully',
    data: {
      skills: user.learningProfile.skills,
    },
  });
});

// Update skill
const updateSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { level, endorsements } = req.body;

  const user = await User.findById(req.user._id);
  const skill = user.learningProfile.skills.id(skillId);

  if (!skill) {
    throw new ApiError(404, 'Skill not found');
  }

  if (level) skill.level = level;
  if (endorsements !== undefined) skill.endorsements = endorsements;

  await user.save();

  res.json({
    success: true,
    message: 'Skill updated successfully',
    data: {
      skill,
    },
  });
});

// Remove skill
const removeSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const user = await User.findById(req.user._id);
  user.learningProfile.skills.id(skillId).remove();
  await user.save();

  res.json({
    success: true,
    message: 'Skill removed successfully',
  });
});

// Add learning goal
const addLearningGoal = asyncHandler(async (req, res) => {
  const { title, description, targetDate } = req.body;

  if (!title) {
    throw new ApiError(400, 'Goal title is required');
  }

  const user = await User.findById(req.user._id);
  user.learningProfile.learningGoals.push({ title, description, targetDate });
  await user.save();

  res.json({
    success: true,
    message: 'Learning goal added successfully',
    data: {
      goals: user.learningProfile.learningGoals,
    },
  });
});

// Update learning goal
const updateLearningGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { title, description, targetDate, completed } = req.body;

  const user = await User.findById(req.user._id);
  const goal = user.learningProfile.learningGoals.id(goalId);

  if (!goal) {
    throw new ApiError(404, 'Learning goal not found');
  }

  if (title) goal.title = title;
  if (description) goal.description = description;
  if (targetDate) goal.targetDate = targetDate;
  if (completed !== undefined) goal.completed = completed;

  await user.save();

  res.json({
    success: true,
    message: 'Learning goal updated successfully',
    data: {
      goal,
    },
  });
});

// Remove learning goal
const removeLearningGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  const user = await User.findById(req.user._id);
  user.learningProfile.learningGoals.id(goalId).remove();
  await user.save();

  res.json({
    success: true,
    message: 'Learning goal removed successfully',
  });
});

// Get user statistics
const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const stats = {
    accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
    skillsCount: user.learningProfile.skills.length,
    goalsCount: user.learningProfile.learningGoals.length,
    completedGoals: user.learningProfile.learningGoals.filter(goal => goal.completed).length,
    lastActive: user.lastActiveAt,
    emailVerified: user.emailVerified,
    subscriptionPlan: user.subscription.plan,
  };

  res.json({
    success: true,
    data: {
      stats,
    },
  });
});

// Get system statistics (admin only)
const getSystemStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const pendingUsers = await User.countDocuments({ status: 'pending' });
  const suspendedUsers = await User.countDocuments({ status: 'suspended' });
  const verifiedUsers = await User.countDocuments({ emailVerified: true });

  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
  });

  const subscriptionStats = await User.aggregate([
    {
      $group: {
        _id: '$subscription.plan',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
        verified: verifiedUsers,
        recentSignups: recentUsers,
      },
      subscriptions: subscriptionStats,
    },
  });
});

module.exports = {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  searchUsers,
  getPublicProfile,
  getUserPreferences,
  updateUserPreferences,
  getLearningProfile,
  updateLearningProfile,
  addSkill,
  updateSkill,
  removeSkill,
  addLearningGoal,
  updateLearningGoal,
  removeLearningGoal,
  getUserStats,
  getSystemStats,
};