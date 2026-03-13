/**
 * Haversine distance between two GPS points (meters)
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compass bearing from user to a building (degrees, 0=North, clockwise)
 */
export function computeBearing(
  userLat: number, userLng: number,
  buildingLat: number, buildingLng: number
): number {
  const φ1 = userLat * Math.PI / 180;
  const φ2 = buildingLat * Math.PI / 180;
  const Δλ = (buildingLng - userLng) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

/**
 * Convert GPS lat/lng to Three.js 3D world XZ coordinates
 * Uses campus center as world origin (0, 0, 0)
 */
export function latLngToWorld(
  buildingLat: number, buildingLng: number,
  campusCenter: [number, number],
  scale: number = 1
): { x: number; z: number } {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos(campusCenter[0] * Math.PI / 180);
  const x = (buildingLng - campusCenter[1]) * metersPerDegreeLng / scale;
  const z = -(buildingLat - campusCenter[0]) * metersPerDegreeLat / scale;
  return { x, z };
}

/**
 * Convert camera heading + building bearing to screen X position (%)
 * Returns null if building is behind the camera (> FOV/2)
 */
export function bearingToScreenX(
  deviceHeading: number,
  buildingBearing: number,
  fieldOfView: number = 60
): number | null {
  let diff = buildingBearing - deviceHeading;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  if (Math.abs(diff) > fieldOfView / 2) return null;
  return 50 + (diff / (fieldOfView / 2)) * 50;
}

/**
 * Map tilt angle to AR label vertical position
 */
export function tiltToScreenY(
  deviceTilt: number,
  buildingDistance: number
): number {
  const distanceFactor = Math.min(buildingDistance / 200, 1);
  const baseTiltOffset = (deviceTilt - 45) * 1.2;
  return Math.max(10, Math.min(85, 50 + baseTiltOffset - distanceFactor * 20));
}

/**
 * Format distance to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get building height estimate from floors data (for VR extrusion)
 */
export function getBuildingHeight(floors: number = 1): number {
  return Math.max(floors * 3.5, 4);
}
