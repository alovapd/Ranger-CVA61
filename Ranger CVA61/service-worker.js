// service-worker.js - GitHub Pages Compatible PWA Service Worker

const CACHE_NAME = 'naval-navigation-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Determine base path dynamically
function getBasePath() {
    const url = new URL(self.location);
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    // Check if we're on GitHub Pages
    if (url.hostname.includes('github.io') && pathParts.length > 0) {
        return '/' + pathParts[0] + '/';
    }
    return '/';
}

const BASE_PATH = getBasePath();
console.log('[Service Worker] Base path:', BASE_PATH);

// Assets to cache with correct paths
const STATIC_ASSETS = [
    // Main files
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'manifest.json',
    
    // Stylesheets
    BASE_PATH + 'css/styles.css',
    
    // JavaScript files
    BASE_PATH + 'js/config.js',
    BASE_PATH + 'js/core/app.js',
    BASE_PATH + 'js/core/data-manager.js',
    BASE_PATH + 'js/core/storage.js',
    BASE_PATH + 'js/core/settings.js',
    BASE_PATH + 'js/ui/alerts.js',
    BASE_PATH + 'js/ui/forms.js',
    BASE_PATH + 'js/ui/tables.js',
    BASE_PATH + 'js/ui/themes.js',
    BASE_PATH + 'js/ui/shortcuts.js',
    BASE_PATH + 'js/navigation/coordinates.js',
    BASE_PATH + 'js/navigation/distance.js',
    BASE_PATH + 'js/navigation/mapping.js',
    
    // Data files
    BASE_PATH + 'data/landmass.js',
    
    // Icons and assets (if they exist)
    BASE_PATH + 'favicon-16x16.png',
    BASE_PATH + 'favicon-32x32.png',
    BASE_PATH + 'apple-touch-icon.png'
];

// External resources (CDN)
const EXTERNAL_ASSETS = [
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// All assets to cache
const ASSETS_TO_CACHE = [...STATIC_ASSETS, ...EXTERNAL_ASSETS];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching assets...');
                console.log('[Service Worker] Assets to cache:', ASSETS_TO_CACHE);
                
                // Cache assets with error handling
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => {
                        return cache.add(url).catch(error => {
                            console.warn(`[Service Worker] Failed to cache: ${url}`, error);
                            return null;
                        });
                    })
                );
            })
            .then((results) => {
                const successful = results.filter(result => result.status === 'fulfilled').length;
                const failed = results.filter(result => result.status === 'rejected').length;
                console.log(`[Service Worker] Cached ${successful} assets, ${failed} failed`);
                
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Install failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other special schemes
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', request.url);
                    return cachedResponse;
                }
                
                // For navigation requests (HTML pages), try to serve index.html
                if (request.mode === 'navigate') {
                    return caches.match(BASE_PATH + 'index.html')
                        .then((indexResponse) => {
                            if (indexResponse) {
                                console.log('[Service Worker] Serving index.html for navigation:', request.url);
                                return indexResponse;
                            }
                            return fetch(request);
                        });
                }
                
                // For other requests, try network first
                console.log('[Service Worker] Fetching from network:', request.url);
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                })
                                .catch((error) => {
                                    console.warn('[Service Worker] Failed to cache response:', error);
                                });
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.warn('[Service Worker] Network fetch failed:', request.url, error);
                        
                        // For JavaScript files, try to serve a basic error response
                        if (request.url.endsWith('.js')) {
                            return new Response(
                                `console.error('Failed to load: ${request.url}');`,
                                {
                                    headers: { 'Content-Type': 'application/javascript' },
                                    status: 200
                                }
                            );
                        }
                        
                        // For other requests, return a basic 404 response
                        return new Response('Resource not found', { status: 404 });
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_VERSION,
            basePath: BASE_PATH,
            cacheName: CACHE_NAME
        });
    }
});

// Handle sync events (for background sync if needed)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'navigation-data-sync') {
        event.waitUntil(
            // Could implement background data sync here
            Promise.resolve()
        );
    }
});

// Handle push events (for notifications if needed)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event.data?.text());
    
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: BASE_PATH + 'favicon-32x32.png',
            badge: BASE_PATH + 'favicon-16x16.png',
            tag: 'naval-navigation'
        };
        
        event.waitUntil(
            self.registration.showNotification('Naval Navigation', options)
        );
    }
});

// Log service worker registration details
console.log('[Service Worker] Registered with base path:', BASE_PATH);
console.log('[Service Worker] Cache name:', CACHE_NAME);
console.log('[Service Worker] Will cache', ASSETS_TO_CACHE.length, 'assets');