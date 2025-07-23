const mongoose = require("mongoose");

const removedProfileSchema = new mongoose.Schema({
  regCode: String,
  name: String,
  details: Object
});
const RemovedProfiles = mongoose.model('RemovedProfilesComparison', removedProfileSchema);

module.exports = RemovedProfiles;
