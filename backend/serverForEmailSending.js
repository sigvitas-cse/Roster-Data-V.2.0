const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/yourDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// MongoDB schema and model
const loginSchema = new mongoose.Schema({
  name: String,
  userId: { type: String, unique: true },
  password: String,
  userType: String,
  email: String,
});

const LoginModel = mongoose.model('Login', loginSchema);

// Nodemailer transporter (using App Password for Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'darshan@sigvitas.com',
    pass: 'nkpt ixhc gsgo yzyh', // App password generated for Gmail
  },
});

// Password generator function
const generatePassword = () => {
  return Math.random().toString(36).slice(-8); // Generates an 8-character random password
};

// POST route to save employee details
app.post('/api/save-employee-details', async (req, res) => {
  const { name, userId, email, userType } = req.body;

  // Generate a random password
  const autoPassword = generatePassword();

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(autoPassword, salt);

    // Create new employee document
    const newEmployee = new LoginModel({
      name,
      userId,
      email,
      userType,
      password: hashPassword,
    });

    // Save to MongoDB
    await newEmployee.save();

    // Send email notification
    const mailOptions = {
      from: 'darshan@sigvitas.com',
      to: email,
      subject: 'Employee Account Created',
      text: `Hi ${name},\n\nYour account has been created successfully! Your password is: ${autoPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent:', info.response);
    });

    // Send response to frontend
    res.status(200).json({ message: 'Employee details saved and email sent successfully.' });
  } catch (err) {
    console.error('Error saving employee or sending email:', err);
    res.status(500).json({ message: 'An error occurred while saving the employee.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
