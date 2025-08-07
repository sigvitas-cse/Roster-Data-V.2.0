const mongoose = require('mongoose');

const dailyLoginSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true, // For faster queries by date
  },
  logins: [
    {
      email: {
        type: String,
        required: true,
      },
      loginTime: {
        type: Date,
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuiestLogin',
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DailyLogin', dailyLoginSchema);