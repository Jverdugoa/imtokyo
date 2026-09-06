/**
 * IndexedDB helper for robust, large-capacity local storage.
 * Handles garments, outfits, profile, and settings with gigabytes of quota.
 */

const DB_NAME = "imftok_db";
const DB_VERSION = 1;
const STORE_NAME = "key_val";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const IDBService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => resolve((req.result as T) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB set failed:", e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },
};
