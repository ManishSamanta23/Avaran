const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, platform, platformId, city, pincode,
      avgWeeklyEarnings, avgDailyHours, password } = req.body;

    const exists = await Worker.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    // Simple risk scoring based on city
    const highRiskCities = ['Mumbai', 'Delhi', 'Chennai'];
    const medRiskCities = ['Bengaluru', 'Kolkata', 'Hyderabad'];
    let riskScore = 0.3;
    let riskZone = 'Low';
    if (highRiskCities.includes(city)) { riskScore = 0.8; riskZone = 'High'; }
    else if (medRiskCities.includes(city)) { riskScore = 0.55; riskZone = 'Medium'; }

    const worker = await Worker.create({
      name, phone, email, platform, platformId, city, pincode,
      avgWeeklyEarnings: avgWeeklyEarnings || 4000,
      avgDailyHours: avgDailyHours || 10,
      riskScore, riskZone, password
    });

    res.status(201).json({
      _id: worker._id,
      name: worker.name,
      phone: worker.phone,
      platform: worker.platform,
      city: worker.city,
      riskScore: worker.riskScore,
      riskZone: worker.riskZone,
      token: generateToken(worker._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const worker = await Worker.findOne({ phone });
    if (worker && (await worker.matchPassword(password))) {
      res.json({
        _id: worker._id,
        name: worker.name,
        phone: worker.phone,
        platform: worker.platform,
        city: worker.city,
        riskScore: worker.riskScore,
        riskZone: worker.riskZone,
        token: generateToken(worker._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
