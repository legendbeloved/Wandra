export const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("WandraDB", 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("moments_sync")) {
        db.createObjectStore("moments_sync", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveMomentOffline = async (moment: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("moments_sync", "readwrite");
    const store = tx.objectStore("moments_sync");
    const req = store.add(moment);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getOfflineMoments = async () => {
  const db = await initDB();
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction("moments_sync", "readonly");
    const store = tx.objectStore("moments_sync");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const clearOfflineMoments = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("moments_sync", "readwrite");
    const store = tx.objectStore("moments_sync");
    const req = store.clear();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
