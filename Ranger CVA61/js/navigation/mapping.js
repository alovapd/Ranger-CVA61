// js/navigation/mapping.js - Enhanced with Auto Date Range Detection

class NavigationMapping {
    constructor(app) {
        this.app = app;
        this.map = null;
        this.trackLayer = null;
        this.markers = [];
        this.isInitialized = false;
        
        // Track plotting state
        this.currentPlottedTrack = [];
        this.dateRangeInputs = {
            start: null,
            end: null
        };
    }

    initialize() {
        if (this.isInitialized) return;
        
        try {
            // Initialize Leaflet map
            this.map = L.map('map').setView([20.0, -160.0], 4);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            // Initialize track layer
            this.trackLayer = L.layerGroup().addTo(this.map);
            
            // Setup date range inputs
            this._setupDateRangeInputs();
            
            // Setup plot controls
            this._setupPlotControls();
            
            this.isInitialized = true;
            console.log('[NavigationMapping] Initialized successfully');
            
        } catch (error) {
            console.error('[NavigationMapping] Initialization failed:', error);
        }
    }

    _setupDateRangeInputs() {
        // Find or create date range inputs
        this.dateRangeInputs.start = document.getElementById('plot-start-date') || this._createDateInput('plot-start-date', 'Start Date');
        this.dateRangeInputs.end = document.getElementById('plot-end-date') || this._createDateInput('plot-end-date', 'End Date');
        
        // Add event listeners for manual date changes
        this.dateRangeInputs.start.addEventListener('change', () => this._onDateRangeChange());
        this.dateRangeInputs.end.addEventListener('change', () => this._onDateRangeChange());
    }

    _createDateInput(id, placeholder) {
        // Look for existing input first
        let input = document.getElementById(id);
        if (input) return input;
        
        // Create new input if it doesn't exist
        input = document.createElement('input');
        input.type = 'date';
        input.id = id;
        input.placeholder = placeholder;
        input.className = 'form-control date-input';
        
        // Try to add to navigation panel or create container
        const navPanel = document.querySelector('.navigation-panel') || document.querySelector('#navigation-plot');
        if (navPanel) {
            const dateContainer = navPanel.querySelector('.date-range-container') || this._createDateContainer(navPanel);
            dateContainer.appendChild(input);
        }
        
        return input;
    }

    _createDateContainer(parent) {
        const container = document.createElement('div');
        container.className = 'date-range-container';
        container.innerHTML = `
            <h4>📅 Plot Date Range</h4>
            <div class="date-inputs">
                <label for="plot-start-date">From:</label>
                <label for="plot-end-date">To:</label>
            </div>
        `;
        parent.appendChild(container);
        return container.querySelector('.date-inputs');
    }

    _setupPlotControls() {
        // Find or create plot track button
        let plotButton = document.getElementById('plot-track-btn');
        if (!plotButton) {
            plotButton = this._createPlotButton();
        }
        
        plotButton.addEventListener('click', () => this.plotTrack());
        
        // Auto-plot all data button
        let plotAllButton = document.getElementById('plot-all-btn');
        if (!plotAllButton) {
            plotAllButton = this._createPlotAllButton();
        }
        
        plotAllButton.addEventListener('click', () => this.plotAllData());
    }

    _createPlotButton() {
        const button = document.createElement('button');
        button.id = 'plot-track-btn';
        button.className = 'btn btn-primary';
        button.innerHTML = '🗺️ Plot Track';
        
        const container = document.querySelector('.date-range-container') || document.querySelector('.navigation-panel');
        if (container) {
            container.appendChild(button);
        }
        
        return button;
    }

    _createPlotAllButton() {
        const button = document.createElement('button');
        button.id = 'plot-all-btn';
        button.className = 'btn btn-secondary';
        button.innerHTML = '📍 Plot All Data';
        
        const container = document.querySelector('.date-range-container') || document.querySelector('.navigation-panel');
        if (container) {
            container.appendChild(button);
        }
        
        return button;
    }

    // **KEY FIX: Auto-calculate date range from all available data**
    updateDateRangeFromData() {
        const allData = this.app.dataManager.getAllNavigationData();
        
        if (!allData || allData.length === 0) {
            console.log('[NavigationMapping] No data available for date range calculation');
            return;
        }

        try {
            // Extract all dates and find min/max
            const dates = allData
                .map(entry => this._parseEntryDate(entry))
                .filter(date => date && !isNaN(date.getTime()))
                .sort((a, b) => a.getTime() - b.getTime());

            if (dates.length === 0) {
                console.warn('[NavigationMapping] No valid dates found in data');
                return;
            }

            const minDate = dates[0];
            const maxDate = dates[dates.length - 1];

            // Update date inputs with full range
            this._setDateInputValue(this.dateRangeInputs.start, minDate);
            this._setDateInputValue(this.dateRangeInputs.end, maxDate);

            console.log(`[NavigationMapping] Updated date range: ${minDate.toDateString()} to ${maxDate.toDateString()}`);
            
            // Show user feedback
            this.app.alerts?.show('Date range updated to cover all imported data', 'success');
            
        } catch (error) {
            console.error('[NavigationMapping] Error updating date range:', error);
        }
    }

    _parseEntryDate(entry) {
        // Try multiple date field possibilities
        const dateFields = ['date', 'Date', 'dateTime', 'timestamp', 'logDate', 'entryDate'];
        
        for (const field of dateFields) {
            if (entry[field]) {
                const date = new Date(entry[field]);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }
        
        // Try to parse from other common patterns
        if (entry.day && entry.month && entry.year) {
            return new Date(entry.year, entry.month - 1, entry.day);
        }
        
        return null;
    }

    _setDateInputValue(input, date) {
        if (input && date) {
            // Format date as YYYY-MM-DD for HTML date input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            input.value = `${year}-${month}-${day}`;
        }
    }

    _onDateRangeChange() {
        // User manually changed date range - update plot if track is currently shown
        if (this.currentPlottedTrack.length > 0) {
            console.log('[NavigationMapping] Date range changed, re-plotting track');
            this.plotTrack();
        }
    }

    // **Enhanced plotTrack method with date filtering**
    plotTrack() {
        try {
            // Clear existing track
            this.clearTrack();
            
            // Get date range
            const dateRange = this._getDateRange();
            if (!dateRange.isValid) {
                this.app.alerts?.show('Please set valid start and end dates', 'warning');
                return;
            }
            
            // Get filtered data
            const filteredData = this._getFilteredDataByDateRange(dateRange.start, dateRange.end);
            
            if (filteredData.length === 0) {
                this.app.alerts?.show(`No navigation data found between ${dateRange.start.toDateString()} and ${dateRange.end.toDateString()}`, 'info');
                return;
            }
            
            // Plot the filtered track
            this._plotFilteredTrack(filteredData);
            
            // Update tracking
            this.currentPlottedTrack = filteredData;
            
            console.log(`[NavigationMapping] Plotted ${filteredData.length} navigation points`);
            this.app.alerts?.show(`Plotted track with ${filteredData.length} navigation points`, 'success');
            
        } catch (error) {
            console.error('[NavigationMapping] Error plotting track:', error);
            this.app.alerts?.show('Error plotting track. Please check your data.', 'error');
        }
    }

    // **New method: Plot all data without date restrictions**
    plotAllData() {
        try {
            // Clear existing track
            this.clearTrack();
            
            // Get all data
            const allData = this.app.dataManager.getAllNavigationData();
            
            if (!allData || allData.length === 0) {
                this.app.alerts?.show('No navigation data available to plot', 'info');
                return;
            }
            
            // Update date range to cover all data
            this.updateDateRangeFromData();
            
            // Plot all data
            this._plotFilteredTrack(allData);
            
            // Update tracking
            this.currentPlottedTrack = allData;
            
            console.log(`[NavigationMapping] Plotted all data: ${allData.length} navigation points`);
            this.app.alerts?.show(`Plotted complete track with ${allData.length} navigation points`, 'success');
            
        } catch (error) {
            console.error('[NavigationMapping] Error plotting all data:', error);
            this.app.alerts?.show('Error plotting track. Please check your data.', 'error');
        }
    }

    _getDateRange() {
        const startValue = this.dateRangeInputs.start?.value;
        const endValue = this.dateRangeInputs.end?.value;
        
        if (!startValue || !endValue) {
            return { isValid: false };
        }
        
        const startDate = new Date(startValue);
        const endDate = new Date(endValue);
        
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return { isValid: false };
        }
        
        if (startDate > endDate) {
            return { isValid: false };
        }
        
        return {
            isValid: true,
            start: startDate,
            end: endDate
        };
    }

    _getFilteredDataByDateRange(startDate, endDate) {
        const allData = this.app.dataManager.getAllNavigationData();
        
        return allData.filter(entry => {
            const entryDate = this._parseEntryDate(entry);
            return entryDate && entryDate >= startDate && entryDate <= endDate;
        });
    }

    _plotFilteredTrack(data) {
        if (!data || data.length === 0) return;
        
        // Extract coordinates
        const coordinates = data
            .map(entry => this._extractCoordinates(entry))
            .filter(coord => coord && coord.isValid);
        
        if (coordinates.length === 0) {
            this.app.alerts?.show('No valid coordinates found in the selected data', 'warning');
            return;
        }
        
        // Create polyline for track
        const latlngs = coordinates.map(coord => [coord.latitude, coord.longitude]);
        const polyline = L.polyline(latlngs, {
            color: '#1f77b4',
            weight: 3,
            opacity: 0.8
        }).addTo(this.trackLayer);
        
        // Add markers for start and end points
        this._addStartEndMarkers(coordinates);
        
        // Add waypoint markers
        this._addWaypointMarkers(data, coordinates);
        
        // Fit map to track bounds
        if (latlngs.length > 0) {
            this.map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
        }
    }

    _extractCoordinates(entry) {
        try {
            // Try various coordinate field combinations
            const coordFields = [
                { lat: 'latitude', lng: 'longitude' },
                { lat: 'lat', lng: 'lng' },
                { lat: 'lat', lng: 'lon' },
                { lat: 'Latitude', lng: 'Longitude' }
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
            console.error('[NavigationMapping] Error extracting coordinates:', error);
            return { isValid: false };
        }
    }

    _addStartEndMarkers(coordinates) {
        if (coordinates.length === 0) return;
        
        const start = coordinates[0];
        const end = coordinates[coordinates.length - 1];
        
        // Start marker (green)
        const startMarker = L.marker([start.latitude, start.longitude], {
            icon: L.divIcon({
                className: 'start-marker',
                html: '🟢',
                iconSize: [20, 20]
            })
        }).bindPopup('Track Start').addTo(this.trackLayer);
        
        // End marker (red) - only if different from start
        if (coordinates.length > 1) {
            const endMarker = L.marker([end.latitude, end.longitude], {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '🔴',
                    iconSize: [20, 20]
                })
            }).bindPopup('Track End').addTo(this.trackLayer);
        }
    }

    _addWaypointMarkers(data, coordinates) {
        // Add markers for important waypoints
        data.forEach((entry, index) => {
            if (index < coordinates.length && entry.isImportant) {
                const coord = coordinates[index];
                const marker = L.marker([coord.latitude, coord.longitude], {
                    icon: L.divIcon({
                        className: 'important-marker',
                        html: '⭐',
                        iconSize: [16, 16]
                    })
                }).bindPopup(this._createMarkerPopup(entry)).addTo(this.trackLayer);
            }
        });
    }

    _createMarkerPopup(entry) {
        const date = this._parseEntryDate(entry);
        const dateStr = date ? date.toLocaleDateString() : 'Unknown Date';
        
        return `
            <div class="marker-popup">
                <strong>Navigation Entry</strong><br>
                <strong>Date:</strong> ${dateStr}<br>
                <strong>Position:</strong> ${entry.latitude || entry.lat || 'N/A'}, ${entry.longitude || entry.lng || 'N/A'}<br>
                ${entry.course ? `<strong>Course:</strong> ${entry.course}°<br>` : ''}
                ${entry.speed ? `<strong>Speed:</strong> ${entry.speed} knots<br>` : ''}
                ${entry.remarks ? `<strong>Remarks:</strong> ${entry.remarks}` : ''}
            </div>
        `;
    }

    clearTrack() {
        if (this.trackLayer) {
            this.trackLayer.clearLayers();
        }
        this.currentPlottedTrack = [];
        console.log('[NavigationMapping] Track cleared');
    }

    // **Method to be called after data import**
    onDataImported() {
        console.log('[NavigationMapping] Data imported, updating date range');
        this.updateDateRangeFromData();
    }

    // Public methods for external access
    getCurrentTrack() {
        return this.currentPlottedTrack;
    }

    getDateRange() {
        return this._getDateRange();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationMapping;
}