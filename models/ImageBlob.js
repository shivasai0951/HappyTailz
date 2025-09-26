const mongoose = require('mongoose');

const ImageBlobSchema = new mongoose.Schema(
  {
    _id: { type: String }, // short id
    contentType: { type: String, required: true },
    blob: { type: Buffer, required: true }, // encrypted payload: iv(12) | tag(16) | ciphertext
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model('ImageBlob', ImageBlobSchema);
