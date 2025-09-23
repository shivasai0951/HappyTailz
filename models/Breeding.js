const mongoose = require('mongoose');

const BreedingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    imageUrl: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Breeding', BreedingSchema);
