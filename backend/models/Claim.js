const mongoose = require('mongoose');

/**
 * Claim Schema:
 * Data model for submitted disruption claims, including worker and policy relationships,
 * parametric trigger metrics, and automated validation results.
 */
const claimSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  triggerType: {
    type: String,
    enum: ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Severe AQI', 'Curfew/Bandh'],
    required: true
  },
  triggerValue: { 
    type: String,
    description: 'User-entered value (for audit only)'
  },
  hoursLost: { type: Number, required: true },
  payoutAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Auto-Approved', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  fraudScore: { type: Number, default: 0 },
  /**
   * Detailed fraud scoring breakdown:
   * Stores individual component scores, decision rationale, and fraud risk signals
   * for transparency and auditing purposes.
   */
  fraudScoringDetails: {
    fraudScore: { type: Number, default: 0 },
    fraudPercentage: { type: Number, default: 0 },
    decision: { 
      type: String, 
      enum: ['AUTO_APPROVE', 'UNDER_REVIEW', 'HOLD_MANUAL_REVIEW'],
      default: 'UNDER_REVIEW'
    },
    decisionReason: { type: String },
    breakdown: {
      locationMismatchScore: { type: Number, default: 0 },
      platformActivityScore: { type: Number, default: 0 },
      duplicateSignalScore: { type: Number, default: 0 },
      behavioralAnomalyScore: { type: Number, default: 0 }
    },
    signals: { type: mongoose.Schema.Types.Mixed },
    calculatedAt: { type: Date }
  },
  /**
   * Automated Approval Handshake:
   * Stores granular verification data from the parametric engine.
   * Tracks whether claimed environmental disruption matched actual 
   * atmospheric records at time/point of claim.
   */
  autoApprovalDetails: {
    success: { type: Boolean, default: false },
    disruption_type: { type: String },
    auto_approved: { type: Boolean },
    decision_reason: { type: String },
    checked_against_api: { type: Boolean, default: false },
    api_used: { type: String },
    error: { type: String },
    validation_data: {
      approved: { type: Boolean },
      metric: { type: String },
      actual_value: { type: mongoose.Schema.Types.Mixed },
      actual_aqi_level: { type: Number },
      actual_pm25: { type: Number },
      threshold: { type: mongoose.Schema.Types.Mixed },
      unit: { type: String },
      condition: { type: String },
      weather_description: { type: String },
      components: { type: mongoose.Schema.Types.Mixed }
    },
    timestamp: { type: Date }
  },
  payoutMethod: { type: String, default: 'UPI' },
  payoutTransactionId: { type: String },
  isAutoClaim: { type: Boolean, default: true },
  claimDate: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Claim', claimSchema);
