/**
 * Theme Manager - Production Version
 * Professional theme system with dark mode, nautical themes, and smooth transitions
 */

class ThemeManager {
  constructor(config) {
    this.config = config;
    this.currentTheme = this._getConfigValue('USER_PREFERENCES.UI.theme', 'default');
    this.transitionDuration = 300;
    
    this.themes = {
      default: {
        name: 'Default Naval',
        icon: '🚢',
        colors: {
          primary: '#1a365d',
          secondary: '#2c5aa0',
          accent: '#ffd700',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#2d3748',
          textSecondary: '#4a5568',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#dc2626',
          info: '#0ea5e9'
        }
      },
      
      dark: {
        name: 'Dark Command',
        icon: '🌙',
        colors: {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#fbbf24',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          textSecondary: '#cbd5e0',
          border: '#334155',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        }
      },
      
      nautical: {
        name: 'Nautical Blue',
        icon: '⚓',
        colors: {
          primary: '#0369a1',
          secondary: '#0284c7',
          accent: '#f97316',
          background: '#f0f9ff',
          surface: '#e0f2fe',
          text: '#0c4a6e',
          textSecondary: '#075985',
          border: '#bae6fd',
          success: '#059669',
          warning: '#ea580c',
          error: '#dc2626',
          info: '#0891b2'
        }
      },
      
      submarine: {
        name: 'Submarine Green',
        icon: '🔋',
        colors: {
          primary: '#065f46',
          secondary: '#047857',
          accent: '#fbbf24',
          background: '#0f1419',
          surface: '#1f2937',
          text: '#d1fae5',
          textSecondary: '#a7f3d0',
          border: '#374151',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#60a5fa'
        }
      },
      
      sunset: {
        name: 'Naval Sunset',
        icon: '🌅',
        colors: {
          primary: '#c2410c',
          secondary: '#ea580c',
          accent: '#fbbf24',
          background: '#fffbeb',
          surface: '#fef3c7',
          text: '#92400e',
          textSecondary: '#b45309',
          border: '#fed7aa',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
          info: '#0891b2'
        }
      }
    };
    
    this.init();
  }

  /**
   * Initialize theme system
   */
  init() {
    this._createThemeStyles();
    // REMOVED: this._setupThemeToggle(); - No longer adds header button
    this._applyTheme(this.currentTheme);
    this._setupSystemThemeDetection();
  }

  /**
   * Switch to a specific theme
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      return false;
    }

    this.currentTheme = themeName;
    this._applyTheme(themeName);
    this._saveThemePreference(themeName);
    this._notifyThemeChange(themeName);
    
    return true;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      name: this.themes[key].name,
      icon: this.themes[key].icon
    }));
  }

  /**
   * Toggle between light and dark themes
   */
  toggleDarkMode() {
    const isDark = this.currentTheme === 'dark' || this.currentTheme === 'submarine';
    const newTheme = isDark ? 'default' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Create theme control widget
   */
  createThemeControl() {
    const control = document.createElement('div');
    control.id = 'theme-control';
    control.className = 'theme-control';
    
    control.innerHTML = `
      <div class="theme-selector">
        <button class="theme-toggle-btn" title="Switch Theme">
          <span class="theme-icon">${this.themes[this.currentTheme].icon}</span>
          <span class="theme-name">${this.themes[this.currentTheme].name}</span>
        </button>
        <div class="theme-dropdown" style="display: none;">
          ${this.getAvailableThemes().map(theme => `
            <button class="theme-option ${theme.key === this.currentTheme ? 'active' : ''}" 
                    data-theme="${theme.key}">
              <span class="theme-icon">${theme.icon}</span>
              <span class="theme-name">${theme.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this._addThemeControlStyles(control);
    this._setupThemeControlEvents(control);
    
    return control;
  }

  // Private methods

  /**
   * Create CSS custom properties for themes
   */
  _createThemeStyles() {
    const style = document.createElement('style');
    style.id = 'theme-styles';
    
    let css = `
      :root {
        --transition-theme: all ${this.transitionDuration}ms ease;
      }
      
      * {
        transition: background-color ${this.transitionDuration}ms ease, 
                   color ${this.transitionDuration}ms ease,
                   border-color ${this.transitionDuration}ms ease,
                   box-shadow ${this.transitionDuration}ms ease;
      }
      
      .theme-transitioning * {
        transition: none !important;
      }
    `;

    Object.entries(this.themes).forEach(([themeName, theme]) => {
      css += `
        [data-theme="${themeName}"] {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
          --color-background: ${theme.colors.background};
          --color-surface: ${theme.colors.surface};
          --color-text: ${theme.colors.text};
          --color-text-secondary: ${theme.colors.textSecondary};
          --color-border: ${theme.colors.border};
          --color-success: ${theme.colors.success};
          --color-warning: ${theme.colors.warning};
          --color-error: ${theme.colors.error};
          --color-info: ${theme.colors.info};
        }
      `;
    });

    css += `
      body {
        background: var(--color-background) !important;
        color: var(--color-text) !important;
      }
      
      .container {
        background: var(--color-surface) !important;
        border-color: var(--color-border) !important;
      }
      
      .header {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
        border-bottom-color: var(--color-accent) !important;
      }
      
      .panel {
        background: var(--color-surface) !important;
        border-color: var(--color-border) !important;
        color: var(--color-text) !important;
      }
      
      .panel h2 {
        color: var(--color-primary) !important;
        border-bottom-color: var(--color-accent) !important;
      }
      
      .btn-primary {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
        border-color: var(--color-primary) !important;
      }
      
      .btn-secondary {
        background: var(--color-surface) !important;
        color: var(--color-text-secondary) !important;
        border-color: var(--color-border) !important;
      }
      
      .btn-secondary:hover {
        background: var(--color-border) !important;
      }
      
      input, select, textarea {
        background: var(--color-surface) !important;
        color: var(--color-text) !important;
        border-color: var(--color-border) !important;
      }
      
      input:focus, select:focus, textarea:focus {
        border-color: var(--color-primary) !important;
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1) !important;
      }
      
      .log-table {
        background: var(--color-surface) !important;
        color: var(--color-text) !important;
      }
      
      .log-table th {
        background: var(--color-primary) !important;
        border-color: var(--color-secondary) !important;
      }
      
      .log-table td {
        border-color: var(--color-border) !important;
      }
      
      .log-table tbody tr:nth-child(even) {
        background: var(--color-background) !important;
      }
      
      .log-table tbody tr:hover {
        background: rgba(var(--color-primary-rgb), 0.05) !important;
      }
      
      .success-message {
        background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success) 100%) !important;
        border-color: var(--color-success) !important;
      }
      
      .vessel-info {
        background: var(--color-background) !important;
        border-left-color: var(--color-primary) !important;
      }
      
      .app-footer {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
      }
      
      #map {
        background: var(--color-surface) !important;
        border-color: var(--color-border) !important;
      }
      
      .coordinate-inputs {
        background: var(--color-surface) !important;
        border-color: var(--color-border) !important;
      }
      
      .last-entry-display {
        background: var(--color-background) !important;
        border-color: var(--color-border) !important;
        color: var(--color-text) !important;
      }
      
      [data-theme="dark"] .leaflet-control-layers,
      [data-theme="submarine"] .leaflet-control-layers {
        background: var(--color-surface) !important;
        color: var(--color-text) !important;
      }
      
      [data-theme="dark"] .leaflet-control-layers-toggle,
      [data-theme="submarine"] .leaflet-control-layers-toggle {
        background: var(--color-surface) !important;
      }
    `;

    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Apply theme to document
   */
  _applyTheme(themeName) {
    document.body.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', themeName);
    
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, this.transitionDuration);

    document.title = `Naval Navigation Deck Log System - ${this.themes[themeName].name}`;
    
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = this.themes[themeName].colors.primary;
    }
  }

  /**
   * REMOVED: Setup automatic theme toggle button
   * This method is now empty to prevent header button creation
   */
  _setupThemeToggle() {
    // DISABLED: No longer automatically adds theme button to header
    console.log('[ThemeManager] Header theme button creation disabled');
  }

  /**
   * Add styles for theme control
   */
  _addThemeControlStyles(control) {
    const style = document.createElement('style');
    style.textContent = `
      .theme-control {
        position: relative;
        z-index: 1000;
      }
      
      .theme-selector {
        position: relative;
      }
      
      .theme-toggle-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      }
      
      .theme-toggle-btn:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-1px);
      }
      
      .theme-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 5px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        min-width: 160px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        backdrop-filter: blur(10px);
        z-index: 1001;
      }
      
      .theme-option {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 10px 12px;
        border: none;
        background: transparent;
        color: var(--color-text);
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s ease;
      }
      
      .theme-option:hover {
        background: var(--color-background);
      }
      
      .theme-option.active {
        background: var(--color-primary);
        color: white;
      }
      
      .theme-option:first-child {
        border-radius: 8px 8px 0 0;
      }
      
      .theme-option:last-child {
        border-radius: 0 0 8px 8px;
      }
      
      .theme-icon {
        font-size: 14px;
      }
      
      .theme-name {
        font-weight: 500;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Setup theme control events
   */
  _setupThemeControlEvents(control) {
    const toggleBtn = control.querySelector('.theme-toggle-btn');
    const dropdown = control.querySelector('.theme-dropdown');
    const options = control.querySelectorAll('.theme-option');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display !== 'none';
      dropdown.style.display = isVisible ? 'none' : 'block';
    });

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeName = option.getAttribute('data-theme');
        this.setTheme(themeName);
        dropdown.style.display = 'none';
        
        options.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        const themeIcon = toggleBtn.querySelector('.theme-icon');
        const themeName2 = toggleBtn.querySelector('.theme-name');
        themeIcon.textContent = this.themes[themeName].icon;
        themeName2.textContent = this.themes[themeName].name;
      });
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });
  }

  /**
   * Setup system theme detection
   */
  _setupSystemThemeDetection() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        const savedTheme = this._getConfigValue('USER_PREFERENCES.UI.theme', 'auto');
        if (savedTheme === 'auto') {
          this.setTheme(e.matches ? 'dark' : 'default');
        }
      };

      mediaQuery.addListener(handleSystemThemeChange);
      
      if (this._getConfigValue('USER_PREFERENCES.UI.theme', 'auto') === 'auto') {
        handleSystemThemeChange(mediaQuery);
      }
    }
  }

  /**
   * Save theme preference
   */
  _saveThemePreference(themeName) {
    if (this.config && this.config.set) {
      this.config.set('USER_PREFERENCES.UI.theme', themeName);
    }
  }

  /**
   * Notify other components of theme change
   */
  _notifyThemeChange(themeName) {
    const event = new CustomEvent('themeChanged', {
      detail: { 
        theme: themeName, 
        colors: this.themes[themeName].colors 
      }
    });
    document.dispatchEvent(event);

    if (window.performanceMonitor) {
      const dashboard = document.getElementById('performance-dashboard');
      if (dashboard) {
        dashboard.style.background = `rgba(0,0,0,0.9)`;
        dashboard.style.color = 'white';
      }
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
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
} else {
  window.ThemeManager = ThemeManager;
}