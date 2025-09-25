const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    services: [{ type: String }],
    active: { type: Boolean, default: true },
    image: {
      data: Buffer,
      contentType: String
    }
  },
  { timestamps: true }
);

// Ensure images are serialized as base64 strings
HospitalSchema.set('toJSON', {
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

module.exports = mongoose.model('Hospital', HospitalSchema);
