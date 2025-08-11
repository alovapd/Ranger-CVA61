/**
 * Settings Manager
 * Visual settings panel for all user preferences
 * Performance monitoring removed
 */

class SettingsManager {
  constructor(config, app) {
    this.config = config;
    this.app = app;
    this.isOpen = false;
    this.settingsPanel = null;
    
    // Settings categories
    this.categories = {
      appearance: {
        title: '🎨 Appearance',
        icon: '🎨',
        settings: [
          {
            key: 'USER_PREFERENCES.UI.theme',
            label: 'Theme',
            type: 'select',
            options: [
              { value: 'default', label: '🚢 Default Naval' },
              { value: 'dark', label: '🌙 Dark Command' },
              { value: 'nautical', label: '⚓ Nautical Blue' },
              { value: 'submarine', label: '🔋 Submarine Green' },
              { value: 'sunset', label: '🌅 Naval Sunset' }
            ],
            description: 'Choose your preferred color theme'
          },
          {
            key: 'USER_PREFERENCES.UI.compactMode',
            label: 'Compact Mode',
            type: 'checkbox',
            description: 'Reduce spacing for smaller screens'
          },
          {
            key: 'USER_PREFERENCES.UI.showSuccessMessages',
            label: 'Success Messages',
            type: 'checkbox',
            description: 'Show confirmation messages for actions'
          },
          {
            key: 'USER_PREFERENCES.UI.messageDuration',
            label: 'Message Duration',
            type: 'range',
            min: 1000,
            max: 10000,
            step: 500,
            unit: 'ms',
            description: 'How long messages stay visible'
          }
        ]
      },
      
      navigation: {
        title: '🧭 Navigation',
        icon: '🧭',
        settings: [
          {
            key: 'USER_PREFERENCES.MAP.defaultZoom',
            label: 'Default Zoom Level',
            type: 'range',
            min: 1,
            max: 18,
            step: 1,
            description: 'Initial map zoom level'
          },
          {
            key: 'USER_PREFERENCES.MAP.autoPlotNewEntries',
            label: 'Auto-Plot New Entries',
            type: 'checkbox',
            description: 'Automatically show new entries on map'
          },
          {
            key: 'USER_PREFERENCES.MAP.autoZoomToNewEntry',
            label: 'Auto-Zoom to New Entry',
            type: 'checkbox',
            description: 'Zoom to new entries when plotted'
          },
          {
            key: 'USER_PREFERENCES.MAP.showTrackLine',
            label: 'Show Track Lines',
            type: 'checkbox',
            description: 'Connect navigation points with lines'
          },
          {
            key: 'USER_PREFERENCES.MAP.showFixNumbers',
            label: 'Show Plot Numbers',
            type: 'checkbox',
            description: 'Display plot numbers on map markers'
          },
          {
            key: 'USER_PREFERENCES.MAP.measurementUnits',
            label: 'Measurement Units',
            type: 'select',
            options: [
              { value: 'nautical', label: 'Nautical Miles' },
              { value: 'metric', label: 'Kilometers' },
              { value: 'imperial', label: 'Statute Miles' }
            ],
            description: 'Units for distance measurements'
          }
        ]
      },
      
      forms: {
        title: '📝 Forms & Data',
        icon: '📝',
        settings: [
          {
            key: 'USER_PREFERENCES.FORM.defaultTimeIncrement',
            label: 'Default Time Increment',
            type: 'select',
            options: [
              { value: '01:00', label: '1 Hour' },
              { value: '02:00', label: '2 Hours' },
              { value: '04:00', label: '4 Hours' },
              { value: '06:00', label: '6 Hours' },
              { value: '08:00', label: '8 Hours' },
              { value: '12:00', label: '12 Hours' }
            ],
            description: 'Time between navigation entries'
          },
          {
            key: 'USER_PREFERENCES.FORM.autoFillNextTime',
            label: 'Auto-Fill Next Time',
            type: 'checkbox',
            description: 'Automatically suggest next time entry'
          },
          {
            key: 'USER_PREFERENCES.FORM.rememberLastPosition',
            label: 'Remember Last Position',
            type: 'checkbox',
            description: 'Pre-fill with previous coordinates'
          },
          {
            key: 'USER_PREFERENCES.FORM.validateCoordinates',
            label: 'Validate Coordinates',
            type: 'checkbox',
            description: 'Check coordinate format while typing'
          },
          {
            key: 'USER_PREFERENCES.FORM.defaultLatDirection',
            label: 'Default Latitude Direction',
            type: 'select',
            options: [
              { value: 'N', label: 'North (N)' },
              { value: 'S', label: 'South (S)' }
            ],
            description: 'Default direction for latitude'
          },
          {
            key: 'USER_PREFERENCES.FORM.defaultLonDirection',
            label: 'Default Longitude Direction',
            type: 'select',
            options: [
              { value: 'E', label: 'East (E)' },
              { value: 'W', label: 'West (W)' }
            ],
            description: 'Default direction for longitude'
          }
        ]
      },
      
      table: {
        title: '📊 Table Display',
        icon: '📊',
        settings: [
          {
            key: 'USER_PREFERENCES.TABLE.rowsPerPage',
            label: 'Rows Per Page',
            type: 'range',
            min: 10,
            max: 200,
            step: 10,
            description: 'Number of entries to display at once'
          },
          {
            key: 'USER_PREFERENCES.TABLE.sortBy',
            label: 'Default Sort',
            type: 'select',
            options: [
              { value: 'timestamp', label: 'Time Order' },
              { value: 'date', label: 'Date' },
              { value: 'plotNumber', label: 'Plot Number' }
            ],
            description: 'How to sort navigation entries'
          },
          {
            key: 'USER_PREFERENCES.TABLE.sortOrder',
            label: 'Sort Order',
            type: 'select',
            options: [
              { value: 'asc', label: 'Ascending (Oldest First)' },
              { value: 'desc', label: 'Descending (Newest First)' }
            ],
            description: 'Sort direction'
          },
          {
            key: 'USER_PREFERENCES.TABLE.showDistanceToLand',
            label: 'Show Distance to Land',
            type: 'checkbox',
            description: 'Calculate and display distance to nearest coastline'
          },
          {
            key: 'USER_PREFERENCES.TABLE.highlightImportantEntries',
            label: 'Highlight Important Entries',
            type: 'checkbox',
            description: 'Visually distinguish important navigation entries'
          }
        ]
      },
      
      data: {
        title: '💾 Data Management',
        icon: '💾',
        settings: [
          {
            key: 'USER_PREFERENCES.DATA.autoSave',
            label: 'Auto-Save',
            type: 'checkbox',
            description: 'Automatically save changes to browser storage'
          },
          {
            key: 'USER_PREFERENCES.DATA.autoSaveInterval',
            label: 'Auto-Save Interval',
            type: 'range',
            min: 10000,
            max: 300000,
            step: 10000,
            unit: 'ms',
            description: 'How often to auto-save (milliseconds)'
          },
          {
            key: 'USER_PREFERENCES.DATA.backupBeforeImport',
            label: 'Backup Before Import',
            type: 'checkbox',
            description: 'Create backup before importing new data'
          },
          {
            key: 'USER_PREFERENCES.DATA.maxHistoryEntries',
            label: 'Max History Entries',
            type: 'range',
            min: 100,
            max: 5000,
            step: 100,
            description: 'Maximum navigation entries to keep'
          }
        ]
      },
      
      interface: {
        title: '⌨️ Interface',
        icon: '⌨️',
        settings: [
          {
            key: 'USER_PREFERENCES.UI.keyboardShortcuts',
            label: 'Keyboard Shortcuts',
            type: 'checkbox',
            description: 'Enable keyboard shortcuts for quick actions'
          },
          // Performance monitoring setting removed
          {
            key: 'USER_PREFERENCES.UI.animations',
            label: 'Animations',
            type: 'checkbox',
            description: 'Enable smooth transitions and animations'
          },
          {
            key: 'USER_PREFERENCES.UI.tooltips',
            label: 'Show Tooltips',
            type: 'checkbox',
            description: 'Display helpful tooltips on interface elements'
          }
        ]
      }
    };
    
    this.init();
  }

  /**
   * Initialize settings manager
   */
  init() {
    this._createSettingsPanel();
    // REMOVED: this._addSettingsButton(); - No longer adds header button
    console.log('[SettingsManager] Settings system initialized (header button disabled)');
  }

  /**
   * Show settings panel
   */
  show() {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = 'flex';
      this.isOpen = true;
      this._loadCurrentValues();
    }
  }

  /**
   * Hide settings panel
   */
  hide() {
    if (this.settingsPanel) {
      this.settingsPanel.style.display = 'none';
      this.isOpen = false;
    }
  }

  /**
   * Toggle settings panel
   */
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults() {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    // Clear user preferences
    if (this.config && this.config.set) {
      Object.values(this.categories).forEach(category => {
        category.settings.forEach(setting => {
          // Get default value based on type
          let defaultValue;
          switch (setting.type) {
            case 'checkbox':
              defaultValue = true;
              break;
            case 'range':
              defaultValue = setting.min || 0;
              break;
            case 'select':
              defaultValue = setting.options[0].value;
              break;
            default:
              defaultValue = '';
          }
          this.config.set(setting.key, defaultValue);
        });
      });
    }

    this._loadCurrentValues();
    this._showNotification('Settings reset to defaults', 'success');
  }

  /**
   * Export settings
   */
  exportSettings() {
    const settings = {};
    Object.values(this.categories).forEach(category => {
      category.settings.forEach(setting => {
        settings[setting.key] = this._getConfigValue(setting.key);
      });
    });

    const data = {
      version: this._getConfigValue('APP.VERSION', 'v0.4.3'),
      exported: new Date().toISOString(),
      settings: settings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naval-navigation-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this._showNotification('Settings exported successfully', 'success');
  }

  /**
   * Import settings
   */
  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (!data.settings) {
            throw new Error('Invalid settings file format');
          }

          // Apply imported settings
          Object.entries(data.settings).forEach(([key, value]) => {
            if (this.config && this.config.set) {
              this.config.set(key, value);
            }
          });

          this._loadCurrentValues();
          this._showNotification('Settings imported successfully', 'success');
          
        } catch (error) {
          this._showNotification('Failed to import settings: Invalid file format', 'error');
        }
      };
      
      reader.readAsText(file);
    };

    input.click();
  }

  // Private methods

  /**
   * Create settings panel
   */
  _createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel';
    panel.style.cssText = `
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

    panel.innerHTML = `
      <div class="settings-content" style="
        background: var(--color-surface, white);
        border-radius: 12px;
        width: 90%;
        max-width: 900px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        <div class="settings-header" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          background: var(--color-primary, #1a365d);
          color: white;
        ">
          <h2 style="margin: 0; font-size: 1.4em;">⚙️ Navigation System Settings</h2>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button onclick="window.settingsManager.exportSettings()" 
                    style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
                    title="Export Settings">
              📁 Export
            </button>
            <button onclick="window.settingsManager.importSettings()" 
                    style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
                    title="Import Settings">
              📤 Import
            </button>
            <button onclick="window.settingsManager.hide()" 
                    style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px;"
                    title="Close Settings">
              ×
            </button>
          </div>
        </div>
        
        <div class="settings-body" style="
          display: flex;
          flex: 1;
          overflow: hidden;
        ">
          <div class="settings-sidebar" style="
            width: 200px;
            background: var(--color-background, #f8fafc);
            border-right: 1px solid var(--color-border, #e2e8f0);
            overflow-y: auto;
          ">
            ${Object.entries(this.categories).map(([key, category]) => `
              <button class="category-btn" data-category="${key}" style="
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 15px 20px;
                border: none;
                background: transparent;
                color: var(--color-text, black);
                cursor: pointer;
                text-align: left;
                transition: background-color 0.2s ease;
                border-left: 3px solid transparent;
              ">
                <span style="font-size: 16px;">${category.icon}</span>
                <span style="font-size: 13px; font-weight: 500;">${category.title.replace(/🎨 |🧭 |📝 |📊 |💾 |⌨️ /, '')}</span>
              </button>
            `).join('')}
          </div>
          
          <div class="settings-main" style="
            flex: 1;
            overflow-y: auto;
            padding: 25px;
          ">
            <div id="settings-category-content">
              <!-- Category content will be inserted here -->
            </div>
          </div>
        </div>
        
        <div class="settings-footer" style="
          padding: 15px 25px;
          border-top: 1px solid var(--color-border, #e2e8f0);
          background: var(--color-background, #f8fafc);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="font-size: 12px; color: var(--color-text-secondary, #666);">
            Changes are saved automatically
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.settingsManager.resetToDefaults()" 
                    style="background: var(--color-error, #dc2626); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">
              Reset to Defaults
            </button>
            <button onclick="window.settingsManager.hide()" 
                    style="background: var(--color-primary, #1a365d); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this._setupPanelEvents(panel);
    
    document.body.appendChild(panel);
    this.settingsPanel = panel;

    // Show first category by default
    this._showCategory('appearance');
  }

  /**
   * Setup panel event listeners
   */
  _setupPanelEvents(panel) {
    // Category button clicks
    const categoryBtns = panel.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        this._showCategory(category);
        
        // Update active state
        categoryBtns.forEach(b => {
          b.style.background = 'transparent';
          b.style.borderLeftColor = 'transparent';
        });
        btn.style.background = 'var(--color-surface, white)';
        btn.style.borderLeftColor = 'var(--color-primary, #1a365d)';
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });

    // Close on backdrop click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        this.hide();
      }
    });
  }

  /**
   * Show specific category
   */
  _showCategory(categoryKey) {
    const category = this.categories[categoryKey];
    if (!category) return;

    const content = document.getElementById('settings-category-content');
    
    content.innerHTML = `
      <div class="category-header" style="margin-bottom: 25px;">
        <h3 style="margin: 0; color: var(--color-primary, #1a365d); font-size: 1.2em;">
          ${category.title}
        </h3>
      </div>
      
      <div class="settings-grid" style="display: grid; gap: 20px;">
        ${category.settings.map(setting => this._renderSetting(setting)).join('')}
      </div>
    `;

    // Setup setting event listeners
    this._setupSettingEvents(content);
  }

  /**
   * Render individual setting
   */
  _renderSetting(setting) {
    const currentValue = this._getConfigValue(setting.key);
    
    let inputHTML = '';
    
    switch (setting.type) {
      case 'checkbox':
        inputHTML = `
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" ${currentValue ? 'checked' : ''} 
                   data-setting-key="${setting.key}" 
                   style="margin: 0;">
            <span style="font-weight: 500; color: var(--color-text, black);">${setting.label}</span>
          </label>
        `;
        break;
        
      case 'range':
        inputHTML = `
          <div>
            <label style="display: block; font-weight: 500; color: var(--color-text, black); margin-bottom: 8px;">
              ${setting.label}
            </label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" 
                     min="${setting.min}" 
                     max="${setting.max}" 
                     step="${setting.step || 1}"
                     value="${currentValue || setting.min}"
                     data-setting-key="${setting.key}"
                     style="flex: 1;">
              <span class="range-value" style="font-family: monospace; font-size: 12px; min-width: 60px; text-align: right;">
                ${currentValue || setting.min}${setting.unit || ''}
              </span>
            </div>
          </div>
        `;
        break;
        
      case 'select':
        inputHTML = `
          <div>
            <label style="display: block; font-weight: 500; color: var(--color-text, black); margin-bottom: 8px;">
              ${setting.label}
            </label>
            <select data-setting-key="${setting.key}" 
                    style="width: 100%; padding: 8px; border: 1px solid var(--color-border, #ccc); border-radius: 4px; background: var(--color-surface, white); color: var(--color-text, black);">
              ${setting.options.map(option => `
                <option value="${option.value}" ${currentValue === option.value ? 'selected' : ''}>
                  ${option.label}
                </option>
              `).join('')}
            </select>
          </div>
        `;
        break;
        
      default:
        inputHTML = `
          <div>
            <label style="display: block; font-weight: 500; color: var(--color-text, black); margin-bottom: 8px;">
              ${setting.label}
            </label>
            <input type="text" 
                   value="${currentValue || ''}"
                   data-setting-key="${setting.key}"
                   style="width: 100%; padding: 8px; border: 1px solid var(--color-border, #ccc); border-radius: 4px; background: var(--color-surface, white); color: var(--color-text, black);">
          </div>
        `;
    }
    
    return `
      <div class="setting-item" style="
        background: var(--color-surface, white);
        padding: 15px;
        border-radius: 8px;
        border: 1px solid var(--color-border, #e2e8f0);
      ">
        ${inputHTML}
        ${setting.description ? `
          <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--color-text-secondary, #666); line-height: 1.4;">
            ${setting.description}
          </p>
        ` : ''}
      </div>
    `;
  }

  /**
   * Setup setting input event listeners
   */
  _setupSettingEvents(container) {
    const inputs = container.querySelectorAll('[data-setting-key]');
    
    inputs.forEach(input => {
      const settingKey = input.getAttribute('data-setting-key');
      
      const updateSetting = () => {
        let value;
        
        if (input.type === 'checkbox') {
          value = input.checked;
        } else if (input.type === 'range') {
          value = parseInt(input.value);
          // Update range display
          const rangeValue = input.parentElement.querySelector('.range-value');
          if (rangeValue) {
            const unit = rangeValue.textContent.match(/[a-zA-Z%]+$/)?.[0] || '';
            rangeValue.textContent = `${value}${unit}`;
          }
        } else if (input.type === 'number') {
          value = parseInt(input.value);
        } else {
          value = input.value;
        }
        
        // Save setting
        if (this.config && this.config.set) {
          this.config.set(settingKey, value);
        }
        
        // Apply immediate effects for certain settings
        this._applySettingChange(settingKey, value);
      };
      
      // Add appropriate event listener
      if (input.type === 'range') {
        input.addEventListener('input', updateSetting);
      } else {
        input.addEventListener('change', updateSetting);
      }
    });
  }

  /**
   * Apply setting changes immediately (Performance Monitor cases removed)
   */
  _applySettingChange(settingKey, value) {
    switch (settingKey) {
      case 'USER_PREFERENCES.UI.theme':
        if (window.themeManager) {
          window.themeManager.setTheme(value);
        }
        break;
        
      case 'USER_PREFERENCES.UI.keyboardShortcuts':
        if (window.shortcutsManager) {
          window.shortcutsManager.setEnabled(value);
        }
        break;
        
      // Performance monitoring case removed
        
      case 'USER_PREFERENCES.TABLE.sortBy':
      case 'USER_PREFERENCES.TABLE.sortOrder':
        // Refresh table if app is available
        if (this.app && this.app._refreshUI) {
          setTimeout(() => this.app._refreshUI(), 100);
        }
        break;
    }
  }

  /**
   * Load current values into form
   */
  _loadCurrentValues() {
    if (!this.settingsPanel) return;
    
    const inputs = this.settingsPanel.querySelectorAll('[data-setting-key]');
    inputs.forEach(input => {
      const settingKey = input.getAttribute('data-setting-key');
      const currentValue = this._getConfigValue(settingKey);
      
      if (input.type === 'checkbox') {
        input.checked = currentValue;
      } else if (input.type === 'range') {
        input.value = currentValue || input.min;
        const rangeValue = input.parentElement.querySelector('.range-value');
        if (rangeValue) {
          const unit = rangeValue.textContent.match(/[a-zA-Z%]+$/)?.[0] || '';
          rangeValue.textContent = `${input.value}${unit}`;
        }
      } else {
        input.value = currentValue || '';
      }
    });
  }

  /**
   * REMOVED: Add settings button to UI
   * This method is now empty to prevent header button creation
   */
  _addSettingsButton() {
    // DISABLED: No longer automatically adds settings button to header
    console.log('[SettingsManager] Header settings button creation disabled');
  }

  /**
   * Show notification
   */
  _showNotification(message, type = 'info') {
    if (this.app && this.app.alerts) {
      if (type === 'success') {
        this.app.alerts.showSuccess(message);
      } else if (type === 'error') {
        this.app.alerts.showError(message);
      } else {
        this.app.alerts.showInfo(message);
      }
    }
  }

  /**
   * Get configuration value with fallback
   */
  _getConfigValue(path, defaultValue = null) {
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
  module.exports = SettingsManager;
} else {
  window.SettingsManager = SettingsManager;
}