const mongoose = require('mongoose');
const GuiestLogin = require('./models/guiestlogin'); // adjust the path if needed
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://darshanbr36:tgnHO951d3j9ZEy1@cluster0.wuehq.mongodb.net/test1?retryWrites=true&w=majority&appName=cluster0';
// Make sure you connect to the database first
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('Connection error:', err));

// Insert a new user
const insertNewUser = async () => {
  try {

    const plainPassword = '$c&#kalara#!492';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);


    const newUser = await GuiestLogin.create({
      email: 'c_kalra',
      password: hashedPassword,
      accessRevoked: false,
      currentPage: 1,
      maxPageReached: 1,
    });

    console.log('New user inserted:', newUser);
  } catch (err) {
    console.error('Error inserting user:', err.message);
  } finally {
    mongoose.connection.close(); // optional: close after one-time insert
  }
};

insertNewUser();
