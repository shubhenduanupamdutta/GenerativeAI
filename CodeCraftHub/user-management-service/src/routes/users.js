const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
];

const searchValidation = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Public routes
router.get('/search', searchValidation, userController.searchUsers);
router.get('/:userId/public', userController.getPublicProfile);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User management
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/me', userController.getCurrentUser);
router.put('/me', updateUserValidation, userController.updateCurrentUser);
router.delete('/me', userController.deleteCurrentUser);

// Specific user operations (admin only)
router.get('/:userId', authorize('admin'), userController.getUserById);
router.put('/:userId', authorize('admin'), updateUserValidation, userController.updateUser);
router.delete('/:userId', authorize('admin'), userController.deleteUser);
router.patch('/:userId/status', authorize('admin'), userController.updateUserStatus);

// User preferences
router.get('/me/preferences', userController.getUserPreferences);
router.put('/me/preferences', userController.updateUserPreferences);

// Learning profile management
router.get('/me/learning-profile', userController.getLearningProfile);
router.put('/me/learning-profile', userController.updateLearningProfile);
router.post('/me/skills', userController.addSkill);
router.put('/me/skills/:skillId', userController.updateSkill);
router.delete('/me/skills/:skillId', userController.removeSkill);
router.post('/me/goals', userController.addLearningGoal);
router.put('/me/goals/:goalId', userController.updateLearningGoal);
router.delete('/me/goals/:goalId', userController.removeLearningGoal);

// Statistics and analytics
router.get('/me/stats', userController.getUserStats);
router.get('/stats', authorize('admin'), userController.getSystemStats);

module.exports = router;