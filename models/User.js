const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'driver', 'user'], default: 'user', index: true },
    phone: { type: String, trim: true },
    contact: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    image: {
      data: Buffer,
      contentType: String
    }
  },
  { timestamps: true }
);

// Ensure images are serialized as base64 strings and never expose password
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    if (ret.image && ret.image.data) {
      ret.image = {
        contentType: ret.image.contentType || 'application/octet-stream',
        data: Buffer.from(ret.image.data).toString('base64')
      };
    }
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
