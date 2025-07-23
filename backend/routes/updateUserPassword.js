const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/guiestlogin');

async function updateUserPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://darshanbr36:tgnHO951d3j9ZEy1@cluster0.wuehq.mongodb.net/test1?retryWrites=true&w=majority&appName=cluster0');
    const email = 'darshan@sigvitas.com';
    const plainPassword = 'Admin@123'; // Match the password you're entering

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return;
    }

    user.password = hashedPassword;
    await user.save();
    console.log(`Updated password for user ${email} with hash: ${hashedPassword}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

updateUserPassword();