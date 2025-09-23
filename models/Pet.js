const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    notes: { type: String },
    imageUrl: { type: String, trim: true },
    // Controls whether this pet should appear in the public breeding list
    showInBreeding: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', PetSchema);
