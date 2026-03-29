const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// @route GET /api/workers/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker._id).select('-password');
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/workers/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker._id);
    const { name, email, avgWeeklyEarnings, avgDailyHours } = req.body;
    if (name) worker.name = name;
    if (email) worker.email = email;
    if (avgWeeklyEarnings) worker.avgWeeklyEarnings = avgWeeklyEarnings;
    if (avgDailyHours) worker.avgDailyHours = avgDailyHours;
    await worker.save();
    res.json({ message: 'Profile updated', worker });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
