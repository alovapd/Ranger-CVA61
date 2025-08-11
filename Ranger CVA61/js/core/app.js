/**
 * Naval Navigation Deck Log System - Main Application Controller
 * Production Version - Performance monitoring removed
 */

class NavalNavigationApp {
  constructor() {
    this.config = null;
    this.storage = null;
    this.dataManager = null;
    this.mapping = null;
    this.forms = null;
    this.tables = null;
    this.alerts = null;
    this.themeManager = null;
    this.shortcutsManager = null;
    this.settingsManager = null;
    this.editingId = null;
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      this.config = window.configManager || this._createFallbackConfig();
      
      // Initialize core modules
      this.dataManager = new NavigationDataManager(this.config);
      this.storage = new DataStorage(this.config);
      this.alerts = new AlertManager(this.config);
      this.mapping = new NavigationMapping(this.config, this.alerts);
      this.forms = new FormManager(this.config, this.alerts);
      this.tables = new TableManager(this.config, this.alerts);

      // Initialize enhanced UX modules if available
      this._initializeEnhancedModules();

      // Load data and setup UI
      await this._loadApplicationData();
      this._setupUserInterface();
      this._setupEventListeners();
      
      this.initialized = true;
      this.alerts.show('Navigation system ready', 'success');
      
    } catch (error) {
      throw new Error('Failed to initialize application: ' + error.message);
    }
  }

  /**
   * Initialize enhanced UX modules (Performance Monitor removed)
   */
  _initializeEnhancedModules() {
    // Theme Manager
    if (window.ThemeManager) {
      this.themeManager = new ThemeManager(this.config);
      window.themeManager = this.themeManager;
    }
    
    // Settings Manager
    if (window.SettingsManager) {
      this.settingsManager = new SettingsManager(this.config, this);
      window.settingsManager = this.settingsManager;
    }
    
    // Keyboard Shortcuts Manager
    if (window.ShortcutsManager) {
      this.shortcutsManager = new ShortcutsManager(this.config, this);
      window.shortcutsManager = this.shortcutsManager;
    }
    
    // Performance Monitor removed - no longer initializing
  }

  /**
   * Add a new navigation log entry
   */
  addNavigationLog(data) {
    try {
      const newLog = this.dataManager.addNavigationLog(data);
      this.storage.save(this.dataManager.getAllLogs());
      
      if (this.config && this.config.updateLastEntry) {
        this.config.updateLastEntry(newLog.id, 'add');
      }

      this._refreshUI();
      
      if (this._getConfigValue('USER_PREFERENCES.MAP.autoPlotNewEntries', true)) {
        this._autoPlotAndHighlight(newLog, data.logDate);
      }

      this.forms.reset();
      this.alerts.show(`Navigation entry added: ${data.positionTime}`, 'success');

    } catch (error) {
      this.alerts.showError('Failed to add navigation entry');
    }
  }

  /**
   * Update an existing navigation log entry
   */
  updateNavigationLog(id, data) {
    try {
      const updatedLog = this.dataManager.updateNavigationLog(id, data);
      
      if (!updatedLog) {
        throw new Error('Navigation log entry not found');
      }

      this.storage.save(this.dataManager.getAllLogs());
      
      if (this.config && this.config.updateLastEntry) {
        this.config.updateLastEntry(parseInt(id), 'update');
      }

      this._refreshUI();
      
      if (this._getConfigValue('USER_PREFERENCES.MAP.autoPlotNewEntries', true)) {
        this._autoPlotAndHighlight({ id: parseInt(id) }, data.logDate);
      }

      this.forms.reset();
      this.alerts.show(`Navigation entry updated: ${data.positionTime}`, 'success');

    } catch (error) {
      this.alerts.showError('Failed to update navigation entry');
    }
  }

  /**
   * Delete a navigation log entry
   */
  deleteNavigationLog(id) {
    if (!confirm('Are you sure you want to delete this navigation log entry?')) {
      return;
    }

    try {
      const success = this.dataManager.deleteNavigationLog(id);
      
      if (!success) {
        throw new Error('Navigation log entry not found');
      }

      this.storage.save(this.dataManager.getAllLogs());
      this._refreshUI();
      this.alerts.show('Navigation log entry deleted', 'success');

    } catch (error) {
      this.alerts.showError('Failed to delete navigation entry');
    }
  }

  /**
   * Toggle importance of a navigation log entry
   */
  toggleImportance(id) {
    try {
      const log = this.dataManager.getLogById(parseInt(id));
      if (!log) {
        this.alerts.showError('Navigation log entry not found');
        return;
      }

      // Toggle the importance flag
      const updatedData = { ...log, isImportant: !log.isImportant };
      this.dataManager.updateNavigationLog(id, updatedData);
      
      this.storage.save(this.dataManager.getAllLogs());
      this._refreshUI();
      
      const status = updatedData.isImportant ? 'marked as important' : 'importance removed';
      this.alerts.show(`Entry ${status}`, 'success');

    } catch (error) {
      console.error('Error toggling importance:', error);
      this.alerts.showError('Failed to toggle entry importance');
    }
  }

  /**
   * Start editing a navigation log entry
   */
  editNavigationLog(id) {
    try {
      const log = this.dataManager.getLogById(parseInt(id));
      if (!log) {
        throw new Error('Navigation log entry not found');
      }

      this.editingId = id;
      this.forms.populateForEdit(log);

    } catch (error) {
      this.alerts.showError('Failed to edit navigation entry');
    }
  }

  /**
   * Cancel editing mode
   */
  cancelEdit() {
    this.editingId = null;
    this.forms.reset();
  }

  /**
   * Export data to JSON
   */
  exportToJSON() {
    try {
      const navigationLogs = this.dataManager.getAllLogs();
      this.storage.exportJSON(navigationLogs);
      
      const count = navigationLogs.length;
      const message = `${count} ${count === 1 ? 'entry' : 'entries'} exported to JSON`;
      this.alerts.show(message, 'success');
      
    } catch (error) {
      this.alerts.showError('Export failed');
    }
  }

  /**
   * Export data to CSV
   */
  exportToCSV() {
    try {
      const navigationLogs = this.dataManager.getAllLogs();
      this.storage.exportCSV(navigationLogs);
      
      const count = navigationLogs.length;
      const message = `${count} ${count === 1 ? 'entry' : 'entries'} exported to CSV`;
      this.alerts.show(message, 'success');
      
    } catch (error) {
      this.alerts.showError('CSV export failed');
    }
  }

  /**
   * Import data from JSON
   */
  importFromJSON() {
    try {
      this.storage.importFromJSON((importedLogs, isReplace) => {
        if (isReplace) {
          this.dataManager.replaceAllLogs(importedLogs);
        } else {
          const maxId = this.dataManager.getAllLogs().length > 0 ? 
            Math.max(...this.dataManager.getAllLogs().map(l => l.id)) : 0;
          const newLogs = importedLogs.map((log, i) => ({ ...log, id: maxId + i + 1 }));
          this.dataManager.bulkAddLogs(newLogs);
        }
        
        this.storage.save(this.dataManager.getAllLogs());
        this._refreshUI();
        this.alerts.show(`${importedLogs.length} entries imported`, 'success');
      });
    } catch (error) {
      this.alerts.showError('Import failed');
    }
  }

  /**
   * Plot navigation track on map
   */
  plotNavigationTrack() {
    try {
      const startDate = document.getElementById('startDate')?.value;
      const endDate = document.getElementById('endDate')?.value;
      const showLine = this._getConfigValue('USER_PREFERENCES.MAP.showTrackLine', true);
      const showNumbers = this._getConfigValue('USER_PREFERENCES.MAP.showFixNumbers', true);

      let logsToPlot;
      
      if (startDate && endDate) {
        logsToPlot = this.dataManager.getLogsByDateRange(startDate, endDate);
      } else {
        logsToPlot = this.dataManager.getChronologicalLogs();
      }

      this.mapping.plotTrack(logsToPlot, {
        startDate,
        endDate,
        showLine,
        showNumbers
      });
      
      if (logsToPlot.length === 0) {
        this.alerts.show('No entries to plot in selected date range', 'warning');
      } else {
        this.alerts.show(`${logsToPlot.length} plots rendered`, 'success');
      }

    } catch (error) {
      this.alerts.showError('Failed to plot navigation track');
    }
  }

  /**
   * Clear map
   */
  clearMap() {
    this.mapping.clearMap();
    this.alerts.show('Map cleared', 'info');
  }

  /**
   * Find and highlight plot on map
   */
  findPlotOnMap() {
    const totalLogs = this.dataManager.getAllLogs().length;
    const plotNumber = prompt(`Enter plot number to find (1-${totalLogs}):`);
    if (!plotNumber) return;

    try {
      this.mapping.findAndHighlightPlot(parseInt(plotNumber));
    } catch (error) {
      this.alerts.showError('Failed to find plot');
    }
  }

  // Private methods

  /**
   * Load application data from storage
   */
  async _loadApplicationData() {
    try {
      const savedLogs = await this.storage.load();
      
      if (savedLogs.length === 0) {
        const sampleData = this._createSampleData();
        this.dataManager.bulkAddLogs(sampleData);
        this.storage.save(this.dataManager.getAllLogs());
      } else {
        this.dataManager.bulkAddLogs(savedLogs);
      }
      
    } catch (error) {
      const sampleData = this._createSampleData();
      this.dataManager.bulkAddLogs(sampleData);
    }
  }

  /**
   * Setup user interface
   */
  _setupUserInterface() {
    const versionElement = document.getElementById('appVersion');
    if (versionElement) {
      versionElement.textContent = this._getConfigValue('APP.VERSION', 'v0.4.3');
    }

    this.mapping.init();
    this.forms.init(this);
    this.tables.init();
    this._refreshUI();
    
    // Apply saved theme
    const savedTheme = this._getConfigValue('USER_PREFERENCES.UI.theme', 'default');
    if (this.themeManager && savedTheme !== 'default') {
      setTimeout(() => this.themeManager.setTheme(savedTheme), 100);
    }
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    document.getElementById('logForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = this.forms.getFormData();
      
      if (this.editingId) {
        this.updateNavigationLog(this.editingId, formData);
      } else {
        this.addNavigationLog(formData);
      }
    });

    window.addEventListener('resize', () => {
      this.mapping.handleResize();
    });

    window.app = this;
  }

  /**
   * Refresh all UI components
   */
  _refreshUI() {
    const allLogs = this.dataManager.getAllLogs();
    this.tables.update(allLogs);
    this.forms.updateLastEntryDisplay(allLogs);
    this.forms.setDefaultDateRange(allLogs);
  }

  /**
   * Auto-plot and highlight new entry
   */
  _autoPlotAndHighlight(entry, logDate) {
    this.forms.ensureDateRangeCovers(logDate);
    this.plotNavigationTrack();
    
    if (this._getConfigValue('USER_PREFERENCES.MAP.autoZoomToNewEntry', true)) {
      setTimeout(() => this.mapping.highlightMarker(entry.id), 150);
    }
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

  /**
   * Create fallback config if none available
   */
  _createFallbackConfig() {
    return {
      get: (path) => {
        const defaults = {
          'APP.VERSION': 'v0.4.3',
          'APP.VESSEL_NAME': 'USS RANGER',
          'APP.VESSEL_TYPE': 'CVA-61',
          'USER_PREFERENCES.MAP.autoPlotNewEntries': true,
          'USER_PREFERENCES.MAP.autoZoomToNewEntry': true,
          'USER_PREFERENCES.MAP.showTrackLine': true,
          'USER_PREFERENCES.MAP.showFixNumbers': true,
          'USER_PREFERENCES.UI.showSuccessMessages': true,
          'USER_PREFERENCES.UI.theme': 'default'
        };
        return defaults[path];
      },
      updateLastEntry: () => {},
      getLastEntryId: () => null,
      set: () => {}
    };
  }

  /**
   * Create sample navigation data
   */
  _createSampleData() {
    const now = Date.now();
    return [
      {
        id: 1,
        entryTimestamp: now - 300000,
        vesselName: this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER'),
        vesselType: this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61'),
        zoneDescription: 'UTC',
        logDate: '1970-10-01',
        dayOfWeek: 'THURSDAY',
        passageInfo: 'NAVIGATION LOG ENTRY',
        positionTime: '08:00',
        latitude: "20°56.1'N",
        longitude: "158°03.0'W",
        fixMethod: '2',
        remarks: 'Departed NAS Alameda, course set for Hawaiian operating area',
        associatedUrl: '',
        isImportant: false
      },
      {
        id: 2,
        entryTimestamp: now - 240000,
        vesselName: this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER'),
        vesselType: this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61'),
        zoneDescription: 'UTC',
        logDate: '1970-10-01',
        dayOfWeek: 'THURSDAY',
        passageInfo: 'NAVIGATION LOG ENTRY',
        positionTime: '12:00',
        latitude: "20°53'N",
        longitude: "158°48.2'W",
        fixMethod: '2',
        remarks: 'Steady course, maintaining speed',
        associatedUrl: '',
        isImportant: false
      },
      {
        id: 3,
        entryTimestamp: now - 180000,
        vesselName: this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER'),
        vesselType: this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61'),
        zoneDescription: 'UTC',
        logDate: '1970-10-01',
        dayOfWeek: 'THURSDAY',
        passageInfo: 'NAVIGATION LOG ENTRY',
        positionTime: '20:00',
        latitude: "20°42.4'N",
        longitude: "159°13.1'W",
        fixMethod: '2',
        remarks: 'Position confirmed, on track to operating area',
        associatedUrl: '',
        isImportant: false
      }
    ];
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavalNavigationApp;
} else {
  window.NavalNavigationApp = NavalNavigationApp;
}