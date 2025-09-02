// GTGOTG Service Worker
// Provides offline functionality and caching for the PWA

const CACHE_NAME = 'gtgotg-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/GTGOTG_ENHANCED_REVIEW_CSS.css',
  '/assets/GTGOTG_PHOTO_UPLOAD_JS.js',
  '/manifest.json',
  '/assets/gtgotg-app-icon-192.png',
  '/assets/gtgotg-app-icon-512.png',
  '/assets/gtgotg-favicon-32.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('GTGOTG Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('GTGOTG Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('GTGOTG Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('GTGOTG Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('GTGOTG Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('GTGOTG Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('GTGOTG Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('GTGOTG Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline review submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-reviews') {
    console.log('GTGOTG Service Worker: Background sync for reviews');
    event.waitUntil(syncReviews());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('GTGOTG Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New restroom information available!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/assets/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('GTGOTG Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('GTGOTG Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync offline reviews
async function syncReviews() {
  try {
    // Get offline reviews from IndexedDB or localStorage
    const offlineReviews = await getOfflineReviews();
    
    for (const review of offlineReviews) {
      try {
        // Attempt to submit review to server
        await submitReviewToServer(review);
        
        // Remove from offline storage on success
        await removeOfflineReview(review.id);
        
        console.log('GTGOTG Service Worker: Synced offline review:', review.id);
      } catch (error) {
        console.error('GTGOTG Service Worker: Failed to sync review:', error);
      }
    }
  } catch (error) {
    console.error('GTGOTG Service Worker: Background sync failed:', error);
  }
}

// Helper function to get offline reviews
async function getOfflineReviews() {
  // In a real implementation, this would use IndexedDB
  // For now, return empty array as we're using localStorage in the main app
  return [];
}

// Helper function to submit review to server
async function submitReviewToServer(review) {
  // In a real implementation, this would make an API call
  // For now, just simulate success
  return Promise.resolve();
}

// Helper function to remove offline review
async function removeOfflineReview(reviewId) {
  // In a real implementation, this would remove from IndexedDB
  return Promise.resolve();
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('GTGOTG Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('GTGOTG Service Worker: Loaded successfully');

