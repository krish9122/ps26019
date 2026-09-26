/**
 * Spatial calculation helpers for GeoJSON polygons in MongoDB.
 * Implements spherical geodetic area and centroid derivations,
 * replicating PostGIS functionality in Node.js.
 */

const WGS84_RADIUS = 6378137; // Earth radius in meters

/**
 * Calculates the spherical surface area of a single LinearRing in square meters.
 * Based on the spherical excess algorithm (standard in GIS / Turf.js).
 * @param {Array<[number, number]>} ring - Array of [longitude, latitude] coordinates
 * @returns {number} Area in square meters
 */
export function calculateRingArea(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return 0;

  let total = 0;
  const len = ring.length;

  for (let i = 0; i < len; i++) {
    const p1 = ring[i];
    const p2 = ring[(i + 1) % len];

    const lon1 = (p1[0] * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;

    total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  const area = (total * WGS84_RADIUS * WGS84_RADIUS) / 2.0;
  return Math.abs(area);
}

/**
 * Calculates geodetic area of GeoJSON Polygon or MultiPolygon in square meters.
 * @param {Object} geometry - GeoJSON geometry { type: 'Polygon' | 'MultiPolygon', coordinates: [...] }
 * @returns {number} Geodetic area rounded to 2 decimal places
 */
export function calculateGeoJsonArea(geometry) {
  if (!geometry || !geometry.coordinates) return 0;

  let totalArea = 0;

  if (geometry.type === "Polygon") {
    // Exterior ring minus interior holes
    if (geometry.coordinates.length > 0) {
      totalArea += calculateRingArea(geometry.coordinates[0]);
      for (let i = 1; i < geometry.coordinates.length; i++) {
        totalArea -= calculateRingArea(geometry.coordinates[i]);
      }
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      if (polygon.length > 0) {
        let polyArea = calculateRingArea(polygon[0]);
        for (let i = 1; i < polygon.length; i++) {
          polyArea -= calculateRingArea(polygon[i]);
        }
        totalArea += Math.max(0, polyArea);
      }
    }
  }

  return Math.round(Math.max(0, totalArea) * 100) / 100;
}

/**
 * Calculates centroid [latitude, longitude] from GeoJSON Polygon or MultiPolygon.
 * @param {Object} geometry - GeoJSON geometry
 * @returns {{ lat: number, lon: number } | null}
 */
export function calculateCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let points = [];

  if (geometry.type === "Polygon" && geometry.coordinates[0]) {
    points = geometry.coordinates[0];
  } else if (geometry.type === "MultiPolygon" && geometry.coordinates[0] && geometry.coordinates[0][0]) {
    points = geometry.coordinates[0][0];
  }

  if (points.length === 0) return null;

  let sumLon = 0;
  let sumLat = 0;
  const count = points.length;

  for (let i = 0; i < count; i++) {
    sumLon += points[i][0];
    sumLat += points[i][1];
  }

  return {
    lat: Math.round((sumLat / count) * 1000000) / 1000000,
    lon: Math.round((sumLon / count) * 1000000) / 1000000,
  };
}
