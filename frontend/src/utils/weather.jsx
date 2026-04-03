/**
 * Weather & Environmental Data Integration:
 * Interacts with backend weather services to retrieve historical and 
 * real-time atmospheric metrics (Precipitation, AQI, Heat).
 */

import api from './api';

/**
 * getWeather:
 * Fetches current atmospheric conditions for coordinates via secure backend proxy.
 */
export const getWeather = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/weather', {
      params: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
    return data;
  } catch (err) {
    console.error('Weather Retrieval Failure:', err.response?.data?.message || err.message);
    throw err;
  }
};

/**
 * getAQI:
 * Retrieves Air Quality Index and granular pollutant data (PM2.5, PM10).
 */
export const getAQI = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/weather/aqi', {
      params: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
    return data;
  } catch (err) {
    console.error('AQI Retrieval Failure:', err.response?.data?.message || err.message);
    throw err;
  }
};

/**
 * getWeatherAlerts:
 * Retrieves official meteorological alerts for specified coordinates.
 */
export const getWeatherAlerts = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/weather/alerts', {
      params: { latitude, longitude }
    });
    return data;
  } catch (err) {
    console.error('Alert Retrieval Failure:', err);
    throw err;
  }
};

/**
 * validateClaimAgainstWeather:
 * Backend-proxied verification to cross-check claim disruptors with API logs.
 */
export const validateClaimAgainstWeather = async (triggerType, latitude, longitude) => {
  try {
    const { data } = await api.post('/validate-claim', {
      triggerType,
      latitude,
      longitude
    });
    return data;
  } catch (err) {
    console.error('Claim Validation Handshake Error:', err);
    throw err;
  }
};

/**
 * getLiveTriggersForLocation:
 * Returns any active parametric disruption triggers detected in worker's current zone.
 */
export const getLiveTriggersForLocation = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/triggers/live-location', {
      params: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
    return data;
  } catch (err) {
    console.error('Live Trigger Analysis Failure:', err);
    throw err;
  }
};

/**
 * formatWeatherDisplay:
 * Utility for mapping raw weather metrics to human-readable UI strings.
 */
export const formatWeatherDisplay = (weather) => {
  return {
    temp: `${Math.round(weather.temp)}°C`,
    condition: weather.weather?.[0]?.main || 'N/A',
    humidity: `${weather.humidity}%`,
    windSpeed: `${Math.round(weather.wind_speed * 3.6)} km/h`,
    feelsLike: `${Math.round(weather.feels_like)}°C`
  };
};

/**
 * formatAQIDisplay:
 * Maps numerical AQI levels to qualitative health assessments and UI color tokens.
 */
export const formatAQIDisplay = (aqi) => {
  let aqiLevel = 'Good';
  let aqiColor = '#00C49F';
  
  if (aqi.aqi >= 5) {
    aqiLevel = 'Hazardous';
    aqiColor = '#8B0000';
  } else if (aqi.aqi >= 4) {
    aqiLevel = 'Very Unhealthy';
    aqiColor = '#FF4444';
  } else if (aqi.aqi >= 3) {
    aqiLevel = 'Unhealthy';
    aqiColor = '#FF6B35';
  } else if (aqi.aqi >= 2) {
    aqiLevel = 'Moderate';
    aqiColor = '#FFD166';
  } else if (aqi.aqi >= 1) {
    aqiLevel = 'Acceptable';
    aqiColor = '#FFD166';
  }
  
  return {
    level: aqiLevel,
    color: aqiColor,
    pm25: aqi.pm25 || 'N/A',
    pm10: aqi.pm10 || 'N/A'
  };
};
