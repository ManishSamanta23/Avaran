const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const AQI_BASE = 'https://api.openweathermap.org/data/2.5/air_pollution';

/**
 * @route GET /api/weather
 * @desc Get weather data for given coordinates
 * @access Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    if (!OPENWEATHER_API_KEY) {
      console.error('❌ OPENWEATHER_API_KEY is not configured in .env');
      return res.status(500).json({ 
        message: 'Weather API not configured. Add OPENWEATHER_API_KEY to server/.env file',
        hint: 'Get free key from: https://openweathermap.org/api'
      });
    }

    // Get current weather
    try {
      const weatherRes = await axios.get(`${OPENWEATHER_BASE}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          units: 'metric',
          appid: OPENWEATHER_API_KEY
        },
        timeout: 5000
      });

      const weather = weatherRes.data;

      res.json({
        temp: weather.main.temp,
        feels_like: weather.main.feels_like,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        wind_speed: weather.wind.speed,
        wind_gust: weather.wind.gust || 0,
        weather: weather.weather,
        clouds: weather.clouds.all,
        rain: weather.rain?.['1h'] || 0,
        snow: weather.snow?.['1h'] || 0,
        visibility: weather.visibility,
        uvi: weather.uvi || null,
        timestamp: new Date(weather.dt * 1000)
      });
    } catch (apiErr) {
      console.error('❌ OpenWeatherMap API Error:', apiErr.response?.status, apiErr.response?.data?.message || apiErr.message);
      
      if (apiErr.response?.status === 401) {
        return res.status(401).json({ 
          message: 'Invalid API key. Check OPENWEATHER_API_KEY in .env',
          hint: 'Get free key from: https://openweathermap.org/api'
        });
      }
      
      res.status(500).json({ 
        message: 'Failed to fetch weather from OpenWeatherMap',
        error: apiErr.message 
      });
    }
  } catch (err) {
    console.error('❌ Weather endpoint error:', err.message);
    res.status(500).json({ message: 'Failed to fetch weather data', error: err.message });
  }
});

/**
 * @route GET /api/weather/aqi
 * @desc Get Air Quality Index for given coordinates
 * @access Private
 */
router.get('/aqi', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    if (!OPENWEATHER_API_KEY) {
      console.error('❌ OPENWEATHER_API_KEY is not configured in .env');
      return res.status(500).json({ 
        message: 'AQI API not configured. Add OPENWEATHER_API_KEY to server/.env file',
        hint: 'Get free key from: https://openweathermap.org/api'
      });
    }

    try {
      const aqiRes = await axios.get(AQI_BASE, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: OPENWEATHER_API_KEY
        },
        timeout: 5000
      });

      const data = aqiRes.data.list[0];
      const components = data.components;

      // Convert AQI number to level (1-5): 1=Good, 5=Very Poor
      const aqi = data.main.aqi;

      res.json({
        aqi,
        aqi_level: getAQILevel(aqi),
        pm25: Math.round(components.pm2_5),
        pm10: Math.round(components.pm10),
        no2: Math.round(components.no2),
        o3: Math.round(components.o3),
        so2: Math.round(components.so2),
        co: Math.round(components.co),
        timestamp: new Date(data.dt * 1000)
      });
    } catch (apiErr) {
      console.error('❌ OpenWeatherMap AQI Error:', apiErr.response?.status, apiErr.response?.data?.message || apiErr.message);
      
      if (apiErr.response?.status === 401) {
        return res.status(401).json({ 
          message: 'Invalid API key. Check OPENWEATHER_API_KEY in .env',
          hint: 'Get free key from: https://openweathermap.org/api'
        });
      }
      
      res.status(500).json({ 
        message: 'Failed to fetch AQI from OpenWeatherMap',
        error: apiErr.message 
      });
    }
  } catch (err) {
    console.error('❌ AQI endpoint error:', err.message);
    res.status(500).json({ message: 'Failed to fetch AQI data', error: err.message });
  }
});

/**
 * @route GET /api/weather/alerts
 * @desc Get weather alerts for location
 * @access Private
 */
router.get('/alerts', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ 
        message: 'Weather Alert API not configured' 
      });
    }

    const weatherRes = await axios.get(`${OPENWEATHER_BASE}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY
      }
    });

    const alerts = weatherRes.data.alerts || [];

    res.json(alerts.map(alert => ({
      event: alert.event,
      start: new Date(alert.start * 1000),
      end: new Date(alert.end * 1000),
      description: alert.description,
      tags: alert.tags || []
    })));
  } catch (err) {
    console.error('Weather alerts API error:', err.message);
    res.status(500).json({ message: 'Failed to fetch weather alerts' });
  }
});

/**
 * Helper function to convert AQI number to level
 */
function getAQILevel(aqi) {
  switch(aqi) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
}

module.exports = router;
