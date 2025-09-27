const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const { authenticate, checkOwnership } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Validation rules
const updateProfileValidation = [
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
  body('location.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name too long'),
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name too long'),
];

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', profileController.getProfile);
router.put('/', updateProfileValidation, profileController.updateProfile);

// Avatar management
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);
router.delete('/avatar', profileController.deleteAvatar);

// Learning profile specific routes
router.get('/learning', profileController.getLearningProfile);
router.put('/learning', profileController.updateLearningProfile);

// Skills management
router.post('/skills', profileController.addSkill);
router.put('/skills/:skillName', profileController.updateSkill);
router.delete('/skills/:skillName', profileController.removeSkill);

// Goals management
router.post('/goals', profileController.addLearningGoal);
router.put('/goals/:goalId', profileController.updateLearningGoal);
router.delete('/goals/:goalId', profileController.removeLearningGoal);
router.patch('/goals/:goalId/complete', profileController.completeLearningGoal);

// Preferences
router.get('/preferences', profileController.getPreferences);
router.put('/preferences', profileController.updatePreferences);

// Privacy settings
router.get('/privacy', profileController.getPrivacySettings);
router.put('/privacy', profileController.updatePrivacySettings);

module.exports = router;