/**
 * Naval Navigation Deck Log System - Main Entry Point
 * Fixed to include all global functions
 */

let app = null;

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    app = new NavalNavigationApp();
    await app.init();
    
    window.app = app;
    setupGlobalFunctions();
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    showCriticalError(error.message);
  }
});

/**
 * Setup global functions for HTML onclick handlers
 */
function setupGlobalFunctions() {
  // Navigation log management
  window.editNavigationLog = (id) => app.editNavigationLog(id);
  window.deleteNavigationLog = (id) => app.deleteNavigationLog(id);
  window.toggleImportance = (id) => app.toggleImportance(id); // <- This was likely missing!
  window.cancelEdit = () => app.cancelEdit();
  
  // Data export/import
  window.exportToJSON = () => app.exportToJSON();
  window.importFromJSON = () => app.importFromJSON();
  window.exportToCSV = () => app.exportToCSV();
  
  // KML Export for Google Earth
  window.exportToKML = () => {
    try {
      const navigationLogs = app.dataManager.getAllLogs();
      
      if (navigationLogs.length === 0) {
        app.alerts.showWarning('No navigation data to export. Add some entries first.');
        return;
      }
      
      app.storage.exportKML(navigationLogs);
      
      const count = navigationLogs.length;
      const message = `${count} ${count === 1 ? 'entry' : 'entries'} exported to KML for Google Earth`;
      app.alerts.showSuccess(message);
      
    } catch (error) {
      app.alerts.showError('KML export failed: ' + error.message);
    }
  };
  
  // Map functions
  window.plotNavigationTrack = () => app.plotNavigationTrack();
  window.clearMap = () => app.clearMap();
  window.findPlotOnMap = () => app.findPlotOnMap();
  
  // Distance measurement functions
  if (app.mapping) {
    window.toggleDistanceMeasurement = () => app.mapping.toggleDistanceMeasurement();
    window.clearAllMeasurements = () => app.mapping.clearAllMeasurements();
  }

  console.log('Global functions setup complete - including toggleImportance');
}

/**
 * Display critical error to user
 */
function showCriticalError(message) {
  const errorElement = document.createElement('div');
  errorElement.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: #fee2e2; color: #7f1d1d; border: 1px solid #ef4444;
    padding: 15px 20px; border-radius: 8px; z-index: 10000;
    font-family: system-ui, sans-serif; font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  errorElement.innerHTML = `
    <strong>⚠️ System Error</strong><br>
    Failed to initialize navigation system. Please refresh the page.<br>
    <small style="opacity: 0.8;">Error: ${message}</small>
  `;
  
  document.body.appendChild(errorElement);
  setTimeout(() => errorElement.remove(), 10000);
}

/**
 * Handle unsaved changes warning
 */
window.addEventListener('beforeunload', function(e) {
  if (app && app.config && app.config.get && app.config.get('STATE.unsavedChanges')) {
    e.preventDefault();
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    return e.returnValue;
  }
});

/**
 * Global error handling
 */
window.addEventListener('error', function(e) {
  if (app && app.alerts) {
    app.alerts.showError('An unexpected error occurred. Please refresh if problems persist.');
  }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(e) {
  if (app && app.alerts) {
    app.alerts.showError('A system error occurred. Please try again.');
  }
  e.preventDefault();
});