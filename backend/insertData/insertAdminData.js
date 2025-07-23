const mongoose = require("mongoose");
const AdminsLogin = require("../models/Login"); 
// const AdminsLogin = require("../models/guiestlogin"); 

require('dotenv').config();

mongoose.connect('mongodb+srv://darshanbr36:tgnHO951d3j9ZEy1@cluster0.wuehq.mongodb.net/test1?retryWrites=true&w=majority&appName=cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
});

const admins = [
  { name:'Admin', userId: "newAdmin", password: "Admin@123", userType:'admin', email:'darshan@sigvitas.com' },
  // { name:'Admin', userId: "darshan@sigvitas.com", password: "Admin@123", userType:'admin', email:'darshan@sigvitas.com' },
  // { name:'Admin', userId: "t@triangleip.com", password: "L9x$7mB@qW!4vZr2", userType:'admin', email:'t@triangleip.com' },
  // { name:'Darshan', userId: "Darshanbr66", password: "Darshanbr66@123", userType:'admin' },
  // { name: 'Example', userId: "Example1", password: "Example1@123", userType:'admin' },
];


const saveAdmins = async () => {
  try {
    const result = await AdminsLogin.insertMany(admins);
    console.log("All admins inserted successfully:", result);
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    mongoose.connection.close();
  }
};
saveAdmins();