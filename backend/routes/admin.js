const express = require('express');
const router = express.Router();
const GuestLogin = require('../models/guiestlogin');
const DailyLogin = require('../models/DailyLogin');
const auth = require('../middleware/auth'); // Reuse existing auth middleware

// @route   GET api/admin/user-activity
// @desc    Get all user activity and daily login summaries for admin dashboard
// @access  Private (Admin only)
router.get('/user-activity', auth, async (req, res) => {
  try {
    // TODO: Add admin authorization check (e.g., verify req.user is admin)
    const users = await GuestLogin.find({}).select(
      'email userAgent sessionData pageVisits searches copyActions activityLog currentPage maxPageReached accessRevoked revokedAt createdAt'
    );
    const dailyLogins = await DailyLogin.find({}).sort({ date: -1 });

    const activitySummary = users.map(user => ({
      email: user.email,
      userAgent: user.userAgent,
      createdAt: user.createdAt,
      accessRevoked: user.accessRevoked,
      revokedAt: user.revokedAt,
      currentPage: user.currentPage,
      maxPageReached: user.maxPageReached,
      sessions: user.sessionData.map(session => ({
        loginTime: session.loginTime,
        logoutTime: session.logoutTime,
        logoutReason: session.logoutReason,
      })),
      pageVisits: user.pageVisits.map(visit => ({
        page: visit.page,
        timestamp: visit.timestamp,
      })),
      searches: user.searches.map(search => ({
        query: search.query,
        field: search.field,
        timestamp: search.timestamp,
      })),
      copyActions: user.copyActions.map(copy => ({
        name: copy.name,
        regCode: copy.regCode,
        timestamp: copy.timestamp,
      })),
      activityLog: user.activityLog.map(log => ({
        action: log.action,
        page: log.page,
        details: log.details,
        timestamp: log.timestamp,
      })),
    }));

    const dailyLoginSummary = dailyLogins.map(daily => ({
      date: daily.date,
      logins: daily.logins.map(login => ({
        email: login.email,
        loginTime: login.loginTime,
        userId: login.userId,
      })),
    }));

    res.json({
      message: 'User activity and daily login summaries retrieved',
      data: {
        userActivity: activitySummary,
        dailyLogins: dailyLoginSummary,
      },
    });
  } catch (err) {
    console.error('Admin user activity error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;