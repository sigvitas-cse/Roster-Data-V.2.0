const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Multipledata = require('./models/multipledata'); // Adjust path if needed

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://darshanbr36:tgnHO951d3j9ZEy1@cluster0.wuehq.mongodb.net/test1?retryWrites=true&w=majority&appName=cluster0';

async function createGuiestUser(userId, plainPassword) {
  try {
    await mongoose.connect(MONGO_URI);

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = new Multipledata({ userId, password: hashedPassword });

    await user.save();
    console.log('✅ Multiple search user created:', userId);
  } catch (err) {
    console.error('❌ Error creating user:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Call it with your desired credentials
createGuiestUser('darshan@sigvitas.com', 'Admin@123');
