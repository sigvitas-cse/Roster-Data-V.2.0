const router = require('express').Router();
const UserModel = require("../models/NewProfile"); 
const UserLoginsModel = require("../models/Login");
const NewUsersLoginModel = require("../models/NewUsers");
const Analysis = require("../models/Analysis");
const UpdatedProfilesComparison = require("../models/UpdatedProfilesComparison");
const crypto = require("crypto"); 
const ApiKeyModel = require("../models/ApiKeySchema");
const bcrypt = require('bcrypt');

const multer = require("multer");
const xlsx = require("xlsx");
const OldProfile = require("../models/OldProfile");
const NewProfile = require("../models/NewProfile");

const path = require("path");
const fs = require("fs");
const NewProfiles = require('../models/newlyAddedProfiles');
const RemovedProfiles = require('../models/RemovedProfiles');

const OtpModel = require('../models/Otp');
const LoginModel = require("../models/Login");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'darshan@sigvitas.com',
    pass: 'aqhf klky wpct uuuu', // App password generated for Gmail
  },
});
// aqhf klky wpct uuuu
// pass: 'nkpt ixhc gsgo yzyh',

// Function to generate and store API key
const generateAndStoreApiKey = async () => {
  const newApiKey = crypto.randomBytes(32).toString("hex");

  // Delete the older API key
  await ApiKeyModel.deleteMany({});

  // Save new API key
  await new ApiKeyModel({ key: newApiKey }).save();
  
  // console.log("🔑 New API Key:", newApiKey);
  return newApiKey;
};

// Initialize API Key
let tempApiKey;
(async () => {
  tempApiKey = await generateAndStoreApiKey();
})();

// Refresh API key every 1 hour
setInterval(async () => {
  tempApiKey = await generateAndStoreApiKey();
}, 3600000); // 1 hour

// Middleware to verify API key
const verifyTempApiKey = async (req, res, next) => {
  const clientApiKey = req.get("x-api-key");

  // Fetch the latest API key from the database
  const latestKey = await ApiKeyModel.findOne().sort({ createdAt: -1 });

  if (!clientApiKey || !latestKey || clientApiKey !== latestKey.key) {
      return res.status(403).json({ message: "❌ Invalid API Key" });
  }

  next();
};


// Route to get the current API key (for internal use)
router.get("/get-api-key", async (req, res) => {
  const latestKey = await ApiKeyModel.findOne().sort({ createdAt: -1 });
  res.status(200).json({ apiKey: latestKey ? latestKey.key : "No API Key Found" });
});



router.post("/add-user", async (req, res) => {
  console.log('Inside add-user Section');
  const {
    name,
    organization,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    zipcode,
    phoneNumber,
    regCode,
    agentAttorney,
    dateOfPatent,
    agentLicensed,
    firmOrOrganization,
    updatedPhoneNumber,
    emailAddress,
    updatedOrganization,
    firmUrl,
    updatedAddress,
    updatedCity,
    updatedState,
    updatedCountry,
    updatedZipcode,
    linkedInProfile,
    notes,
    initials,  // Ensure this is included in the request body
    dataUpdatedAsOn,
    userId,
  } = req.body;

  console.log('Inside add-user Section and userId:', userId);

  try {
    // Get the next slNo (Serial Number)
    const lastUser = await UserModel.findOne().sort({ slNo: -1 }).exec();
    const nextSlNo = lastUser ? lastUser.slNo + 1 : 1;

    // Create a new user object
    const newUser = new UserModel({
      slNo: nextSlNo,
      name,
      organization,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      zipcode,
      phoneNumber,
      regCode,
      agentAttorney,
      dateOfPatent,
      agentLicensed,
      firmOrOrganization,
      updatedPhoneNumber,
      emailAddress,
      updatedOrganization,
      firmUrl,
      updatedAddress,
      updatedCity,
      updatedState,
      updatedCountry,
      updatedZipcode,
      linkedInProfile,
      notes,
      initials,
      dataUpdatedAsOn,
      userId,
    });

    // Save the new user to MongoDB
    const savedUser = await newUser.save();

    // Respond with the saved user data
    res.status(201).json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/update-user/:slNo", async (req, res) => {
  console.log('now inside the update-user/:slNo section');
  
  // Extract the `slNo` from the URL params
  const { slNo } = req.params;
  
  // Extract the user data from the request body
  const { 
    name,
    organization,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    zipcode,
    phoneNumber,
    regCode,
    agentAttorney,
    dateOfPatent,
    agentLicensed,
    firmOrOrganization,
    updatedPhoneNumber,
    emailAddress,
    updatedOrganization,
    firmUrl,
    updatedAddress,
    updatedCity,
    updatedState,
    updatedCountry,
    updatedZipcode,
    linkedInProfile,
    notes,
    initials,
    dataUpdatedAsOn 
  } = req.body;

  try {
    // Find the user by `slNo` and update their data
    const updatedUser = await UserModel.findOneAndUpdate(
      { slNo }, // Match by slNo
      {
        name,
        organization,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipcode,
        phoneNumber,
        regCode,
        agentAttorney,
        dateOfPatent,
        agentLicensed,
        firmOrOrganization,
        updatedPhoneNumber,
        emailAddress,
        updatedOrganization,
        firmUrl,
        updatedAddress,
        updatedCity,
        updatedState,
        updatedCountry,
        updatedZipcode,
        linkedInProfile,
        notes,
        initials,
        dataUpdatedAsOn
      }, // The new data to update
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating user." });
  }
});


router.put("/update-userss", async (req, res) => {
  console.log("now inside the update-users section");
  const users = req.body;

  try {
    const updatePromises = users.map(async (user) => {
      const { slNo } = user;

      const updatedUser = await UserModel.findOneAndUpdate(
        { slNo }, // Match user by slNo
        { ...user }, // Update with user data
        { new: true } // Return updated document
      );

      return updatedUser;
    });

    const updatedUsers = await Promise.all(updatePromises);

    res.status(200).json({
      message: "All users updated successfully.",
      data: updatedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "An error occurred." });
  }
});

router.put("/update-users", async (req, res) => {
  console.log("Received update request with body:", JSON.stringify(req.body, null, 2));
  const users = req.body;

  try {
    const updatePromises = users.map(async (user) => {
      const { regCode } = user;
      if (!regCode) {
        console.error("Missing regCode for user:", user);
        throw new Error("regCode is required");
      }
      console.log(`Attempting to update user with regCode: ${regCode}`);
      const updatedUser = await UserModel.findOneAndUpdate(
        { regCode },
        { $set: { ...user } }, // Use $set to explicitly update fields
        { new: true }
      );
      if (!updatedUser) {
        console.warn(`No user found with regCode: ${regCode}`);
      } else {
        console.log(`Updated user:`, updatedUser);
      }
      return updatedUser;
    });

    const updatedUsers = await Promise.all(updatePromises);
    console.log("Update operation completed. Updated users:", updatedUsers);
    res.status(200).json({
      message: "All users updated successfully.",
      data: updatedUsers,
    });
  } catch (err) {
    console.error("Error in update-users:", err.stack);
    res.status(500).json({ error: err.message || "An error occurred." });
  }
});

router.put('/update-users2', async (req, res) => {
  try {
    console.log("Now inside the update-users2 section");
    const updatedUsers = req.body; // Expecting an array of user objects

    if (!updatedUsers || !Array.isArray(updatedUsers) || updatedUsers.length === 0) {
      return res.status(400).send({ message: "No changes to save." });
    }

    const updatePromises = [];

    for (const updatedUser of updatedUsers) {
      const { regCode, ...fieldsToUpdate } = updatedUser;

      if (!regCode) continue;

      const updateFields = {};

      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        if (value !== undefined && value !== null && value !== '') {
          updateFields[key] = value;
        }
      }

      if (Object.keys(updateFields).length > 0) {
        updatePromises.push(
          UserModel.updateOne({ regCode }, { $set: updateFields })
        );
      }
    }

    await Promise.all(updatePromises);
    res.status(200).json({ message: 'Users updated successfully' });
  } catch (error) {
    console.error('Error updating users:', error);
    res.status(500).json({ error: 'Failed to update users' });
  }
});



router.get("/fetch-users", async (req, res) => {
  console.log('now inside the fetch users section');

  try {
    const userId = req.query.userId;
    console.log("Received userId:", userId);

    // Check if userId exists in the query
    if (!userId) {
      console.error("No userId provided");
      console.log(process.env.NODE_ENV);

      return res.status(400).json({ error: "UserId is required" });
    }

    // Query the database
    const users = await UserModel.find({userId: userId});
    // console.log("Fetched users:", users);

    // Check if users are found
    if (!users.length) {
      console.error(`No data found for userId: ${userId}`);
      return res.status(404).json({ message: "No data found for this userId" });
    }

    res.status(200).json({
      message: "Data fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/AllData", async (req, res) => {
  console.log('now inside the AllData section');

  try {

    // Query the database
    const users = await UserModel.find();
    // console.log("Fetched users:", users);

    // Check if users are found
    if (!users.length) {
      return res.status(404).json({ message: "No data found for this userId" });
    }

    res.status(200).json({
      message: "Data fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/all-users-data", async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 1000;
    let letter = req.query.letter?.trim() || "";

    let filter = {};

    // ✅ Filter by name if A-Z is selected
    if (letter && /^[A-Z]$/i.test(letter)) {
      filter.name = new RegExp(`^${letter}`, "i");
    }

    // ✅ If `#` is clicked (letter === ""), DO NOT remove pagination
    if (!letter) {
      page = page; // Keep pagination active
      limit = limit; // Fetch in batches instead of all at once
    }

    // Fetch total user count & paginated data
    const totalUsers = await UserModel.countDocuments(filter);
    const data = await UserModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();


      // ✅ Fetch updated profile regCodes
    const updatedProfiles = await UpdatedProfilesComparison.find({}, { regCode: 1, _id: 0 });
    const updatedRegCodes = new Set(updatedProfiles.map((item) => item.regCode?.trim()?.toLowerCase()));

    // ✅ Mark users as updated if their regCode matches
    const usersWithHighlight = data.map((user) => ({
      ...user,
      isUpdated: updatedRegCodes.has(user.regCode?.trim()?.toLowerCase()),
    }));


    res.status(200).json({
      success: true,
      data: usersWithHighlight,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit), // ✅ Keep pagination working
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


router.get("/all-users-data-filtering", async (req, res) => {
  console.log('now inside the all-users-data-filtering section');

  const filters = req.query; // Get query parameters
  const query = {};

  // Build query dynamically
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      query[key] = { $regex: filters[key], $options: "i" }; // Case-insensitive partial match
    }
  });

  try {
    const data = await UserModel.find(query); // Fetch data based on filters
    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});


router.get("/all-users", async (req, res) => {
  try {
    const users = await UserLoginsModel.find();
    // console.log("Fetched users:", users);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json({ data: users });
  } catch (err) {
    console.error("Error fetching users:", err);  // Log any errors
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

// In your server-side code (Express.js)
router.delete("/delete-user/:userId", async (req, res) => {
  const { userId } = req.params;
  // console.log("UserId:",userId);
  
  const decodedUserId = decodeURIComponent(userId); // Decode URL-encoded userId

  try {
    const result1 = await UserLoginsModel.findOneAndDelete({ email: decodedUserId }); // Assuming email is unique
    const result2 = await NewUsersLoginModel.findOneAndDelete({ email: decodedUserId });
    if (result1 && result2) {
      res.status(200).send({ message: 'User deleted successfully' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error deleting user:", error); // Log the detailed error
    res.status(500).send({ message: 'Error deleting user', error: error.message });
  }
});

// Fetch analysis data
router.get("/analysis", async (req, res) => {
  try {
    console.log('inside the analysis section');
    
    const analysisData = await Analysis.find().sort({ timestamp: 1 });
    res.json(analysisData);
    console.log("analysis data:", analysisData)
  } catch (error) {
    res.status(500).json({ message: "Error fetching analysis data", error });
  }
});


// API to Add New or Update Profiles in Project 2's Collection
router.get("/updatedprofilescomparisons", async (req, res) => {
  console.log("✅ Inside updatedprofilescomparisons route");

  try {
    const updatedProfiles = await UpdatedProfilesComparison.find({}); 
    res.status(200).json(updatedProfiles);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/updatedprofilescomparisons2", async (req, res) => {
  console.log("✅ Inside fortestinnews route");

  try {
    const testData = await UpdatedProfilesComparison.find({}); // Fetch all documents
    console.log("✅ Retrieved Data:", testData); // Debugging

    res.status(200).json(testData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/FetchAllData", verifyTempApiKey, async (req, res) => {
  console.log("✅ Inside FetchAllData route");

  try {
    const testData = await UserModel.find({});
    // const testData = await Analysis.find({}); // Fetch all documents
    // console.log("✅ Retrieved Data:", testData); // Debugging

    res.status(200).json(testData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/fetchAllDataToCompare", async (req, res) => {
  console.log("✅ Inside fetchAllDataToCompare route");

  try {
    const testData = await UserModel.find({}); 

    res.status(200).json(testData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/newlyAddedProfiles", async (req, res) => {
  console.log("✅ Inside newlyAddedProfiles route");

  try {
    const testData1 = await NewProfiles.countDocuments(); 
    console.log('Total:',testData1);
    
    const testData = await NewProfiles.find({}); 

    res.status(200).json(testData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/newlyAddedProfiles2", async (req, res) => {
  console.log("✅ Inside newlyAddedProfiles route");

  try {
    const testData = await NewProfiles.find({}); 

    const formattedData = testData.map(profile => ({
      slNo: profile._id,  // Optional: use Mongo ID as serial
      regCode: profile.regCode,
      name: profile.name,
      organization: profile.details?.["Organization/Law Firm Name"] || "",
      addressLine1: profile.details?.["Address Line 1"] || "",
      addressLine2: profile.details?.["Address Line 2"] || "", // just in case
      city: profile.details?.["City"] || "",
      state: profile.details?.["State"] || "",
      country: profile.details?.["Country"] || "",
      zipcode: profile.details?.["Zipcode"] || "",
      phoneNumber: profile.details?.["Phone Number"] || "",
      agentAttorney: profile.details?.["Agent/Attorney"] || "",
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


router.get("/removedProfiles", async (req, res) => {
  console.log("✅ Inside removedProfiles route");

  try {
    
    const testData = await RemovedProfiles.find({}); 
 // Transform data before sending response
 const formattedData = testData.map(profile => ({
  slNo: profile._id,  // Using MongoDB Object ID as Serial No
  regCode: profile.regCode,
  name: profile.name,
  organization: profile.details?.["Organization/Law Firm Name"] || "",
  addressLine1: profile.details?.["Address Line 1"] || "",
  city: profile.details?.["City"] || "",
  state: profile.details?.["State"] || "",
  country: profile.details?.["Country"] || "",
  zipcode: profile.details?.["Zipcode"] || "",
  phoneNumber: profile.details?.["Phone Number"] || "",
  agentAttorney: profile.details?.["Agent/Attorney"] || "",
}));

res.status(200).json(formattedData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get('/updated-profiles', async (req, res) => {
  console.log("✅ Inside updated-profiles route");

  try {
      const profiles = await UpdatedProfilesComparison.find(); // Fetch all data
      res.json(profiles);
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
  }
});


const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

const convertDate = (date) => {
  if (typeof date === "number") {
    const excelStartDate = new Date(1899, 11, 30);
    const convertedDate = new Date(excelStartDate.getTime() + date * 86400000);
    const month = (convertedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = convertedDate.getDate().toString().padStart(2, "0");
    const year = convertedDate.getFullYear();
    return `${day}-${month}-${year}`;
  } else if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return date;
  }
  return "NA";
};

// Upload route
router.post("/upload-excel-dynamic", upload.single("excelFile"), async (req, res) => {
  try {
  console.log("✅ Inside upload-excel-dynamic route");

    // Step 1: Move existing data
    await OldProfile.deleteMany({});
    console.log("deleted OldProfiles successfully");

    const newProfiles = await NewProfile.find();
    if (newProfiles.length > 0) {
      await OldProfile.insertMany(newProfiles);
    }
    console.log("inserted newprofiles data to oldprofiles db successfully");

    await NewProfile.deleteMany({});

    console.log("deleted NewProfiles successfully");

    // Step 2: Parse Excel from memory
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const users = sheetData.map((row) => ({
      slNo: row["S. No."],
      name: row["Name"],
      organization: row["Organization/Law Firm Name"],
      addressLine1: row["Address Line 1"],
      addressLine2: row["Address Line 2"],
      city: row["City"],
      state: row["State"],
      country: row["Country"],
      zipcode: row["Zipcode"],
      phoneNumber: row["Phone Number"],
      regCode: row["Reg Code"],
      agentAttorney: row["Agent/Attorney"],
      dateOfPatent: convertDate(row["Date of Patent Agent Licensed"]),
      agentLicensed: convertDate(row["Date of Patent Attorney Licensed"]),
      firmOrOrganization: row["Firm or Organization"],
      updatedPhoneNumber: row["Updated Phone Number"],
      emailAddress: row["Email Address"],
      updatedOrganization: row["Updated Organization/Law Firm Name"],
      firmUrl: row["Firm/Organization URL"],
      updatedAddress: row["Updated Address"],
      updatedCity: row["Updated City"],
      updatedState: row["Updated State"],
      updatedCountry: row["Updated Country"],
      updatedZipcode: row["Updated Zipcode"],
      linkedInProfile: row["LinkedIn Profile URL"],
      notes: row["Notes"],
      initials: row["Initials"],
      dataUpdatedAsOn: convertDate(row["Data Updated as on"]),
      userId: row["User Id"],
      admin: row["Admin"],
    }));

    await NewProfile.insertMany(users);
    res.status(200).json({ message: "Excel data uploaded successfully" });
    
    console.log("uploaded NewProfiles to newprofile db successfully");

    const total = await UserModel.countDocuments()
    const userId2 = req.body.userId || "One of the Patent Analyst";


    console.log("UserName = ",userId2);

    const now = new Date();

    const formattedDate = now.toLocaleDateString("en-IN", {
      weekday: "long",        // e.g., Thursday
      day: "numeric",         // e.g., 10
      month: "long",          // e.g., April
      year: "numeric",        // e.g., 2025
      timeZone: "Asia/Kolkata"
    });

    const formattedTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    });



    const mailOptions = {
      from: 'darshan@sigvitas.com',
      to: `dverma@sigvitas.com`,
      subject: 'Re: Daily Data Uploading',
      // text: `Hello Sir, /n/n${userId2} uploaded the data successfully on ${formattedDate} at ${formattedTime}. Total number of users: ${total}/n/nBest Regards,/nDarshan`,
      text: `Hello Sir,\n\n${userId2} uploaded the data successfully on ${formattedDate} at ${formattedTime}. \nTotal Attorneys in the Roster: ${total}\n\nBest Regards,\nDarshan`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Failed to send email:", error);
      }else {
        console.log("Mail sent to the Admin");
      }
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process Excel file" });
  }
});


router.post('/request-otp', async (req, res) => {


  console.log("✅ Inside request-otp route");

  const { email } = req.body;
try{
  // Check if email exists in either Login or NewUsers collection
  const user1 = await LoginModel.findOne({ email });
  const user2 = await NewUsersLoginModel.findOne({ email });

  if (!user1 && !user2) {
    return res.status(404).json({ message: '❌ Email not registered.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiry

  // Save to DB
  await OtpModel.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true }
  );

  // Send OTP Email
  const mailOptions = {
    from: 'darshan@sigvitas.com',
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP is ${otp}. It is valid for 1 minute.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: '❌ Failed to send OTP email.' });
    }
    res.status(200).json({ message: '✅ OTP sent to your email.' });
  });
}catch(err){
  console.log('Error:',err);
  
}
});

router.post('/verify-otp', async (req, res) => {

  console.log("✅ Inside verify-otp route");

  const { email, otp } = req.body;

  const otpRecord = await OtpModel.findOne({ email });

  if (!otpRecord) {
    return res.status(404).json({ message: '❌ OTP not found.' });
  }

  if (otpRecord.otp !== otp) {
    return res.status(400).json({ message: '❌ Invalid OTP.' });
  }

  if (otpRecord.expiresAt < new Date()) {
    await OtpModel.deleteOne({ email }); // Clean up expired OTP
    return res.status(400).json({ message: '❌ OTP expired.' });
  }

  res.status(200).json({ message: '✅ OTP verified.' });
});

router.post('/reset-password', async (req, res) => {

  console.log("✅ Inside reset-password route");

  const { email, newPassword } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update in both collections if email matches
  await LoginModel.updateOne({ email }, { password: hashedPassword });
  await NewUsersLoginModel.updateOne({ email }, { password: hashedPassword });

  await OtpModel.deleteOne({ email }); // Remove OTP after success
  console.log('✅ Password reset successful.');

  res.status(200).json({ message: '✅ Password reset successful.' });
});

router.get('/insights', async (req, res) => {
  try {
    // Query 1: Organization changes
    const orgChanges = await UpdatedProfilesComparison.aggregate([
      { $match: { "changes.Organization/Law Firm Name": { $exists: true } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const orgChangeCount = orgChanges.length > 0 ? orgChanges[0].count : 0;

    // Query 2: All profiles with changes
    const orgMovers = await UpdatedProfilesComparison.find(
      {
        $or: [
          { "changes.Name": { $exists: true } },
          { "changes.Organization/Law Firm Name": { $exists: true } },
          { "changes.Address Line 1": { $exists: true } },
          { "changes.Address Line 2": { $exists: true } },
          { "changes.City": { $exists: true } },
          { "changes.State": { $exists: true } },
          { "changes.Country": { $exists: true } },
          { "changes.Zipcode": { $exists: true } },
          { "changes.Phone Number": { $exists: true } },
          { "changes.Status": { $exists: true } }
        ]
      },
      {
        name: 1,
        regCode: 1,
        "changes.Name": 1,
        "changes.Organization/Law Firm Name": 1,
        "changes.Address Line 1": 1,
        "changes.Address Line 2": 1,
        "changes.City": 1,
        "changes.State": 1,
        "changes.Country": 1,
        "changes.Zipcode": 1,
        "changes.Phone Number": 1,
        "changes.Status": 1,
        _id: 0
      }
    ).lean();

    // Query 3: Status changes (Agent to Attorney, Limited to Agent)
    const statusChanges = await UpdatedProfilesComparison.find(
      {
        "changes.Status": {
          $exists: true,
          $in: [
            { oldValue: { $regex: "^AGENT$", $options: "i" }, newValue: { $regex: "^ATTORNEY$", $options: "i" } },
            { oldValue: { $regex: "^LIMITED RECOGNITION$", $options: "i" }, newValue: { $regex: "^AGENT$", $options: "i" } }
          ]
        }
      },
      {
        regCode: 1,
        name: 1,
        "changes.Status": 1,
        _id: 0
      }
    ).lean();
    const statusChangeCount = statusChanges.length;
    const statusChangeDetails = statusChanges.map(doc => ({
      regCode: doc.regCode,
      name: doc.name,
      oldValue: doc.changes.Status.oldValue,
      newValue: doc.changes.Status.newValue
    }));

    // Query 4: Company leavers
    const companyLeavers = await UpdatedProfilesComparison.aggregate([
      { $match: { "changes.Organization/Law Firm Name": { $exists: true } } },
      {
        $group: {
          _id: "$changes.Organization/Law Firm Name.oldValue",
          people: {
            $push: {
              name: "$name",
              regCode: "$regCode",
              newOrganization: "$changes.Organization/Law Firm Name.newValue",
              nameChanged: { $cond: { if: { $gt: ["$changes.Name", null] }, then: "$changes.Name", else: null } }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $project: { company: "$_id", count: 1, people: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // Query 5: Address changes (count unique profiles)
    const addressChanges = await UpdatedProfilesComparison.find(
      {
        $or: [
          { "changes.Address Line 1": { $exists: true } },
          { "changes.Address Line 2": { $exists: true } },
          { "changes.City": { $exists: true } },
          { "changes.State": { $exists: true } },
          { "changes.Country": { $exists: true } },
          { "changes.Zipcode": { $exists: true } }
        ]
      },
      { regCode: 1, _id: 0 }
    ).distinct('regCode');
    const addressChangeCount = addressChanges.length;

    // Query 6: Name changes
    const nameChanges = await UpdatedProfilesComparison.aggregate([
      { $match: { "changes.Name": { $exists: true } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const nameChangeCount = nameChanges.length > 0 ? nameChanges[0].count : 0;

    // Query 7: Phone Number changes
    const phoneChanges = await UpdatedProfilesComparison.aggregate([
      { $match: { "changes.Phone Number": { $exists: true } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const phoneChangeCount = phoneChanges.length > 0 ? phoneChanges[0].count : 0;

    // Query 8: Changes by State (count all changes per state)
    const changesByState = await UpdatedProfilesComparison.aggregate([
      {
        $match: {
          $or: [
            { "changes.Name": { $exists: true } },
            { "changes.Organization/Law Firm Name": { $exists: true } },
            { "changes.Address Line 1": { $exists: true } },
            { "changes.Address Line 2": { $exists: true } },
            { "changes.City": { $exists: true } },
            { "changes.State": { $exists: true } },
            { "changes.Country": { $exists: true } },
            { "changes.Zipcode": { $exists: true } },
            { "changes.Phone Number": { $exists: true } },
            { "changes.Status": { $exists: true } }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gt: ["$changes.State.newValue", null] },
              then: "$changes.State.newValue",
              else: { $ifNull: ["$State", "Unknown"] } // Handle missing State
            }
          },
          count: { $sum: 1 }
        }
      },
      { $project: { state: "$_id", count: 1, _id: 0 } },
      { $sort: { state: 1 } }
    ]);
    const filteredChangesByState = changesByState.filter(item => item.state && item.state !== 'Unknown');

    // Query 9: Top Organizations with Changes
    const topOrganizations = await UpdatedProfilesComparison.aggregate([
      {
        $match: {
          "changes.Organization/Law Firm Name": { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gt: ["$changes.Organization/Law Firm Name.newValue", null] },
              then: "$changes.Organization/Law Firm Name.newValue",
              else: "$changes.Organization/Law Firm Name.oldValue"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { organization: "$_id", count: 1, _id: 0 } }
    ]);

    res.json({
      organizationChanges: orgChangeCount,
      organizationMovers: orgMovers,
      statusChanges: statusChangeCount,
      statusChangeDetails: statusChangeDetails,
      companyLeavers: companyLeavers,
      addressChanges: addressChangeCount,
      nameChanges: nameChangeCount,
      phoneChanges: phoneChangeCount,
      changesByState: filteredChangesByState,
      topOrganizations: topOrganizations
    });
  } catch (error) {
    console.error("❌ Error fetching insights:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;