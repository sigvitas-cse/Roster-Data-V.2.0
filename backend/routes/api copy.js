const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/guiestlogin');
const Data = require('../models/NewProfile');
const auth = require('../middleware/auth');

router.post('/guiestlogin', async (req, res) => {
  console.log('Now inside guiestlogin route', req.body);
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.startsWith('$2a$') || password.startsWith('$2b$')) {
      console.log(`Invalid password format for email: ${email}`);
      return res.status(400).json({ message: 'Invalid password format' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.accessRevoked) {
      if (user.revokedAt) {
        const revocationTime = new Date(user.revokedAt);
        const currentTime = new Date();
        const hoursSinceRevocation = (currentTime - revocationTime) / (1000 * 60 * 60);
        console.log(`Hours since revocation for ${email}: ${hoursSinceRevocation}`);
        if (hoursSinceRevocation >= 24) {
          console.log(`Revocation expired for user: ${email}`);
          user.accessRevoked = false;
          user.revokedAt = null;
          await user.save();
        } else {
          console.log(`Access still revoked for user: ${email}`);
          return res.status(403).json({ message: 'Access revoked. Try again after 24 hours.' });
        }
      } else {
        console.log(`No revokedAt for revoked user: ${email}, treating as permanent`);
        return res.status(403).json({ message: 'Access revoked. Contact admin to restore access.' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'TOKEN_ABC123DARSHAN', { expiresIn: '1h' });
    user.activityLog.push({ action: 'login', timestamp: new Date() });
    await user.save();

    console.log(`Login successful for user: ${email}`);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-token', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = email;
    console.log('Verify-token: req.user', req.user);
    if (!req.user || !req.user.userId) {
      console.log('Verify-token: Invalid user data in req.user');
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    const user = await User.findById(req.user.userId);
    if (!user || user.accessRevoked) {
      console.log('Verify-token: User not found or access revoked for userId:', req.user.userId);
      return res.status(401).json({ message: 'Invalid or revoked token' });
    }
    console.log('Verify-token: Token valid for userId:', req.user.userId);
    res.status(200).json({ message: 'Token valid' });
  } catch (err) {
    console.error('Verify-token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/current-page', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`Fetched currentPage ${user.currentPage}, maxPageReached ${user.maxPageReached} for user ID: ${req.user.userId}`);
    res.json({ currentPage: user.currentPage, maxPageReached: user.maxPageReached });
  } catch (err) {
    console.error('Fetch current page error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/guiestdata', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.accessRevoked) {
      console.log(`Access revoked for user ID: ${req.user.userId}`);
      return res.status(403).json({ message: 'Access revoked' });
    }
    const page = parseInt(req.body.page) || user.currentPage;
    if (page < user.currentPage) {
      console.log(`Previous page access denied for user ID: ${req.user.userId}, requested page: ${page}, currentPage: ${user.currentPage}`);
      user.activityLog.push({ action: 'attempted_previous_page', page, timestamp: new Date() });
      await user.save();
      return res.status(403).json({ message: 'Previous page access restricted. Please log in again.' });
    }
    if (page > 3 || (user.maxPageReached >= 3 && page > user.maxPageReached)) {
      console.log(`Page limit exceeded for user ID: ${req.user.userId}, requested page: ${page}, maxPageReached: ${user.maxPageReached}`);
      user.activityLog.push({ action: 'attempted_exceed_page_limit', page, timestamp: new Date() });
      await user.save();
      return res.status(403).json({ message: 'Page limit exceeded. Please contact admin.' });
    }
    const limit = 20;
    const skip = (page - 1) * limit;
    const data = await Data.find().skip(skip).limit(limit);

    // Fetch total count of all documents in the collection
    const totalCount = await Data.estimatedDocumentCount();

    user.currentPage = page;
    if (page > user.maxPageReached) {
      user.maxPageReached = page;
      console.log(`Updated maxPageReached to ${page} for user ID: ${req.user.userId}`);
    }
    user.activityLog.push({ action: 'view_page', page, timestamp: new Date() });
    await user.save();
    console.log(`Data fetched for user ID: ${req.user.userId}, page: ${page}`);
    res.json({ data, totalCount });
  } catch (err) {
    console.error('Data fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/guiestlogout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    user.currentPage = 1; // Reset currentPage on logout
    user.activityLog.push({ action: 'logout', timestamp: new Date() });
    await user.save();
    console.log(`Logout successful for user ID: ${req.user.userId}, currentPage reset to 1`);
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/revoke', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log(`User not found for ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    user.accessRevoked = true;
    user.revokedAt = new Date();
    user.activityLog.push({ action: 'access_revoked', timestamp: new Date() });
    await user.save();
    console.log(`Access revoked for user ID: ${req.user.userId}`);
    res.json({ message: 'Access revoked' });
  } catch (err) {
    console.error('Revoke access error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/reset-revocation', async (req, res) => {
  const { email, adminToken } = req.body;
  try {
    if (!email || !adminToken) {
      console.log('Missing email or adminToken for reset-revocation');
      return res.status(400).json({ message: 'Email and admin token are required' });
    }
    if (adminToken !== process.env.ADMIN_TOKEN) {
      console.log('Invalid admin token');
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.accessRevoked) {
      console.log(`User not revoked: ${email}`);
      return res.status(400).json({ message: 'User access is not revoked' });
    }
    user.accessRevoked = false;
    user.revokedAt = null;
    user.activityLog.push({ action: 'revocation_reset', timestamp: new Date() });
    await user.save();
    console.log(`Revocation reset for user: ${email}`);
    res.json({ message: 'User access restored' });
  } catch (err) {
    console.error('Reset revocation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST http://localhost:3001/api/admin/reset-revocation
// Content-Type: application/json
// {
//   "email": "darshan@sigvitas.com"
// }

router.post('/admin/reset-max-page', async (req, res) => {
  const { email, adminToken } = req.body;
  try {
    if (!email || !adminToken) {
      console.log('Missing email or adminToken for reset-max-page');
      return res.status(400).json({ message: 'Email and admin token are required' });
    }
    if (adminToken !== 'TOKEN_ABC123DARSHAN') {
      console.log('Invalid admin token');
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }
    user.maxPageReached = 1;
    user.currentPage = 1;
    user.activityLog.push({ action: 'max_page_reset', timestamp: new Date() });
    await user.save();
    console.log(`Max page reset for user: ${email}`);
    res.json({ message: 'Max page limit reset' });
  } catch (err) {
    console.error('Reset max page error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST http://localhost:3001/api/admin/reset-max-page
// Content-Type: application/json
// {
//   "email": "darshan@sigvitas.com",
//   "adminToken": "your_secure_admin_token"
// }

module.exports = router;