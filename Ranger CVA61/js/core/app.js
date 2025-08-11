// js/core/app.js - GitHub Pages Compatible (No ES6 Modules)

class NavalNavigationApp {
    constructor() {
        this.config = null;
        this.dataManager = null;
        this.storage = null;
        this.settings = null;
        this.alerts = null;
        this.forms = null;
        this.tables = null;
        this.themes = null;
        this.shortcuts = null;
        this.mapping = null;
        
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('[NavalNavigationApp] Starting initialization...');
            
            // Check if all required classes are available
            this._checkDependencies();
            
            // Initialize configuration first
            if (typeof ConfigManager !== 'undefined') {
                this.config = new ConfigManager();
            }
            
            // Initialize core modules
            await this._initializeCoreModules();
            
            // Initialize UI modules
            await this._initializeUIModules();
            
            // Initialize navigation modules
            await this._initializeNavigationModules();
            
            // Setup global event listeners
            this._setupGlobalEventListeners();
            
            // Setup UI event handlers
            this._setupUIEventHandlers();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('[NavalNavigationApp] Initialization complete');
            if (this.alerts) {
                this.alerts.show('⚓ Naval Navigation System Ready', 'success');
            }
            
        } catch (error) {
            console.error('[NavalNavigationApp] Initialization failed:', error);
            this._showError('Failed to initialize application: ' + error.message);
            throw error;
        }
    }

    _checkDependencies() {
        const requiredClasses = [
            'DataManager',
            'DataStorage', 
            'SettingsManager',
            'AlertManager',
            'FormManager',
            'TableManager',
            'ThemeManager',
            'ShortcutManager',
            'NavigationMapping'
        ];

        const missing = requiredClasses.filter(className => typeof window[className] === 'undefined');
        
        if (missing.length > 0) {
            throw new Error(`Missing required modules: ${missing.join(', ')}`);
        }
        
        console.log('[NavalNavigationApp] All dependencies loaded successfully');
    }

    async _initializeCoreModules() {
        try {
            // Data Manager
            if (typeof DataManager !== 'undefined') {
                this.dataManager = new DataManager(this);
                await this.dataManager.initialize();
            }
            
            // Storage Manager
            if (typeof DataStorage !== 'undefined') {
                this.storage = new DataStorage(this);
                await this.storage.initialize();
            }
            
            // Settings Manager
            if (typeof SettingsManager !== 'undefined') {
                this.settings = new SettingsManager(this);
                await this.settings.initialize();
            }
            
            console.log('[NavalNavigationApp] Core modules initialized');
            
        } catch (error) {
            console.error('[NavalNavigationApp] Core module initialization failed:', error);
            throw error;
        }
    }

    async _initializeUIModules() {
        try {
            // Alert Manager
            if (typeof AlertManager !== 'undefined') {
                this.alerts = new AlertManager(this);
                this.alerts.initialize();
            }
            
            // Form Manager
            if (typeof FormManager !== 'undefined') {
                this.forms = new FormManager(this);
                this.forms.initialize();
            }
            
            // Table Manager
            if (typeof TableManager !== 'undefined') {
                this.tables = new TableManager(this);
                this.tables.initialize();
            }
            
            // Theme Manager
            if (typeof ThemeManager !== 'undefined') {
                this.themes = new ThemeManager(this);
                this.themes.initialize();
            }
            
            // Keyboard Shortcuts
            if (typeof ShortcutManager !== 'undefined') {
                this.shortcuts = new ShortcutManager(this);
                this.shortcuts.initialize();
            }
            
            console.log('[NavalNavigationApp] UI modules initialized');
            
        } catch (error) {
            console.error('[NavalNavigationApp] UI module initialization failed:', error);
            throw error;
        }
    }

    async _initializeNavigationModules() {
        try {
            // Navigation Mapping
            if (typeof NavigationMapping !== 'undefined') {
                this.mapping = new NavigationMapping(this);
                this.mapping.initialize();
            }
            
            console.log('[NavalNavigationApp] Navigation modules initialized');
            
        } catch (error) {
            console.error('[NavalNavigationApp] Navigation module initialization failed:', error);
            throw error;
        }
    }

    _setupGlobalEventListeners() {
        // File import events
        document.addEventListener('dataImported', (event) => {
            this._onDataImported(event.detail);
        });
        
        // Application events
        document.addEventListener('settingsChanged', (event) => {
            this._onSettingsChanged(event.detail);
        });
        
        // Navigation events
        document.addEventListener('navigationEntryAdded', (event) => {
            this._onNavigationEntryAdded(event.detail);
        });
    }

    _setupUIEventHandlers() {
        // File input handler
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.importFromFile(file);
                }
            });
        }

        // Import button
        const importBtn = document.getElementById('import-data-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData('json');
            });
        }

        // Add entry button
        const addBtn = document.getElementById('add-entry-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (this.forms) {
                    this.forms.showAddEntryForm();
                }
            });
        }

        // Theme button
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                if (this.themes) {
                    this.themes.showThemeSelector();
                }
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (this.settings) {
                    this.settings.showSettingsPanel();
                }
            });
        }

        // Plot buttons
        const plotTrackBtn = document.getElementById('plot-track-btn');
        if (plotTrackBtn) {
            plotTrackBtn.addEventListener('click', () => {
                if (this.mapping) {
                    this.mapping.plotTrack();
                }
            });
        }

        const plotAllBtn = document.getElementById('plot-all-btn');
        if (plotAllBtn) {
            plotAllBtn.addEventListener('click', () => {
                if (this.mapping) {
                    this.mapping.plotAllData();
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                if (this.tables) {
                    this.tables.filterBySearch(event.target.value);
                }
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('filter-importance');
        if (filterSelect) {
            filterSelect.addEventListener('change', (event) => {
                if (this.tables) {
                    this.tables.filterByImportance(event.target.value);
                }
            });
        }
    }

    // Enhanced data import handling with auto date range update
    async importNavigationData(data, format = 'json') {
        try {
            console.log(`[NavalNavigationApp] Importing ${data.length} navigation entries...`);
            
            // Validate data format
            if (!Array.isArray(data)) {
                throw new Error('Data must be an array of navigation entries');
            }
            
            // Import data through data manager
            const result = await this.dataManager.importNavigationData(data, format);
            
            if (result.success) {
                // Refresh UI
                this._refreshUI();
                
                // Update mapping date range automatically
                if (this.mapping) {
                    this.mapping.onDataImported();
                }
                
                // Show success message
                if (this.alerts) {
                    this.alerts.show(
                        `Successfully imported ${result.imported} navigation entries` + 
                        (result.errors > 0 ? ` (${result.errors} errors)` : ''), 
                        'success'
                    );
                }
                
                // Dispatch event for other modules
                document.dispatchEvent(new CustomEvent('dataImported', {
                    detail: { 
                        data: data,
                        format: format,
                        result: result
                    }
                }));
                
                console.log('[NavalNavigationApp] Data import completed successfully');
                return result;
                
            } else {
                throw new Error(result.error || 'Import failed');
            }
            
        } catch (error) {
            console.error('[NavalNavigationApp] Data import failed:', error);
            if (this.alerts) {
                this.alerts.show(`Import failed: ${error.message}`, 'error');
            }
            throw error;
        }
    }

    // Enhanced file import with better error handling
    async importFromFile(file) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }
            
            console.log(`[NavalNavigationApp] Importing from file: ${file.name}`);
            
            // Show loading message
            if (this.alerts) {
                this.alerts.show('Importing file...', 'info');
            }
            
            // Determine file format
            const format = this._getFileFormat(file.name);
            
            // Read file content
            const content = await this._readFile(file);
            
            // Parse content based on format
            let data;
            switch (format) {
                case 'json':
                    data = JSON.parse(content);
                    break;
                case 'csv':
                    data = await this._parseCSV(content);
                    break;
                default:
                    throw new Error(`Unsupported file format: ${format}`);
            }
            
            // Import the parsed data
            return await this.importNavigationData(data, format);
            
        } catch (error) {
            console.error('[NavalNavigationApp] File import failed:', error);
            if (this.alerts) {
                this.alerts.show(`File import failed: ${error.message}`, 'error');
            }
            throw error;
        } finally {
            // Reset file input
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }

    _getFileFormat(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        switch (extension) {
            case 'json':
                return 'json';
            case 'csv':
                return 'csv';
            default:
                return 'unknown';
        }
    }

    _readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File read error'));
            reader.readAsText(file);
        });
    }

    async _parseCSV(content) {
        // Basic CSV parsing - you might want to enhance this
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1)
            .filter(line => line.trim().length > 0)
            .map(line => {
                const values = line.split(',');
                const entry = {};
                headers.forEach((header, index) => {
                    entry[header] = values[index] ? values[index].trim() : '';
                });
                return entry;
            });
    }

    _onDataImported(detail) {
        console.log('[NavalNavigationApp] Data imported event received:', detail);
        
        // Additional processing after data import
        if (this.settings) {
            this.settings.updateDataStats();
        }
    }

    _onSettingsChanged(detail) {
        console.log('[NavalNavigationApp] Settings changed:', detail);
        this._refreshUI();
    }

    _onNavigationEntryAdded(detail) {
        console.log('[NavalNavigationApp] Navigation entry added:', detail);
        this._refreshUI();
    }

    // Enhanced UI refresh method
    _refreshUI() {
        try {
            // Refresh table
            if (this.tables) {
                this.tables.refresh();
            }
            
            // Update statistics
            if (this.dataManager) {
                this._updateDataStatistics();
            }
            
            // Refresh mapping if track is currently plotted
            if (this.mapping && this.mapping.getCurrentTrack && this.mapping.getCurrentTrack().length > 0) {
                // Re-plot with current date range
                this.mapping.plotTrack();
            }
            
            console.log('[NavalNavigationApp] UI refreshed');
            
        } catch (error) {
            console.error('[NavalNavigationApp] UI refresh failed:', error);
        }
    }

    _updateDataStatistics() {
        try {
            const stats = this.dataManager.getStatistics();
            
            // Update data count display
            const dataCountElement = document.getElementById('data-count');
            if (dataCountElement && stats.totalEntries !== undefined) {
                dataCountElement.textContent = `${stats.totalEntries} entries`;
            }
            
            // Update any other statistics displays
            const statsElements = document.querySelectorAll('[data-stat]');
            statsElements.forEach(element => {
                const statType = element.getAttribute('data-stat');
                if (stats[statType] !== undefined) {
                    element.textContent = stats[statType];
                }
            });
            
        } catch (error) {
            console.error('[NavalNavigationApp] Statistics update failed:', error);
        }
    }

    // Global function for table button interactions
    toggleImportance(id) {
        try {
            console.log(`[NavalNavigationApp] Toggling importance for entry: ${id}`);
            
            if (this.dataManager) {
                const result = this.dataManager.toggleEntryImportance(id);
                if (result.success) {
                    this._refreshUI();
                    console.log(`[NavalNavigationApp] Entry ${id} importance toggled`);
                } else {
                    console.error('[NavalNavigationApp] Failed to toggle importance:', result.error);
                }
            }
            
        } catch (error) {
            console.error('[NavalNavigationApp] Toggle importance failed:', error);
        }
    }

    editEntry(id) {
        try {
            console.log(`[NavalNavigationApp] Editing entry: ${id}`);
            
            if (this.forms) {
                this.forms.editNavigationEntry(id);
            }
            
        } catch (error) {
            console.error('[NavalNavigationApp] Edit entry failed:', error);
        }
    }

    deleteEntry(id) {
        try {
            console.log(`[NavalNavigationApp] Deleting entry: ${id}`);
            
            if (this.dataManager) {
                const result = this.dataManager.deleteNavigationEntry(id);
                if (result.success) {
                    this._refreshUI();
                    if (this.alerts) {
                        this.alerts.show('Navigation entry deleted', 'success');
                    }
                } else {
                    if (this.alerts) {
                        this.alerts.show('Failed to delete entry', 'error');
                    }
                }
            }
            
        } catch (error) {
            console.error('[NavalNavigationApp] Delete entry failed:', error);
        }
    }

    // Force update date range
    updatePlotDateRange() {
        if (this.mapping) {
            this.mapping.updateDateRangeFromData();
        }
    }

    // Public API methods
    getNavigationData() {
        return this.dataManager ? this.dataManager.getAllNavigationData() : [];
    }

    getSettings() {
        return this.settings ? this.settings.getAll() : {};
    }

    exportData(format = 'json') {
        if (this.storage) {
            return this.storage.exportData(format);
        }
        return null;
    }

    _showError(message) {
        if (this.alerts) {
            this.alerts.show(message, 'error');
        } else {
            console.error(message);
            // Try to show in error display if available
            const errorDisplay = document.getElementById('error-display');
            const errorMessage = document.getElementById('error-message');
            if (errorDisplay && errorMessage) {
                errorMessage.textContent = message;
                errorDisplay.style.display = 'flex';
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('app').style.display = 'none';
            } else {
                alert(message);
            }
        }
    }
}

// Global app instance
let app = null;

// Global functions for table interactions (required for HTML onclick handlers)
function toggleImportance(id) {
    if (app) {
        app.toggleImportance(id);
    } else {
        console.error('App not initialized');
    }
}

function editEntry(id) {
    if (app) {
        app.editEntry(id);
    } else {
        console.error('App not initialized');
    }
}

function deleteEntry(id) {
    if (app) {
        app.deleteEntry(id);
    } else {
        console.error('App not initialized');
    }
}

// Initialize app when called (from index.html)
async function initializeNavalApp() {
    try {
        app = new NavalNavigationApp();
        await app.initialize();
        
        // Make app globally accessible for debugging
        window.navalApp = app;
        
        return app;
        
    } catch (error) {
        console.error('Failed to initialize Naval Navigation App:', error);
        throw error;
    }
}

// Auto-initialize if DOM is ready and all scripts are loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all scripts are loaded
    setTimeout(async function() {
        try {
            await initializeNavalApp();
        } catch (error) {
            console.error('Auto-initialization failed:', error);
        }
    }, 100);
});