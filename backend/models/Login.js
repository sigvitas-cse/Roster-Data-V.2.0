const mongoose = require("mongoose");

// Define the schema for login
const loginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  email: { type: String, required: true },
});

// Create and export the model
const LoginModel = mongoose.model("userlogins", loginSchema); // Match the collection name in MongoDB
module.exports = LoginModel;