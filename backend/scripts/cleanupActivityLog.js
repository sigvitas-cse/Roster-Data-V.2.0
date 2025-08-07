const mongoose = require('mongoose');
const GuestLogin = require('../models/guiestlogin');
require('dotenv').config();

async function cleanupActivityLog() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch all users
    const users = await GuestLogin.find({});

    for (const user of users) {
      // Update view_page to page_visit
      const updatedActivityLog = user.activityLog.map(log => {
        if (log.action === 'view_page') {
          return { ...log, action: 'page_visit' };
        }
        return log;
      });

      // Update the user document
      await GuestLogin.updateOne(
        { _id: user._id },
        { $set: { activityLog: updatedActivityLog } }
      );
      console.log(`Updated activityLog for user ${user.email}`);
    }

    console.log('Cleanup completed');
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

cleanupActivityLog();