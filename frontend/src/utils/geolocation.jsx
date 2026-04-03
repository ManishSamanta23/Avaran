/**
 * Geolocation Service:
 * Provides unified access to browser-level coordinates and higher-level
 * address resolution via OpenStreetMap Nominatim.
 */

/**
 * getCurrentLocation:
 * Captures the current device position and initiates a reverse-geocoding 
 * handshake to resolve coordinates into a human-readable city/state.
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation services are unavailable in this environment'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Resolve raw coordinates to geographic entities
          const locationDetails = await reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude, ...locationDetails, accuracy });
        } catch (err) {
          // Return raw coordinates as fallback if resolution fails
          resolve({ 
            latitude, 
            longitude, 
            locationName: null,
            city: null, 
            state: null,
            country: null,
            accuracy 
          });
        }
      },
      (error) => {
        console.error('Critical Geolocation Fault:', error);
        reject(error);
      },
      options
    );
  });
};

/**
 * reverseGeocode:
 * Direct interface with Nominatim OSM API to map lat/long to 
 * specific urban address components.
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' }
      }
    );
    const data = await response.json();
    const address = data.address || {};

    const city = address.city || address.town || address.village || address.county || '';
    const state = address.state || address.province || '';
    const country = address.country || '';

    const locationParts = [city, state, country].filter(part => part && part.trim());
    const locationName = locationParts.length > 0 ? locationParts.join(', ') : null;

    return {
      locationName,
      city: city || null,
      state: state || null,
      country: country || null
    };
  } catch (err) {
    console.error('Reverse Geocoding Failure:', err);
    return {
      locationName: null,
      city: null,
      state: null,
      country: null
    };
  }
};

/**
 * watchLocation:
 * Creates a stream for monitoring persistent movement.
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    console.error('Movement monitoring unavailable');
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 3000
  };

  return navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const locationDetails = await reverseGeocode(latitude, longitude);
      callback({ latitude, longitude, ...locationDetails, accuracy });
    },
    (error) => {
      console.error('Watch Stream Failure:', error);
    },
    options
  );
};

/**
 * stopWatchingLocation:
 * Destroys the active movement monitor stream.
 */
export const stopWatchingLocation = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * calculateDistance:
 * Computes the great-circle distance between two points using the Haversine formula (km).
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
