// Wandra Custom Service Worker Additions
// This file handles background sync for moments saved while offline.

const DB_NAME = 'wandra-offline-sync';
const STORE_NAME = 'pending-moments';

/**
 * Open IndexedDB for offline storage
 */
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a moment to the sync queue
 */
async function queueMoment(momentData) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.add(momentData);
  return tx.complete;
}

/**
 * Sync all pending moments to the server
 */
async function syncMoments() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const moments = await new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });

  for (const moment of moments) {
    try {
      const response = await fetch(`/api/journeys/${moment.journey_id}/moment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moment),
      });

      if (response.ok) {
        store.delete(moment.id);
        console.log('Successfully synced moment:', moment.id);
      }
    } catch (error) {
      console.error('Failed to sync moment, will retry later:', error);
    }
  }
}

// Background Sync Listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'moment-sync') {
    event.waitUntil(syncMoments());
  }
});

// Intercept moment save requests when offline
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.includes('/api/journeys/') && event.request.url.includes('/moment')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // We are likely offline
        const momentData = await event.request.clone().json();
        await queueMoment(momentData);
        
        // Register sync if supported
        if ('sync' in self.registration) {
          await self.registration.sync.register('moment-sync');
        }
        
        return new Response(JSON.stringify({ offline: true, message: 'Saved locally, will sync when online.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 202
        });
      })
    );
  }
});
