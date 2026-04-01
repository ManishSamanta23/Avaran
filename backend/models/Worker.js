const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  platform: { type: String, enum: ['Zepto', 'Blinkit', 'Both'], required: true },
  platformId: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  avgWeeklyEarnings: { type: Number, default: 4000 },
  avgDailyHours: { type: Number, default: 10 },
  riskScore: { type: Number, default: 0.5 },
  riskZone: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

workerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

workerSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);
