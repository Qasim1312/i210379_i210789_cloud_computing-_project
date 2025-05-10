const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Register a new user
router.post('/register', upload.single('profileImage'), authController.register);

// Login
router.post('/login', authController.login);

// Get user profile (requires authentication)
router.get('/profile', auth, authController.getProfile);

// Update profile (requires authentication)
router.put('/profile', auth, upload.single('profileImage'), authController.updateProfile);

module.exports = router; 