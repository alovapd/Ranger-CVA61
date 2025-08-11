/**
 * Table Manager Module
 * High-performance virtual scrolling table for large datasets
 * Handles rendering and updating of navigation log tables efficiently
 */

class TableManager {
  constructor(config, alerts) {
    this.config = config;
    this.alerts = alerts;
    this.container = null;
    
    // Virtual scrolling configuration
    this.rowHeight = 45; // Height of each table row in pixels
    this.visibleRows = 15; // Number of rows visible at once
    this.bufferRows = 5; // Extra rows to render above/below for smooth scrolling
    this.scrollTop = 0;
    this.isVirtualScrolling = true; // Can be disabled for small datasets
    
    // Data management
    this.sortedLogs = [];
    this.filteredLogs = [];
    this.renderCache = new Map();
    
    // Performance tracking
    this.renderTime = 0;
    this.lastRenderCount = 0;
  }

  /**
   * Initialize table manager
   */
  init() {
    this.container = document.getElementById('logTableContainer');
    if (!this.container) {
      console.warn('Table container not found');
      return;
    }
    
    // Setup virtual scrolling container
    this._setupVirtualScrolling();
  }

  /**
   * Update table with navigation logs using virtual scrolling
   */
  update(navigationLogs) {
    const startTime = Date.now();
    
    if (!this.container) return;

    // CLEAR CACHE on every update to ensure fresh rendering
    this.renderCache.clear();

    if (navigationLogs.length === 0) {
      this._renderEmptyState();
      return;
    }

    // Sort and filter data
    this.sortedLogs = this._sortLogs(navigationLogs);
    this.filteredLogs = this.sortedLogs; // Can add filtering here later
    
    // Decide whether to use virtual scrolling
    this.isVirtualScrolling = this.filteredLogs.length > 50;
    
    if (this.isVirtualScrolling) {
      this._renderVirtualTable();
    } else {
      this._renderStandardTable();
    }
    
    this.renderTime = Date.now() - startTime;
    this.lastRenderCount = this.filteredLogs.length;
    
    // Log performance for large datasets
    if (this.filteredLogs.length > 100) {
      console.log(`[TableManager] Rendered ${this.filteredLogs.length} rows in ${this.renderTime}ms (Virtual: ${this.isVirtualScrolling})`);
    }
  }

  /**
   * Get color for date (used by other modules)
   */
  getColorForDate(logDate, navigationLogs) {
    const allDates = [...new Set(navigationLogs.map(log => log.logDate))].sort();
    const dateIndex = allDates.indexOf(logDate);
    const colors = [
      '#1a365d', '#dc2626', '#059669', '#7c3aed', '#ea580c', 
      '#0891b2', '#10b981', '#8b5cf6', '#ef4444', '#0ea5e9'
    ];
    return colors[dateIndex % colors.length];
  }

  /**
   * Scroll to specific entry (for highlighting)
   */
  scrollToEntry(entryId) {
    const index = this.filteredLogs.findIndex(log => log.id === entryId);
    if (index === -1) return;
    
    if (this.isVirtualScrolling) {
      const targetScrollTop = index * this.rowHeight;
      const scrollContainer = this.container.querySelector('.virtual-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = targetScrollTop;
        this._handleScroll({ target: scrollContainer });
      }
    }
  }

  // Private methods

  /**
   * Setup virtual scrolling container
   */
  _setupVirtualScrolling() {
    // Add CSS for virtual scrolling if not present
    if (!document.getElementById('virtual-table-styles')) {
      const style = document.createElement('style');
      style.id = 'virtual-table-styles';
      style.textContent = `
        .virtual-scroll-container {
          height: 400px;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          position: relative;
        }
        
        .virtual-table-content {
          position: relative;
        }
        
        .virtual-row {
          position: absolute;
          left: 0;
          right: 0;
          height: ${this.rowHeight}px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          background: white;
        }
        
        .virtual-row:nth-child(even) {
          background: #f8fafc;
        }
        
        .virtual-row.important-row {
          background: rgba(254, 226, 226, 0.6) !important;
          border-left: none !important;
        }
        
        .virtual-cell {
          padding: 8px;
          font-size: 11px;
          font-family: 'Courier New', monospace;
          text-align: center;
          border-right: 1px solid #cbd5e0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .virtual-cell:last-child {
          border-right: none;
        }
        
        /* Column widths */
        .col-plot { width: 60px; }
        .col-date { width: 100px; }
        .col-time { width: 80px; }
        .col-lat { width: 120px; }
        .col-lon { width: 120px; }
        .col-dist { width: 90px; }
        .col-land { width: 100px; }
        .col-remarks { flex: 1; text-align: left; }
        .col-actions { width: 200px; }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Render virtual scrolling table for large datasets
   */
  _renderVirtualTable() {
    const vesselName = this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER');
    const vesselType = this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61');
    
    const totalHeight = this.filteredLogs.length * this.rowHeight;
    
    this.container.innerHTML = `
      <div class="vessel-header">${vesselName} (${vesselType}) - NAVIGATION LOG ENTRIES (${this.filteredLogs.length} entries)</div>
      
      <div class="virtual-scroll-container">
        <div class="virtual-table-content" style="height: ${totalHeight}px;">
          <div class="table-header" style="position: sticky; top: 0; z-index: 10; background: white; border-bottom: 2px solid #1a365d;">
            <div class="virtual-row" style="position: static; background: #1a365d; color: white; font-weight: bold;">
              <div class="virtual-cell col-plot">PLOT #</div>
              <div class="virtual-cell col-date">DATE</div>
              <div class="virtual-cell col-time">TIME</div>
              <div class="virtual-cell col-lat">LATITUDE</div>
              <div class="virtual-cell col-lon">LONGITUDE</div>
              <div class="virtual-cell col-dist">DIST TO LAND (NM)</div>
              <div class="virtual-cell col-land">NEAREST LAND</div>
              <div class="virtual-cell col-remarks">REMARKS</div>
              <div class="virtual-cell col-actions">ACTIONS</div>
            </div>
          </div>
          <div class="virtual-rows-container"></div>
        </div>
      </div>
      
      <div style="margin-top: 10px; font-size: 12px; color: #6b7280; text-align: center;">
        Virtual scrolling active for ${this.filteredLogs.length} entries • Rendering time: ${this.renderTime}ms
      </div>
    `;
    
    // Setup scroll handler
    const scrollContainer = this.container.querySelector('.virtual-scroll-container');
    scrollContainer.addEventListener('scroll', (e) => this._handleScroll(e));
    
    // Initial render
    this._renderVisibleRows();
  }

  /**
   * Handle scroll events for virtual scrolling
   */
  _handleScroll(event) {
    this.scrollTop = event.target.scrollTop;
    this._renderVisibleRows();
  }

  /**
   * Render only visible rows for performance
   */
  _renderVisibleRows() {
    const containerHeight = 400; // Height of scroll container
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - this.bufferRows);
    const endIndex = Math.min(
      this.filteredLogs.length,
      Math.ceil((this.scrollTop + containerHeight) / this.rowHeight) + this.bufferRows
    );
    
    const rowsContainer = this.container.querySelector('.virtual-rows-container');
    if (!rowsContainer) return;
    
    // Clear existing rows
    rowsContainer.innerHTML = '';
    
    // Render visible rows
    for (let i = startIndex; i < endIndex; i++) {
      const log = this.filteredLogs[i];
      const rowElement = this._createVirtualRow(log, i + 1, i);
      rowsContainer.appendChild(rowElement);
    }
  }

  /**
   * Create a virtual row element - FIXED VERSION with no caching
   */
  _createVirtualRow(log, plotNumber, index) {
    // NO CACHING - always create fresh rows to ensure state updates
    const row = document.createElement('div');
    row.className = `virtual-row ${log.isImportant ? 'important-row' : ''}`;
    row.style.top = `${(index * this.rowHeight) + 45}px`; // +45 for header
    
    const formattedDate = new Date(log.logDate + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const plotColor = this.getColorForDate(log.logDate, this.sortedLogs);
    const { distanceDisplay, nearestLandDisplay, distanceTitle } = this._calculateDistanceInfo(log);
    
    // PROPER button state based on current importance
    const importantIcon = log.isImportant ? '⭐' : '☆';
    const importantTitle = log.isImportant ? 'Click to remove importance' : 'Click to mark as important';
    const importantBtnClass = log.isImportant ? 'importance-btn active' : 'importance-btn';
    
    const urlButton = log.associatedUrl
      ? `<button class="btn btn-secondary btn-small url-btn" onclick="window.open('${log.associatedUrl}','_blank')" title="Open associated URL">🔗</button>`
      : '';
    
    row.innerHTML = `
      <div class="virtual-cell col-plot plot-number">${plotNumber}</div>
      <div class="virtual-cell col-date date-entry">${formattedDate}</div>
      <div class="virtual-cell col-time time-entry">${log.positionTime}</div>
      <div class="virtual-cell col-lat coordinate-entry">${log.latitude}</div>
      <div class="virtual-cell col-lon coordinate-entry">${log.longitude}</div>
      <div class="virtual-cell col-dist distance-entry" title="${distanceTitle}">${distanceDisplay}</div>
      <div class="virtual-cell col-land nearest-land-entry" title="${distanceTitle}">${nearestLandDisplay}</div>
      <div class="virtual-cell col-remarks">${log.remarks || ''}</div>
      <div class="virtual-cell col-actions">
        <div style="display: flex; align-items: center; gap: 3px; justify-content: center;">
          <div class="plot-color-indicator" style="background-color:${plotColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px #cbd5e0;" title="Map plot color"></div>
          ${urlButton}
          <button class="btn ${importantBtnClass}" onclick="toggleImportance(${log.id})" title="${importantTitle}">${importantIcon}</button>
          <button class="btn btn-secondary btn-small" onclick="editNavigationLog(${log.id})">✏️</button>
          <button class="btn btn-danger btn-small" onclick="deleteNavigationLog(${log.id})">🗑️</button>
        </div>
      </div>
    `;
    
    return row;
  }

  /**
   * Render standard table for small datasets
   */
  _renderStandardTable() {
    const vesselName = this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER');
    const vesselType = this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61');

    let html = `
      <div class="vessel-header">${vesselName} (${vesselType}) - NAVIGATION LOG ENTRIES (${this.filteredLogs.length} entries)</div>
      <table class="log-table">
        <thead>
          <tr>
            <th>PLOT<br>#</th>
            <th>DATE</th>
            <th>TIME</th>
            <th>LATITUDE</th>
            <th>LONGITUDE</th>
            <th>DIST TO<br>LAND (NM)</th>
            <th>NEAREST<br>LAND</th>
            <th>REMARKS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.filteredLogs.forEach((log, index) => {
      html += this._renderTableRow(log, index + 1, this.sortedLogs);
    });

    html += `</tbody></table>`;
    
    if (this.filteredLogs.length > 25) {
      html += `<div style="margin-top: 10px; font-size: 12px; color: #6b7280; text-align: center;">
        Standard table view • ${this.filteredLogs.length} entries • Rendering time: ${this.renderTime}ms
      </div>`;
    }
    
    this.container.innerHTML = html;
  }

  /**
   * Sort navigation logs
   */
  _sortLogs(navigationLogs) {
    const sortBy = this._getConfigValue('USER_PREFERENCES.TABLE.sortBy', 'timestamp');
    const sortOrder = this._getConfigValue('USER_PREFERENCES.TABLE.sortOrder', 'asc');

    let sorted;
    switch (sortBy) {
      case 'date':
        sorted = [...navigationLogs].sort((a, b) => {
          const dateA = new Date(a.logDate);
          const dateB = new Date(b.logDate);
          return dateA - dateB;
        });
        break;
      case 'plotNumber':
        sorted = [...navigationLogs].sort((a, b) => a.id - b.id);
        break;
      default: // timestamp
        sorted = [...navigationLogs].sort((a, b) =>
          new Date(`${a.logDate}T${a.positionTime}`) - new Date(`${b.logDate}T${b.positionTime}`)
        );
    }

    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  }

  /**
   * Render empty state
   */
  _renderEmptyState() {
    const vesselName = this._getConfigValue('APP.VESSEL_NAME', 'USS RANGER');
    const vesselType = this._getConfigValue('APP.VESSEL_TYPE', 'CVA-61');

    this.container.innerHTML = `
      <div class="vessel-header">${vesselName} (${vesselType}) - NAVIGATION LOG ENTRIES</div>
      <div style="padding:20px; text-align:center; color:#4a5568; font-style:italic;">
        No navigation entries yet. Add your first entry using the form above.
      </div>
    `;
  }

  /**
   * Render a single table row (for standard table) - FIXED VERSION
   */
  _renderTableRow(log, plotNumber, allLogs) {
    const formattedDate = new Date(log.logDate + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // PROPERLY handle important row class and button state
    const rowClass = log.isImportant ? 'important-row' : '';
    const importantIcon = log.isImportant ? '⭐' : '☆';
    const importantTitle = log.isImportant ? 'Click to remove importance' : 'Click to mark as important';
    const importantBtnClass = log.isImportant ? 'importance-btn active' : 'importance-btn';
    
    const plotColor = this.getColorForDate(log.logDate, allLogs);

    // Calculate distance to land
    const { distanceDisplay, nearestLandDisplay, distanceTitle } = this._calculateDistanceInfo(log);

    // URL button
    const urlButton = log.associatedUrl
      ? `<button class="btn btn-secondary btn-small url-btn" onclick="window.open('${log.associatedUrl}','_blank')" title="Open associated URL: ${log.associatedUrl}">🔗</button>`
      : '';

    return `
      <tr class="${rowClass}">
        <td class="position-entry plot-number">${plotNumber}</td>
        <td class="position-entry date-entry">${formattedDate}</td>
        <td class="position-entry time-entry">${log.positionTime}</td>
        <td class="position-entry coordinate-entry">${log.latitude}</td>
        <td class="position-entry coordinate-entry">${log.longitude}</td>
        <td class="position-entry distance-entry" title="${distanceTitle}">${distanceDisplay}</td>
        <td class="position-entry nearest-land-entry" title="${distanceTitle}">${nearestLandDisplay}</td>
        <td class="position-entry">${log.remarks || ''}</td>
        <td class="position-entry action-buttons">
          <div class="plot-color-indicator" style="background-color:${plotColor};" title="Map plot color for ${formattedDate}"></div>
          ${urlButton}
          <button class="btn ${importantBtnClass}" onclick="toggleImportance(${log.id})" title="${importantTitle}">${importantIcon}</button>
          <button class="btn btn-secondary btn-small" onclick="editNavigationLog(${log.id})">✏️</button>
          <button class="btn btn-danger btn-small" onclick="deleteNavigationLog(${log.id})">🗑️</button>
        </td>
      </tr>
    `;
  }

  /**
   * Calculate distance information for a log entry
   */
  _calculateDistanceInfo(log) {
    let distanceDisplay = 'N/A';
    let nearestLandDisplay = 'Unknown';
    let distanceTitle = 'Distance calculation unavailable';

    if (this._getConfigValue('USER_PREFERENCES.TABLE.showDistanceToLand', true)) {
      const latDec = this._parseCoordinate(log.latitude);
      const lonDec = this._parseCoordinate(log.longitude);

      if (latDec !== null && lonDec !== null && window.calculateDistanceToLand) {
        try {
          const landData = window.calculateDistanceToLand(latDec, lonDec);
          distanceDisplay = landData.displayText;
          nearestLandDisplay = landData.nearestLand;
          distanceTitle = `Distance to ${landData.nearestLand}`;
        } catch (error) {
          // Keep default values if calculation fails
        }
      }
    }

    return { distanceDisplay, nearestLandDisplay, distanceTitle };
  }

  /**
   * Parse coordinate string to decimal degrees
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
  module.exports = TableManager;
} else {
  window.TableManager = TableManager;
}