const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { protect } = require('../middleware/auth');

// Payout formula
const calculatePayout = (hoursLost, avgDailyHours, avgDailyEarnings, plan) => {
  const ratios = { Basic: 0.5, Pro: 0.75, Max: 1.0 };
  const ratio = ratios[plan] || 0.75;
  return Math.round((hoursLost / avgDailyHours) * avgDailyEarnings * ratio);
};

// Simple fraud score
const getFraudScore = (worker, triggerType, hoursLost) => {
  let score = 0;
  if (hoursLost > 12) score += 0.4;
  if (hoursLost > 8) score += 0.2;
  return Math.min(score, 1.0);
};

// @route POST /api/claims
router.post('/', protect, async (req, res) => {
  try {
    const { triggerType, triggerValue, hoursLost } = req.body;
    const policy = await Policy.findOne({ worker: req.worker._id, status: 'Active' });
    if (!policy) return res.status(400).json({ message: 'No active policy found' });

    if (!policy.coverageEvents.includes(triggerType))
      return res.status(400).json({ message: 'This trigger is not covered by your plan' });

    const avgDailyEarnings = req.worker.avgWeeklyEarnings / 7;
    const payoutAmount = Math.min(
      calculatePayout(hoursLost, req.worker.avgDailyHours, avgDailyEarnings, policy.plan),
      policy.maxWeeklyPayout
    );

    const fraudScore = getFraudScore(req.worker, triggerType, hoursLost);
    let status = 'Auto-Approved';
    if (fraudScore >= 0.6) status = 'Under Review';
    else if (fraudScore >= 0.3) status = 'Pending';

    const claim = await Claim.create({
      worker: req.worker._id,
      policy: policy._id,
      triggerType, triggerValue, hoursLost, payoutAmount,
      fraudScore, status,
      payoutTransactionId: status === 'Auto-Approved'
        ? 'TXN' + Date.now()
        : null
    });

    if (status === 'Auto-Approved') {
      policy.totalPayoutReceived += payoutAmount;
      await policy.save();
    }

    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/claims/my
router.get('/my', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ worker: req.worker._id })
      .populate('policy', 'plan')
      .sort('-claimDate');
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
