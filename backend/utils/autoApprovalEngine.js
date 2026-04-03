const axios = require('axios');

/**
 * Core Parametric Engine
 * Validates claims by cross-referencing worker geolocation with real-time 
 * environmental data from external APIs (Weather, AQI).
 */

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const AQI_BASE = 'https://api.openweathermap.org/data/2.5/air_pollution';

/**
 * Environmental thresholds calibrated for Indian urban conditions.
 */
const AUTO_APPROVAL_THRESHOLDS = {
  'Heavy Rainfall': {
    metric: 'rainfall_mm',
    threshold: 20,
    description: 'Rainfall >= 20 mm/hr'
  },
  'Flash Flood': {
    metric: 'rainfall_mm',
    threshold: 40,
    description: 'Rainfall >= 40 mm (3-hour) OR Extreme weather condition'
  },
  'Extreme Heat': {
    metric: 'temperature_celsius',
    threshold: 38,
    description: 'Temperature >= 38°C'
  },
  'Cyclone': {
    metric: 'wind_speed_kmh',
    threshold: 50,
    description: 'Wind Speed >= 50 km/h OR Cyclone Alert detected'
  },
  'Air Pollution': {
    metric: 'aqi_index',
    threshold: 4, 
    description: 'PM2.5 >= 250 µg/m³ OR AQI Level >= 4'
  }
};

/**
 * Queries OpenWeatherMap for current atmospheric conditions.
 */
async function fetchWeatherData(latitude, longitude) {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('API Configuration missing: OPENWEATHER_API_KEY');
    }

    const response = await axios.get(`${OPENWEATHER_BASE}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        units: 'metric',
        appid: OPENWEATHER_API_KEY
      },
      timeout: 5000
    });

    const data = response.data;

    return {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed, 
      wind_gust: data.wind.gust || 0,
      weather_condition: data.weather[0]?.main || '',
      weather_description: data.weather[0]?.description || '',
      clouds: data.clouds.all,
      rainfall_1h: data.rain?.['1h'] || 0,
      rainfall_3h: data.rain?.['3h'] || 0,
      snow_1h: data.snow?.['1h'] || 0,
      visibility: data.visibility,
      timestamp: new Date(data.dt * 1000)
    };
  } catch (error) {
    console.error('Weather Fetch Error:', error.message);
    throw new Error(`Failed to retrieve weather data: ${error.message}`);
  }
}

/**
 * Queries OpenWeatherMap for real-time Air Quality Index (AQI) data.
 */
async function fetchAQIData(latitude, longitude) {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('API Configuration missing: OPENWEATHER_API_KEY');
    }

    const response = await axios.get(AQI_BASE, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY
      },
      timeout: 5000
    });

    const data = response.data.list[0];
    const components = data.components;
    const aqi_level = data.main.aqi;

    // Estimate AQI index based on PM2.5 levels
    const pm25 = Math.round(components.pm2_5);
    const aqi_index = Math.round((pm25 / 35) * 100);

    return {
      aqi_level: aqi_level,
      aqi_index: aqi_index,
      pm25: pm25,
      pm10: Math.round(components.pm10),
      no2: Math.round(components.no2),
      o3: Math.round(components.o3),
      so2: Math.round(components.so2),
      co: Math.round(components.co),
      aqi_level_name: getAQILevelName(aqi_level),
      timestamp: new Date(data.dt * 1000)
    };
  } catch (error) {
    console.error('AQI Fetch Error:', error.message);
    throw new Error(`Failed to retrieve AQI data: ${error.message}`);
  }
}

/**
 * Maps categorical AQI levels (1-5) to descriptive labels.
 */
function getAQILevelName(level) {
  const levels = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor'
  };
  return levels[level] || 'Unknown';
}

/**
 * Validation logic for Heavy Rainfall claims.
 */
async function validateHeavyRainfall(latitude, longitude) {
  const weather = await fetchWeatherData(latitude, longitude);
  const rainfall = weather.rainfall_1h;
  const threshold = AUTO_APPROVAL_THRESHOLDS['Heavy Rainfall'].threshold;

  return {
    approved: rainfall >= threshold,
    metric: 'rainfall_1h',
    actual_value: rainfall,
    threshold: threshold,
    unit: 'mm',
    condition: `Actual: ${rainfall.toFixed(1)} mm, Threshold: ${threshold} mm`,
    weather_description: weather.weather_description,
    timestamp: weather.timestamp
  };
}

/**
 * Validation logic for Flash Flood claims using cumulative precipitation.
 */
async function validateFlashFlood(latitude, longitude) {
  const weather = await fetchWeatherData(latitude, longitude);
  const rainfall = Math.max(weather.rainfall_1h, weather.rainfall_3h);
  const threshold = AUTO_APPROVAL_THRESHOLDS['Flash Flood'].threshold;

  const isExtremeCondition = weather.weather_description.toLowerCase().includes('heavy rain') ||
                             weather.weather_description.toLowerCase().includes('extreme rain');

  return {
    approved: rainfall >= threshold || isExtremeCondition,
    metric: 'rainfall_3h',
    actual_value: rainfall,
    threshold: threshold,
    unit: 'mm',
    extreme_condition_detected: isExtremeCondition,
    condition: `Actual: ${rainfall.toFixed(1)} mm, Threshold: ${threshold} mm${isExtremeCondition ? ' (Condition Detected)' : ''}`,
    weather_description: weather.weather_description,
    timestamp: weather.timestamp
  };
}

/**
 * Validation logic for Extreme Heat based on ambient temperature.
 */
async function validateExtremeHeat(latitude, longitude) {
  const weather = await fetchWeatherData(latitude, longitude);
  const temperature = weather.temp;
  const threshold = AUTO_APPROVAL_THRESHOLDS['Extreme Heat'].threshold;

  return {
    approved: temperature >= threshold,
    metric: 'temperature',
    actual_value: temperature,
    threshold: threshold,
    unit: '°C',
    feels_like: weather.feels_like,
    condition: `Actual: ${temperature.toFixed(1)}°C, Threshold: ${threshold}°C`,
    weather_description: weather.weather_description,
    timestamp: weather.timestamp
  };
}

/**
 * Validation logic for Cyclone events based on wind speed and atmospheric alerts.
 */
async function validateCyclone(latitude, longitude) {
  const weather = await fetchWeatherData(latitude, longitude);
  const windSpeed = weather.wind_speed * 3.6;
  const threshold = AUTO_APPROVAL_THRESHOLDS['Cyclone'].threshold;

  const isCycloneCondition = weather.weather_description.toLowerCase().includes('cyclone') ||
                             weather.weather_description.toLowerCase().includes('storm') ||
                             weather.weather_description.toLowerCase().includes('tornado') ||
                             weather.weather_description.toLowerCase().includes('squall');

  return {
    approved: windSpeed >= threshold || isCycloneCondition,
    metric: 'wind_speed',
    actual_value: windSpeed,
    threshold: threshold,
    unit: 'km/h',
    cyclone_condition_detected: isCycloneCondition,
    condition: `Actual: ${windSpeed.toFixed(1)} km/h, Threshold: ${threshold} km/h${isCycloneCondition ? ' (Condition Detected)' : ''}`,
    weather_description: weather.weather_description,
    timestamp: weather.timestamp
  };
}

/**
 * Validation logic for Air Pollution claims using PM2.5 and AQI indicators.
 */
async function validateAirPollution(latitude, longitude) {
  const aqi = await fetchAQIData(latitude, longitude);
  const threshold = AUTO_APPROVAL_THRESHOLDS['Air Pollution'].threshold;
  const pm25 = aqi.pm25;

  const autoApproveOnLevel = aqi.aqi_level >= threshold;
  const autoApproveOnPM25 = pm25 >= 250;

  return {
    approved: autoApproveOnLevel || autoApproveOnPM25,
    metric: 'aqi_level',
    actual_aqi_level: aqi.aqi_level,
    actual_aqi_level_name: aqi.aqi_level_name,
    actual_pm25: pm25,
    threshold_aqi_level: threshold,
    threshold_pm25: 250,
    unit: 'AQI Level (1-5) / PM2.5 (µg/m³)',
    condition: `AQI: ${aqi.aqi_level} (${aqi.aqi_level_name}), PM2.5: ${pm25}`,
    components: aqi.components,
    timestamp: aqi.timestamp
  };
}

/**
 * Orchestrates claim validation against real-time API data.
 */
async function validateClaimAgainstRealData(disruptionType, latitude, longitude) {
  if (!latitude || !longitude) {
    throw new Error('Geolocation coordinates are mandatory for automated validation.');
  }

  const normalizedType = normalizeDisruptionType(disruptionType);

  try {
    let validationResult;

    switch (normalizedType) {
      case 'Heavy Rainfall':
        validationResult = await validateHeavyRainfall(latitude, longitude);
        break;
      case 'Flash Flood':
        validationResult = await validateFlashFlood(latitude, longitude);
        break;
      case 'Extreme Heat':
        validationResult = await validateExtremeHeat(latitude, longitude);
        break;
      case 'Cyclone':
        validationResult = await validateCyclone(latitude, longitude);
        break;
      case 'Air Pollution':
        validationResult = await validateAirPollution(latitude, longitude);
        break;
      default:
        throw new Error(`Unsupported disruption type: ${disruptionType}`);
    }

    return {
      success: true,
      disruption_type: normalizedType,
      auto_approved: validationResult.approved,
      decision_reason: validationResult.approved 
        ? `Verification successful: ${validationResult.condition}`
        : `Verification unsuccessful: ${validationResult.condition}`,
      validation_data: validationResult,
      checked_against_api: true,
      api_used: getAPIUsedForType(normalizedType),
      timestamp: validationResult.timestamp
    };
  } catch (error) {
    console.error('Claim Verification Logic Error:', error.message);
    return {
      success: false,
      disruption_type: normalizedType,
      auto_approved: false,
      error: error.message,
      decision_reason: `API Verification Fault: ${error.message}. Routing to manual review.`,
      timestamp: new Date()
    };
  }
}

/**
 * Maps incoming disruption labels to internal normalized keys.
 */
function normalizeDisruptionType(type) {
  const mapping = {
    'heavy rainfall': 'Heavy Rainfall',
    'flash flood': 'Flash Flood',
    'extreme heat': 'Extreme Heat',
    'severe heat': 'Extreme Heat',
    'cyclone': 'Cyclone',
    'air pollution': 'Air Pollution',
    'severe aqi': 'Air Pollution'
  };

  return mapping[type.toLowerCase()] || type;
}

/**
 * Returns the data source associated with a specific disruption type.
 */
function getAPIUsedForType(disruptionType) {
  const apiMap = {
    'Heavy Rainfall': 'OpenWeatherMap (Weather)',
    'Flash Flood': 'OpenWeatherMap (Weather)',
    'Extreme Heat': 'OpenWeatherMap (Weather)',
    'Cyclone': 'OpenWeatherMap (Weather)',
    'Air Pollution': 'OpenWeatherMap (AQI)'
  };

  return apiMap[disruptionType] || 'OpenWeatherMap';
}

module.exports = {
  validateClaimAgainstRealData,
  AUTO_APPROVAL_THRESHOLDS,
  validateHeavyRainfall,
  validateFlashFlood,
  validateExtremeHeat,
  validateCyclone,
  validateAirPollution,
  fetchWeatherData,
  fetchAQIData
};
