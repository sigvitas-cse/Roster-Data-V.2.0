const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  page: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accessRevoked: { type: Boolean, default: false },
  revokedAt: { type: Date },
  currentPage: { type: Number, default: 1 },
  maxPageReached: { type: Number, default: 1 }, // New field for max page
  activityLog: [activityLogSchema],
});

module.exports = mongoose.model('GuiestLogin', userSchema);