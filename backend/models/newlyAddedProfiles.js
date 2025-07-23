const mongoose = require("mongoose");

const newProfileSchema = new mongoose.Schema({
    regCode: String,
    name: String,
    details: Object
  });
  const NewProfiles = mongoose.model('NewProfilesComparison', newProfileSchema);

module.exports = NewProfiles;
