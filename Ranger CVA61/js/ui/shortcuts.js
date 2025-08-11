/**
 * Keyboard Shortcuts Manager - Production Version
 * Professional keyboard shortcuts for power users
 * Performance monitor shortcut removed
 */

class ShortcutsManager {
  constructor(config, app) {
    this.config = config;
    this.app = app;
    this.enabled = this._getConfigValue('USER_PREFERENCES.UI.keyboardShortcuts', true);
    this.showHelp = false;
    
    this.shortcuts = {
      // Navigation Entry
      'ctrl+n': { action: 'newEntry', description: 'New navigation entry', group: 'Entry' },
      'ctrl+s': { action: 'saveEntry', description: 'Save current entry', group: 'Entry' },
      'escape': { action: 'cancelEdit', description: 'Cancel editing', group: 'Entry' },
      'ctrl+d': { action: 'duplicateEntry', description: 'Duplicate last entry', group: 'Entry' },
      
      // Data Management
      'ctrl+e': { action: 'exportJSON', description: 'Export to JSON', group: 'Data' },
      'ctrl+i': { action: 'importJSON', description: 'Import from JSON', group: 'Data' },
      'ctrl+shift+e': { action: 'exportCSV', description: 'Export to CSV', group: 'Data' },
      'ctrl+r': { action: 'refreshData', description: 'Refresh data', group: 'Data' },
      
      // Map Controls
      'ctrl+m': { action: 'plotTrack', description: 'Plot navigation track', group: 'Map' },
      'ctrl+shift+m': { action: 'clearMap', description: 'Clear map', group: 'Map' },
      'ctrl+f': { action: 'findPlot', description: 'Find plot on map', group: 'Map' },
      'ctrl+shift+d': { action: 'measureDistance', description: 'Measure distance', group: 'Map' },
      
      // UI Controls
      'ctrl+t': { action: 'toggleTheme', description: 'Toggle dark mode', group: 'UI' },
      'ctrl+shift+s': { action: 'openSettings', description: 'Open settings', group: 'UI' },
      // Performance monitor shortcut removed
      'f11': { action: 'toggleFullscreen', description: 'Toggle fullscreen', group: 'UI' },
      
      // Navigation
      'ctrl+1': { action: 'focusForm', description: 'Focus entry form', group: 'Navigation' },
      'ctrl+2': { action: 'focusTable', description: 'Focus data table', group: 'Navigation' },
      'ctrl+3': { action: 'focusMap', description: 'Focus map', group: 'Navigation' },
      'tab': { action: 'nextField', description: 'Next form field', group: 'Navigation' },
      'shift+tab': { action: 'prevField', description: 'Previous form field', group: 'Navigation' },
      
      // Quick Actions
      'ctrl+shift+t': { action: 'quickTime', description: 'Set current time', group: 'Quick' },
      'ctrl+shift+l': { action: 'quickLocation', description: 'Use last location', group: 'Quick' },
      'ctrl+shift+r': { action: 'quickRemarks', description: 'Standard remarks', group: 'Quick' },
      
      // Help
      'f1': { action: 'showHelp', description: 'Show keyboard shortcuts', group: 'Help' },
      'ctrl+shift+h': { action: 'showHelp', description: 'Show keyboard shortcuts', group: 'Help' }
    };
    
    this.init();
  }

  /**
   * Initialize shortcuts system
   */
  init() {
    if (!this.enabled) return;
    
    this._setupEventListeners();
    this._createHelpOverlay();
    this._addShortcutIndicators();
  }

  /**
   * Enable/disable shortcuts
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.config && this.config.set) {
      this.config.set('USER_PREFERENCES.UI.keyboardShortcuts', enabled);
    }
    
    if (enabled) {
      this._setupEventListeners();
    } else {
      this._removeEventListeners();
    }
  }

  /**
   * Show shortcuts help overlay
   */
  showHelpOverlay() {
    const overlay = document.getElementById('shortcuts-help-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      this.showHelp = true;
    }
  }

  /**
   * Hide shortcuts help overlay
   */
  hideHelpOverlay() {
    const overlay = document.getElementById('shortcuts-help-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      this.showHelp = false;
    }
  }

  /**
   * Get shortcuts by group
   */
  getShortcutsByGroup() {
    const groups = {};
    Object.entries(this.shortcuts).forEach(([key, shortcut]) => {
      if (!groups[shortcut.group]) {
        groups[shortcut.group] = [];
      }
      groups[shortcut.group].push({
        key: this._formatKeyDisplay(key),
        description: shortcut.description
      });
    });
    return groups;
  }

  // Private methods

  /**
   * Setup keyboard event listeners
   */
  _setupEventListeners() {
    this.keydownHandler = this._handleKeydown.bind(this);
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Remove event listeners
   */
  _removeEventListeners() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }

  /**
   * Handle keydown events
   */
  _handleKeydown(event) {
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
    const isContentEditable = event.target.isContentEditable;
    
    if (isInput || isContentEditable) {
      const allowedInInputs = ['escape', 'f1', 'ctrl+s', 'ctrl+shift+h'];
      const keyCombo = this._getKeyCombo(event);
      if (!allowedInInputs.includes(keyCombo)) {
        return;
      }
    }

    const keyCombo = this._getKeyCombo(event);
    const shortcut = this.shortcuts[keyCombo];

    if (shortcut) {
      event.preventDefault();
      this._executeAction(shortcut.action, event);
    }
  }

  /**
   * Get key combination string
   */
  _getKeyCombo(event) {
    const keys = [];
    
    if (event.ctrlKey) keys.push('ctrl');
    if (event.shiftKey) keys.push('shift');
    if (event.altKey) keys.push('alt');
    if (event.metaKey) keys.push('meta');
    
    let key = event.key.toLowerCase();
    
    const keyMappings = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right'
    };
    
    if (keyMappings[key]) {
      key = keyMappings[key];
    }
    
    if (['control', 'shift', 'alt', 'meta'].includes(key)) {
      return null;
    }
    
    keys.push(key);
    return keys.join('+');
  }

  /**
   * Execute shortcut action (Performance monitor case removed)
   */
  _executeAction(action, event) {
    try {
      switch (action) {
        case 'newEntry':
          this._newEntry();
          break;
        case 'saveEntry':
          this._saveEntry();
          break;
        case 'cancelEdit':
          this._cancelEdit();
          break;
        case 'duplicateEntry':
          this._duplicateEntry();
          break;
        case 'exportJSON':
          if (this.app.exportToJSON) this.app.exportToJSON();
          break;
        case 'importJSON':
          if (this.app.importFromJSON) this.app.importFromJSON();
          break;
        case 'exportCSV':
          if (this.app.exportToCSV) this.app.exportToCSV();
          break;
        case 'refreshData':
          this._refreshData();
          break;
        case 'plotTrack':
          if (this.app.plotNavigationTrack) this.app.plotNavigationTrack();
          break;
        case 'clearMap':
          if (this.app.clearMap) this.app.clearMap();
          break;
        case 'findPlot':
          if (this.app.findPlotOnMap) this.app.findPlotOnMap();
          break;
        case 'measureDistance':
          if (this.app.mapping && this.app.mapping.toggleDistanceMeasurement) {
            this.app.mapping.toggleDistanceMeasurement();
          }
          break;
        case 'toggleTheme':
          this._toggleTheme();
          break;
        case 'openSettings':
          this._openSettings();
          break;
        // Performance monitor case removed
        case 'toggleFullscreen':
          this._toggleFullscreen();
          break;
        case 'focusForm':
          this._focusForm();
          break;
        case 'focusTable':
          this._focusTable();
          break;
        case 'focusMap':
          this._focusMap();
          break;
        case 'nextField':
          this._nextField();
          break;
        case 'prevField':
          this._prevField();
          break;
        case 'quickTime':
          this._quickTime();
          break;
        case 'quickLocation':
          this._quickLocation();
          break;
        case 'quickRemarks':
          this._quickRemarks();
          break;
        case 'showHelp':
          this.showHelpOverlay();
          break;
      }
      
    } catch (error) {
      console.error('Shortcut execution error:', error);
    }
  }

  /**
   * New entry action
   */
  _newEntry() {
    if (this.app.forms && this.app.forms.reset) {
      this.app.forms.reset();
    }
    
    const firstInput = document.querySelector('#logDate, #positionTime');
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Save entry action
   */
  _saveEntry() {
    const form = document.getElementById('logForm');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  }

  /**
   * Cancel edit action
   */
  _cancelEdit() {
    if (this.app.cancelEdit) {
      this.app.cancelEdit();
    }
  }

  /**
   * Duplicate last entry
   */
  _duplicateEntry() {
    if (this.app.dataManager) {
      const logs = this.app.dataManager.getAllLogs();
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        
        if (this.app.forms && this.app.forms.populateForEdit) {
          const duplicateData = { ...lastLog };
          delete duplicateData.id;
          delete duplicateData.entryTimestamp;
          delete duplicateData.lastModified;
          
          const editId = document.getElementById('editId');
          if (editId) editId.value = '';
          
          this.app.forms.populateForEdit(duplicateData);
        }
      }
    }
  }

  /**
   * Refresh data
   */
  _refreshData() {
    if (this.app._refreshUI) {
      this.app._refreshUI();
    }
  }

  /**
   * Toggle theme
   */
  _toggleTheme() {
    if (window.themeManager) {
      window.themeManager.toggleDarkMode();
    }
  }

  /**
   * Open settings
   */
  _openSettings() {
    if (window.settingsManager) {
      window.settingsManager.show();
    }
  }

  // Performance monitor method removed

  /**
   * Toggle fullscreen
   */
  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Could not enter fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Focus form section
   */
  _focusForm() {
    const form = document.getElementById('logForm');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = form.querySelector('input, select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  /**
   * Focus table section
   */
  _focusTable() {
    const table = document.getElementById('logTableContainer');
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Focus map section
   */
  _focusMap() {
    const map = document.getElementById('map');
    if (map) {
      map.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Navigate to next form field
   */
  _nextField() {
    const activeElement = document.activeElement;
    const formElements = Array.from(document.querySelectorAll('input, select, textarea, button'));
    const currentIndex = formElements.indexOf(activeElement);
    
    if (currentIndex !== -1 && currentIndex < formElements.length - 1) {
      formElements[currentIndex + 1].focus();
    }
  }

  /**
   * Navigate to previous form field
   */
  _prevField() {
    const activeElement = document.activeElement;
    const formElements = Array.from(document.querySelectorAll('input, select, textarea, button'));
    const currentIndex = formElements.indexOf(activeElement);
    
    if (currentIndex > 0) {
      formElements[currentIndex - 1].focus();
    }
  }

  /**
   * Quick set current time
   */
  _quickTime() {
    const timeSelect = document.getElementById('positionTime');
    if (timeSelect) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = '00';
      const timeValue = `${hours}:${minutes}`;
      
      const options = Array.from(timeSelect.options);
      const closestOption = options.find(opt => opt.value === timeValue) || 
                           options.find(opt => opt.value.startsWith(hours));
      
      if (closestOption) {
        timeSelect.value = closestOption.value;
        timeSelect.classList.add('user-input');
      }
    }
  }

  /**
   * Quick use last location
   */
  _quickLocation() {
    if (this.app.dataManager) {
      const logs = this.app.dataManager.getAllLogs();
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        
        const latParts = this._parseCoordinateString(lastLog.latitude);
        const lonParts = this._parseCoordinateString(lastLog.longitude);
        
        if (latParts.degrees) {
          const latDeg = document.getElementById('latDegrees');
          const latMin = document.getElementById('latMinutes');
          const latDir = document.getElementById('latDirection');
          
          if (latDeg) { latDeg.value = latParts.degrees; latDeg.classList.add('user-input'); }
          if (latMin) { latMin.value = latParts.minutes; latMin.classList.add('user-input'); }
          if (latDir) { latDir.value = latParts.direction; latDir.classList.add('user-input'); }
        }
        
        if (lonParts.degrees) {
          const lonDeg = document.getElementById('lonDegrees');
          const lonMin = document.getElementById('lonMinutes');
          const lonDir = document.getElementById('lonDirection');
          
          if (lonDeg) { lonDeg.value = lonParts.degrees; lonDeg.classList.add('user-input'); }
          if (lonMin) { lonMin.value = lonParts.minutes; lonMin.classList.add('user-input'); }
          if (lonDir) { lonDir.value = lonParts.direction; lonDir.classList.add('user-input'); }
        }
      }
    }
  }

  /**
   * Quick standard remarks
   */
  _quickRemarks() {
    const remarks = document.getElementById('remarks');
    if (remarks) {
      const standardRemarks = [
        'Routine navigation',
        'Course maintained',
        'Position confirmed',
        'Weather conditions normal',
        'Steady as she goes'
      ];
      
      const randomRemark = standardRemarks[Math.floor(Math.random() * standardRemarks.length)];
      remarks.value = randomRemark;
      remarks.focus();
    }
  }

  /**
   * Parse coordinate string into parts
   */
  _parseCoordinateString(coordString) {
    const match = coordString.match(/(\d+)°(\d+\.?\d*)'([NSEW])/);
    if (!match) return { degrees: '', minutes: '', direction: '' };
    return { degrees: match[1], minutes: match[2], direction: match[3] };
  }

  /**
   * Create help overlay
   */
  _createHelpOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'shortcuts-help-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(5px);
    `;
    
    const groups = this.getShortcutsByGroup();
    const groupOrder = ['Entry', 'Data', 'Map', 'UI', 'Navigation', 'Quick', 'Help'];
    
    overlay.innerHTML = `
      <div style="background: var(--color-surface, white); border-radius: 12px; padding: 30px; max-width: 800px; max-height: 80vh; overflow-y: auto; color: var(--color-text, black);">
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: var(--color-primary, #1a365d);">⌨️ Keyboard Shortcuts</h2>
          <button onclick="window.shortcutsManager.hideHelpOverlay()" 
                  style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-text-secondary, #666);">×</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          ${groupOrder.map(groupName => {
            if (!groups[groupName]) return '';
            return `
              <div style="background: var(--color-background, #f8f9fa); padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: var(--color-primary, #1a365d); font-size: 14px;">${groupName}</h3>
                ${groups[groupName].map(shortcut => `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px;">
                    <span style="color: var(--color-text-secondary, #666);">${shortcut.description}</span>
                    <kbd style="background: var(--color-border, #e2e8f0); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px;">${shortcut.key}</kbd>
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: var(--color-text-secondary, #666); font-size: 12px;">
          Press <kbd style="background: var(--color-border, #e2e8f0); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Esc</kbd> or <kbd style="background: var(--color-border, #e2e8f0); padding: 2px 6px; border-radius: 4px; font-family: monospace;">F1</kbd> to close
        </div>
      </div>
    `;
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideHelpOverlay();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (this.showHelp && (e.key === 'Escape' || e.key === 'F1')) {
        e.preventDefault();
        this.hideHelpOverlay();
      }
    });
    
    document.body.appendChild(overlay);
  }

  /**
   * Add shortcut indicators to UI elements
   */
  _addShortcutIndicators() {
    const indicators = [
      { id: 'submitBtn', shortcut: 'Ctrl+S' },
      { selector: 'button[onclick*="exportToJSON"]', shortcut: 'Ctrl+E' },
      { selector: 'button[onclick*="plotNavigationTrack"]', shortcut: 'Ctrl+M' },
      { selector: 'button[onclick*="clearMap"]', shortcut: 'Ctrl+Shift+M' }
    ];
    
    indicators.forEach(({ id, selector, shortcut }) => {
      const element = id ? document.getElementById(id) : document.querySelector(selector);
      if (element) {
        const originalTitle = element.title || '';
        element.title = originalTitle ? `${originalTitle} (${shortcut})` : `Shortcut: ${shortcut}`;
      }
    });
  }

  /**
   * Format key combination for display
   */
  _formatKeyDisplay(keyCombo) {
    return keyCombo
      .split('+')
      .map(key => {
        const keyMap = {
          ctrl: 'Ctrl',
          shift: 'Shift',
          alt: 'Alt',
          meta: 'Cmd',
          escape: 'Esc',
          ' ': 'Space'
        };
        return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
      })
      .join('+');
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
  module.exports = ShortcutsManager;
} else {
  window.ShortcutsManager = ShortcutsManager;
}