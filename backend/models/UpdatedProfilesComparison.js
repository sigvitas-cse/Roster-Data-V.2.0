const mongoose = require("mongoose");

const updatedProfileSchema = new mongoose.Schema({
  regCode: { type: String, required: true, unique: true },
  name: { type: String },
  changes: { type: Object },
  isUpdated: { type: Boolean, default: false }, // Add this field if missing
});

const UpdatedProfilesComparison = mongoose.model("UpdatedProfilesComparison", updatedProfileSchema);

module.exports = UpdatedProfilesComparison;
