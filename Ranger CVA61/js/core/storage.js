/**
 * Data Storage Module - Enhanced with KML Export
 * Handles all data persistence operations including localStorage, import/export
 * Phase 3: Added professional KML export for Google Earth integration
 */

class DataStorage {
  constructor(config) {
    this.config = config;
    this.storageKey = 'ussRangerNavigationLogs';
  }

  /**
   * Save navigation logs to localStorage
   */
  save(navigationLogs) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(navigationLogs));
      if (this.config && this.config.set) {
        this.config.set('STATE.lastSaveTimestamp', Date.now());
        this.config.set('STATE.unsavedChanges', false);
      }
      return true;
    } catch (error) {
      throw new Error('Failed to save data to local storage');
    }
  }

  /**
   * Load navigation logs from localStorage
   */
  async load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      throw new Error('Failed to load data from local storage');
    }
  }

  /**
   * Export navigation logs to JSON file
   */
  exportJSON(navigationLogs) {
    const vesselName = this.config?.get('APP.VESSEL_NAME') || 'USS RANGER CVA-61';
    
    const dataToExport = {
      vessel: vesselName,
      exportDate: new Date().toISOString(),
      totalEntries: navigationLogs.length,
      navigationLogs
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    this._downloadFile(
      blob, 
      `USS_Ranger_Navigation_Log_${this._getDateString()}.json`
    );
  }

  /**
   * Import navigation logs from JSON file
   */
  importFromJSON(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          if (!importedData.navigationLogs || !Array.isArray(importedData.navigationLogs)) {
            throw new Error('Invalid file format');
          }

          const totalEntries = importedData.totalEntries || importedData.navigationLogs.length;
          const replace = confirm(
            `Import ${totalEntries} navigation entries?\n\n` +
            `Click OK to REPLACE current data, or Cancel to merge.`
          );

          callback(importedData.navigationLogs, replace);

        } catch (error) {
          throw new Error('Invalid JSON file format');
        }
      };
      
      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Export navigation logs to CSV file
   */
  exportCSV(navigationLogs) {
    if (navigationLogs.length === 0) {
      throw new Error('No navigation data to export');
    }

    const headers = [
      'Plot #',
      'Date',
      'Day',
      'Time',
      'Latitude',
      'Longitude',
      'Latitude (Decimal)',
      'Longitude (Decimal)',
      'Distance to Land (NM)',
      'Nearest Land',
      'Remarks'
    ];

    const grouped = this._groupLogsByVesselAndDate(navigationLogs);
    let csv = headers.join(',') + '\n';

    Object.values(grouped).forEach(logs => {
      logs
        .sort((a, b) => a.positionTime.localeCompare(b.positionTime))
        .forEach((log, i) => {
          const row = this._createCSVRow(log, i + 1);
          csv += row.join(',') + '\n';
        });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    this._downloadFile(
      blob, 
      `USS_Ranger_Navigation_Log_${this._getDateString()}.csv`
    );
  }

  /**
   * Export navigation logs to KML format for Google Earth
   * Phase 3: New feature for professional GIS integration
   */
  exportKML(navigationLogs) {
    if (navigationLogs.length === 0) {
      throw new Error('No navigation data to export');
    }

    const vesselName = this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER');
    const vesselType = this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61');
    
    // Sort logs chronologically for proper track creation
    const sortedLogs = this._sortLogsChronologically(navigationLogs);
    const kmlContent = this._generateKMLContent(sortedLogs, vesselName, vesselType);
    
    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    this._downloadFile(
      blob, 
      `${vesselName}_Navigation_Track_${this._getDateString()}.kml`
    );
  }

  /**
   * Clear all stored data
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      throw new Error('Failed to clear stored data');
    }
  }

  /**
   * Get storage information
   */
  getStorageInfo() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return {
        hasData: !!data,
        dataSize: data ? data.length : 0,
        lastModified: this.config?.get('STATE.lastSaveTimestamp') || null
      };
    } catch (error) {
      return {
        hasData: false,
        dataSize: 0,
        lastModified: null
      };
    }
  }

  // Private methods

  /**
   * Group navigation logs by vessel and date
   */
  _groupLogsByVesselAndDate(navigationLogs) {
    const grouped = {};
    navigationLogs.forEach(log => {
      const key = `${log.vesselName}_${log.logDate}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(log);
    });
    return grouped;
  }

  /**
   * Create a CSV row for a navigation log entry
   */
  _createCSVRow(log, plotNumber) {
    const latDec = this._parseCoordinate(log.latitude);
    const lonDec = this._parseCoordinate(log.longitude);
    
    let distanceToLand = '';
    let nearestLand = '';
    
    if (latDec !== null && lonDec !== null && window.calculateDistanceToLand) {
      try {
        const landData = window.calculateDistanceToLand(latDec, lonDec);
        distanceToLand = landData.distance ? landData.distance.toFixed(1) : '';
        nearestLand = landData.nearestLand;
      } catch (error) {
        // Keep default values if calculation fails
      }
    }
    
    return [
      plotNumber,
      log.logDate,
      log.dayOfWeek,
      log.positionTime,
      `"${log.latitude}"`,
      `"${log.longitude}"`,
      latDec ?? '',
      lonDec ?? '',
      distanceToLand,
      `"${nearestLand}"`,
      `"${(log.remarks || '').replace(/"/g, '""')}"`
    ];
  }

  /**
   * Parse coordinate string to decimal
   */
  _parseCoordinate(coordString) {
    const match = coordString.match(/(\d+)°(\d+\.?\d*)'([NSEW])/);
    if (!match) return null;
    
    const degrees = parseInt(match[1], 10);
    const minutes = parseFloat(match[2]);
    const direction = match[3];
    
    let decimal = degrees + (minutes / 60);
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }
    
    return decimal;
  }

  /**
   * Download a file to the user's computer
   */
  _downloadFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }

  /**
   * Get current date string for filenames
   */
  _getDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // ===== KML Export Private Methods =====

  /**
   * Generate complete KML content with navigation tracks and waypoints
   */
  _generateKMLContent(navigationLogs, vesselName, vesselType) {
    const kmlHeader = this._generateKMLHeader(vesselName, vesselType, navigationLogs.length);
    const kmlStyles = this._generateKMLStyles();
    const kmlTracks = this._generateKMLTracks(navigationLogs);
    const kmlPlacemarks = this._generateKMLPlacemarks(navigationLogs);
    const kmlFooter = this._generateKMLFooter();
    
    return kmlHeader + kmlStyles + kmlTracks + kmlPlacemarks + kmlFooter;
  }

  /**
   * Generate KML header with document information
   */
  _generateKMLHeader(vesselName, vesselType, totalEntries) {
    const exportDate = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${vesselName} (${vesselType}) Navigation Track</name>
    <description><![CDATA[
      <h3>USS Ranger CVA-61 Navigation Log</h3>
      <p><strong>Vessel:</strong> ${vesselName} (${vesselType})</p>
      <p><strong>Export Date:</strong> ${new Date(exportDate).toLocaleDateString()}</p>
      <p><strong>Total Entries:</strong> ${totalEntries}</p>
      <p><strong>Service Period:</strong> August 1957 - July 1993</p>
      <hr>
      <p><em>Generated by Naval Navigation Deck Log System v0.4.3</em></p>
      <p><em>Source: National Archives Navy Logbooks</em></p>
    ]]></description>
    <open>1</open>
    
    <!-- Document metadata -->
    <ExtendedData>
      <Data name="vessel">
        <value>${vesselName}</value>
      </Data>
      <Data name="vesselType">
        <value>${vesselType}</value>
      </Data>
      <Data name="exportDate">
        <value>${exportDate}</value>
      </Data>
      <Data name="totalEntries">
        <value>${totalEntries}</value>
      </Data>
      <Data name="systemVersion">
        <value>Naval Navigation Deck Log System v0.4.3</value>
      </Data>
    </ExtendedData>
`;
  }

  /**
   * Generate KML styles for different elements
   */
  _generateKMLStyles() {
    return `
    <!-- Navigation Track Style -->
    <Style id="navigationTrack">
      <LineStyle>
        <color>ff0000ff</color>
        <width>3</width>
        <gx:labelVisibility>1</gx:labelVisibility>
      </LineStyle>
    </Style>
    
    <!-- Daily Track Styles (different colors for each day) -->
    <Style id="track_day1">
      <LineStyle>
        <color>ff0000ff</color>
        <width>2</width>
      </LineStyle>
    </Style>
    
    <Style id="track_day2">
      <LineStyle>
        <color>ff00ff00</color>
        <width>2</width>
      </LineStyle>
    </Style>
    
    <Style id="track_day3">
      <LineStyle>
        <color>ffff0000</color>
        <width>2</width>
      </LineStyle>
    </Style>
    
    <Style id="track_day4">
      <LineStyle>
        <color>ffffff00</color>
        <width>2</width>
      </LineStyle>
    </Style>
    
    <Style id="track_day5">
      <LineStyle>
        <color>ffff00ff</color>
        <width>2</width>
      </LineStyle>
    </Style>
    
    <!-- Waypoint Styles -->
    <Style id="navigationWaypoint">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/sailing.png</href>
        </Icon>
        <hotSpot x="0.5" y="0.0" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <color>ffffffff</color>
        <scale>0.8</scale>
      </LabelStyle>
    </Style>
    
    <!-- Important Waypoint Style -->
    <Style id="importantWaypoint">
      <IconStyle>
        <color>ff00ffff</color>
        <scale>1.3</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/star.png</href>
        </Icon>
        <hotSpot x="0.5" y="0.0" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <color>ff00ffff</color>
        <scale>1.0</scale>
      </LabelStyle>
    </Style>
    
    <!-- Start/End Point Styles -->
    <Style id="startPoint">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/flag.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff00ff00</color>
        <scale>1.0</scale>
      </LabelStyle>
    </Style>
    
    <Style id="endPoint">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/flag.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff0000ff</color>
        <scale>1.0</scale>
      </LabelStyle>
    </Style>
`;
  }

  /**
   * Generate KML tracks organized by date
   */
  _generateKMLTracks(navigationLogs) {
    let kmlTracks = `
    <!-- Navigation Tracks Folder -->
    <Folder>
      <name>Navigation Tracks</name>
      <description>Daily navigation tracks with course lines</description>
      <open>1</open>
`;

    // Group logs by date
    const logsByDate = this._groupLogsByDate(navigationLogs);
    let dayIndex = 0;

    Object.entries(logsByDate).forEach(([date, dayLogs]) => {
      if (dayLogs.length < 2) return; // Need at least 2 points for a track
      
      dayIndex++;
      const trackStyle = `track_day${((dayIndex - 1) % 5) + 1}`;
      const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      kmlTracks += `
      <Placemark>
        <name>${formattedDate} Track</name>
        <description><![CDATA[
          <h4>Navigation Track - ${formattedDate}</h4>
          <p><strong>Positions:</strong> ${dayLogs.length}</p>
          <p><strong>Start Time:</strong> ${dayLogs[0].positionTime}</p>
          <p><strong>End Time:</strong> ${dayLogs[dayLogs.length - 1].positionTime}</p>
          ${this._calculateTrackDistance(dayLogs)}
        ]]></description>
        <styleUrl>#${trackStyle}</styleUrl>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
`;

      // Add coordinates for this date's track
      dayLogs.forEach(log => {
        const coords = this._parseCoordinatesToDecimal(log);
        if (coords) {
          kmlTracks += `            ${coords.lon},${coords.lat},0\n`;
        }
      });

      kmlTracks += `          </coordinates>
        </LineString>
      </Placemark>
`;
    });

    kmlTracks += `    </Folder>\n`;
    return kmlTracks;
  }

  /**
   * Generate KML placemarks for individual navigation points
   */
  _generateKMLPlacemarks(navigationLogs) {
    let kmlPlacemarks = `
    <!-- Navigation Waypoints Folder -->
    <Folder>
      <name>Navigation Waypoints</name>
      <description>Individual navigation log entries</description>
      <open>0</open>
`;

    navigationLogs.forEach((log, index) => {
      const coords = this._parseCoordinatesToDecimal(log);
      if (!coords) return;

      const plotNumber = index + 1;
      const isFirst = index === 0;
      const isLast = index === navigationLogs.length - 1;
      const isImportant = log.isImportant;
      
      let styleUrl = '#navigationWaypoint';
      if (isFirst) styleUrl = '#startPoint';
      else if (isLast) styleUrl = '#endPoint';
      else if (isImportant) styleUrl = '#importantWaypoint';

      const formattedDate = new Date(log.logDate + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Calculate distance to land if available
      let distanceToLand = '';
      if (window.calculateDistanceToLand) {
        try {
          const landData = window.calculateDistanceToLand(coords.lat, coords.lon);
          if (landData.displayText !== 'N/A') {
            distanceToLand = `
          <p><strong>Distance to Land:</strong> ${landData.displayText}</p>
          <p><strong>Nearest Land:</strong> ${landData.nearestLand}</p>`;
          }
        } catch (e) {
          // Ignore calculation errors
        }
      }

      kmlPlacemarks += `
      <Placemark>
        <name>Plot ${plotNumber} - ${log.positionTime}</name>
        <description><![CDATA[
          <h4>Navigation Log Entry</h4>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${log.positionTime} ${log.zoneDescription || 'UTC'}</p>
          <p><strong>Position:</strong> ${log.latitude}, ${log.longitude}</p>
          <p><strong>Plot Number:</strong> ${plotNumber}</p>${distanceToLand}
          ${log.remarks ? `<p><strong>Remarks:</strong> ${this._escapeXML(log.remarks)}</p>` : ''}
          ${isImportant ? '<p><strong>⭐ Important Entry</strong></p>' : ''}
          ${log.associatedUrl ? `<p><strong>Reference:</strong> <a href="${log.associatedUrl}" target="_blank">View Link</a></p>` : ''}
          <hr>
          <p><em>Entry ID: ${log.id}</em></p>
        ]]></description>
        <styleUrl>${styleUrl}</styleUrl>
        <Point>
          <coordinates>${coords.lon},${coords.lat},0</coordinates>
        </Point>
        
        <!-- Extended data for applications that support it -->
        <ExtendedData>
          <Data name="plotNumber">
            <value>${plotNumber}</value>
          </Data>
          <Data name="logDate">
            <value>${log.logDate}</value>
          </Data>
          <Data name="positionTime">
            <value>${log.positionTime}</value>
          </Data>
          <Data name="latitude">
            <value>${log.latitude}</value>
          </Data>
          <Data name="longitude">
            <value>${log.longitude}</value>
          </Data>
          <Data name="isImportant">
            <value>${isImportant}</value>
          </Data>
          ${log.remarks ? `<Data name="remarks"><value>${this._escapeXML(log.remarks)}</value></Data>` : ''}
        </ExtendedData>
      </Placemark>
`;
    });

    kmlPlacemarks += `    </Folder>\n`;
    return kmlPlacemarks;
  }

  /**
   * Generate KML footer
   */
  _generateKMLFooter() {
    return `  </Document>
</kml>`;
  }

  /**
   * Sort logs chronologically
   */
  _sortLogsChronologically(logs) {
    return [...logs].sort((a, b) =>
      new Date(`${a.logDate}T${a.positionTime}`) - new Date(`${b.logDate}T${b.positionTime}`)
    );
  }

  /**
   * Group logs by date for track generation
   */
  _groupLogsByDate(logs) {
    const grouped = {};
    logs.forEach(log => {
      if (!grouped[log.logDate]) {
        grouped[log.logDate] = [];
      }
      grouped[log.logDate].push(log);
    });
    
    // Sort each day's logs by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.positionTime.localeCompare(b.positionTime));
    });
    
    return grouped;
  }

  /**
   * Parse coordinates to decimal format for KML
   */
  _parseCoordinatesToDecimal(log) {
    const lat = this._parseCoordinate(log.latitude);
    const lon = this._parseCoordinate(log.longitude);
    
    if (lat === null || lon === null) return null;
    return { lat, lon };
  }

  /**
   * Calculate track distance for description
   */
  _calculateTrackDistance(dayLogs) {
    if (dayLogs.length < 2) return '';
    
    let totalDistance = 0;
    for (let i = 0; i < dayLogs.length - 1; i++) {
      const start = this._parseCoordinatesToDecimal(dayLogs[i]);
      const end = this._parseCoordinatesToDecimal(dayLogs[i + 1]);
      
      if (start && end && window.calculateDistance) {
        totalDistance += window.calculateDistance(start.lat, start.lon, end.lat, end.lon);
      }
    }
    
    if (totalDistance > 0) {
      return `<p><strong>Track Distance:</strong> ${totalDistance.toFixed(1)} NM</p>`;
    }
    
    return '';
  }

  /**
   * Escape XML special characters
   */
  _escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Get configuration value with fallback
   */
  _getConfigValue(path, defaultValue) {
    if (this.config && this.config.get) {
      try {
        const value = this.config.get(path);
        return value !== undefined ? value : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataStorage;
} else {
  window.DataStorage = DataStorage;
}