const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'page_visit', 'search', 'copy', 'attempted_previous_page', 'max_page_reset', 'attempted_exceed_page_limit', 'access_revoked', 'revocation_reset'],
  },
  page: { type: Number },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessRevoked: {
    type: Boolean,
    default: false,
  },
  revokedAt: {
    type: Date,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  maxPageReached: {
    type: Number,
    default: 1,
  },
  userAgent: {
    type: String,
    default: '',
  },
  sessionData: [
    {
      loginTime: { type: Date, default: null },
      logoutTime: { type: Date, default: null },
      logoutReason: { type: String, default: null },
    },
  ],
  pageVisits: [
    {
      page: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  searches: [
    {
      query: { type: String, required: true },
      field: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  copyActions: [
    {
      name: { type: String, required: true },
      regCode: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  activityLog: [activityLogSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GuiestLogin', userSchema); // Note: Changed to 'GuestLogin' for consistency