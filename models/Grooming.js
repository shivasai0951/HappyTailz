const mongoose = require('mongoose');

const GroomingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    services: [{ type: String }],
    price: { type: Number, required: true },
    durationMinutes: { type: Number },
    active: { type: Boolean, default: true },
    imageUrl: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grooming', GroomingSchema);
