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
    image: {
      data: Buffer,
      contentType: String
    },
    // Controls whether this pet should appear in the public breeding list
    showInBreeding: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// Ensure images are serialized as base64 strings
PetSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.image && ret.image.data) {
      ret.image = {
        contentType: ret.image.contentType || 'application/octet-stream',
        data: Buffer.from(ret.image.data).toString('base64')
      };
    }
    return ret;
  }
});

module.exports = mongoose.model('Pet', PetSchema);
