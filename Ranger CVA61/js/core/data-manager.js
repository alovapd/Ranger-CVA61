// js/core/data-manager.js - Enhanced with Date Range Support

class DataManager {
    constructor(app) {
        this.app = app;
        this.navigationData = new Map();
        this.nextId = 1;
        this.isInitialized = false;
        
        // Index for fast lookups
        this.dateIndex = new Map();
        this.coordinateIndex = new Map();
        this.importanceIndex = new Set();
    }

    async initialize() {
        try {
            console.log('[DataManager] Initializing...');
            
            // Load existing data from storage
            await this._loadStoredData();
            
            // Build indexes
            this._rebuildIndexes();
            
            this.isInitialized = true;
            console.log(`[DataManager] Initialized with ${this.navigationData.size} navigation entries`);
            
        } catch (error) {
            console.error('[DataManager] Initialization failed:', error);
            throw error;
        }
    }

    async _loadStoredData() {
        try {
            if (this.app.storage) {
                const storedData = await this.app.storage.loadNavigationData();
                if (storedData && Array.isArray(storedData)) {
                    storedData.forEach(entry => {
                        const id = entry.id || this.nextId++;
                        this.navigationData.set(id, { ...entry, id });
                    });
                    
                    // Update next ID to avoid conflicts
                    this.nextId = Math.max(...Array.from(this.navigationData.keys()), 0) + 1;
                }
            }
        } catch (error) {
            console.warn('[DataManager] Could not load stored data:', error);
        }
    }

    _rebuildIndexes() {
        // Clear existing indexes
        this.dateIndex.clear();
        this.coordinateIndex.clear();
        this.importanceIndex.clear();
        
        // Rebuild indexes
        for (const [id, entry] of this.navigationData) {
            this._addToIndexes(id, entry);
        }
        
        console.log(`[DataManager] Rebuilt indexes for ${this.navigationData.size} entries`);
    }

    _addToIndexes(id, entry) {
        // Date index
        const date = this._parseEntryDate(entry);
        if (date) {
            const dateKey = this._getDateKey(date);
            if (!this.dateIndex.has(dateKey)) {
                this.dateIndex.set(dateKey, new Set());
            }
            this.dateIndex.get(dateKey).add(id);
        }
        
        // Coordinate index
        const coords = this._extractCoordinates(entry);
        if (coords.isValid) {
            const coordKey = `${Math.floor(coords.latitude * 10)},${Math.floor(coords.longitude * 10)}`;
            if (!this.coordinateIndex.has(coordKey)) {
                this.coordinateIndex.set(coordKey, new Set());
            }
            this.coordinateIndex.get(coordKey).add(id);
        }
        
        // Importance index
        if (entry.isImportant) {
            this.importanceIndex.add(id);
        }
    }

    _removeFromIndexes(id, entry) {
        // Date index
        const date = this._parseEntryDate(entry);
        if (date) {
            const dateKey = this._getDateKey(date);
            if (this.dateIndex.has(dateKey)) {
                this.dateIndex.get(dateKey).delete(id);
                if (this.dateIndex.get(dateKey).size === 0) {
                    this.dateIndex.delete(dateKey);
                }
            }
        }
        
        // Coordinate index
        const coords = this._extractCoordinates(entry);
        if (coords.isValid) {
            const coordKey = `${Math.floor(coords.latitude * 10)},${Math.floor(coords.longitude * 10)}`;
            if (this.coordinateIndex.has(coordKey)) {
                this.coordinateIndex.get(coordKey).delete(id);
                if (this.coordinateIndex.get(coordKey).size === 0) {
                    this.coordinateIndex.delete(coordKey);
                }
            }
        }
        
        // Importance index
        this.importanceIndex.delete(id);
    }

    _getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    _parseEntryDate(entry) {
        // Try multiple date field possibilities
        const dateFields = ['date', 'Date', 'dateTime', 'timestamp', 'logDate', 'entryDate', 'navigationDate'];
        
        for (const field of dateFields) {
            if (entry[field]) {
                const date = new Date(entry[field]);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }
        
        // Try to construct from separate fields
        if (entry.day && entry.month && entry.year) {
            const date = new Date(entry.year, entry.month - 1, entry.day);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        return null;
    }

    _extractCoordinates(entry) {
        try {
            // Try various coordinate field combinations
            const coordFields = [
                { lat: 'latitude', lng: 'longitude' },
                { lat: 'lat', lng: 'lng' },
                { lat: 'lat', lng: 'lon' },
                { lat: 'Latitude', lng: 'Longitude' },
                { lat: 'LAT', lng: 'LON' }
            ];
            
            for (const fields of coordFields) {
                if (entry[fields.lat] !== undefined && entry[fields.lng] !== undefined) {
                    const lat = parseFloat(entry[fields.lat]);
                    const lng = parseFloat(entry[fields.lng]);
                    
                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        return {
                            latitude: lat,
                            longitude: lng,
                            isValid: true
                        };
                    }
                }
            }
            
            return { isValid: false };
            
        } catch (error) {
            console.error('[DataManager] Error extracting coordinates:', error);
            return { isValid: false };
        }
    }

    // **Enhanced import method with better validation**
    async importNavigationData(data, format = 'json') {
        try {
            if (!Array.isArray(data)) {
                throw new Error('Data must be an array');
            }
            
            let imported = 0;
            let errors = 0;
            const errorDetails = [];
            
            for (let i = 0; i < data.length; i++) {
                try {
                    const entry = this._validateAndNormalizeEntry(data[i], i);
                    if (entry) {
                        this.addNavigationEntry(entry);
                        imported++;
                    }
                } catch (error) {
                    errors++;
                    errorDetails.push(`Row ${i + 1}: ${error.message}`);
                    console.warn(`[DataManager] Import error at row ${i + 1}:`, error);
                }
            }
            
            // Save to storage
            if (this.app.storage) {
                await this.app.storage.saveNavigationData(this.getAllNavigationData());
            }
            
            console.log(`[DataManager] Import complete: ${imported} imported, ${errors} errors`);
            
            return {
                success: true,
                imported,
                errors,
                errorDetails: errorDetails.slice(0, 10) // Limit error details
            };
            
        } catch (error) {
            console.error('[DataManager] Import failed:', error);
            return {
                success: false,
                error: error.message,
                imported: 0,
                errors: data.length
            };
        }
    }

    _validateAndNormalizeEntry(rawEntry, index) {
        if (!rawEntry || typeof rawEntry !== 'object') {
            throw new Error('Entry must be an object');
        }
        
        // Create normalized entry
        const entry = {
            id: rawEntry.id || this.nextId++,
            isImportant: Boolean(rawEntry.isImportant || rawEntry.important),
            remarks: rawEntry.remarks || rawEntry.notes || '',
            ...rawEntry
        };
        
        // Validate coordinates
        const coords = this._extractCoordinates(entry);
        if (!coords.isValid) {
            throw new Error('Invalid or missing coordinates');
        }
        
        // Validate date
        const date = this._parseEntryDate(entry);
        if (!date) {
            // Try to use index as a fallback date (for test data)
            entry.date = new Date(Date.now() + (index * 3600000)); // 1 hour apart
            console.warn(`[DataManager] No valid date found for entry ${index}, using generated date`);
        }
        
        return entry;
    }

    addNavigationEntry(entry) {
        try {
            const id = entry.id || this.nextId++;
            const normalizedEntry = { ...entry, id };
            
            // Add to main storage
            this.navigationData.set(id, normalizedEntry);
            
            // Add to indexes
            this._addToIndexes(id, normalizedEntry);
            
            // Update next ID
            this.nextId = Math.max(this.nextId, id + 1);
            
            console.log(`[DataManager] Added navigation entry: ${id}`);
            return { success: true, id };
            
        } catch (error) {
            console.error('[DataManager] Failed to add entry:', error);
            return { success: false, error: error.message };
        }
    }

    updateNavigationEntry(id, updates) {
        try {
            if (!this.navigationData.has(id)) {
                throw new Error(`Entry ${id} not found`);
            }
            
            const currentEntry = this.navigationData.get(id);
            
            // Remove from indexes
            this._removeFromIndexes(id, currentEntry);
            
            // Update entry
            const updatedEntry = { ...currentEntry, ...updates, id };
            this.navigationData.set(id, updatedEntry);
            
            // Re-add to indexes
            this._addToIndexes(id, updatedEntry);
            
            console.log(`[DataManager] Updated navigation entry: ${id}`);
            return { success: true };
            
        } catch (error) {
            console.error('[DataManager] Failed to update entry:', error);
            return { success: false, error: error.message };
        }
    }

    deleteNavigationEntry(id) {
        try {
            if (!this.navigationData.has(id)) {
                throw new Error(`Entry ${id} not found`);
            }
            
            const entry = this.navigationData.get(id);
            
            // Remove from indexes
            this._removeFromIndexes(id, entry);
            
            // Remove from main storage
            this.navigationData.delete(id);
            
            console.log(`[DataManager] Deleted navigation entry: ${id}`);
            return { success: true };
            
        } catch (error) {
            console.error('[DataManager] Failed to delete entry:', error);
            return { success: false, error: error.message };
        }
    }

    toggleEntryImportance(id) {
        try {
            if (!this.navigationData.has(id)) {
                throw new Error(`Entry ${id} not found`);
            }
            
            const entry = this.navigationData.get(id);
            const wasImportant = entry.isImportant;
            
            // Update importance
            const updates = { isImportant: !wasImportant };
            const result = this.updateNavigationEntry(id, updates);
            
            if (result.success) {
                console.log(`[DataManager] Toggled importance for entry ${id}: ${!wasImportant}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('[DataManager] Failed to toggle importance:', error);
            return { success: false, error: error.message };
        }
    }

    // **Enhanced data retrieval methods with date filtering**
    getAllNavigationData() {
        return Array.from(this.navigationData.values());
    }

    getNavigationEntry(id) {
        return this.navigationData.get(id) || null;
    }

    getNavigationDataByDateRange(startDate, endDate) {
        try {
            const results = [];
            
            // Iterate through date index for efficiency
            for (const [dateKey, entryIds] of this.dateIndex) {
                const date = new Date(dateKey);
                if (date >= startDate && date <= endDate) {
                    for (const id of entryIds) {
                        const entry = this.navigationData.get(id);
                        if (entry) {
                            results.push(entry);
                        }
                    }
                }
            }
            
            // Sort by date
            results.sort((a, b) => {
                const dateA = this._parseEntryDate(a);
                const dateB = this._parseEntryDate(b);
                return dateA && dateB ? dateA.getTime() - dateB.getTime() : 0;
            });
            
            return results;
            
        } catch (error) {
            console.error('[DataManager] Error filtering by date range:', error);
            return [];
        }
    }

    getImportantEntries() {
        const results = [];
        for (const id of this.importanceIndex) {
            const entry = this.navigationData.get(id);
            if (entry) {
                results.push(entry);
            }
        }
        return results;
    }

    // **New method: Get date range of all data**
    getDataDateRange() {
        try {
            const allDates = [];
            
            for (const entry of this.navigationData.values()) {
                const date = this._parseEntryDate(entry);
                if (date) {
                    allDates.push(date);
                }
            }
            
            if (allDates.length === 0) {
                return null;
            }
            
            allDates.sort((a, b) => a.getTime() - b.getTime());
            
            return {
                start: allDates[0],
                end: allDates[allDates.length - 1],
                totalEntries: allDates.length
            };
            
        } catch (error) {
            console.error('[DataManager] Error getting date range:', error);
            return null;
        }
    }

    searchNavigationData(query) {
        try {
            const results = [];
            const searchTerm = query.toLowerCase();
            
            for (const entry of this.navigationData.values()) {
                // Search in remarks, course, speed, etc.
                const searchFields = [
                    entry.remarks || '',
                    entry.course || '',
                    entry.speed || '',
                    entry.weather || '',
                    entry.sea || ''
                ].join(' ').toLowerCase();
                
                if (searchFields.includes(searchTerm)) {
                    results.push(entry);
                }
            }
            
            return results;
            
        } catch (error) {
            console.error('[DataManager] Search failed:', error);
            return [];
        }
    }

    getStatistics() {
        try {
            const total = this.navigationData.size;
            const important = this.importanceIndex.size;
            const dateRange = this.getDataDateRange();
            
            // Calculate coordinate bounds
            const coordinates = [];
            for (const entry of this.navigationData.values()) {
                const coords = this._extractCoordinates(entry);
                if (coords.isValid) {
                    coordinates.push(coords);
                }
            }
            
            let bounds = null;
            if (coordinates.length > 0) {
                bounds = {
                    north: Math.max(...coordinates.map(c => c.latitude)),
                    south: Math.min(...coordinates.map(c => c.latitude)),
                    east: Math.max(...coordinates.map(c => c.longitude)),
                    west: Math.min(...coordinates.map(c => c.longitude))
                };
            }
            
            return {
                totalEntries: total,
                importantEntries: important,
                validCoordinates: coordinates.length,
                dateRange,
                coordinateBounds: bounds,
                memoryUsage: this._estimateMemoryUsage()
            };
            
        } catch (error) {
            console.error('[DataManager] Statistics calculation failed:', error);
            return {
                totalEntries: 0,
                importantEntries: 0,
                validCoordinates: 0,
                dateRange: null,
                coordinateBounds: null,
                memoryUsage: 0
            };
        }
    }

    _estimateMemoryUsage() {
        // Rough estimation of memory usage
        const entrySize = 1000; // Approximate bytes per entry
        return this.navigationData.size * entrySize;
    }

    // Clear all data
    clearAllData() {
        this.navigationData.clear();
        this.dateIndex.clear();
        this.coordinateIndex.clear();
        this.importanceIndex.clear();
        this.nextId = 1;
        
        console.log('[DataManager] All data cleared');
        return { success: true };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}