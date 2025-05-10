const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadFileToS3 } = require('../config/s3');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// User registration
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    // Upload profile image if exists
    if (req.file) {
      const imageUrl = await uploadFileToS3(req.file, 'profile-images');
      user.profileImage = imageUrl;
    }

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const updates = {};

    if (username) updates.username = username;

    // Upload new profile image if exists
    if (req.file) {
      const imageUrl = await uploadFileToS3(req.file, 'profile-images');
      updates.profileImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 