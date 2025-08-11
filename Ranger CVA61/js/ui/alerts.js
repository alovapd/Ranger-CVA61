/**
 * Alert Manager
 * Handles all user notifications and messages
 */

class AlertManager {
  constructor(config) {
    this.config = config;
    this.container = null;
    this.successContainer = null;
    this.init();
  }

  /**
   * Initialize alert system
   */
  init() {
    this.container = document.getElementById('alert-container');
    this.successContainer = document.getElementById('successMessage');
    
    if (!this.container) {
      this._createAlertContainer();
    }
  }

  /**
   * Show an alert message
   */
  show(message, type = 'info', duration = null) {
    if (!this.container) return;

    // Use success message component for success alerts if available
    if (type === 'success' && this.successContainer && this._shouldShowSuccessMessages()) {
      this._showSuccessMessage(message, duration);
      return;
    }

    // Show regular alert
    this._showAlert(message, type, duration);
  }

  /**
   * Show a success message using the dedicated success component
   */
  showSuccess(message, duration = null) {
    if (this.successContainer && this._shouldShowSuccessMessages()) {
      this._showSuccessMessage(message, duration);
    } else {
      this._showAlert(message, 'success', duration);
    }
  }

  /**
   * Show an error message
   */
  showError(message, duration = null) {
    this._showAlert(message, 'error', duration);
  }

  /**
   * Show a warning message
   */
  showWarning(message, duration = null) {
    this._showAlert(message, 'warning', duration);
  }

  /**
   * Show an info message
   */
  showInfo(message, duration = null) {
    this._showAlert(message, 'info', duration);
  }

  /**
   * Clear all alerts
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    if (this.successContainer) {
      this.successContainer.style.display = 'none';
    }
  }

  // Private methods

  /**
   * Show success message in dedicated component
   */
  _showSuccessMessage(message, duration = null) {
    if (!this.successContainer) return;

    const textElement = this.successContainer.querySelector('.success-text');
    if (textElement) {
      textElement.textContent = message;
    }

    this.successContainer.classList.remove('fade-out');
    this.successContainer.style.display = 'block';

    const showDuration = duration || this._getConfigValue('USER_PREFERENCES.UI.messageDuration', 3000);
    
    setTimeout(() => {
      this.successContainer.classList.add('fade-out');
      setTimeout(() => {
        this.successContainer.style.display = 'none';
        this.successContainer.classList.remove('fade-out');
      }, 600);
    }, showDuration);
  }

  /**
   * Show regular alert message
   */
  _showAlert(message, type, duration = null) {
    const id = `alert-${Date.now()}`;
    const alertDuration = duration || this._getAlertDuration(type);
    const styles = this._getAlertStyles(type);

    const element = document.createElement('div');
    element.id = id;
    element.style.cssText = `
      margin-bottom: 8px;
      padding: 8px 10px;
      border-left: 4px solid ${styles.border};
      background: ${styles.background};
      color: ${styles.color};
      border-radius: 6px;
      font-size: 12px;
      animation: slideIn 0.3s ease-out;
    `;
    element.textContent = message;

    this.container.appendChild(element);

    // Auto-remove after duration
    setTimeout(() => {
      const alertElement = document.getElementById(id);
      if (alertElement) {
        alertElement.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => alertElement.remove(), 300);
      }
    }, alertDuration);
  }

  /**
   * Create alert container if it doesn't exist
   */
  _createAlertContainer() {
    this.container = document.createElement('div');
    this.container.id = 'alert-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  /**
   * Get alert styles based on type
   */
  _getAlertStyles(type) {
    const styles = {
      success: {
        background: '#dcfce7',
        border: '#16a34a',
        color: '#166534'
      },
      error: {
        background: '#fee2e2',
        border: '#ef4444',
        color: '#7f1d1d'
      },
      warning: {
        background: '#fef3c7',
        border: '#f59e0b',
        color: '#92400e'
      },
      info: {
        background: '#e0f2fe',
        border: '#0ea5e9',
        color: '#075985'
      }
    };

    return styles[type] || styles.info;
  }

  /**
   * Get alert duration based on type and config
   */
  _getAlertDuration(type) {
    const durations = {
      success: this._getConfigValue('ALERTS.SUCCESS_DURATION', 3000),
      error: this._getConfigValue('ALERTS.ERROR_DURATION', 5000),
      warning: this._getConfigValue('ALERTS.WARNING_DURATION', 4000),
      info: this._getConfigValue('ALERTS.INFO_DURATION', 3000)
    };

    return durations[type] || durations.info;
  }

  /**
   * Check if success messages should be shown
   */
  _shouldShowSuccessMessages() {
    return this._getConfigValue('USER_PREFERENCES.UI.showSuccessMessages', true);
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
  module.exports = AlertManager;
} else {
  window.AlertManager = AlertManager;
}