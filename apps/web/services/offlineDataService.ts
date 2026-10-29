import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'techInsightsOfflineDB';
const DB_VERSION = 2;
const BLOGS_STORE = 'blogs';
const LATEST_BLOG_KEY = 'latestBlog';

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Modernized IndexedDB Initialization using Promise-based `idb`
 */
export async function getDB(): Promise<IDBPDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only accessible in browser environment.');
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        let store;
        if (!db.objectStoreNames.contains(BLOGS_STORE)) {
          store = db.createObjectStore(BLOGS_STORE, { keyPath: '_id' });
        } else {
          store = transaction.objectStore(BLOGS_STORE);
        }

        if (!store.indexNames.contains('genre')) {
          store.createIndex('genre', 'genre', { unique: false });
        }
        if (!store.indexNames.contains('createdAt')) {
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Check browser storage quota
 */
export async function checkStorageQuota() {
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = ((estimate.usage || 0) / (estimate.quota || 1)) * 100;
    return { percentUsed, estimate };
  }
  return null;
}

/**
 * Cleanup blogs older than maxAgeMs (default: 30 days)
 */
export async function cleanupOldBlogs(maxAgeMs = 30 * 24 * 60 * 60 * 1000): Promise<number> {
  try {
    const db = await getDB();
    const allBlogs = await db.getAll(BLOGS_STORE);
    const cutoffDate = Date.now() - maxAgeMs;

    const blogsToDelete = allBlogs.filter((blog) => {
      const time = new Date(blog.createdAt).getTime();
      return time < cutoffDate;
    });

    if (blogsToDelete.length === 0) return 0;

    const tx = db.transaction(BLOGS_STORE, 'readwrite');
    await Promise.all([
      ...blogsToDelete.map((blog) => tx.store.delete(blog._id)),
      tx.done,
    ]);

    return blogsToDelete.length;
  } catch (error) {
    console.error('Offline storage cleanup error:', error);
    return 0;
  }
}

/**
 * Save blog to offline storage
 */
export async function saveBlog(blog: any): Promise<boolean> {
  try {
    const db = await getDB();
    await db.put(BLOGS_STORE, blog);
    return true;
  } catch (error: any) {
    if (error?.name === 'QuotaExceededError') {
      try {
        const cleaned = await cleanupOldBlogs();
        if (cleaned > 0) {
          const db = await getDB();
          await db.put(BLOGS_STORE, blog);
          return true;
        }
      } catch (cleanupErr) {
        console.error('Storage quota exceeded, cleanup failed:', cleanupErr);
      }
    }
    console.error('Failed to save blog offline:', error);
    return false;
  }
}

/**
 * Save latest blog for instant access
 */
export async function saveLatestBlog(blog: any): Promise<boolean> {
  if (typeof window !== 'undefined' && blog?._id) {
    localStorage.setItem(LATEST_BLOG_KEY, blog._id);
  }
  return saveBlog(blog);
}

/**
 * Retrieve single blog from offline store
 */
export async function getBlog(id: string): Promise<any | null> {
  try {
    const db = await getDB();
    return (await db.get(BLOGS_STORE, id)) || null;
  } catch (error) {
    console.error('Failed to get offline blog:', error);
    return null;
  }
}

/**
 * Retrieve latest blog from offline store
 */
export async function getLatestBlog(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  const latestId = localStorage.getItem(LATEST_BLOG_KEY);
  if (!latestId) return null;
  return getBlog(latestId);
}

/**
 * Retrieve all offline blogs
 */
export async function getAllBlogs(): Promise<any[]> {
  try {
    const db = await getDB();
    return await db.getAll(BLOGS_STORE);
  } catch (error) {
    console.error('Failed to get all offline blogs:', error);
    return [];
  }
}
