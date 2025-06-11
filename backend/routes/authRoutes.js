const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const {
  register,
  login,
  getMe,
  logout,
  updateProfile
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;