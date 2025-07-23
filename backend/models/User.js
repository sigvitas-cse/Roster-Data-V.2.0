const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  slNo: { type: Number, required: false },
  name: { type: String, required: false },
  organization: { type: String, required: false },
  addressLine1: { type: String, required: false },
  addressLine2: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  country: { type: String, required: false },
  zipcode: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  regCode: { type: String, required: false },
  agentAttorney: { type: String, required: false },
  dateOfPatent: { type: String, required: false },
  agentLicensed: { type: String, required: false },
  firmOrOrganization: { type: String, required: false },
  updatedPhoneNumber: { type: String, required: false },
  emailAddress: { type: String, required: false },
  updatedOrganization: { type: String, required: false },
  firmUrl: { type: String, required: false },
  updatedAddress: { type: String, required: false },
  updatedCity: { type: String, required: false },
  updatedState: { type: String, required: false },
  updatedCountry: { type: String, required: false },
  updatedZipcode: { type: String, required: false },
  linkedInProfile: { type: String, required: false },
  notes: { type: String, required: false },
  initials: { type: String, required: false },
  dataUpdatedAsOn: { type: String, required: false },
  userId: { type: String, required: false },
  admin: { type: String, required: false },
// 🔹 New Fields for LinkedIn Monitoring
  lastChecked: { type: Date, default: null }, // Last checked date
  previousData: { type: Object, default: null }, // Old LinkedIn data
  latestData: { type: Object, default: null }, // Latest LinkedIn data
  changesDetected: { type: Boolean, default: false }, // If any update found
  notes: { type: String, required: false },
  initials: { type: String, required: false },
  dataUpdatedAsOn: { type: String, required: false },
  userId: { type: String, required: false },
  admin: { type: String, required: false },
});


module.exports = mongoose.model("exceldatas", UserSchema);