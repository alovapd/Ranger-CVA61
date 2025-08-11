/**
 * Distance Calculation Module
 * Functions for calculating distances, bearings, and distance-to-land measurements
 * Uses nautical miles as primary unit for maritime navigation
 */

class DistanceCalculator {
  
  // Navigation constants
  static EARTH_RADIUS_NM = 3440.065; // Earth's radius in nautical miles
  static EARTH_RADIUS_KM = 6371;     // Earth's radius in kilometers
  static EARTH_RADIUS_MI = 3959;     // Earth's radius in statute miles
  static NM_TO_FEET = 6076;          // Nautical miles to feet
  static NM_TO_METERS = 1852;        // Nautical miles to meters
  static KNOTS_TO_MPH = 1.15078;     // Knots to miles per hour
  static KNOTS_TO_KMH = 1.852;       // Knots to kilometers per hour

  /**
   * Calculate great circle distance between two points in nautical miles
   * @param {number} lat1 - First point latitude in decimal degrees
   * @param {number} lon1 - First point longitude in decimal degrees
   * @param {number} lat2 - Second point latitude in decimal degrees
   * @param {number} lon2 - Second point longitude in decimal degrees
   * @returns {number} Distance in nautical miles
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    // Validate inputs
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lon2 !== 'number') {
      return 0;
    }

    // Convert degrees to radians
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_NM * c;
  }

  /**
   * Calculate bearing from first point to second point in degrees (0-360)
   * @param {number} lat1 - First point latitude in decimal degrees
   * @param {number} lon1 - First point longitude in decimal degrees
   * @param {number} lat2 - Second point latitude in decimal degrees
   * @param {number} lon2 - Second point longitude in decimal degrees
   * @returns {number} Bearing in degrees (0-360)
   */
  static calculateBearing(lat1, lon1, lat2, lon2) {
    // Validate inputs
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lon2 !== 'number') {
      return 0;
    }

    // Convert to radians
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }

  /**
   * Calculate distance from a point to a line segment (shortest distance)
   * @param {number} px - Point X coordinate (longitude)
   * @param {number} py - Point Y coordinate (latitude)
   * @param {number} x1 - Line start X coordinate (longitude)
   * @param {number} y1 - Line start Y coordinate (latitude)
   * @param {number} x2 - Line end X coordinate (longitude)
   * @param {number} y2 - Line end Y coordinate (latitude)
   * @returns {number} Distance in nautical miles
   */
  static distanceToLineSegment(px, py, x1, y1, x2, y2) {
    // Vector from line start to point
    const A = px - x1;
    const B = py - y1;
    
    // Vector from line start to line end
    const C = x2 - x1;
    const D = y2 - y1;

    // Calculate dot product and line length squared
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    // Handle degenerate case (line segment is actually a point)
    if (lenSq === 0) {
      return this.calculateDistance(py, px, y1, x1);
    }

    // Calculate parameter t (projection of point onto line)
    let param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      // Point is before the start of the line segment
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      // Point is after the end of the line segment
      xx = x2;
      yy = y2;
    } else {
      // Point projects onto the line segment
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return this.calculateDistance(py, px, yy, xx);
  }

  /**
   * Calculate distance from a point to the nearest point on a coastline
   * @param {number} shipLat - Ship latitude in decimal degrees
   * @param {number} shipLon - Ship longitude in decimal degrees
   * @param {Array} coastline - Array of {lat, lon} points defining the coastline
   * @returns {number} Distance to nearest point on coastline in nautical miles
   */
  static distanceToCoastline(shipLat, shipLon, coastline) {
    if (!Array.isArray(coastline) || coastline.length === 0) {
      return Infinity;
    }

    let minDistance = Infinity;

    for (let i = 0; i < coastline.length; i++) {
      const point = coastline[i];
      
      // Distance to individual coastline point
      const pointDistance = this.calculateDistance(shipLat, shipLon, point.lat, point.lon);
      if (pointDistance < minDistance) {
        minDistance = pointDistance;
      }

      // Distance to line segment between consecutive points
      if (i < coastline.length - 1) {
        const nextPoint = coastline[i + 1];
        const segmentDistance = this.distanceToLineSegment(
          shipLon, shipLat,
          point.lon, point.lat,
          nextPoint.lon, nextPoint.lat
        );
        if (segmentDistance < minDistance) {
          minDistance = segmentDistance;
        }
      }
    }

    return minDistance;
  }

  /**
   * Calculate distance to nearest land from ship position
   * Uses predefined landmass boundaries from global LANDMASS_BOUNDARIES
   * @param {number} latitude - Ship latitude in decimal degrees
   * @param {number} longitude - Ship longitude in decimal degrees
   * @returns {object} Object with distance, nearestLand, and displayText
   */
  static calculateDistanceToLand(latitude, longitude) {
    // Check if landmass boundaries are available
    if (typeof window === 'undefined' || !window.LANDMASS_BOUNDARIES) {
      return {
        distance: null,
        nearestLand: 'Unknown',
        displayText: 'N/A'
      };
    }

    let minDistance = Infinity;
    let nearestLand = '';

    // Check distance to each defined landmass
    for (const [landName, coastline] of Object.entries(window.LANDMASS_BOUNDARIES)) {
      const distance = this.distanceToCoastline(latitude, longitude, coastline);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLand = landName;
      }
    }

    // Handle case where no land found
    if (minDistance === Infinity) {
      return {
        distance: null,
        nearestLand: 'Unknown',
        displayText: 'N/A'
      };
    }

    // Format distance for display
    const formattedDistance = minDistance < 1 ? 
      `${(minDistance * this.NM_TO_FEET).toFixed(0)} ft` : 
      `${minDistance.toFixed(1)} NM`;

    // Convert internal land names to display names
    const landDisplayNames = {
      northAmericaWest: 'US West Coast',
      hawaii: 'Hawaiian Islands',
      japan: 'Japan',
      philippines: 'Philippines',
      vietnam: 'Vietnam',
      thailand: 'Thailand',
      southKorea: 'South Korea',
      australiaEast: 'Australia'
    };

    return {
      distance: minDistance,
      nearestLand: landDisplayNames[nearestLand] || nearestLand,
      displayText: formattedDistance
    };
  }

  /**
   * Calculate course and distance between two navigation fixes
   * @param {object} fix1 - First fix with lat and lon properties
   * @param {object} fix2 - Second fix with lat and lon properties
   * @returns {object} Object with course, distance, and time if provided
   */
  static calculateCourseAndDistance(fix1, fix2) {
    if (!fix1 || !fix2 || 
        typeof fix1.lat !== 'number' || typeof fix1.lon !== 'number' ||
        typeof fix2.lat !== 'number' || typeof fix2.lon !== 'number') {
      return {
        course: null,
        distance: null,
        bearing: null
      };
    }

    const distance = this.calculateDistance(fix1.lat, fix1.lon, fix2.lat, fix2.lon);
    const bearing = this.calculateBearing(fix1.lat, fix1.lon, fix2.lat, fix2.lon);

    return {
      course: bearing,
      distance: distance,
      bearing: bearing,
      distanceText: distance < 1 ? 
        `${(distance * this.NM_TO_FEET).toFixed(0)} ft` : 
        `${distance.toFixed(2)} NM`,
      bearingText: `${bearing.toFixed(1)}°T`
    };
  }

  /**
   * Calculate speed over ground between two fixes
   * @param {object} fix1 - First fix with lat, lon, and time properties
   * @param {object} fix2 - Second fix with lat, lon, and time properties
   * @returns {object} Object with speed in knots and time elapsed
   */
  static calculateSpeed(fix1, fix2) {
    if (!fix1 || !fix2 || !fix1.time || !fix2.time) {
      return {
        speed: null,
        timeElapsed: null,
        speedText: 'N/A'
      };
    }

    const distance = this.calculateDistance(fix1.lat, fix1.lon, fix2.lat, fix2.lon);
    
    // Calculate time difference in hours
    const time1 = new Date(`${fix1.date}T${fix1.time}`);
    const time2 = new Date(`${fix2.date}T${fix2.time}`);
    const timeElapsedMs = Math.abs(time2 - time1);
    const timeElapsedHours = timeElapsedMs / (1000 * 60 * 60);

    if (timeElapsedHours === 0) {
      return {
        speed: null,
        timeElapsed: 0,
        speedText: 'N/A'
      };
    }

    const speed = distance / timeElapsedHours;

    return {
      speed: speed,
      timeElapsed: timeElapsedHours,
      speedText: `${speed.toFixed(1)} kts`,
      timeElapsedText: `${timeElapsedHours.toFixed(1)} hrs`
    };
  }

  /**
   * Convert distance between different units
   * @param {number} distance - Distance value
   * @param {string} fromUnit - Source unit ('nm', 'km', 'mi', 'ft', 'm')
   * @param {string} toUnit - Target unit ('nm', 'km', 'mi', 'ft', 'm')
   * @returns {number} Converted distance
   */
  static convertDistance(distance, fromUnit, toUnit) {
    if (typeof distance !== 'number' || isNaN(distance)) {
      return 0;
    }

    // Convert to nautical miles first
    let nm;
    switch (fromUnit.toLowerCase()) {
      case 'nm': nm = distance; break;
      case 'km': nm = distance / 1.852; break;
      case 'mi': nm = distance / 1.15078; break;
      case 'ft': nm = distance / this.NM_TO_FEET; break;
      case 'm': nm = distance / this.NM_TO_METERS; break;
      default: return distance;
    }

    // Convert from nautical miles to target unit
    switch (toUnit.toLowerCase()) {
      case 'nm': return nm;
      case 'km': return nm * 1.852;
      case 'mi': return nm * 1.15078;
      case 'ft': return nm * this.NM_TO_FEET;
      case 'm': return nm * this.NM_TO_METERS;
      default: return nm;
    }
  }

  /**
   * Calculate range and bearing from one point to another
   * @param {number} fromLat - Starting latitude
   * @param {number} fromLon - Starting longitude
   * @param {number} toLat - Ending latitude
   * @param {number} toLon - Ending longitude
   * @returns {object} Range and bearing information
   */
  static calculateRangeAndBearing(fromLat, fromLon, toLat, toLon) {
    const distance = this.calculateDistance(fromLat, fromLon, toLat, toLon);
    const bearing = this.calculateBearing(fromLat, fromLon, toLat, toLon);

    return {
      range: distance,
      bearing: bearing,
      rangeText: distance < 1 ? 
        `${(distance * this.NM_TO_FEET).toFixed(0)} ft` : 
        `${distance.toFixed(2)} NM`,
      bearingText: `${bearing.toFixed(1)}°T`,
      reciprocalBearing: (bearing + 180) % 360,
      reciprocalBearingText: `${((bearing + 180) % 360).toFixed(1)}°T`
    };
  }

  /**
   * Calculate estimated time of arrival based on current speed and course
   * @param {number} currentLat - Current latitude
   * @param {number} currentLon - Current longitude
   * @param {number} destLat - Destination latitude
   * @param {number} destLon - Destination longitude
   * @param {number} speed - Speed in knots
   * @returns {object} ETA information
   */
  static calculateETA(currentLat, currentLon, destLat, destLon, speed) {
    if (!speed || speed <= 0) {
      return {
        eta: null,
        etaText: 'N/A',
        timeToGo: null,
        timeToGoText: 'N/A'
      };
    }

    const distance = this.calculateDistance(currentLat, currentLon, destLat, destLon);
    const timeHours = distance / speed;
    const timeMs = timeHours * 60 * 60 * 1000;
    
    const now = new Date();
    const eta = new Date(now.getTime() + timeMs);

    return {
      eta: eta,
      etaText: eta.toLocaleString(),
      timeToGo: timeHours,
      timeToGoText: `${Math.floor(timeHours)}h ${Math.round((timeHours % 1) * 60)}m`,
      distance: distance,
      distanceText: `${distance.toFixed(1)} NM`
    };
  }
}

// Make calculateDistanceToLand available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.calculateDistance = DistanceCalculator.calculateDistance.bind(DistanceCalculator);
  window.calculateDistanceToLand = DistanceCalculator.calculateDistanceToLand.bind(DistanceCalculator);
  window.distanceToCoastline = DistanceCalculator.distanceToCoastline.bind(DistanceCalculator);
  window.distanceToLineSegment = DistanceCalculator.distanceToLineSegment.bind(DistanceCalculator);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DistanceCalculator;
} else {
  window.DistanceCalculator = DistanceCalculator;
}