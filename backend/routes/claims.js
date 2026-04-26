const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { protect } = require('../middleware/auth');
const { z } = require('zod');
const { validateClaimAgainstRealData } = require('../utils/autoApprovalEngine');
const { calculateFraudScore } = require('../utils/fraudScoringEngine');

/**
 * Validation schema for claim submission.
 * Geography coordinates are required for automated API verification.
 */
const claimSchema = z.object({
  triggerType: z.string({ required_error: 'Trigger type is required' }).min(1, 'Trigger type is required'),
  triggerValue: z.any().optional(),
  hoursLost: z.coerce.number().positive('Hours lost must be greater than 0').max(24, 'Hours lost cannot exceed 24'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  claimPincode: z.string().optional()
});

/**
 * Payout Algorithm:
 * Calculates total compensation based on hours lost, average earnings, and plan tier multiplier.
 */
const calculatePayout = (hoursLost, avgDailyHours, avgDailyEarnings, plan) => {
  const ratios = { Basic: 0.5, Pro: 0.75, Max: 1.0 };
  const ratio = ratios[plan] || 0.75;
  return Math.round((hoursLost / avgDailyHours) * avgDailyEarnings * ratio);
};

const AUTO_APPROVABLE_TRIGGERS = ['Heavy Rainfall', 'Flash Flood', 'Extreme Heat', 'Cyclone', 'Air Pollution'];

/**
 * @route   POST /api/claims
 * @desc    Submits a claim and triggers the automated parametric validation pipeline
 *          with comprehensive weighted fraud scoring.
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const parsed = claimSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
    
    const { triggerType, triggerValue, hoursLost, latitude, longitude, claimPincode } = parsed.data;
    
    const policy = await Policy.findOne({ worker: req.worker._id, status: 'Active' });
    if (!policy) return res.status(400).json({ message: 'No active policy found for this worker' });

    if (!policy.coverageEvents.includes(triggerType))
      return res.status(400).json({ message: 'The selected disruption event is not covered by current plan tier' });

    const avgDailyEarnings = req.worker.avgWeeklyEarnings / 7;
    const payoutAmount = Math.min(
      calculatePayout(hoursLost, req.worker.avgDailyHours, avgDailyEarnings, policy.plan),
      policy.maxWeeklyPayout
    );

    // Create temporary claim object for fraud scoring
    const tempClaim = {
      claimDate: new Date(),
      triggerType,
      hoursLost
    };

    // Calculate comprehensive fraud score
    const fraudScoring = await calculateFraudScore(req.worker, tempClaim, claimPincode);

    let status = 'Under Review';
    let autoApprovalDetails = null;
    let transactionId = null;

    /**
     * Decision Logic based on fraud score:
     * - fraudScore < 0.20 → AUTO-APPROVE
     * - fraudScore 0.20 to 0.50 → UNDER REVIEW
     * - fraudScore > 0.50 → HOLD for manual review, flag as HIGH RISK
     */
    
    if (fraudScoring.decision === 'AUTO_APPROVE' && 
        latitude && longitude && 
        AUTO_APPROVABLE_TRIGGERS.includes(triggerType)) {
      // Attempt environmental API verification for low-fraud claims
      try {
        const validationResult = await validateClaimAgainstRealData(triggerType, latitude, longitude);
        autoApprovalDetails = {
          ...validationResult,
          fraudScoring: fraudScoring
        };

        if (validationResult.success && validationResult.auto_approved) {
          status = 'Auto-Approved';
          transactionId = 'TXN' + Date.now();
        } else {
          status = 'Under Review';
        }
      } catch (validationError) {
        console.error('API Verification Fault:', validationError.message);
        status = 'Under Review';
        autoApprovalDetails = {
          success: false,
          error: validationError.message,
          decision_reason: 'Automated validation failed. Routed to manual review.',
          fraudScoring: fraudScoring
        };
      }
    } else if (fraudScoring.decision === 'HOLD_MANUAL_REVIEW') {
      // High fraud risk - flag for manual review
      status = 'Under Review';
      autoApprovalDetails = {
        success: false,
        error: 'High Fraud Risk Detected',
        decision_reason: fraudScoring.decisionReason,
        fraudScoring: fraudScoring,
        flaggedForManualReview: true,
        highRiskFlag: true
      };
    } else {
      // Moderate risk or missing data - route to manual review
      status = 'Under Review';
      autoApprovalDetails = {
        success: false,
        error: 'Manual Review Required',
        decision_reason: fraudScoring.decisionReason,
        fraudScoring: fraudScoring
      };

      // Add additional context for why manual review is needed
      if (!latitude || !longitude) {
        autoApprovalDetails.error = 'Geolocation Missing';
        autoApprovalDetails.decision_reason = 'Precise coordinates required for real-time verification';
      } else if (!AUTO_APPROVABLE_TRIGGERS.includes(triggerType)) {
        autoApprovalDetails.error = 'Manual Verification Required';
        autoApprovalDetails.decision_reason = `Event type requires human verification of external records`;
      }
    }

    const claim = await Claim.create({
      worker: req.worker._id,
      policy: policy._id,
      triggerType,
      triggerValue, 
      hoursLost,
      payoutAmount,
      fraudScore: fraudScoring.fraudScore,
      fraudScoringDetails: {
        fraudScore: fraudScoring.fraudScore,
        fraudPercentage: fraudScoring.fraudPercentage,
        decision: fraudScoring.decision,
        decisionReason: fraudScoring.decisionReason,
        breakdown: fraudScoring.breakdown,
        signals: {
          ...fraudScoring.signals,
          aiReview: fraudScoring.aiReview || null
        },
        calculatedAt: new Date()
      },
      status,
      payoutTransactionId: transactionId,
      isAutoClaim: status === 'Auto-Approved',
      autoApprovalDetails: autoApprovalDetails 
    });

    if (status === 'Auto-Approved') {
      policy.totalPayoutReceived = (policy.totalPayoutReceived || 0) + payoutAmount;
      await policy.save();
    }

    res.status(201).json({
      message: `Claim processed successfully: ${status}`,
      claim: claim,
      autoApprovalDetails: autoApprovalDetails,
      fraudScoring: fraudScoring
    });

  } catch (err) {
    console.error('Claim Submission Failure:', err.message);
    res.status(500).json({ message: 'Internal server fault during claim processing' });
  }
});

/**
 * @route   GET /api/claims/my
 * @desc    Retrieves claim history for the authenticated worker.
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ worker: req.worker._id })
      .populate('policy', 'plan')
      .sort('-claimDate');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve claim history: ' + err.message });
  }
});

module.exports = router;
