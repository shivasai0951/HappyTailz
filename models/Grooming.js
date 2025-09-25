const mongoose = require('mongoose');

const GroomingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    services: [{ type: String }],
    price: { type: Number, required: true },
    oldprice: { type: Number },
    address: { type: String, trim: true },
    durationMinutes: { type: Number },
    active: { type: Boolean, default: true },
    image: {
      data: Buffer,
      contentType: String
    }
  },
  { timestamps: true }
);

// Ensure images are serialized as base64 strings
GroomingSchema.set('toJSON', {
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

module.exports = mongoose.model('Grooming', GroomingSchema);
