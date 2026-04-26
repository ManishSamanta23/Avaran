const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const { generateFraudRiskInsight } = require('./geminiRiskInsights');

/**
 * Weighted Fraud Scoring Engine
 * 
 * Uses a multi-factor weighted scoring system to assess claim authenticity.
 * Combines location, temporal, behavioral, and economic signals.
 */

/**
 * Calculate location mismatch score (0 to 1)
 * 
 * Checks if user's registered pincode matches the claimed disruption zone.
 * - Exact match (same pincode) → 0.0
 * - Same city (first 2 digits match in Indian postal system) → 0.3
 * - Different city → 1.0
 */
async function getLocationMismatchScore(workerPincode, claimPincode) {
  try {
    // If no claim pincode provided, neutral score
    if (!claimPincode) return 0.1;
    
    const workerZip = workerPincode.substring(0, 2);
    const claimZip = claimPincode.substring(0, 2);
    
    if (workerPincode === claimPincode) {
      return 0.0; // Exact match - trusted
    } else if (workerZip === claimZip) {
      return 0.3; // Same city/region - moderate risk
    } else {
      return 1.0; // Different city - high risk
    }
  } catch (err) {
    console.error('Location score calculation error:', err);
    return 0.5; // Default neutral on error
  }
}

/**
 * Calculate platform activity score (0 to 1)
 * 
 * Evaluates claim timing and user history patterns.
 */
async function getPlatformActivityScore(worker, claimDate) {
  try {
    let score = 0.0;
    
    // Check claim submission time vs working hours (6 AM to 10 PM)
    const claimHour = new Date(claimDate).getHours();
    if (claimHour < 6 || claimHour >= 22) {
      score += 0.5; // Outside working hours
    }
    
    // Check user's claim history
    const allClaims = await Claim.find({ worker: worker._id });
    
    // New user (0 previous claims) - slight suspicion
    if (allClaims.length === 0) {
      score += 0.1;
    }
    
    // Check for excessive claims in 30 days (> 5 claims)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentClaims = allClaims.filter(c => new Date(c.claimDate) >= thirtyDaysAgo);
    
    if (recentClaims.length > 5) {
      score += 0.8; // Excessive claims behavior
    }
    
    return Math.min(score, 1.0);
  } catch (err) {
    console.error('Platform activity score calculation error:', err);
    return 0.1; // Default low risk on error
  }
}

/**
 * Calculate duplicate signal score (0 to 1)
 * 
 * Detects suspicious claim patterns and patterns of abuse.
 */
async function getDuplicateSignalScore(worker, triggerType, claimDate) {
  try {
    let score = 0.0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get all claims from this worker in the last 7 days
    const recentClaims = await Claim.find({
      worker: worker._id,
      claimDate: { $gte: sevenDaysAgo }
    });
    
    // Multiple claims from same user in 7 days
    if (recentClaims.length > 1) {
      score += 0.7;
    }
    
    // Multiple claims for same trigger type in 7 days
    const sameTriggerClaims = recentClaims.filter(c => c.triggerType === triggerType);
    if (sameTriggerClaims.length > 1) {
      score += 0.9; // Very suspicious pattern
    }
    
    return Math.min(score, 1.0);
  } catch (err) {
    console.error('Duplicate signal score calculation error:', err);
    return 0.0; // Default safe on error
  }
}

/**
 * Calculate behavioral anomaly score (0 to 1)
 * 
 * Flags unusual claim behaviors relative to user's profile and history.
 */
async function getBehavioralAnomalyScore(worker, claimName, hoursLost, claimDate) {
  try {
    let score = 0.0;
    const policy = await Policy.findOne({ 
      worker: worker._id, 
      status: 'Active' 
    });
    
    if (!policy) return 0.3; // No active policy - unusual
    
    // Get claim history to calculate average payout
    const allClaims = await Claim.find({ worker: worker._id });
    const approvedClaims = allClaims.filter(c => 
      ['Auto-Approved', 'Approved', 'Paid'].includes(c.status)
    );
    
    if (approvedClaims.length > 0) {
      const avgPayout = approvedClaims.reduce((sum, c) => sum + c.payoutAmount, 0) / approvedClaims.length;
      
      // Calculate estimated payout for this claim
      const avgDailyEarnings = worker.avgWeeklyEarnings / 7;
      const ratios = { 'Basic': 0.5, 'Pro': 0.75, 'Max': 1.0 };
      const ratio = ratios[policy.plan] || 0.75;
      const estimatedPayout = Math.round((hoursLost / worker.avgDailyHours) * avgDailyEarnings * ratio);
      
      // Claim amount > 2x average payout
      if (estimatedPayout > avgPayout * 2) {
        score += 0.6;
      }
    } else {
      // First claim - check if it's for maximum payout
      const maxPayout = policy.maxWeeklyPayout;
      const avgDailyEarnings = worker.avgWeeklyEarnings / 7;
      const ratios = { 'Basic': 0.5, 'Pro': 0.75, 'Max': 1.0 };
      const ratio = ratios[policy.plan] || 0.75;
      const estimatedPayout = Math.round((hoursLost / worker.avgDailyHours) * avgDailyEarnings * ratio);
      
      if (estimatedPayout >= maxPayout * 0.9) {
        score += 0.5; // First claim for near-max payout
      }
    }
    
    // Check if plan was upgraded within 24 hours before claim
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    if (new Date(policy.startDate) >= oneDayAgo) {
      score += 0.8; // Recent plan upgrade before claim
    }
    
    return Math.min(score, 1.0);
  } catch (err) {
    console.error('Behavioral anomaly score calculation error:', err);
    return 0.0; // Default safe on error
  }
}

/**
 * Comprehensive Fraud Score Calculation
 * 
 * Combines all weighted components into a final fraud score (0 to 1).
 * Returns breakdown of individual scores for admin visibility.
 */
async function calculateFraudScore(worker, claim, claimPincode = null) {
  try {
    // Calculate individual component scores
    const locationScore = await getLocationMismatchScore(worker.pincode, claimPincode);
    const platformScore = await getPlatformActivityScore(worker, claim.claimDate);
    const duplicateScore = await getDuplicateSignalScore(worker, claim.triggerType, claim.claimDate);
    const behavioralScore = await getBehavioralAnomalyScore(worker, claim.triggerType, claim.hoursLost, claim.claimDate);
    
    // Calculate weighted fraud score
    const fraudScore =
      (locationScore * 0.35) +
      (platformScore * 0.30) +
      (duplicateScore * 0.20) +
      (behavioralScore * 0.15);
    
    // Determine status and return detailed breakdown
    let decision = 'UNDER_REVIEW';
    let decisionReason = 'Manual review required';
    
    if (fraudScore < 0.20) {
      decision = 'AUTO_APPROVE';
      decisionReason = 'Low fraud risk detected';
    } else if (fraudScore < 0.50) {
      decision = 'UNDER_REVIEW';
      decisionReason = 'Moderate fraud risk - requires human verification';
    } else {
      decision = 'HOLD_MANUAL_REVIEW';
      decisionReason = 'High fraud risk - flagged for manual review';
    }
    
    const result = {
      fraudScore: parseFloat(fraudScore.toFixed(4)),
      fraudPercentage: Math.round(fraudScore * 100),
      decision,
      decisionReason,
      breakdown: {
        locationMismatchScore: parseFloat(locationScore.toFixed(4)),
        platformActivityScore: parseFloat(platformScore.toFixed(4)),
        duplicateSignalScore: parseFloat(duplicateScore.toFixed(4)),
        behavioralAnomalyScore: parseFloat(behavioralScore.toFixed(4))
      },
      signals: {
        locationMismatch: locationScore > 0 ? `Score: ${(locationScore * 100).toFixed(0)}%` : 'None',
        platformActivity: platformScore > 0 ? `Score: ${(platformScore * 100).toFixed(0)}%` : 'None',
        duplicatePattern: duplicateScore > 0 ? `Score: ${(duplicateScore * 100).toFixed(0)}%` : 'None',
        behavioralAnomaly: behavioralScore > 0 ? `Score: ${(behavioralScore * 100).toFixed(0)}%` : 'None'
      }
    };

    const aiReview = await generateFraudRiskInsight({
      claim: {
        triggerType: claim.triggerType,
        hoursLost: claim.hoursLost,
        claimDate: claim.claimDate
      },
      worker: {
        pincode: worker.pincode,
        avgWeeklyEarnings: worker.avgWeeklyEarnings,
        avgDailyHours: worker.avgDailyHours
      },
      claimPincode,
      scoring: {
        fraudScore: result.fraudScore,
        fraudPercentage: result.fraudPercentage,
        decision: result.decision,
        breakdown: result.breakdown
      }
    });

    if (aiReview) {
      result.signals.aiRiskInsight = aiReview.riskSummary;
      result.aiReview = aiReview;
    }

    return result;
  } catch (err) {
    console.error('Fraud score calculation error:', err);
    return {
      fraudScore: 0.25,
      fraudPercentage: 25,
      decision: 'UNDER_REVIEW',
      decisionReason: 'Error calculating fraud score - routed to manual review',
      breakdown: {
        locationMismatchScore: 0,
        platformActivityScore: 0,
        duplicateSignalScore: 0,
        behavioralAnomalyScore: 0
      },
      signals: {},
      error: err.message
    };
  }
}

module.exports = {
  calculateFraudScore,
  getLocationMismatchScore,
  getPlatformActivityScore,
  getDuplicateSignalScore,
  getBehavioralAnomalyScore
};
