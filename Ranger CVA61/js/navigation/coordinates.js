/**
 * Coordinate Utilities Module
 * Functions for parsing, validating, formatting, and converting coordinates
 * Supports maritime navigation coordinate formats (degrees, decimal minutes)
 */

class CoordinateUtils {
  
  /**
   * Parse coordinate string to decimal degrees
   * Supports format: "20°56.1'N" or "158°03.0'W"
   * @param {string} coordString - Coordinate string to parse
   * @returns {number|null} Decimal degrees or null if invalid
   */
  static parseCoordinate(coordString) {
    if (!coordString || typeof coordString !== 'string') {
      return null;
    }

    // Match pattern: degrees°minutes'direction
    const match = coordString.match(/^(\d+)°(\d+\.?\d*)'([NSEW])$/);
    if (!match) {
      return null;
    }

    const degrees = parseInt(match[1], 10);
    const minutes = parseFloat(match[2]);
    const direction = match[3];

    // Validate ranges
    if (isNaN(degrees) || isNaN(minutes)) {
      return null;
    }

    if (minutes >= 60) {
      return null;
    }

    // Calculate decimal degrees
    let decimal = degrees + (minutes / 60);

    // Apply direction (South and West are negative)
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }

    return decimal;
  }

  /**
   * Format decimal degrees to coordinate string
   * @param {number} decimal - Decimal degrees
   * @param {boolean} isLatitude - True for latitude, false for longitude
   * @returns {string} Formatted coordinate string
   */
  static formatCoordinate(decimal, isLatitude) {
    if (typeof decimal !== 'number' || isNaN(decimal)) {
      return '';
    }

    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutes = ((abs - degrees) * 60).toFixed(1);
    
    let direction;
    if (isLatitude) {
      direction = decimal >= 0 ? 'N' : 'S';
    } else {
      direction = decimal >= 0 ? 'E' : 'W';
    }

    return `${degrees}°${minutes}'${direction}`;
  }

  /**
   * Parse coordinate string into component parts
   * @param {string} coordString - Coordinate string to parse
   * @returns {object} Object with degrees, minutes, direction properties
   */
  static parseCoordinateString(coordString) {
    if (!coordString || typeof coordString !== 'string') {
      return { degrees: '', minutes: '', direction: '' };
    }

    const match = coordString.match(/^(\d+)°(\d+\.?\d*)'([NSEW])$/);
    if (!match) {
      return { degrees: '', minutes: '', direction: '' };
    }

    return {
      degrees: match[1],
      minutes: match[2],
      direction: match[3]
    };
  }

  /**
   * Build coordinate string from component parts
   * @param {string|number} degrees - Degrees value
   * @param {string|number} minutes - Minutes value
   * @param {string} direction - Direction (N, S, E, W)
   * @returns {string} Formatted coordinate string
   */
  static buildCoordinateString(degrees, minutes, direction) {
    if (!degrees || !minutes || !direction) {
      return '';
    }

    // Ensure proper formatting
    const deg = parseInt(degrees, 10);
    const min = parseFloat(minutes);

    if (isNaN(deg) || isNaN(min)) {
      return '';
    }

    return `${deg}°${min}'${direction}`;
  }

  /**
   * Validate coordinate components
   * @param {string|number} degrees - Degrees value
   * @param {string|number} minutes - Minutes value
   * @param {string} direction - Direction (N, S, E, W)
   * @param {boolean} isLatitude - True for latitude, false for longitude
   * @returns {object} Validation result with valid flag and error message
   */
  static validateCoordinate(degrees, minutes, direction, isLatitude = true) {
    // Check for required fields
    if (!degrees || !minutes || !direction) {
      return { valid: false, error: 'All coordinate fields are required' };
    }

    // Parse numeric values
    const deg = parseInt(degrees, 10);
    const min = parseFloat(minutes);

    if (isNaN(deg) || isNaN(min)) {
      return { valid: false, error: 'Degrees and minutes must be numeric' };
    }

    // Validate ranges
    const maxDegrees = isLatitude ? 90 : 180;
    
    if (deg < 0 || deg > maxDegrees) {
      return { valid: false, error: `Degrees must be between 0 and ${maxDegrees}` };
    }

    if (min < 0 || min >= 60) {
      return { valid: false, error: 'Minutes must be between 0 and 59.999' };
    }

    // Validate direction
    const validDirections = isLatitude ? ['N', 'S'] : ['E', 'W'];
    if (!validDirections.includes(direction.toUpperCase())) {
      return { valid: false, error: `Direction must be ${validDirections.join(' or ')}` };
    }

    // Special validation for latitude limits
    if (isLatitude && deg === 90 && min > 0) {
      return { valid: false, error: 'Latitude cannot exceed 90°00.0\'' };
    }

    // Special validation for longitude limits
    if (!isLatitude && deg === 180 && min > 0) {
      return { valid: false, error: 'Longitude cannot exceed 180°00.0\'' };
    }

    return { valid: true };
  }

  /**
   * Convert decimal degrees to degrees, minutes, seconds
   * @param {number} decimal - Decimal degrees
   * @returns {object} Object with degrees, minutes, seconds
   */
  static decimalToDMS(decimal) {
    if (typeof decimal !== 'number' || isNaN(decimal)) {
      return { degrees: 0, minutes: 0, seconds: 0 };
    }

    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutesFloat = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;

    return {
      degrees,
      minutes,
      seconds: Math.round(seconds * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Convert degrees, minutes, seconds to decimal degrees
   * @param {number} degrees - Degrees
   * @param {number} minutes - Minutes
   * @param {number} seconds - Seconds
   * @param {string} direction - Direction (N, S, E, W)
   * @returns {number} Decimal degrees
   */
  static dmsToDecimal(degrees, minutes, seconds, direction) {
    if (typeof degrees !== 'number' || typeof minutes !== 'number' || typeof seconds !== 'number') {
      return 0;
    }

    let decimal = degrees + (minutes / 60) + (seconds / 3600);

    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }

    return decimal;
  }

  /**
   * Get coordinate bounds for validation
   * @param {boolean} isLatitude - True for latitude, false for longitude
   * @returns {object} Object with min and max values
   */
  static getCoordinateBounds(isLatitude) {
    if (isLatitude) {
      return { min: -90, max: 90, maxDegrees: 90 };
    } else {
      return { min: -180, max: 180, maxDegrees: 180 };
    }
  }

  /**
   * Normalize coordinate to standard range
   * @param {number} coordinate - Coordinate value
   * @param {boolean} isLatitude - True for latitude, false for longitude
   * @returns {number} Normalized coordinate
   */
  static normalizeCoordinate(coordinate, isLatitude) {
    if (typeof coordinate !== 'number' || isNaN(coordinate)) {
      return 0;
    }

    if (isLatitude) {
      // Clamp latitude to [-90, 90]
      return Math.max(-90, Math.min(90, coordinate));
    } else {
      // Normalize longitude to [-180, 180]
      let normalized = coordinate % 360;
      if (normalized > 180) {
        normalized -= 360;
      } else if (normalized < -180) {
        normalized += 360;
      }
      return normalized;
    }
  }

  /**
   * Calculate the midpoint between two coordinates
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {object} Object with lat and lon properties
   */
  static calculateMidpoint(lat1, lon1, lat2, lon2) {
    // Convert to radians
    const lat1Rad = lat1 * Math.PI / 180;
    const lon1Rad = lon1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const lon2Rad = lon2 * Math.PI / 180;

    const dLon = lon2Rad - lon1Rad;

    const Bx = Math.cos(lat2Rad) * Math.cos(dLon);
    const By = Math.cos(lat2Rad) * Math.sin(dLon);

    const lat3Rad = Math.atan2(
      Math.sin(lat1Rad) + Math.sin(lat2Rad),
      Math.sqrt((Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By)
    );

    const lon3Rad = lon1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx);

    // Convert back to degrees
    return {
      lat: lat3Rad * 180 / Math.PI,
      lon: lon3Rad * 180 / Math.PI
    };
  }

  /**
   * Check if a coordinate is within specified bounds
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {object} bounds - Bounds object with north, south, east, west properties
   * @returns {boolean} True if coordinate is within bounds
   */
  static isWithinBounds(lat, lon, bounds) {
    if (!bounds || typeof lat !== 'number' || typeof lon !== 'number') {
      return false;
    }

    const { north, south, east, west } = bounds;

    // Handle longitude crossing 180/-180 meridian
    let lonInBounds;
    if (west <= east) {
      lonInBounds = lon >= west && lon <= east;
    } else {
      lonInBounds = lon >= west || lon <= east;
    }

    return lat >= south && lat <= north && lonInBounds;
  }

  /**
   * Format coordinate for display with specified precision
   * @param {number} decimal - Decimal coordinate
   * @param {boolean} isLatitude - True for latitude, false for longitude
   * @param {number} precision - Number of decimal places for minutes
   * @returns {string} Formatted coordinate string
   */
  static formatCoordinateWithPrecision(decimal, isLatitude, precision = 1) {
    if (typeof decimal !== 'number' || isNaN(decimal)) {
      return '';
    }

    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutes = ((abs - degrees) * 60).toFixed(precision);
    
    let direction;
    if (isLatitude) {
      direction = decimal >= 0 ? 'N' : 'S';
    } else {
      direction = decimal >= 0 ? 'E' : 'W';
    }

    return `${degrees}°${minutes}'${direction}`;
  }

  /**
   * Get coordinate type and hemisphere
   * @param {string} coordString - Coordinate string
   * @returns {object} Object with type and hemisphere information
   */
  static getCoordinateInfo(coordString) {
    const parsed = this.parseCoordinateString(coordString);
    
    if (!parsed.direction) {
      return { type: 'unknown', hemisphere: 'unknown', isLatitude: null };
    }

    const direction = parsed.direction.toUpperCase();
    const isLatitude = direction === 'N' || direction === 'S';
    
    return {
      type: isLatitude ? 'latitude' : 'longitude',
      hemisphere: direction === 'N' ? 'northern' : 
                  direction === 'S' ? 'southern' : 
                  direction === 'E' ? 'eastern' : 'western',
      isLatitude,
      direction
    };
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoordinateUtils;
} else {
  window.CoordinateUtils = CoordinateUtils;
}