/**
 * Landmass Boundary Data for Distance-to-Land Calculations
 * Contains coastline coordinates for major landmasses in the Pacific region
 * Used by the Naval Navigation Deck Log System for USS Ranger CVA-61
 */

// Major landmass boundaries for distance calculations
window.LANDMASS_BOUNDARIES = {
  
  // North America - West Coast (California to Washington)
  northAmericaWest: [
    { lat: 49.0, lon: -125.0 },   // Northern Washington
    { lat: 48.5, lon: -124.5 },   // Washington coast
    { lat: 47.6, lon: -124.2 },   // Olympic Peninsula
    { lat: 46.9, lon: -124.1 },   // Washington/Oregon border
    { lat: 45.9, lon: -124.0 },   // Oregon coast
    { lat: 44.6, lon: -124.2 },   // Central Oregon
    { lat: 43.4, lon: -124.4 },   // Southern Oregon
    { lat: 42.0, lon: -124.4 },   // Oregon/California border
    { lat: 40.8, lon: -124.4 },   // Northern California
    { lat: 39.8, lon: -123.8 },   // Mendocino
    { lat: 38.8, lon: -123.0 },   // Point Reyes area
    { lat: 37.8, lon: -122.5 },   // San Francisco Bay
    { lat: 36.8, lon: -121.9 },   // Monterey Bay
    { lat: 35.7, lon: -121.3 },   // Big Sur
    { lat: 34.4, lon: -120.5 },   // Point Conception
    { lat: 33.2, lon: -117.4 },   // Los Angeles area
    { lat: 32.5, lon: -117.2 },   // San Diego
    { lat: 31.8, lon: -116.9 }    // US/Mexico border
  ],
  
  // Hawaiian Islands
  hawaii: [
    // Big Island (Hawaii)
    { lat: 20.3, lon: -155.0 },   // Hilo
    { lat: 19.7, lon: -154.8 },   // Pahoa
    { lat: 19.0, lon: -155.7 },   // South Point
    { lat: 19.5, lon: -156.0 },   // Kona coast
    { lat: 20.1, lon: -155.9 },   // Kailua-Kona
    { lat: 20.3, lon: -155.5 },   // Waimea
    
    // Maui
    { lat: 21.0, lon: -156.7 },   // West Maui
    { lat: 20.6, lon: -156.0 },   // Central Maui
    { lat: 20.6, lon: -155.9 },   // Haleakala
    { lat: 20.8, lon: -156.3 },   // Kahului
    { lat: 21.0, lon: -156.7 },   // Return to start
    
    // Oahu
    { lat: 21.7, lon: -158.3 },   // North Shore
    { lat: 21.3, lon: -157.6 },   // Honolulu
    { lat: 21.2, lon: -157.6 },   // Diamond Head
    { lat: 21.2, lon: -158.3 },   // West Oahu
    { lat: 21.7, lon: -158.3 },   // Return to start
    
    // Kauai
    { lat: 22.2, lon: -159.7 },   // Na Pali Coast
    { lat: 21.9, lon: -159.3 },   // Lihue
    { lat: 21.9, lon: -159.8 },   // Waimea
    { lat: 22.2, lon: -159.7 }    // Return to start
  ],
  
  // Japan (Main Islands)
  japan: [
    { lat: 45.5, lon: 141.9 },    // Hokkaido - Cape Soya
    { lat: 43.4, lon: 145.8 },    // Hokkaido - Nemuro
    { lat: 42.9, lon: 144.4 },    // Hokkaido - Kushiro
    { lat: 41.5, lon: 140.9 },    // Honshu - Aomori
    { lat: 38.3, lon: 141.0 },    // Honshu - Sendai
    { lat: 36.3, lon: 140.9 },    // Honshu - Hitachi
    { lat: 35.7, lon: 139.8 },    // Tokyo Bay
    { lat: 34.7, lon: 139.7 },    // Sagami Bay
    { lat: 33.2, lon: 130.2 },    // Kyushu - Fukuoka
    { lat: 31.0, lon: 130.5 },    // Kyushu - Kagoshima
    { lat: 30.3, lon: 131.0 },    // Kyushu - Cape Sata
    { lat: 33.2, lon: 129.7 },    // Kyushu - Nagasaki
    { lat: 35.7, lon: 135.5 },    // Honshu - Osaka
    { lat: 37.9, lon: 139.0 },    // Honshu - Niigata
    { lat: 40.8, lon: 140.7 }     // Honshu - Hachinohe
  ],
  
  // Philippines (Major Islands)
  philippines: [
    { lat: 18.5, lon: 120.2 },    // Luzon - North
    { lat: 19.3, lon: 121.2 },    // Luzon - Northeast
    { lat: 18.2, lon: 122.0 },    // Luzon - East coast
    { lat: 16.0, lon: 120.3 },    // Luzon - Lingayen Gulf
    { lat: 14.6, lon: 120.9 },    // Manila Bay
    { lat: 13.4, lon: 123.0 },    // Luzon - Southeast
    { lat: 11.0, lon: 124.6 },    // Samar
    { lat: 9.8, lon: 118.7 },     // Palawan
    { lat: 8.0, lon: 117.2 },     // Palawan - South
    { lat: 6.9, lon: 122.1 },     // Mindanao - Zamboanga
    { lat: 5.0, lon: 119.9 },     // Mindanao - South
    { lat: 7.4, lon: 126.6 },     // Mindanao - East
    { lat: 9.5, lon: 127.0 },     // Mindanao - Northeast
    { lat: 11.2, lon: 125.0 },    // Leyte
    { lat: 13.1, lon: 120.6 }     // Luzon - West coast
  ],
  
  // Vietnam Coast
  vietnam: [
    { lat: 23.4, lon: 109.5 },    // North - near China border
    { lat: 22.8, lon: 108.1 },    // Ha Long Bay
    { lat: 21.5, lon: 107.0 },    // Red River Delta
    { lat: 20.9, lon: 106.7 },    // Hanoi area
    { lat: 20.0, lon: 106.0 },    // Thanh Hoa
    { lat: 19.8, lon: 105.9 },    // Vinh
    { lat: 18.7, lon: 105.6 },    // Dong Hoi
    { lat: 17.5, lon: 106.6 },    // Hue
    { lat: 16.8, lon: 107.4 },    // Da Nang
    { lat: 16.0, lon: 108.2 },    // Hoi An
    { lat: 15.9, lon: 108.7 },    // Chu Lai
    { lat: 14.8, lon: 109.0 },    // Quy Nhon
    { lat: 13.4, lon: 109.2 },    // Nha Trang
    { lat: 12.7, lon: 109.2 },    // Cam Ranh
    { lat: 11.6, lon: 109.4 },    // Phan Thiet
    { lat: 10.8, lon: 108.1 },    // Vung Tau
    { lat: 10.0, lon: 105.8 },    // Mekong Delta
    { lat: 9.2, lon: 104.9 },     // Ca Mau
    { lat: 8.6, lon: 104.7 },     // An Thoi
    { lat: 8.4, lon: 104.7 }      // Southernmost point
  ],
  
  // Thailand Coast (Gulf of Thailand and Andaman Sea)
  thailand: [
    { lat: 20.4, lon: 100.4 },    // North - Myanmar border
    { lat: 19.9, lon: 99.8 },     // Mae Sai area
    { lat: 18.8, lon: 98.9 },     // Chiang Mai region
    { lat: 16.4, lon: 98.5 },     // Tak province
    { lat: 14.6, lon: 98.6 },     // Kanchanaburi
    { lat: 13.7, lon: 100.5 },    // Bangkok
    { lat: 12.6, lon: 101.7 },    // Pattaya
    { lat: 11.8, lon: 99.8 },     // Hua Hin
    { lat: 10.5, lon: 99.0 },     // Chumphon
    { lat: 9.4, lon: 99.3 },      // Surat Thani
    { lat: 8.1, lon: 98.3 },      // Phuket
    { lat: 7.0, lon: 100.5 },     // Songkhla
    { lat: 6.7, lon: 101.7 },     // Narathiwat
    { lat: 6.4, lon: 101.8 }      // Malaysia border
  ],
  
  // South Korea
  southKorea: [
    { lat: 38.6, lon: 128.4 },    // East coast - Sokcho
    { lat: 37.5, lon: 129.1 },    // East coast - Gangneung
    { lat: 36.4, lon: 129.6 },    // East coast - Pohang
    { lat: 35.8, lon: 129.5 },    // Busan area
    { lat: 35.1, lon: 129.1 },    // South coast - Masan
    { lat: 34.7, lon: 128.9 },    // South coast - Tongyeong
    { lat: 34.3, lon: 126.2 },    // South coast - Mokpo
    { lat: 34.8, lon: 125.4 },    // West coast - Gunsan
    { lat: 35.7, lon: 126.7 },    // West coast - Seosan
    { lat: 36.8, lon: 126.4 },    // West coast - Incheon
    { lat: 37.9, lon: 124.7 },    // West coast - Haeju
    { lat: 38.4, lon: 125.0 }     // North - near DMZ
  ],
  
  // Australia - East Coast (Queensland to Tasmania)
  australiaEast: [
    { lat: -10.7, lon: 142.5 },   // Cape York
    { lat: -12.5, lon: 143.2 },   // Cooktown
    { lat: -16.3, lon: 145.8 },   // Cairns
    { lat: -19.3, lon: 146.8 },   // Townsville
    { lat: -23.4, lon: 150.9 },   // Rockhampton
    { lat: -28.2, lon: 153.6 },   // Gold Coast
    { lat: -33.9, lon: 151.2 },   // Sydney
    { lat: -37.8, lon: 144.9 },   // Melbourne (Port Phillip)
    { lat: -38.3, lon: 141.6 },   // Portland
    { lat: -35.0, lon: 138.6 },   // Adelaide (Gulf St Vincent)
    { lat: -31.9, lon: 115.9 },   // Perth (Fremantle)
    { lat: -20.7, lon: 115.0 },   // Port Hedland
    { lat: -12.4, lon: 130.8 },   // Darwin
    { lat: -11.2, lon: 132.3 },   // Groote Eylandt
    { lat: -12.0, lon: 136.8 }    // Gulf of Carpentaria
  ]
};

/**
 * Distance calculation functions
 * These functions work with the landmass boundary data above
 */

/**
 * Calculate great circle distance between two points in nautical miles
 * @param {number} lat1 - First point latitude in decimal degrees
 * @param {number} lon1 - First point longitude in decimal degrees
 * @param {number} lat2 - Second point latitude in decimal degrees
 * @param {number} lon2 - Second point longitude in decimal degrees
 * @returns {number} Distance in nautical miles
 */
window.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate distance from point to line segment
 * @param {number} px - Point X coordinate (longitude)
 * @param {number} py - Point Y coordinate (latitude)
 * @param {number} x1 - Line start X coordinate (longitude)
 * @param {number} y1 - Line start Y coordinate (latitude)
 * @param {number} x2 - Line end X coordinate (longitude)
 * @param {number} y2 - Line end Y coordinate (latitude)
 * @returns {number} Distance in nautical miles
 */
window.distanceToLineSegment = function(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return window.calculateDistance(py, px, y1, x1);
  }
  
  let param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  return window.calculateDistance(py, px, yy, xx);
};

/**
 * Calculate distance to nearest point on a coastline
 * @param {number} shipLat - Ship latitude in decimal degrees
 * @param {number} shipLon - Ship longitude in decimal degrees
 * @param {Array} coastline - Array of {lat, lon} points defining the coastline
 * @returns {number} Distance to nearest point on coastline in nautical miles
 */
window.distanceToCoastline = function(shipLat, shipLon, coastline) {
  let minDistance = Infinity;
  
  for (let i = 0; i < coastline.length; i++) {
    const distance = window.calculateDistance(shipLat, shipLon, coastline[i].lat, coastline[i].lon);
    if (distance < minDistance) {
      minDistance = distance;
    }
    
    // Also check distance to line segments between points
    if (i < coastline.length - 1) {
      const segmentDistance = window.distanceToLineSegment(
        shipLon, shipLat,
        coastline[i].lon, coastline[i].lat,
        coastline[i + 1].lon, coastline[i + 1].lat
      );
      if (segmentDistance < minDistance) {
        minDistance = segmentDistance;
      }
    }
  }
  
  return minDistance;
};

/**
 * Main function to calculate distance to nearest land
 * @param {number} latitude - Ship latitude in decimal degrees
 * @param {number} longitude - Ship longitude in decimal degrees
 * @returns {object} Object with distance, nearestLand, and displayText properties
 */
window.calculateDistanceToLand = function(latitude, longitude) {
  let minDistance = Infinity;
  let nearestLand = '';
  
  // Check distance to each landmass
  for (const [landName, coastline] of Object.entries(window.LANDMASS_BOUNDARIES)) {
    const distance = window.distanceToCoastline(latitude, longitude, coastline);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLand = landName;
    }
  }
  
  // Format the result
  if (minDistance === Infinity) {
    return { distance: null, nearestLand: 'Unknown', displayText: 'N/A' };
  }
  
  const formattedDistance = minDistance < 1 ? 
    `${(minDistance * 6076).toFixed(0)} ft` : 
    `${minDistance.toFixed(1)} NM`;
  
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
};

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Starting latitude
 * @param {number} lon1 - Starting longitude
 * @param {number} lat2 - Ending latitude
 * @param {number} lon2 - Ending longitude
 * @returns {number} Bearing in degrees (0-360)
 */
window.calculateBearing = function(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

// Log successful loading
console.log('Landmass boundary data loaded successfully - ' + Object.keys(window.LANDMASS_BOUNDARIES).length + ' regions defined');