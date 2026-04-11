const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

/**
 * Admin Routes
 * These routes allow admins to view and manage all platform data
 * No authentication required for demo (in production, would require admin auth middleware)
 */

/**
 * @route   GET /api/admin/workers
 * @desc    Get all workers with their account details and stats
 * @access  Admin only
 */
router.get('/workers', async (req, res) => {
  try {
    const workers = await Worker.find().select('-password');

    // Enrich worker data with policy and claim info
    const enrichedWorkers = await Promise.all(
      workers.map(async (worker) => {
        const policies = await Policy.find({ worker: worker._id });
        const claims = await Claim.find({ worker: worker._id });

        const activePolicy = policies.find(p => p.status === 'Active');

        return {
          _id: worker._id,
          name: worker.name,
          phone: worker.phone,
          email: worker.email,
          platform: worker.platform,
          city: worker.city,
          pincode: worker.pincode,
          avgWeeklyEarnings: worker.avgWeeklyEarnings,
          avgDailyHours: worker.avgDailyHours,
          riskScore: worker.riskScore,
          riskZone: worker.riskZone,
          createdAt: worker.createdAt,
          activePlan: activePolicy ? activePolicy.plan : null,
          totalClaims: claims.length
        };
      })
    );

    res.json(enrichedWorkers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workers: ' + err.message });
  }
});

/**
 * @route   GET /api/admin/policies
 * @desc    Get all policies across the platform
 * @access  Admin only
 */
router.get('/policies', async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate('worker', 'name phone platform')
      .sort('-createdAt');
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch policies: ' + err.message });
  }
});

/**
 * @route   GET /api/admin/claims
 * @desc    Get all claims across all workers
 * @access  Admin only
 */
router.get('/claims', async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('worker', 'name phone platform')
      .populate('policy', 'plan')
      .sort('-claimDate');

    // Enrich claims with worker info in a flat structure for easy display
    const enrichedClaims = claims.map(claim => ({
      _id: claim._id,
      workerName: claim.worker?.name || 'Unknown',
      workerPhone: claim.worker?.phone,
      triggerType: claim.triggerType,
      hoursLost: claim.hoursLost,
      payoutAmount: claim.payoutAmount,
      status: claim.status,
      fraudScore: claim.fraudScore || 0,
      claimDate: claim.claimDate,
      resolvedAt: claim.resolvedAt,
      worker: claim.worker
    }));

    res.json(enrichedClaims);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch claims: ' + err.message });
  }
});

/**
 * @route   GET /api/admin/claims/:id
 * @desc    Get a specific claim detail
 * @access  Admin only
 */
router.get('/claims/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('worker')
      .populate('policy');
    
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch claim: ' + err.message });
  }
});

/**
 * @route   PUT /api/admin/claims/:id/approve
 * @desc    Approve a pending/under-review claim
 * @access  Admin only
 */
router.put('/claims/:id/approve', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    // Update claim status
    claim.status = 'Approved';
    claim.resolvedAt = new Date();
    await claim.save();

    // Update policy payout received
    const policy = await Policy.findById(claim.policy);
    if (policy && claim.status !== 'Rejected') {
      policy.totalPayoutReceived = (policy.totalPayoutReceived || 0) + claim.payoutAmount;
      await policy.save();
    }

    res.json({ message: 'Claim approved successfully', claim });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve claim: ' + err.message });
  }
});

/**
 * @route   PUT /api/admin/claims/:id/reject
 * @desc    Reject a pending/under-review claim
 * @access  Admin only
 */
router.put('/claims/:id/reject', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    // Update claim status
    claim.status = 'Rejected';
    claim.resolvedAt = new Date();
    await claim.save();

    res.json({ message: 'Claim rejected successfully', claim });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject claim: ' + err.message });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get summarized platform statistics
 * @access  Admin only
 */
router.get('/stats', async (req, res) => {
  try {
    const workers = await Worker.find();
    const policies = await Policy.find();
    const claims = await Claim.find();

    const activePolicies = policies.filter(p => p.status === 'Active');
    const approvedClaims = claims.filter(c => ['Auto-Approved', 'Approved', 'Paid'].includes(c.status));
    const pendingClaims = claims.filter(c => c.status === 'Under Review');

    const totalPayouts = approvedClaims.reduce((sum, c) => sum + c.payoutAmount, 0);
    const totalPremiums = policies.reduce((sum, p) => sum + p.totalPremiumPaid, 0);

    res.json({
      totalWorkers: workers.length,
      activePolicies: activePolicies.length,
      totalClaims: claims.length,
      approvedClaims: approvedClaims.length,
      pendingClaims: pendingClaims.length,
      totalPayouts,
      totalPremiums,
      lossRatio: totalPremiums > 0 ? (totalPayouts / totalPremiums * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats: ' + err.message });
  }
});

module.exports = router;
