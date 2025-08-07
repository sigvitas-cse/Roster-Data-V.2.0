const cron = require('node-cron');
const GuestLogin = require('../models/guiestlogin');
const DailyLogin = require('../models/DailyLogin');

// Schedule daily at midnight (IST)
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await GuestLogin.find({}).select('email sessionData');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyLogins = [];

    for (const user of users) {
      const hasLoginToday = user.sessionData.some(session => {
        const loginDate = new Date(session.loginTime);
        return loginDate.getFullYear() === today.getFullYear() &&
               loginDate.getMonth() === today.getMonth() &&
               loginDate.getDate() === today.getDate();
      });
      if (hasLoginToday) {
        const latestLogin = user.sessionData
          .filter(session => {
            const loginDate = new Date(session.loginTime);
            return loginDate.getFullYear() === today.getFullYear() &&
                   loginDate.getMonth() === today.getMonth() &&
                   loginDate.getDate() === today.getDate();
          })
          .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))[0];
        dailyLogins.push({
          email: user.email,
          loginTime: latestLogin.loginTime,
          userId: user._id,
        });
      }
    }

    if (dailyLogins.length > 0) {
      await DailyLogin.create({
        date: today,
        logins: dailyLogins,
      });
      console.log(`Daily logins for ${today.toISOString().split('T')[0]}:`, dailyLogins);
    } else {
      console.log(`No logins for ${today.toISOString().split('T')[0]}`);
    }
  } catch (err) {
    console.error('Daily login check error:', err);
  }
}, {
  timezone: 'Asia/Kolkata',
});

module.exports = () => {
  console.log('Daily login cron job initialized');
};