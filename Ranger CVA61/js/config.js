// ===== Naval Navigation Deck Log System - Configuration =====
// config.js - Centralized configuration and state management

const CONFIG = {
  // Application metadata
  APP: {
    VERSION: 'v0.4.3',
    NAME: 'Naval Navigation Deck Log System',
    VESSEL_NAME: 'USS RANGER',
    VESSEL_TYPE: 'CVA-61',
    COMMISSIONED: 'August 1957',
    DECOMMISSIONED: 'July 1993'
  },

  // User preferences (persisted to localStorage)
  USER_PREFERENCES: {
    // Map settings
    MAP: {
      defaultZoom: 6,
      defaultCenter: [20.9, -158.0],
      showTrackLine: true,
      showFixNumbers: true,
      autoPlotNewEntries: true,
      autoZoomToNewEntry: true,
      measurementUnits: 'nautical' // 'nautical', 'metric', 'imperial'
    },
    
    // Form settings
    FORM: {
      defaultTimeIncrement: '04:00', // 4 hours between entries
      autoFillNextTime: true,
      rememberLastPosition: true,
      validateCoordinates: true,
      defaultLatDirection: 'N',
      defaultLonDirection: 'W'
    },
    
    // Table settings
    TABLE: {
      rowsPerPage: 50,
      sortBy: 'timestamp', // 'timestamp', 'date', 'plotNumber'
      sortOrder: 'asc', // 'asc', 'desc'
      showDistanceToLand: true,
      highlightImportantEntries: true
    },
    
    // Data management
    DATA: {
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      backupBeforeImport: true,
      maxHistoryEntries: 1000
    },
    
    // UI preferences
    UI: {
      theme: 'default', // 'default', 'dark', 'nautical'
      compactMode: false,
      showSuccessMessages: true,
      messageDuration: 3000
    }
  },

  // Application state (not persisted, runtime only)
  STATE: {
    // Last user interaction tracking
    lastEntryAdded: null, // Will store the ID of the most recently added entry
    lastEntryUpdated: null, // Will store the ID of the most recently updated entry
    lastUserAction: null, // 'add', 'update', 'delete', 'import'
    lastUserActionTimestamp: null,
    
    // Form state
    isEditing: false,
    editingEntryId: null,
    formDirty: false,
    
    // Map state
    mapInitialized: false,
    measurementMode: false,
    plotsVisible: false,
    
    // Data state
    dataLoaded: false,
    unsavedChanges: false,
    lastSaveTimestamp: null
  },

  // Default coordinate templates for quick entry
  COORDINATE_TEMPLATES: {
    'Pearl Harbor': { lat: "21°20.0'N", lon: "157°58.0'W" },
    'San Diego': { lat: "32°43.0'N", lon: "117°09.0'W" },
    'Alameda': { lat: "37°46.0'N", lon: "122°18.0'W" },
    'Yokosuka': { lat: "35°17.0'N", lon: "139°40.0'E" },
    'Subic Bay': { lat: "14°48.0'N", lon: "120°17.0'E" }
  },

  // Navigation calculation constants
  NAVIGATION: {
    EARTH_RADIUS_NM: 3440.065,
    EARTH_RADIUS_KM: 6371,
    EARTH_RADIUS_MI: 3959,
    KNOTS_TO_MPH: 1.15078,
    KNOTS_TO_KMH: 1.852,
    NM_TO_FEET: 6076,
    NM_TO_METERS: 1852
  },

  // Alert and notification settings
  ALERTS: {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
    WARNING_DURATION: 4000,
    INFO_DURATION: 3000
  },

  // Data validation rules
  VALIDATION: {
    LATITUDE: {
      min: -90,
      max: 90,
      maxDegrees: 90,
      maxMinutes: 59.999
    },
    LONGITUDE: {
      min: -180,
      max: 180,
      maxDegrees: 180,
      maxMinutes: 59.999
    },
    REMARKS: {
      maxLength: 500
    },
    URL: {
      maxLength: 2000
    }
  }
};

// ===== Configuration Management Functions =====

class ConfigManager {
  constructor() {
    this.loadUserPreferences();
    this.initializeState();
  }

  // Load user preferences from localStorage
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('ussRangerNavLog_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        // Merge with defaults, preserving structure
        this.mergePreferences(CONFIG.USER_PREFERENCES, preferences);
      }
    } catch (e) {
      console.warn('Could not load user preferences:', e);
    }
  }

  // Deep merge preferences while preserving structure
  mergePreferences(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          this.mergePreferences(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  // Save user preferences to localStorage
  saveUserPreferences() {
    try {
      localStorage.setItem('ussRangerNavLog_preferences', JSON.stringify(CONFIG.USER_PREFERENCES));
    } catch (e) {
      console.warn('Could not save user preferences:', e);
    }
  }

  // Initialize application state
  initializeState() {
    CONFIG.STATE.lastUserActionTimestamp = Date.now();
    CONFIG.STATE.dataLoaded = false;
    CONFIG.STATE.mapInitialized = false;
  }

  // Get a configuration value using dot notation
  get(path) {
    return this.getNestedValue(CONFIG, path);
  }

  // Set a configuration value using dot notation
  set(path, value) {
    this.setNestedValue(CONFIG, path, value);
    
    // If setting a user preference, save to localStorage
    if (path.startsWith('USER_PREFERENCES.')) {
      this.saveUserPreferences();
    }
  }

  // Get nested object value using dot notation
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Set nested object value using dot notation
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Update last entry tracking
  updateLastEntry(entryId, action = 'add') {
    CONFIG.STATE.lastUserAction = action;
    CONFIG.STATE.lastUserActionTimestamp = Date.now();
    
    if (action === 'add') {
      CONFIG.STATE.lastEntryAdded = entryId;
    } else if (action === 'update') {
      CONFIG.STATE.lastEntryUpdated = entryId;
    }
    
    // Mark as having unsaved changes
    CONFIG.STATE.unsavedChanges = true;
  }

  // Get the ID of the most recently added/updated entry
  getLastEntryId() {
    const lastAdded = CONFIG.STATE.lastEntryAdded;
    const lastUpdated = CONFIG.STATE.lastEntryUpdated;
    
    // Return the most recent action's entry ID
    if (!lastAdded && !lastUpdated) return null;
    if (!lastAdded) return lastUpdated;
    if (!lastUpdated) return lastAdded;
    
    // Compare timestamps to see which was more recent
    // For now, prioritize the most recently added entry
    return lastAdded;
  }

  // Reset state (useful for cleanup)
  resetState() {
    this.initializeState();
  }

  // Export current configuration (for debugging/backup)
  exportConfig() {
    return {
      version: CONFIG.APP.VERSION,
      exported: new Date().toISOString(),
      preferences: CONFIG.USER_PREFERENCES,
      state: CONFIG.STATE
    };
  }

  // Validate coordinate input
  validateCoordinate(degrees, minutes, direction, isLatitude = true) {
    const limits = isLatitude ? CONFIG.VALIDATION.LATITUDE : CONFIG.VALIDATION.LONGITUDE;
    
    if (!degrees || !minutes || !direction) {
      return { valid: false, error: 'All coordinate fields are required' };
    }
    
    const deg = parseInt(degrees, 10);
    const min = parseFloat(minutes);
    
    if (isNaN(deg) || isNaN(min)) {
      return { valid: false, error: 'Degrees and minutes must be numeric' };
    }
    
    if (deg < 0 || deg > limits.maxDegrees) {
      return { valid: false, error: `Degrees must be between 0 and ${limits.maxDegrees}` };
    }
    
    if (min < 0 || min >= 60) {
      return { valid: false, error: 'Minutes must be between 0 and 59.999' };
    }
    
    const validDirections = isLatitude ? ['N', 'S'] : ['E', 'W'];
    if (!validDirections.includes(direction)) {
      return { valid: false, error: `Direction must be ${validDirections.join(' or ')}` };
    }
    
    return { valid: true };
  }

  // Get next suggested time based on user preferences
  getNextSuggestedTime(lastTime) {
    if (!CONFIG.USER_PREFERENCES.FORM.autoFillNextTime || !lastTime) {
      return null;
    }
    
    const increment = CONFIG.USER_PREFERENCES.FORM.defaultTimeIncrement;
    const [hours, minutes] = increment.split(':').map(n => parseInt(n, 10));
    
    const [lastHours, lastMinutes] = lastTime.split(':').map(n => parseInt(n, 10));
    
    let newMinutes = lastMinutes + minutes;
    let newHours = lastHours + hours;
    
    if (newMinutes >= 60) {
      newHours += Math.floor(newMinutes / 60);
      newMinutes = newMinutes % 60;
    }
    
    if (newHours >= 24) {
      newHours = newHours % 24;
    }
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
}

// Create global instance
const configManager = new ConfigManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, ConfigManager, configManager };
} else {
  // Browser environment
  window.CONFIG = CONFIG;
  window.configManager = configManager;
}