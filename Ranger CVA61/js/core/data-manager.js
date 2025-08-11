/**
 * Navigation Data Manager - Production Version
 * High-performance data indexing and management for large datasets
 */

class NavigationDataManager {
  constructor(config) {
    this.config = config;
    
    // Primary data storage
    this.navigationLogs = [];
    
    // Performance indexes
    this.logsById = new Map();
    this.logsByDate = new Map();
    this.chronologicalIndex = [];
    this.chronologicalDirty = true;
    
    // Spatial indexing for map performance
    this.spatialGrid = new Map();
    this.gridSize = 0.5;
    this.spatialBounds = { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 };
    
    // Caching with TTL and memory management
    this.cacheConfig = {
      maxSize: 1000,
      ttl: 300000,
      cleanupInterval: 60000
    };
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    
    // Coordinate parsing cache
    this.coordinateCache = new Map();
    this.maxCoordinateCache = 500;
    
    // Performance metrics
    this.metrics = {
      totalLogs: 0,
      indexUpdates: 0,
      cacheHits: 0,
      cacheMisses: 0,
      memoryUsage: 0,
      lastOperationTime: 0
    };
    
    this._startCacheCleanup();
  }

  /**
   * Get all navigation logs
   */
  getAllLogs() {
    return this.navigationLogs;
  }

  /**
   * Add a new navigation log with enhanced indexing
   */
  addNavigationLog(logData) {
    const newLog = {
      id: Date.now(),
      entryTimestamp: Date.now(),
      ...logData
    };

    this.navigationLogs.push(newLog);
    this._updateIndexes(newLog);
    this._invalidateCaches(['chronological', 'dateRange']);
    
    this.metrics.totalLogs++;
    this.metrics.indexUpdates++;
    
    return newLog;
  }

  /**
   * Update existing navigation log
   */
  updateNavigationLog(id, logData) {
    const index = this.navigationLogs.findIndex(log => log.id === parseInt(id));
    if (index === -1) return null;

    const oldLog = this.navigationLogs[index];
    const updatedLog = {
      id: parseInt(id),
      entryTimestamp: oldLog.entryTimestamp || Date.now(),
      lastModified: Date.now(),
      ...logData
    };

    this.navigationLogs[index] = updatedLog;
    
    this._removeFromIndexes(oldLog);
    this._updateIndexes(updatedLog);
    this._invalidateCaches(['chronological', 'dateRange']);
    
    this.metrics.indexUpdates++;
    
    return updatedLog;
  }

  /**
   * Delete navigation log
   */
  deleteNavigationLog(id) {
    const index = this.navigationLogs.findIndex(log => log.id === parseInt(id));
    if (index === -1) return false;

    const logToDelete = this.navigationLogs[index];
    
    this.navigationLogs.splice(index, 1);
    this._removeFromIndexes(logToDelete);
    this._invalidateCaches(['chronological', 'dateRange']);
    
    this.metrics.totalLogs--;
    this.metrics.indexUpdates++;
    
    return true;
  }

  /**
   * Fast lookup by ID using index
   */
  getLogById(id) {
    const log = this.logsById.get(parseInt(id));
    this._updateMetrics(log ? 'hit' : 'miss');
    return log;
  }

  /**
   * Date-based lookup with caching
   */
  getLogsByDate(date) {
    const cacheKey = `date_${date}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    
    const logs = this.logsByDate.get(date) || [];
    this._setCached(cacheKey, logs, 300000);
    
    this._updateMetrics(logs.length > 0 ? 'hit' : 'miss');
    return logs;
  }

  /**
   * Date range queries with intelligent caching
   */
  getLogsByDateRange(startDate, endDate) {
    const cacheKey = `dateRange_${startDate}_${endDate}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const filteredLogs = this.navigationLogs.filter(log => 
      log.logDate >= startDate && log.logDate <= endDate
    );

    this._setCached(cacheKey, filteredLogs, 300000);
    this._updateMetrics('miss');
    
    return filteredLogs;
  }

  /**
   * Chronological sorting with lazy evaluation
   */
  getChronologicalLogs() {
    if (!this.chronologicalDirty && this.chronologicalIndex.length === this.navigationLogs.length) {
      this._updateMetrics('hit');
      return this.chronologicalIndex;
    }

    const cacheKey = 'chronological_all';
    const cached = this._getCached(cacheKey);
    if (cached && !this.chronologicalDirty) return cached;

    const sortedLogs = [...this.navigationLogs].sort((a, b) =>
      new Date(`${a.logDate}T${a.positionTime}`) - new Date(`${b.logDate}T${b.positionTime}`)
    );

    this.chronologicalIndex = sortedLogs;
    this.chronologicalDirty = false;
    this._setCached(cacheKey, sortedLogs, 600000);
    this._updateMetrics('miss');
    
    return sortedLogs;
  }

  /**
   * Spatial queries with optimized grid system
   */
  getLogsInBounds(northEast, southWest) {
    const cacheKey = `bounds_${southWest.lat}_${southWest.lon}_${northEast.lat}_${northEast.lon}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const logsInBounds = [];
    
    const minGridX = Math.floor(southWest.lon / this.gridSize);
    const maxGridX = Math.ceil(northEast.lon / this.gridSize);
    const minGridY = Math.floor(southWest.lat / this.gridSize);
    const maxGridY = Math.ceil(northEast.lat / this.gridSize);

    if (southWest.lat > this.spatialBounds.maxLat || northEast.lat < this.spatialBounds.minLat ||
        southWest.lon > this.spatialBounds.maxLon || northEast.lon < this.spatialBounds.minLon) {
      return [];
    }

    for (let x = minGridX; x <= maxGridX; x++) {
      for (let y = minGridY; y <= maxGridY; y++) {
        const gridKey = `${x},${y}`;
        const cellLogs = this.spatialGrid.get(gridKey);
        
        if (cellLogs) {
          cellLogs.forEach(log => {
            const coords = this._getCachedCoordinates(log);
            if (coords && 
                coords.lat >= southWest.lat && coords.lat <= northEast.lat &&
                coords.lon >= southWest.lon && coords.lon <= northEast.lon) {
              logsInBounds.push(log);
            }
          });
        }
      }
    }

    this._setCached(cacheKey, logsInBounds, 180000);
    return logsInBounds;
  }

  /**
   * Batch operations for importing large datasets
   */
  bulkAddLogs(logs) {
    this.navigationLogs.push(...logs);
    logs.forEach(log => this._updateIndexes(log, true));
    this._invalidateCaches(['chronological', 'dateRange']);
    
    this.metrics.totalLogs += logs.length;
    this.metrics.indexUpdates++;
  }

  /**
   * Replace all data (for imports)
   */
  replaceAllLogs(logs) {
    this.navigationLogs = [...logs];
    this._rebuildAllIndexes();
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheEfficiency: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100,
      indexedEntries: this.logsById.size,
      spatialCells: this.spatialGrid.size,
      memoryUsageEstimate: this._estimateMemoryUsage()
    };
  }

  // Private methods

  /**
   * Update indexes with batching support
   */
  _updateIndexes(log, skipSpatialBounds = false) {
    this.logsById.set(log.id, log);
    
    if (!this.logsByDate.has(log.logDate)) {
      this.logsByDate.set(log.logDate, []);
    }
    this.logsByDate.get(log.logDate).push(log);
    
    const coords = this._getCachedCoordinates(log);
    if (coords) {
      if (!skipSpatialBounds) {
        this._updateSpatialBounds(coords);
      }
      
      const gridX = Math.floor(coords.lon / this.gridSize);
      const gridY = Math.floor(coords.lat / this.gridSize);
      const gridKey = `${gridX},${gridY}`;
      
      if (!this.spatialGrid.has(gridKey)) {
        this.spatialGrid.set(gridKey, []);
      }
      this.spatialGrid.get(gridKey).push(log);
    }
    
    this.chronologicalDirty = true;
  }

  /**
   * Remove from indexes
   */
  _removeFromIndexes(log) {
    this.logsById.delete(log.id);
    
    const dateLogs = this.logsByDate.get(log.logDate);
    if (dateLogs) {
      const index = dateLogs.findIndex(l => l.id === log.id);
      if (index !== -1) {
        dateLogs.splice(index, 1);
        if (dateLogs.length === 0) {
          this.logsByDate.delete(log.logDate);
        }
      }
    }
    
    const coords = this._getCachedCoordinates(log);
    if (coords) {
      const gridX = Math.floor(coords.lon / this.gridSize);
      const gridY = Math.floor(coords.lat / this.gridSize);
      const gridKey = `${gridX},${gridY}`;
      
      const cellLogs = this.spatialGrid.get(gridKey);
      if (cellLogs) {
        const index = cellLogs.findIndex(l => l.id === log.id);
        if (index !== -1) {
          cellLogs.splice(index, 1);
          if (cellLogs.length === 0) {
            this.spatialGrid.delete(gridKey);
          }
        }
      }
    }
    
    this.chronologicalDirty = true;
  }

  /**
   * Update spatial bounds for optimization
   */
  _updateSpatialBounds(coords) {
    if (coords.lat < this.spatialBounds.minLat) this.spatialBounds.minLat = coords.lat;
    if (coords.lat > this.spatialBounds.maxLat) this.spatialBounds.maxLat = coords.lat;
    if (coords.lon < this.spatialBounds.minLon) this.spatialBounds.minLon = coords.lon;
    if (coords.lon > this.spatialBounds.maxLon) this.spatialBounds.maxLon = coords.lon;
  }

  /**
   * Rebuild all indexes from scratch
   */
  _rebuildAllIndexes() {
    this.logsById.clear();
    this.logsByDate.clear();
    this.spatialGrid.clear();
    this.spatialBounds = { minLat: 90, maxLat: -90, minLon: 180, maxLon: -180 };
    this._invalidateCaches();
    
    this.navigationLogs.forEach(log => this._updateIndexes(log));
    
    this.metrics.totalLogs = this.navigationLogs.length;
    this.metrics.indexUpdates++;
  }

  /**
   * Enhanced coordinate caching with LRU eviction
   */
  _getCachedCoordinates(log) {
    const coordKey = `${log.latitude}-${log.longitude}`;
    
    if (!this.coordinateCache.has(coordKey)) {
      if (this.coordinateCache.size >= this.maxCoordinateCache) {
        this._evictOldestCoordinates();
      }
      
      const lat = this._parseCoordinate(log.latitude);
      const lon = this._parseCoordinate(log.longitude);
      
      if (lat !== null && lon !== null) {
        this.coordinateCache.set(coordKey, { lat, lon, lastUsed: Date.now() });
      } else {
        this.coordinateCache.set(coordKey, null);
      }
    } else {
      const cached = this.coordinateCache.get(coordKey);
      if (cached) {
        cached.lastUsed = Date.now();
      }
    }
    
    const result = this.coordinateCache.get(coordKey);
    return result && result.lat !== undefined ? { lat: result.lat, lon: result.lon } : result;
  }

  /**
   * LRU eviction for coordinate cache
   */
  _evictOldestCoordinates() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of this.coordinateCache.entries()) {
      if (value && value.lastUsed < oldestTime) {
        oldestTime = value.lastUsed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.coordinateCache.delete(oldestKey);
    }
  }

  /**
   * Parse coordinate string to decimal
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
   * Enhanced caching with TTL
   */
  _getCached(key) {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp || Date.now() - timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    
    this._updateMetrics('hit');
    return this.cache.get(key);
  }

  /**
   * Set cache with TTL
   */
  _setCached(key, value, ttl = null) {
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this._evictOldestCache();
    }
    
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Evict oldest cache entries
   */
  _evictOldestCache() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }
  }

  /**
   * Invalidate specific cache categories
   */
  _invalidateCaches(categories = ['all']) {
    if (categories.includes('all')) {
      this.cache.clear();
      this.cacheTimestamps.clear();
      return;
    }
    
    categories.forEach(category => {
      for (const key of this.cache.keys()) {
        if (key.startsWith(category)) {
          this.cache.delete(key);
          this.cacheTimestamps.delete(key);
        }
      }
    });
  }

  /**
   * Start cache cleanup interval
   */
  _startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamp] of this.cacheTimestamps.entries()) {
        if (now - timestamp > this.cacheConfig.ttl) {
          this.cache.delete(key);
          this.cacheTimestamps.delete(key);
        }
      }
    }, this.cacheConfig.cleanupInterval);
  }

  /**
   * Update performance metrics
   */
  _updateMetrics(type) {
    if (type === 'hit') {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Estimate memory usage
   */
  _estimateMemoryUsage() {
    const logSize = this.navigationLogs.length * 300;
    const indexSize = this.logsById.size * 50;
    const cacheSize = this.cache.size * 100;
    return Math.round((logSize + indexSize + cacheSize) / 1024);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationDataManager;
} else {
  window.NavigationDataManager = NavigationDataManager;
}