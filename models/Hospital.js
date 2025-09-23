const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    services: [{ type: String }],
    active: { type: Boolean, default: true },
    imageUrl: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', HospitalSchema);
