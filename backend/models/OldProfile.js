const mongoose = require("mongoose");

const OldProfileSchema = new mongoose.Schema({
  slNo: Number,
  name: String,
  organization: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  country: String,
  zipcode: String,
  phoneNumber: String,
  regCode: String,
  agentAttorney: String,
  dateOfPatent: String,
  agentLicensed: String,
  firmOrOrganization: String,
  updatedPhoneNumber: String,
  emailAddress: String,
  updatedOrganization: String,
  firmUrl: String,
  updatedAddress: String,
  updatedCity: String,
  updatedState: String,
  updatedCountry: String,
  updatedZipcode: String,
  linkedInProfile: String,
  notes: String,
  initials: String,
  dataUpdatedAsOn: String,
  userId: String,
  admin: String,
});

module.exports = mongoose.model("oldprofiles", OldProfileSchema);
// module.exports = mongoose.model("fortestinNEW", OldProfileSchema);
