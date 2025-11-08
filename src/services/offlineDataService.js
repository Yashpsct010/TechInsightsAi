/**
 * Service to manage offline data storage using IndexedDB
 */

const DB_NAME = "techInsightsOfflineDB";
const DB_VERSION = 2; // Bumped to 2 to add indexes to existing databases
const BLOGS_STORE = "blogs";
const LATEST_BLOG_KEY = "latestBlog";

let db = null;

/**
 * Initialize the IndexedDB database
 * Returns immediately if db is already initialized (optimized for performance)
 */
export const initializeDB = () => {
  // Return immediately if db is already initialized (synchronous path)
  if (db) {
    return Promise.resolve(db);
  }

  // Only create Promise if db needs to be initialized
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject("Could not open IndexedDB");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("IndexedDB initialized successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(BLOGS_STORE)) {
        const store = database.createObjectStore(BLOGS_STORE, {
          keyPath: "_id",
        });
        // Add indexes for better query performance
        store.createIndex("genre", "genre", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
        console.log("Blog store created with indexes");
      } else {
        // Add indexes to existing store if they don't exist
        const transaction = event.target.transaction;
        const store = transaction.objectStore(BLOGS_STORE);
        if (!store.indexNames.contains("genre")) {
          store.createIndex("genre", "genre", { unique: false });
        }
        if (!store.indexNames.contains("createdAt")) {
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      }
    };
  });
};

/**
 * Save blog data to IndexedDB
 * @param {Object} blog - Blog data to store
 */
export const saveBlog = async (blog) => {
  try {
    // Only initialize if db doesn't exist (optimized path)
    if (!db) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOGS_STORE], "readwrite");
      const store = transaction.objectStore(BLOGS_STORE);
      const request = store.put(blog);

      request.onsuccess = () => {
        console.log("Blog saved to offline storage:", blog._id || blog.title);
        resolve(true);
      };

      request.onerror = (event) => {
        console.error("Error saving blog:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Failed to save blog:", error);
    return false;
  }
};

/**
 * Save the latest blog for quick access
 * @param {Object} blog - Latest blog data
 */
export const saveLatestBlog = async (blog) => {
  // Store the ID of the latest blog in localStorage for quick access
  localStorage.setItem(LATEST_BLOG_KEY, blog._id);
  return saveBlog(blog);
};

/**
 * Get a blog by ID from IndexedDB
 * @param {string} id - Blog ID
 */
export const getBlog = async (id) => {
  try {
    // Only initialize if db doesn't exist (optimized path)
    if (!db) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOGS_STORE], "readonly");
      const store = transaction.objectStore(BLOGS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Error getting blog:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Failed to get blog:", error);
    return null;
  }
};

/**
 * Get the latest blog from offline storage
 * Optimized to avoid double initialization
 */
export const getLatestBlog = async () => {
  const latestBlogId = localStorage.getItem(LATEST_BLOG_KEY);
  if (!latestBlogId) {
    return null;
  }

  try {
    // Only initialize if db doesn't exist (optimized path)
    if (!db) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOGS_STORE], "readonly");
      const store = transaction.objectStore(BLOGS_STORE);
      const request = store.get(latestBlogId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Error getting latest blog:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Failed to get latest blog:", error);
    return null;
  }
};

/**
 * Get all saved blogs from IndexedDB
 */
export const getAllBlogs = async () => {
  try {
    // Only initialize if db doesn't exist (optimized path)
    if (!db) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOGS_STORE], "readonly");
      const store = transaction.objectStore(BLOGS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("Error getting all blogs:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("Failed to get all blogs:", error);
    return [];
  }
};
