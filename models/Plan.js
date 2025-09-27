const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: ['1 day', '1 week', '1 month'], index: true },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    discount: { type: Number },
    description: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
