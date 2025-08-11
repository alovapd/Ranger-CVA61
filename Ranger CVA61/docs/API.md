# Naval Navigation Deck Log System - API Documentation

Internal API documentation for the USS Ranger CVA-61 Navigation Log System modular architecture.

## 🏗️ Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
Core Layer:
├── NavalNavigationApp (main controller)
├── ConfigManager (configuration and state)
└── DataStorage (persistence layer)

Navigation Layer:
├── NavigationMapping (map functionality)
├── CoordinateUtils (coordinate operations)
└── DistanceCalculator (distance calculations)

UI Layer:
├── FormManager (form handling)
├── TableManager (table rendering)
└── AlertManager (user notifications)
```

## 📚 Core API Reference

### NavalNavigationApp

Main application controller that coordinates all modules.

#### Constructor
```javascript
const app = new NavalNavigationApp();
await app.init();
```

#### Methods

##### `addNavigationLog(data)`
Add a new navigation log entry.
```javascript
app.addNavigationLog({
  logDate: '2024-01-01',
  positionTime: '12:00',
  latitude: "20°56.1'N",
  longitude: "158°03.0'W",
  remarks: 'Navigation entry'
});
```

##### `updateNavigationLog(id, data)`
Update an existing navigation log entry.
```javascript
app.updateNavigationLog(123, {
  remarks: 'Updated remarks'
});
```

##### `deleteNavigationLog(id)`
Delete a navigation log entry.
```javascript
app.deleteNavigationLog(123);
```

##### `editNavigationLog(id)`
Start editing a navigation log entry.
```javascript
app.editNavigationLog(123);
```

##### `plotNavigationTrack()`
Plot navigation track on map.
```javascript
app.plotNavigationTrack();
```

##### `exportToJSON()` / `exportToCSV()`
Export navigation data.
```javascript
app.exportToJSON();
app.exportToCSV();
```

### ConfigManager

Manages application configuration and user preferences.

#### Constructor
```javascript
const config = new ConfigManager();
```

#### Methods

##### `get(path)`
Get configuration value using dot notation.
```javascript
const zoom = config.get('USER_PREFERENCES.MAP.defaultZoom');
const vesselName = config.get('APP.VESSEL_NAME');
```

##### `set(path, value)`
Set configuration value using dot notation.
```javascript
config.set('USER_PREFERENCES.MAP.defaultZoom', 8);
config.set('USER_PREFERENCES.UI.theme', 'dark');
```

##### `updateLastEntry(entryId, action)`
Track last user action for smart UI updates.
```javascript
config.updateLastEntry(123, 'add');
config.updateLastEntry(456, 'update');
```

##### `getLastEntryId()`
Get ID of most recently added/updated entry.
```javascript
const lastId = config.getLastEntryId();
```

##### `validateCoordinate(degrees, minutes, direction, isLatitude)`
Validate coordinate components.
```javascript
const result = config.validateCoordinate('20', '56.1', 'N', true);
// Returns: {valid: true} or {valid: false, error: 'message'}
```

### DataStorage

Handles all data persistence operations.

#### Constructor
```javascript
const storage = new DataStorage(config);
```

#### Methods

##### `save(navigationLogs)`
Save navigation logs to localStorage.
```javascript
storage.save(navigationLogs);
```

##### `load()`
Load navigation logs from localStorage.
```javascript
const logs = await storage.load();
```

##### `exportJSON(navigationLogs)`
Export navigation logs to JSON file.
```javascript
storage.exportJSON(navigationLogs);
```

##### `exportCSV(navigationLogs)`
Export navigation logs to CSV file.
```javascript
storage.exportCSV(navigationLogs);
```

##### `importFromJSON(callback)`
Import navigation logs from JSON file.
```javascript
storage.importFromJSON((importedLogs, isReplace) => {
  // Handle imported data
});
```

## 🧭 Navigation API Reference

### NavigationMapping

Manages all map-related functionality.

#### Constructor
```javascript
const mapping = new NavigationMapping(config, alerts);
mapping.init();
```

#### Methods

##### `plotTrack(navigationLogs, options)`
Plot navigation track on map.
```javascript
mapping.plotTrack(navigationLogs, {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  showLine: true,
  showNumbers: true
});
```

##### `clearMap()`
Clear all markers and lines from map.
```javascript
mapping.clearMap();
```

##### `findAndHighlightPlot(plotNumber)`
Find and highlight specific plot number.
```javascript
mapping.findAndHighlightPlot(5);
```

##### `highlightMarker(entryId)`
Highlight marker by entry ID.
```javascript
mapping.highlightMarker(123);
```

##### `toggleDistanceMeasurement()`
Toggle distance measurement mode.
```javascript
mapping.toggleDistanceMeasurement();
```

##### `clearAllMeasurements()`
Clear all distance measurements.
```javascript
mapping.clearAllMeasurements();
```

### CoordinateUtils

Utilities for coordinate parsing, validation, and formatting.

#### Static Methods

##### `parseCoordinate(coordString)`
Parse coordinate string to decimal degrees.
```javascript
const decimal = CoordinateUtils.parseCoordinate("20°56.1'N");
// Returns: 20.935
```

##### `formatCoordinate(decimal, isLatitude)`
Format decimal degrees to coordinate string.
```javascript
const coord = CoordinateUtils.formatCoordinate(20.935, true);
// Returns: "20°56.1'N"
```

##### `validateCoordinate(degrees, minutes, direction, isLatitude)`
Validate coordinate components.
```javascript
const result = CoordinateUtils.validateCoordinate('20', '56.1', 'N', true);
// Returns: {valid: true} or {valid: false, error: 'message'}
```

##### `buildCoordinateString(degrees, minutes, direction)`
Build coordinate string from components.
```javascript
const coord = CoordinateUtils.buildCoordinateString('20', '56.1', 'N');
// Returns: "20°56.1'N"
```

##### `parseCoordinateString(coordString)`
Parse coordinate string into components.
```javascript
const parts = CoordinateUtils.parseCoordinateString("20°56.1'N");
// Returns: {degrees: '20', minutes: '56.1', direction: 'N'}
```

### DistanceCalculator

Distance and bearing calculations for navigation.

#### Static Methods

##### `calculateDistance(lat1, lon1, lat2, lon2)`
Calculate great circle distance in nautical miles.
```javascript
const distance = DistanceCalculator.calculateDistance(20.935, -158.05, 21.3, -157.8);
// Returns: 25.4 (nautical miles)
```

##### `calculateBearing(lat1, lon1, lat2, lon2)`
Calculate true bearing in degrees.
```javascript
const bearing = DistanceCalculator.calculateBearing(20.935, -158.05, 21.3, -157.8);
// Returns: 045.2 (degrees)
```

##### `calculateDistanceToLand(latitude, longitude)`
Calculate distance to nearest land.
```javascript
const result = DistanceCalculator.calculateDistanceToLand(20.935, -158.05);
// Returns: {distance: 125.3, nearestLand: "Hawaiian Islands", displayText: "125.3 NM"}
```

##### `calculateCourseAndDistance(fix1, fix2)`
Calculate course and distance between fixes.
```javascript
const result = DistanceCalculator.calculateCourseAndDistance(
  {lat: 20.935, lon: -158.05},
  {lat: 21.3, lon: -157.8}
);
// Returns: {course: 045.2, distance: 25.4, distanceText: "25.4 NM", bearingText: "045.2°T"}
```

##### `calculateSpeed(fix1, fix2)`
Calculate speed between fixes with time data.
```javascript
const result = DistanceCalculator.calculateSpeed(
  {lat: 20.935, lon: -158.05, date: "2024-01-01", time: "08:00"},
  {lat: 21.3, lon: -157.8, date: "2024-01-01", time: "12:00"}
);
// Returns: {speed: 6.35, speedText: "6.4 kts", timeElapsed: 4}
```

## 🖥️ UI API Reference

### FormManager

Handles all form operations and validation.

#### Constructor
```javascript
const forms = new FormManager(config, alerts);
forms.init(app);
```

#### Methods

##### `getFormData()`
Get form data for submission.
```javascript
const data = forms.getFormData();
```

##### `populateForEdit(log)`
Populate form for editing existing entry.
```javascript
forms.populateForEdit(logEntry);
```

##### `reset()`
Reset form to default state.
```javascript
forms.reset();
```

##### `updateLastEntryDisplay(navigationLogs)`
Update last entry display widget.
```javascript
forms.updateLastEntryDisplay(navigationLogs);
```

##### `setDefaultDateRange(navigationLogs)`
Set default date range for filtering.
```javascript
forms.setDefaultDateRange(navigationLogs);
```

### TableManager

Handles table rendering and updates.

#### Constructor
```javascript
const tables = new TableManager(config, alerts);
```

#### Methods

##### `update(navigationLogs)`
Update table with navigation logs.
```javascript
tables.update(navigationLogs);
```

##### `getColorForDate(logDate, navigationLogs)`
Get color for date (used for plot markers).
```javascript
const color = tables.getColorForDate('2024-01-01', navigationLogs);
```

### AlertManager

Manages user notifications and messages.

#### Constructor
```javascript
const alerts = new AlertManager(config);
```

#### Methods

##### `show(message, type, duration)`
Show alert message.
```javascript
alerts.show('Entry added successfully', 'success');
alerts.show('Invalid coordinates', 'error');
alerts.show('Data exported', 'info');
```

##### `showSuccess(message)` / `showError(message)` / `showWarning(message)`
Show specific alert types.
```javascript
alerts.showSuccess('Navigation entry added');
alerts.showError('Failed to save data');
alerts.showWarning('Large dataset may be slow');
```

##### `clearAll()`
Clear all alerts.
```javascript
alerts.clearAll();
```

## 🔗 Global Functions

For backward compatibility, these functions are available globally:

### Window Functions
```javascript
// Main app functions (bound to app instance)
window.editNavigationLog(id)
window.deleteNavigationLog(id)
window.toggleImportance(id)
window.exportToJSON()
window.plotNavigationTrack()
window.findPlotOnMap()

// Distance calculations (from landmass.js)
window.calculateDistance(lat1, lon1, lat2, lon2)
window.calculateDistanceToLand(latitude, longitude)
window.calculateBearing(lat1, lon1, lat2, lon2)
```

## 📊 Data Structures

### Navigation Log Entry
```javascript
{
  id: 1234567890,                    // Unique timestamp ID
  entryTimestamp: 1234567890,        // When entry was created
  lastModified: 1234567890,          // When entry was last updated
  vesselName: 'USS RANGER',          // Vessel name
  vesselType: 'CVA-61',              // Vessel type
  zoneDescription: 'UTC',            // Time zone
  logDate: '2024-01-01',             // Date (YYYY-MM-DD)
  dayOfWeek: 'MONDAY',               // Day of week
  passageInfo: 'NAVIGATION LOG ENTRY', // Entry type
  positionTime: '12:00',             // Time (HH:MM)
  latitude: "20°56.1'N",             // Latitude string
  longitude: "158°03.0'W",           // Longitude string
  fixMethod: '2',                    // Fix method
  remarks: 'Navigation remarks',      // User remarks
  associatedUrl: 'https://...',      // Optional URL
  isImportant: false                 // Importance flag
}
```

### Configuration Structure
```javascript
{
  APP: {
    VERSION: 'v0.4.3',
    VESSEL_NAME: 'USS RANGER',
    // ... other app metadata
  },
  USER_PREFERENCES: {
    MAP: { /* map settings */ },
    FORM: { /* form settings */ },
    TABLE: { /* table settings */ },
    // ... other user preferences
  },
  STATE: {
    lastEntryAdded: 123,
    lastEntryUpdated: 456,
    // ... other runtime state
  }
}
```

## 🔄 Event Flow

### Adding New Entry
1. User fills form → `FormManager.getFormData()`
2. App validates → `ConfigManager.validateCoordinate()`
3. App creates entry → `NavalNavigationApp.addNavigationLog()`
4. Data saved → `DataStorage.save()`
5. Config updated → `ConfigManager.updateLastEntry()`
6. UI refreshed → `TableManager.update()`, `FormManager.updateLastEntryDisplay()`
7. Map updated → `NavigationMapping.plotTrack()` (if enabled)

### Loading Application
1. DOM ready → `main.js` creates `NavalNavigationApp`
2. Config loaded → `ConfigManager.loadUserPreferences()`
3. Modules initialized → `DataStorage`, `AlertManager`, etc.
4. Data loaded → `DataStorage.load()`
5. UI rendered → `TableManager.update()`, `FormManager.updateLastEntryDisplay()`
6. Map initialized → `NavigationMapping.init()`

## 🧪 Testing APIs

### Manual Testing
```javascript
// Test in browser console
const testEntry = {
  logDate: '2024-01-01',
  positionTime: '12:00',
  latitude: "20°56.1'N",
  longitude: "158°03.0'W",
  remarks: 'Test entry'
};

app.addNavigationLog(testEntry);
```

### Unit Testing (with Jest)
```javascript
describe('CoordinateUtils', () => {
  test('parseCoordinate should convert to decimal', () => {
    expect(CoordinateUtils.parseCoordinate("20°56.1'N")).toBeCloseTo(20.935);
  });
});
```

---

This API documentation covers all public methods and interfaces in the Naval Navigation Deck Log System. For implementation details, refer to the individual module source files. 🚢⚓