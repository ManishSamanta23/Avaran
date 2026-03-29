const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// @route GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const workerId = req.worker._id;
    const policy = await Policy.findOne({ worker: workerId, status: 'Active' });
    const claims = await Claim.find({ worker: workerId });

    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status));
    const totalPayout = approvedClaims.reduce((sum, c) => sum + c.payoutAmount, 0);
    const totalPremium = policy ? policy.totalPremiumPaid : 0;

    // Weekly claims for chart (last 8 weeks)
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekClaims = claims.filter(c =>
        new Date(c.claimDate) >= weekStart && new Date(c.claimDate) < weekEnd
      );
      weeklyData.push({
        week: `W${8 - i}`,
        claims: weekClaims.length,
        payout: weekClaims.reduce((s, c) => s + c.payoutAmount, 0)
      });
    }

    res.json({
      totalClaims,
      approvedClaims: approvedClaims.length,
      totalPayout,
      totalPremium,
      activePolicy: policy,
      weeklyData,
      earningsProtected: totalPayout,
      coverageRate: totalClaims > 0
        ? Math.round((approvedClaims.length / totalClaims) * 100) : 100
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
