/**
 * Form Manager Module
 * Handles all form operations including validation, population, and user input tracking
 */

class FormManager {
  constructor(config, alerts) {
    this.config = config;
    this.alerts = alerts;
    this.app = null;
    this.elements = {};
  }

  /**
   * Initialize form manager
   */
  init(app) {
    this.app = app;
    this._cacheElements();
    this._setupEventListeners();
    this._setDefaultValues();
  }

  /**
   * Get form data for submission
   */
  getFormData() {
    const latString = this._buildCoordinateString(
      this.elements.latDegrees.value,
      this.elements.latMinutes.value,
      this.elements.latDirection.value
    );

    const lonString = this._buildCoordinateString(
      this.elements.lonDegrees.value,
      this.elements.lonMinutes.value,
      this.elements.lonDirection.value
    );

    return {
      vesselName: this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER'),
      vesselType: this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61'),
      zoneDescription: 'UTC',
      logDate: this.elements.logDate.value,
      dayOfWeek: this.elements.dayOfWeek.value,
      passageInfo: 'NAVIGATION LOG ENTRY',
      positionTime: this.elements.positionTime.value,
      latitude: latString,
      longitude: lonString,
      fixMethod: '2',
      remarks: this.elements.remarks.value,
      associatedUrl: this.elements.associatedUrl.value,
      isImportant: false
    };
  }

  /**
   * Populate form for editing an existing entry
   */
  populateForEdit(log) {
    this.elements.editId.value = log.id;
    this.elements.logDate.value = log.logDate;
    this.elements.positionTime.value = log.positionTime;

    const lat = this._parseCoordinateString(log.latitude);
    const lon = this._parseCoordinateString(log.longitude);

    this.elements.latDegrees.value = lat.degrees;
    this.elements.latMinutes.value = lat.minutes;
    this.elements.latDirection.value = lat.direction;
    this.elements.lonDegrees.value = lon.degrees;
    this.elements.lonMinutes.value = lon.minutes;
    this.elements.lonDirection.value = lon.direction;

    this.elements.remarks.value = log.remarks || '';
    this.elements.associatedUrl.value = log.associatedUrl || '';

    // Mark fields as user input
    ['positionTime', 'latDegrees', 'latMinutes', 'latDirection', 'lonDegrees', 'lonMinutes', 'lonDirection']
      .forEach(field => {
        if (this.elements[field] && this.elements[field].value) {
          this._markAsUserInput(this.elements[field]);
        }
      });

    this._updateDayOfWeek();
    this._setEditMode(true);
  }

  /**
   * Reset form to default state
   */
  reset() {
    this.elements.logForm.reset();
    this.elements.editId.value = '';
    this._setEditMode(false);

    // Set smart defaults
    this.elements.logDate.value = this._getDefaultDate();
    this.elements.latDirection.value = this._getConfigValue('USER_PREFERENCES.FORM.defaultLatDirection', 'N');
    this.elements.lonDirection.value = this._getConfigValue('USER_PREFERENCES.FORM.defaultLonDirection', 'W');
    this.elements.associatedUrl.value = '';

    this._removeUserInputStyling();
    this._updateDayOfWeek();
  }

  /**
   * Update last entry display
   */
  updateLastEntryDisplay(navigationLogs) {
    const container = this.elements.lastEntryDisplay;
    if (!container) return;

    if (navigationLogs.length === 0) {
      container.innerHTML = '<span class="no-entries">No entries yet</span>';
      return;
    }

    const lastEntry = this._getLastEntry(navigationLogs);
    if (!lastEntry) return;

    const formattedDate = new Date(lastEntry.logDate + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Calculate distance to land
    let distanceInfo = '';
    if (this._getConfigValue('USER_PREFERENCES.TABLE.showDistanceToLand', true)) {
      const landData = this._calculateDistanceToLand(lastEntry);
      if (landData) {
        distanceInfo = `<tr><td class="entry-label">Distance to Land:</td><td class="entry-value">${landData.displayText}</td></tr>`;
      }
    }

    // Determine status
    const { actionText, actionIcon } = this._getEntryStatus(lastEntry);

    container.innerHTML = `
      <table class="last-entry-table">
        <tr><td class="entry-label">Status:</td><td class="entry-value">${actionIcon} ${actionText}</td></tr>
        <tr><td class="entry-label">Date:</td><td class="entry-value">${formattedDate}</td></tr>
        <tr><td class="entry-label">Time:</td><td class="entry-value">${lastEntry.positionTime}</td></tr>
        <tr><td class="entry-label">Position:</td><td class="entry-value">${lastEntry.latitude}<br>${lastEntry.longitude}</td></tr>
        ${distanceInfo}
      </table>
    `;
  }

  /**
   * Set default date range for filtering
   */
  setDefaultDateRange(navigationLogs) {
    if (navigationLogs.length === 0) return;

    const dates = navigationLogs.map(l => l.logDate).sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    const startDate = this.elements.startDate;
    const endDate = this.elements.endDate;

    if (startDate && endDate) {
      startDate.min = minDate;
      startDate.max = maxDate;
      endDate.min = minDate;
      endDate.max = maxDate;
      
      if (!startDate.value) startDate.value = minDate;
      if (!endDate.value) endDate.value = maxDate;
    }
  }

  /**
   * Ensure date range covers the specified date
   */
  ensureDateRangeCovers(dateStr) {
    const startDate = this.elements.startDate;
    const endDate = this.elements.endDate;
    
    if (!startDate || !endDate) return;

    if (!startDate.value || startDate.value > dateStr) {
      startDate.value = dateStr;
    }
    if (!endDate.value || endDate.value < dateStr) {
      endDate.value = dateStr;
    }
  }

  // Private methods

  /**
   * Cache DOM elements
   */
  _cacheElements() {
    const ids = [
      'logForm', 'editId', 'logDate', 'dayOfWeek', 'positionTime',
      'latDegrees', 'latMinutes', 'latDirection',
      'lonDegrees', 'lonMinutes', 'lonDirection',
      'remarks', 'associatedUrl', 'submitBtn', 'cancelBtn',
      'lastEntryDisplay', 'startDate', 'endDate'
    ];

    ids.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Date change updates day of week
    if (this.elements.logDate) {
      this.elements.logDate.addEventListener('change', () => this._updateDayOfWeek());
    }

    // Track user input on coordinate fields
    ['positionTime', 'latDegrees', 'latMinutes', 'latDirection', 'lonDegrees', 'lonMinutes', 'lonDirection']
      .forEach(field => {
        const element = this.elements[field];
        if (element) {
          element.addEventListener('input', () => this._markAsUserInput(element));
          element.addEventListener('change', () => this._markAsUserInput(element));
        }
      });
  }

  /**
   * Set default form values
   */
  _setDefaultValues() {
    if (this.elements.logDate) {
      this.elements.logDate.value = this._getDefaultDate();
    }
    this._updateDayOfWeek();
  }

  /**
   * Update day of week based on selected date
   */
  _updateDayOfWeek() {
    if (!this.elements.logDate || !this.elements.dayOfWeek) return;

    const dateValue = this.elements.logDate.value;
    if (dateValue) {
      const selectedDate = new Date(dateValue + 'T00:00:00');
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      this.elements.dayOfWeek.value = days[selectedDate.getDay()];
    }
  }

  /**
   * Build coordinate string from components
   */
  _buildCoordinateString(degrees, minutes, direction) {
    if (!degrees || !minutes || !direction) return '';
    return `${degrees}°${minutes}'${direction}`;
  }

  /**
   * Parse coordinate string into components
   */
  _parseCoordinateString(coordString) {
    const match = coordString.match(/(\d+)°(\d+\.?\d*)'([NSEW])/);
    if (!match) return { degrees: '', minutes: '', direction: '' };
    return { degrees: match[1], minutes: match[2], direction: match[3] };
  }

  /**
   * Mark field as having user input
   */
  _markAsUserInput(element) {
    element.classList.add('user-input');
  }

  /**
   * Remove user input styling from all coordinate fields
   */
  _removeUserInputStyling() {
    ['positionTime', 'latDegrees', 'latMinutes', 'latDirection', 'lonDegrees', 'lonMinutes', 'lonDirection']
      .forEach(field => {
        const element = this.elements[field];
        if (element) {
          element.classList.remove('user-input');
        }
      });
  }

  /**
   * Set form edit mode
   */
  _setEditMode(isEditing) {
    if (this.elements.submitBtn) {
      this.elements.submitBtn.textContent = isEditing ? '💾 Update Entry' : '➕ Add Log Entry';
    }
    if (this.elements.cancelBtn) {
      this.elements.cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
    }
  }

  /**
   * Get default date for new entries
   */
  _getDefaultDate() {
    if (this.app && (!this.app.dataManager || this.app.dataManager.getAllLogs().length === 0)) {
  return '1970-10-01';
}

if (this.app && this.app.dataManager && this.app.dataManager.getAllLogs().length > 0) {
  const sorted = this.app.dataManager.getAllLogs().sort((a, b) =>
    new Date(`${b.logDate}T${b.positionTime}`) - new Date(`${a.logDate}T${a.positionTime}`)
  );
  return sorted[0].logDate;
}
    
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get the most recently entered/updated entry
   */
  _getLastEntry(navigationLogs) {
    // Try to get from config first
    if (this.config && this.config.getLastEntryId) {
      const lastEntryId = this.config.getLastEntryId();
      if (lastEntryId) {
        const entry = navigationLogs.find(log => log.id === lastEntryId);
        if (entry) return entry;
      }
    }

    // Fallback to entry with highest timestamp
    const withTimestamps = navigationLogs.filter(log => log.entryTimestamp);
    if (withTimestamps.length > 0) {
      return withTimestamps.sort((a, b) => b.entryTimestamp - a.entryTimestamp)[0];
    }

    // Final fallback to chronologically latest
    const sorted = navigationLogs.sort((a, b) =>
      new Date(`${b.logDate}T${b.positionTime}`) - new Date(`${a.logDate}T${a.positionTime}`)
    );
    return sorted[0];
  }

  /**
   * Get entry status for display
   */
  _getEntryStatus(entry) {
    if (this.config && this.config.get) {
      const isLastAdded = entry.id === this.config.get('STATE.lastEntryAdded');
      const isLastUpdated = entry.id === this.config.get('STATE.lastEntryUpdated');
      
      if (isLastAdded) {
        return { actionText: 'Recently Added', actionIcon: '✅' };
      } else if (isLastUpdated) {
        return { actionText: 'Recently Updated', actionIcon: '📝' };
      }
    }
    
    return { actionText: 'Last Entry', actionIcon: '📍' };
  }

  /**
   * Calculate distance to land for an entry
   */
  _calculateDistanceToLand(entry) {
    if (!window.calculateDistanceToLand) return null;

    const lat = this._parseCoordinate(entry.latitude);
    const lon = this._parseCoordinate(entry.longitude);
    
    if (lat !== null && lon !== null) {
      return window.calculateDistanceToLand(lat, lon);
    }
    
    return null;
  }

  /**
   * Parse coordinate string to decimal degrees
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
  module.exports = FormManager;
} else {
  window.FormManager = FormManager;
}