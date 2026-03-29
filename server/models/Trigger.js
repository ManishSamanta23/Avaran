const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'],
    required: true
  },
  city: { type: String, required: true },
  pincode: { type: String },
  value: { type: String },
  threshold: { type: String },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  isActive: { type: Boolean, default: true },
  affectedWorkers: { type: Number, default: 0 },
  dataSource: { type: String },
  detectedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('Trigger', triggerSchema);
