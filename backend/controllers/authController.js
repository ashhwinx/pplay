const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Couple = require('../models/Couple');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coupleCode: user.coupleCode,
        coupleId: user.coupleId,
        partnerId: user.partnerId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and populate partner info
    const user = await User.findOne({ email })
      .populate('coupleId')
      .populate('partnerId', 'name email avatar isOnline lastSeen');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coupleCode: user.coupleCode,
        coupleId: user.coupleId,
        partnerId: user.partnerId,
        partner: user.partnerId, // Include partner info
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('coupleId')
      .populate('partnerId', 'name email avatar isOnline lastSeen');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coupleCode: user.coupleCode,
        coupleId: user.coupleId,
        partnerId: user.partnerId,
        partner: user.partnerId, // Include partner info
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data', error: error.message });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Update user offline status
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
      socketId: null
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('partnerId', 'name email avatar isOnline lastSeen');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateProfile
};