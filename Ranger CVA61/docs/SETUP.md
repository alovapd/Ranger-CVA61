# Naval Navigation Deck Log System - Setup Guide

Complete installation and setup instructions for the USS Ranger CVA-61 Navigation Log System.

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No server required - runs entirely in the browser

### Immediate Setup
1. **Download/extract** the project files
2. **Open `index.html`** in any web browser
3. **Start logging navigation data** immediately!

That's it! The system is ready to use.

## 📁 Project Structure

```
naval-navigation-log/
├── index.html              # Main application page
├── manifest.json            # PWA manifest (app installation)
├── service-worker.js        # Offline functionality
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── config.js           # Configuration management
│   ├── main.js             # Application entry point
│   ├── core/
│   │   ├── app.js          # Main application controller
│   │   └── storage.js      # Data persistence
│   ├── navigation/
│   │   ├── coordinates.js  # Coordinate utilities
│   │   ├── distance.js     # Distance calculations
│   │   └── mapping.js      # Map functionality
│   └── ui/
│       ├── alerts.js       # User notifications
│       ├── forms.js        # Form management
│       └── tables.js       # Table rendering
├── data/
│   └── landmass.js        # Coastline boundary data
└── docs/
    ├── SETUP.md           # This file
    ├── API.md             # Internal API documentation
    └── CHANGELOG.md       # Version history
```

## 🛠️ Development Setup

### Install Development Tools (Optional)
```bash
# Navigate to project directory
cd naval-navigation-log

# Install Node.js dependencies (optional for development)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run lint         # Check code quality
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm clean            # Clean build directory
```

## 📱 Progressive Web App (PWA) Setup

### Enable PWA Features
The application automatically registers as a PWA when accessed via HTTPS or localhost.

### Install as Desktop App
1. **Chrome/Edge**: Click install icon in address bar
2. **Firefox**: Add to home screen option in menu
3. **Safari**: Add to dock option in share menu

### Offline Functionality
- All core features work offline after first load
- Data persists in browser localStorage
- Service worker caches essential files

## 🗄️ Data Management

### Automatic Storage
- **Auto-save**: Data saves automatically every 30 seconds
- **Browser storage**: Uses localStorage for persistence
- **No server required**: All data stays on your device

### Import/Export
- **JSON format**: Complete data with metadata
- **CSV format**: Spreadsheet-compatible export
- **Backup recommended**: Export data regularly

### Storage Locations
```
Browser: localStorage['ussRangerNavigationLogs']
Export: Downloads folder (JSON/CSV files)
Config: localStorage['ussRangerNavLog_preferences']
```

## 🗺️ Map Configuration

### Map Providers
- **Default**: OpenStreetMap (free, no API key needed)
- **Alternative**: CartoDB Light layer
- **Offline**: Cached tiles work offline

### Tile Sources
```javascript
// OpenStreetMap
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

// CartoDB Light
https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```

### Custom Map Layers (Advanced)
To add custom map layers, edit `js/navigation/mapping.js`:
```javascript
const customLayer = L.tileLayer('your-tile-url-here', {
  attribution: 'Your attribution',
  maxZoom: 19
});
```

## ⚙️ Configuration Options

### User Preferences
Edit settings in browser or modify `js/config.js`:

```javascript
USER_PREFERENCES: {
  MAP: {
    defaultZoom: 6,
    defaultCenter: [20.9, -158.0],
    autoPlotNewEntries: true,
    autoZoomToNewEntry: true
  },
  FORM: {
    defaultTimeIncrement: '04:00',
    autoFillNextTime: true,
    rememberLastPosition: true
  },
  UI: {
    showSuccessMessages: true,
    messageDuration: 3000
  }
}
```

### Coordinate Templates
Add common locations in `js/config.js`:
```javascript
COORDINATE_TEMPLATES: {
  'Custom Port': { lat: "20°30.0'N", lon: "158°00.0'W" }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Map Not Loading
- **Check internet connection** for tile downloads
- **Verify console errors** in browser developer tools
- **Try alternative map layer** using layer control

#### Data Not Saving
- **Check browser localStorage** is enabled
- **Verify sufficient storage space** available
- **Try clearing browser cache** and reload

#### Import/Export Problems
- **Verify file format** is valid JSON
- **Check file permissions** in downloads folder
- **Ensure browser supports** File API

#### Performance Issues
- **Large datasets** (1000+ entries) may slow rendering
- **Use date filtering** to display fewer entries
- **Clear browser cache** if experiencing slowdowns

### Browser Compatibility Issues

#### Internet Explorer
- **Not supported** - use modern browser instead

#### Mobile Browsers
- **Touch interactions** work on all modern mobile browsers
- **Responsive design** adapts to screen size
- **PWA installation** available on mobile

### Debug Mode
Enable debug logging in console:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

## 🚀 Deployment Options

### Local File System
- **No server needed** - open `index.html` directly
- **File:// protocol** - some PWA features limited
- **Local development** - full functionality

### Web Server
- **Any HTTP server** - Apache, Nginx, IIS
- **Static hosting** - GitHub Pages, Netlify, Vercel
- **HTTPS recommended** - for full PWA features

### Deployment Steps
1. **Copy all files** to web server directory
2. **Ensure MIME types** are configured for .json, .js files
3. **Configure HTTPS** for PWA functionality
4. **Test offline mode** after first load

## 🔒 Security Considerations

### Data Privacy
- **No external servers** - all data stays local
- **No tracking** - no analytics or external calls
- **No authentication** - single-user application

### Network Security
- **HTTPS recommended** for production deployment
- **CSP headers** can be added for additional security
- **No sensitive data** transmitted over network

## 📊 Performance Optimization

### Large Datasets
- **Pagination**: Limit table rows displayed
- **Date filtering**: Show only relevant time periods
- **Map optimization**: Use clustering for many points

### Browser Performance
- **Regular cleanup**: Clear old browser data
- **Memory management**: Restart browser periodically
- **Hardware acceleration**: Enable in browser settings

## 🆕 Updates and Maintenance

### Updating the Application
1. **Backup current data** (export to JSON)
2. **Replace application files** with new version
3. **Open application** - service worker updates automatically
4. **Verify functionality** with test entry

### Version Management
- **Check version** in footer or console
- **Service worker** handles cache updates
- **Browser refresh** may be needed for major updates

## 📞 Support

### Self-Help Resources
- **Browser console** for error messages
- **Network tab** for loading issues
- **Application tab** for storage inspection

### Common Solutions
- **Clear cache**: Ctrl+F5 or Cmd+Shift+R
- **Restart browser**: Close and reopen
- **Update browser**: Ensure latest version

### Data Recovery
- **Export early, export often**: Regular JSON backups
- **Browser storage**: Check Application > Storage in dev tools
- **No cloud backup**: System is entirely local

---

## 🎯 Next Steps

After setup:
1. **Add your first navigation entry**
2. **Plot the track on the map**
3. **Export data as backup**
4. **Explore advanced features** (distance measurement, plot finding)
5. **Configure preferences** to match your workflow

Your Naval Navigation Deck Log System is ready for professional maritime navigation logging! ⚓🚢