const DB_NAME = "thumbnail-creator";
const DB_VERSION = 1;
const STORE = "draft";

const KEY_META = "meta";
const KEY_ORIGINAL = "original";
const KEY_PROCESSED = "processed";

export type ThumbnailDraftMeta = {
  selectedStyle: string;
  text: string;
  font: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveThumbnailDraftMeta(meta: ThumbnailDraftMeta) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(meta, KEY_META);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveThumbnailDraftImages(images: {
  original: Blob;
  processed: Blob | null;
}) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  store.put(images.original, KEY_ORIGINAL);
  if (images.processed) {
    store.put(images.processed, KEY_PROCESSED);
  } else {
    store.delete(KEY_PROCESSED);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadThumbnailDraft(): Promise<{
  meta: ThumbnailDraftMeta | null;
  original: Blob | null;
  processed: Blob | null;
}> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const [meta, original, processed] = await Promise.all([
    idbRequest<ThumbnailDraftMeta | undefined>(store.get(KEY_META)),
    idbRequest<Blob | undefined>(store.get(KEY_ORIGINAL)),
    idbRequest<Blob | undefined>(store.get(KEY_PROCESSED)),
  ]);

  return {
    meta: meta ?? null,
    original: original ?? null,
    processed: processed ?? null,
  };
}

export async function clearThumbnailDraft() {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).clear();
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
