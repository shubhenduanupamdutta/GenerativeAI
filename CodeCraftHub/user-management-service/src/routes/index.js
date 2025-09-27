const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const profileRoutes = require('./profile');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'User Management Service is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);

module.exports = router;