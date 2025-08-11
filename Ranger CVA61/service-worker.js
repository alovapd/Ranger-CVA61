/**
 * Naval Navigation Deck Log System - Service Worker
 * Provides offline functionality and caching for PWA support
 */

const CACHE_NAME = 'naval-navigation-v1';
const APP_VERSION = '0.4.3';

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // Stylesheets
  '/css/styles.css',
  
  // JavaScript modules
  '/js/main.js',
  '/js/config.js',
  '/js/core/app.js',
  '/js/core/storage.js',
  '/js/ui/alerts.js',
  '/js/ui/forms.js',
  '/js/ui/tables.js',
  '/js/navigation/mapping.js',
  '/js/navigation/coordinates.js',
  '/js/navigation/distance.js',
  
  // Data files
  '/data/landmass.js',
  
  // External dependencies (Leaflet)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Network-first resources (map tiles, external APIs)
const NETWORK_FIRST_PATTERNS = [
  /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/,
  /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/,
  /^https:\/\/api\..*/
];

// Cache-first resources (static assets)
const CACHE_FIRST_PATTERNS = [
  /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/,
  /^\/icons\/.*/,
  /^\/css\/.*/,
  /^\/js\/.*/
];

/**
 * Service Worker Installation
 * Pre-cache essential files for offline use
 */
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing service worker version ${APP_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

/**
 * Service Worker Activation
 * Clean up old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating service worker version ${APP_VERSION}`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Delete old caches
        const deletePromises = cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('[SW] Service worker activated and ready');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] Failed to activate service worker:', error);
      })
  );
});

/**
 * Fetch Event Handler
 * Implement caching strategies based on request type
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  event.respondWith(
    handleFetchRequest(request)
      .catch((error) => {
        console.error('[SW] Fetch handler error:', error);
        // Return offline fallback if available
        return getOfflineFallback(request);
      })
  );
});

/**
 * Handle fetch requests with appropriate caching strategy
 */
async function handleFetchRequest(request) {
  const url = request.url;
  
  // Network-first strategy (map tiles, APIs)
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
    return networkFirst(request);
  }
  
  // Cache-first strategy (static assets)
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
    return cacheFirst(request);
  }
  
  // Stale-while-revalidate for HTML and main app files
  return staleWhileRevalidate(request);
}

/**
 * Network-first caching strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Cache-first caching strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    throw error;
  }
}

/**
 * Stale-while-revalidate caching strategy
 * Serve from cache immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background to update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn('[SW] Background fetch failed:', error);
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cached version, wait for network
  return fetchPromise;
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
  // For HTML requests, try to serve the main index.html
  if (request.destination === 'document') {
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
  }
  
  // For other requests, return a basic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This resource is not available offline',
      timestamp: new Date().toISOString()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

/**
 * Handle service worker messages
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION',
        version: APP_VERSION,
        cacheName: CACHE_NAME
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches()
        .then(() => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: true
          });
        })
        .catch((error) => {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            success: false,
            error: error.message
          });
        });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

/**
 * Clear all caches (for debugging/maintenance)
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  await Promise.all(deletePromises);
  console.log('[SW] All caches cleared');
}

/**
 * Background sync for data persistence
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-navigation-data') {
    event.waitUntil(
      // Could implement background data sync here
      // For now, just log the event
      console.log('[SW] Background sync triggered for navigation data')
    );
  }
});

/**
 * Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  // Could implement push notifications for navigation alerts
  // For now, just log the event
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  // Focus or open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});

console.log(`[SW] Service worker script loaded - version ${APP_VERSION}`);