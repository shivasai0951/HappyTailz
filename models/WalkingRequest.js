const mongoose = require('mongoose');

const WalkingRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    scheduleAt: { type: Date, required: true },
    location: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['requested', 'approved', 'assigned', 'completed', 'cancelled', 'rejected'], default: 'requested', index: true },
    approvedAt: { type: Date },
    assignedAt: { type: Date },
    completedAt: { type: Date },
    days: {
      type: [
        new mongoose.Schema(
          {
            date: { type: Date, required: true },
            status: { type: String, enum: ['pending', 'done', 'skipped', 'missed'], default: 'pending' },
            note: { type: String, default: '' }
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalkingRequest', WalkingRequestSchema);
