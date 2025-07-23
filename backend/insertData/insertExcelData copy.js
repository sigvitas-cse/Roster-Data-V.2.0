const xlsx = require("xlsx");
const User = require("../models/User");
const mongoose = require("mongoose");
require("dotenv").config();

// Function to convert Excel date (if in serial format) to MM-DD-YYYY or retain MM-DD-YYYY
const convertDate = (date) => {
  if (typeof date === "number") {
    // Handle Excel serial date format
    const excelStartDate = new Date(1899, 11, 30); // Excel starts from 30-Dec-1899
    const convertedDate = new Date(excelStartDate.getTime() + date * 86400000);

    // Manually format the date to MM-DD-YYYY
    const month = (convertedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = convertedDate.getDate().toString().padStart(2, "0");
    const year = convertedDate.getFullYear();
    return `${day}-${month}-${year}`;
  } else if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    // If already in MM-DD-YYYY, return as is
    return date;
  }
  return "NA"; // Handle invalid or missing dates
};


const insertDataFromExcel = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB");

    // Define file paths
    const filePaths = [
                        // "C:/Users/dverm/Desktop/Task/backend/insertData/Darshan - Active Attorney - 11-03-2025.xlsx",
                        "C:/Users/dverm/Desktop/Task/backend/insertData/Active Attorney - Darshan - 17-03-2025.xlsx",
                      ];

    let allUsers = [];

    for (const filePath of filePaths) {
      // Read Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Map sheet data to your schema
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

      allUsers = allUsers.concat(users);
    }

    // Insert data into MongoDB
    await User.insertMany(allUsers);
    console.log("Data inserted successfully!");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    mongoose.connection.close(); // Close connection
  }
};

insertDataFromExcel();
