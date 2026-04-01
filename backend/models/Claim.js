const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  triggerType: {
    type: String,
    enum: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'],
    required: true
  },
  triggerValue: { type: String },
  hoursLost: { type: Number, required: true },
  payoutAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Auto-Approved', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  fraudScore: { type: Number, default: 0 },
  payoutMethod: { type: String, default: 'UPI' },
  payoutTransactionId: { type: String },
  isAutoClaim: { type: Boolean, default: true },
  claimDate: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Claim', claimSchema);
