// Geofencing verification utility using Haversine formula in Pure JavaScript
// Verifies whether supervisor & worker check-in is physically inside factory zone

export const DEFAULT_GEOFENCE_RADIUS_METERS = 500; // 500 meters tolerance for industrial gates

/**
 * Calculates distance between two coordinates in meters
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Checks if current GPS point is within factory geofence boundary
 */
export function verifyGeofence(
  currentLat,
  currentLng,
  factoryLat,
  factoryLng,
  maxAllowedRadiusMeters = DEFAULT_GEOFENCE_RADIUS_METERS
) {
  const distanceMeters = calculateDistanceMeters(currentLat, currentLng, factoryLat, factoryLng);
  return {
    isInside: distanceMeters <= maxAllowedRadiusMeters,
    distanceMeters,
  };
}

/**
 * Helper to get user's browser location
 */
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('خدمة تحديد الموقع الجغرافي (GPS) غير مدعومة'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
