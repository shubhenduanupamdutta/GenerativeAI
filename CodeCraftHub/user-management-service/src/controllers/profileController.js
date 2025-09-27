const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
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

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      profile: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        learningProfile: user.learningProfile,
        preferences: user.preferences,
        subscription: user.subscription,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      },
    },
  });
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const allowedFields = [
    'firstName',
    'lastName',
    'bio',
    'phone',
    'location',
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

  logger.info(`Profile updated: ${user.email}`);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      profile: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
      },
    },
  });
});

// Upload avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar if exists
  if (user.avatar) {
    try {
      const oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(user.avatar));
      await fs.unlink(oldAvatarPath);
    } catch (error) {
      logger.warn(`Failed to delete old avatar: ${error.message}`);
    }
  }

  // Update user with new avatar path
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  user.avatar = avatarUrl;
  await user.save();

  logger.info(`Avatar uploaded: ${user.email}`);

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatar: avatarUrl,
    },
  });
});

// Delete avatar
const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.avatar) {
    throw new ApiError(400, 'No avatar to delete');
  }

  // Delete avatar file
  try {
    const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(user.avatar));
    await fs.unlink(avatarPath);
  } catch (error) {
    logger.warn(`Failed to delete avatar file: ${error.message}`);
  }

  // Remove avatar from user
  user.avatar = null;
  await user.save();

  logger.info(`Avatar deleted: ${user.email}`);

  res.json({
    success: true,
    message: 'Avatar deleted successfully',
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
  const allowedFields = [
    'currentLevel',
    'interests',
    'preferredLearningStyle',
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[`learningProfile.${field}`] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('learningProfile');

  logger.info(`Learning profile updated: ${req.user.email}`);

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

  if (!name || name.trim().length === 0) {
    throw new ApiError(400, 'Skill name is required');
  }

  const user = await User.findById(req.user._id);

  // Check if skill already exists
  const existingSkill = user.learningProfile.skills.find(
    skill => skill.name.toLowerCase() === name.toLowerCase()
  );

  if (existingSkill) {
    throw new ApiError(400, 'Skill already exists');
  }

  // Add new skill
  user.learningProfile.skills.push({
    name: name.trim(),
    level,
    endorsements: 0,
  });

  await user.save();

  logger.info(`Skill added: ${name} for user ${user.email}`);

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
  const { skillName } = req.params;
  const { level, endorsements } = req.body;

  const user = await User.findById(req.user._id);

  const skill = user.learningProfile.skills.find(
    s => s.name.toLowerCase() === skillName.toLowerCase()
  );

  if (!skill) {
    throw new ApiError(404, 'Skill not found');
  }

  if (level && ['beginner', 'intermediate', 'advanced', 'expert'].includes(level)) {
    skill.level = level;
  }

  if (typeof endorsements === 'number' && endorsements >= 0) {
    skill.endorsements = endorsements;
  }

  await user.save();

  logger.info(`Skill updated: ${skillName} for user ${user.email}`);

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
  const { skillName } = req.params;

  const user = await User.findById(req.user._id);

  const skillIndex = user.learningProfile.skills.findIndex(
    s => s.name.toLowerCase() === skillName.toLowerCase()
  );

  if (skillIndex === -1) {
    throw new ApiError(404, 'Skill not found');
  }

  user.learningProfile.skills.splice(skillIndex, 1);
  await user.save();

  logger.info(`Skill removed: ${skillName} for user ${user.email}`);

  res.json({
    success: true,
    message: 'Skill removed successfully',
    data: {
      skills: user.learningProfile.skills,
    },
  });
});

// Add learning goal
const addLearningGoal = asyncHandler(async (req, res) => {
  const { title, description, targetDate } = req.body;

  if (!title || title.trim().length === 0) {
    throw new ApiError(400, 'Goal title is required');
  }

  const user = await User.findById(req.user._id);

  const newGoal = {
    title: title.trim(),
    description: description ? description.trim() : '',
    targetDate: targetDate ? new Date(targetDate) : null,
    completed: false,
  };

  user.learningProfile.learningGoals.push(newGoal);
  await user.save();

  logger.info(`Learning goal added: ${title} for user ${user.email}`);

  res.json({
    success: true,
    message: 'Learning goal added successfully',
    data: {
      goal: newGoal,
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

  if (title !== undefined) goal.title = title.trim();
  if (description !== undefined) goal.description = description.trim();
  if (targetDate !== undefined) goal.targetDate = targetDate ? new Date(targetDate) : null;
  if (completed !== undefined) goal.completed = Boolean(completed);

  await user.save();

  logger.info(`Learning goal updated: ${goalId} for user ${user.email}`);

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
  const goal = user.learningProfile.learningGoals.id(goalId);

  if (!goal) {
    throw new ApiError(404, 'Learning goal not found');
  }

  goal.remove();
  await user.save();

  logger.info(`Learning goal removed: ${goalId} for user ${user.email}`);

  res.json({
    success: true,
    message: 'Learning goal removed successfully',
    data: {
      goals: user.learningProfile.learningGoals,
    },
  });
});

// Complete learning goal
const completeLearningGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  const user = await User.findById(req.user._id);
  const goal = user.learningProfile.learningGoals.id(goalId);

  if (!goal) {
    throw new ApiError(404, 'Learning goal not found');
  }

  goal.completed = true;
  await user.save();

  logger.info(`Learning goal completed: ${goalId} for user ${user.email}`);

  res.json({
    success: true,
    message: 'Learning goal marked as completed',
    data: {
      goal,
    },
  });
});

// Get preferences
const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('preferences');

  res.json({
    success: true,
    data: {
      preferences: user.preferences,
    },
  });
});

// Update preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { notifications, ui } = req.body;

  const updates = {};
  if (notifications) updates['preferences.notifications'] = notifications;
  if (ui) updates['preferences.ui'] = ui;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('preferences');

  logger.info(`Preferences updated for user: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences,
    },
  });
});

// Get privacy settings
const getPrivacySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('preferences.privacy');

  res.json({
    success: true,
    data: {
      privacy: user.preferences.privacy,
    },
  });
});

// Update privacy settings
const updatePrivacySettings = asyncHandler(async (req, res) => {
  const { privacy } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 'preferences.privacy': privacy },
    { new: true, runValidators: true }
  ).select('preferences.privacy');

  logger.info(`Privacy settings updated for user: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Privacy settings updated successfully',
    data: {
      privacy: user.preferences.privacy,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getLearningProfile,
  updateLearningProfile,
  addSkill,
  updateSkill,
  removeSkill,
  addLearningGoal,
  updateLearningGoal,
  removeLearningGoal,
  completeLearningGoal,
  getPreferences,
  updatePreferences,
  getPrivacySettings,
  updatePrivacySettings,
};