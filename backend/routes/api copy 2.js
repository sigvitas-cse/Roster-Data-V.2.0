const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const GuestLogin = require('../models/guiestlogin');
const Data = require('../models/NewProfile');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   POST api/guiestlogin
// @desc    Authenticate guest user and get token
// @access  Public
router.post(
  '/guiestlogin',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('userAgent', 'User agent is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { email, password, userAgent } = req.body;

    try {
      let user = await GuestLogin.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      // Update user with userAgent, sessionData, and activityLog
      user.userAgent = userAgent;
      user.sessionData.push({
        loginTime: new Date(),
        logoutTime: null,
        logoutReason: null,
      });
      user.activityLog.push({
        action: 'login',
        details: { userAgent },
        timestamp: new Date(),
      });

      // Debug existing activityLog
      console.log('Before save - activityLog:', user.activityLog);

      await user.save({ validateModifiedOnly: true });

      const payload = {
        userId: user._id,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'TOKEN_ABC123DARSHAN',
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Login error:', err.message);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error. Please contact support.' });
      }
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// @route   POST api/guiestlogout
// @desc    Logout guest user and record logout reason
// @access  Private
router.post('/guiestlogout', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { reason } = req.body;
    const lastSession = user.sessionData[user.sessionData.length - 1];
    if (lastSession && !lastSession.logoutTime) {
      lastSession.logoutTime = new Date();
      lastSession.logoutReason = reason || 'Manual logout';
      user.activityLog.push({
        action: 'logout',
        details: { reason: reason || 'Manual logout' },
        timestamp: new Date(),
      });
      await user.save({ validateModifiedOnly: true });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/log-page-visit
// @desc    Log page visit
// @access  Private
router.post('/log-page-visit', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page, currentPage } = req.body;
    if (!page) {
      return res.status(400).json({ message: 'Page is required' });
    }

    user.pageVisits.push({
      page,
      timestamp: new Date(),
    });
    user.activityLog.push({
      action: 'page_visit',
      page: currentPage || user.currentPage,
      details: { page },
      timestamp: new Date(),
    });

    if (currentPage) {
      user.currentPage = currentPage;
      if (currentPage > user.maxPageReached) {
        user.maxPageReached = currentPage;
      }
    }
    await user.save({ validateModifiedOnly: true });

    res.json({ message: 'Page visit logged' });
  } catch (err) {
    console.error('Page visit log error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/log-search
// @desc    Log search query
// @access  Private
router.post('/log-search', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { query, field } = req.body;
    if (!query || !field) {
      return res.status(400).json({ message: 'Query and field are required' });
    }

    user.searches.push({
      query,
      field,
      timestamp: new Date(),
    });
    user.activityLog.push({
      action: 'search',
      page: user.currentPage,
      details: { query, field },
      timestamp: new Date(),
    });
    await user.save({ validateModifiedOnly: true });

    res.json({ message: 'Search logged' });
  } catch (err) {
    console.error('Search log error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/log-copy
// @desc    Log copy action
// @access  Private
router.post('/log-copy', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, regCode } = req.body;
    if (!name || !regCode) {
      return res.status(400).json({ message: 'Name and regCode are required' });
    }

    user.copyActions.push({
      name,
      regCode,
      timestamp: new Date(),
    });
    user.activityLog.push({
      action: 'copy',
      page: user.currentPage,
      details: { name, regCode },
      timestamp: new Date(),
    });
    await user.save({ validateModifiedOnly: true });

    res.json({ message: 'Copy action logged' });
  } catch (err) {
    console.error('Copy log error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/user-activity
  // @desc    Get all user activity
router.get('/user-activity', async (req, res) => {
  try {
    const users = await GuestLogin.find();
    console.log('Fetched users from DB:', users);
    if (!users || users.length === 0) {
      console.warn('No users found in database');
      return res.status(200).json([]);
    }
    const activityData = users.map(user => ({
      email: user.email,
      activityLog: user.activityLog,
      pageVisits: user.pageVisits,
      copyActions: user.copyActions,
      searches: user.searches,
    }));
    console.log('Activity data sent:', activityData);
    res.status(200).json(activityData);
  } catch (err) {
    console.error('Error fetching user activity:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/users
// @desc    Fetch all users
// @access  Private (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await GuestLogin.find({}, 'email activityLog currentPage maxPageReached sessionData');
    res.json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/users/email/:email
// @desc    Delete a user by email
// @access  Private (admin only)
router.delete('/users/email/:email', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findOneAndDelete({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/users
// @desc    Delete all users
// @access  Private (admin only)
router.delete('/users', auth, async (req, res) => {
  try {
    await GuestLogin.deleteMany({});
    res.json({ message: 'All users deleted successfully' });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/activity/:email/:timestamp
  // @desc    Delete a specific activity by email and timestamp, log deletion
router.delete('/activity/:email/:timestamp', async (req, res) => {
  console.log('Incoming DELETE request to /api/activity/:email/:timestamp from origin:', req.get('origin'));
  console.log('Processing DELETE for email:', req.params.email, 'timestamp:', req.params.timestamp);

  try {
    const user = await GuestLogin.findOne({ email: req.params.email });
    if (!user) {
      console.log(`User ${req.params.email} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    const timestamp = new Date(req.params.timestamp);
    if (isNaN(timestamp)) {
      console.log('Invalid timestamp format:', req.params.timestamp);
      return res.status(400).json({ message: 'Invalid timestamp' });
    }

    const activityToDelete = user.activityLog.find(activity => {
      const activityTimestamp = activity.timestamp instanceof Date
        ? activity.timestamp
        : new Date(activity.timestamp?.$date || activity.timestamp);
      return Math.abs(activityTimestamp - timestamp) < 1000; // Allow 1-second difference
    });

    if (!activityToDelete) {
      console.log(`Activity with timestamp ${timestamp} not found for ${req.params.email}`);
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Remove the activity
    user.activityLog = user.activityLog.filter(activity => {
      const activityTimestamp = activity.timestamp instanceof Date
        ? activity.timestamp
        : new Date(activity.timestamp?.$date || activity.timestamp);
      return Math.abs(activityTimestamp - timestamp) >= 1000;
    });

    // Log deletion info
    user.activityLog.push({
      action: 'activity_deleted',
      details: {
        deletedActivityDetail: {
          email: req.params.email,
          timestamp: timestamp,
          action: activityToDelete.action,
          page: activityToDelete.page,
        },
      },
      timestamp: new Date(),
    });

    await user.save({ validateModifiedOnly: true });
    console.log(`Activity deleted successfully for ${req.params.email} at ${timestamp}`);
    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Activity delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/user/:email
// @desc    Delete a user by email
router.delete('/users/:email', async (req, res) => {
  console.log('Incoming DELETE request to /api/users/:email from origin:', req.get('origin'));
  console.log('Processing DELETE for email:', req.params.email);

  try {
    const user = await GuestLogin.findOneAndDelete({ email: req.params.email });
    if (!user) {
      console.log(`User ${req.params.email} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User deleted successfully: ${req.params.email}`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/user/:email/history
// @desc    Delete user history (activityLog, pageVisits, etc.) by email
router.delete('/users/:email/history', async (req, res) => {
  console.log('Incoming DELETE request to /api/users/:email/history from origin:', req.get('origin'));
  console.log('Processing DELETE history for email:', req.params.email);

  try {
    const user = await GuestLogin.findOne({ email: req.params.email });
    if (!user) {
      console.log(`User ${req.params.email} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear all history-related arrays
    user.activityLog = [];
    user.pageVisits = [];
    user.searches = [];
    user.copyActions = [];

    await user.save({ validateModifiedOnly: true });
    console.log(`User history deleted successfully for ${req.params.email}`);
    res.json({ message: 'User history deleted successfully' });
  } catch (err) {
    console.error('User history delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/verify-token
// @desc    Verify token validity
// @access  Private
router.get('/verify-token', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    const user = await GuestLogin.findById(req.user.userId);
    if (!user || user.accessRevoked) {
      return res.status(401).json({ message: 'Invalid or revoked token' });
    }
    res.status(200).json({ message: 'Token valid', userId: user._id });
  } catch (err) {
    console.error('Verify-token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/current-page
// @desc    Get current page and max page reached
// @access  Private
router.get('/current-page', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ currentPage: user.currentPage, maxPageReached: user.maxPageReached });
  } catch (err) {
    console.error('Fetch current page error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/guiestdata
// @desc    Fetch data with page restrictions
// @access  Private
router.post('/guiestdata', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.accessRevoked) {
      return res.status(403).json({ message: 'Access revoked' });
    }
    const page = parseInt(req.body.page) || user.currentPage;
    if (page < user.currentPage) {
      user.activityLog.push({ action: 'attempted_previous_page', page, timestamp: new Date() });
      await user.save({ validateModifiedOnly: true });
      return res.status(403).json({ message: 'Previous page access restricted. Please log in again.' });
    }
    if (page > 3 || (user.maxPageReached >= 3 && page > user.maxPageReached)) {
      user.activityLog.push({ action: 'attempted_exceed_page_limit', page, timestamp: new Date() });
      await user.save({ validateModifiedOnly: true });
      return res.status(403).json({ message: 'Page limit exceeded. Please contact admin.' });
    }
    const limit = 20;
    const skip = (page - 1) * limit;
    const data = await Data.find().skip(skip).limit(limit);
    const totalCount = await Data.estimatedDocumentCount();

    user.currentPage = page;
    if (page > user.maxPageReached) {
      user.maxPageReached = page;
    }
    user.activityLog.push({ action: 'page_visit', page, timestamp: new Date() }); // Updated from view_page
    await user.save({ validateModifiedOnly: true });

    res.json({ data, totalCount });
  } catch (err) {
    console.error('Data fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/revoke
// @desc    Revoke user access
// @access  Private
router.post('/revoke', auth, async (req, res) => {
  try {
    const user = await GuestLogin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.accessRevoked = true;
    user.revokedAt = new Date();
    user.activityLog.push({ action: 'access_revoked', timestamp: new Date() });
    await user.save({ validateModifiedOnly: true });
    res.json({ message: 'Access revoked' });
  } catch (err) {
    console.error('Revoke access error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/admin/reset-revocation
// @desc    Reset revoked access
// @access  Public (admin only)
router.post('/admin/reset-revocation', async (req, res) => {
  const { email, adminToken } = req.body;
  try {
    if (!email || !adminToken) {
      return res.status(400).json({ message: 'Email and admin token are required' });
    }
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const user = await GuestLogin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.accessRevoked) {
      return res.status(400).json({ message: 'User access is not revoked' });
    }
    user.accessRevoked = false;
    user.revokedAt = null;
    user.activityLog.push({ action: 'revocation_reset', timestamp: new Date() });
    await user.save({ validateModifiedOnly: true });
    res.json({ message: 'User access restored' });
  } catch (err) {
    console.error('Reset revocation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/admin/reset-max-page
// @desc    Reset max page limit
// @access  Public (admin only)
router.post('/admin/reset-max-page', async (req, res) => {
  const { email, adminToken } = req.body;
  try {
    if (!email || !adminToken) {
      return res.status(400).json({ message: 'Email and admin token are required' });
    }
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const user = await GuestLogin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.maxPageReached = 1;
    user.currentPage = 1;
    user.activityLog.push({ action: 'max_page_reset', timestamp: new Date() });
    await user.save({ validateModifiedOnly: true });
    res.json({ message: 'Max page limit reset' });
  } catch (err) {
    console.error('Reset max page error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;