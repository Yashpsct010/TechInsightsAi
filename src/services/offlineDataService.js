/**
 * Service to manage offline data storage using IndexedDB
 */

const DB_NAME = "techInsightsOfflineDB";
const DB_VERSION = 1;
const BLOGS_STORE = "blogs";
const LATEST_BLOG_KEY = "latestBlog";

let db = null;

/**
 * Initialize the IndexedDB database
 */
export const initializeDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

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
        database.createObjectStore(BLOGS_STORE, { keyPath: "_id" });
        console.log("Blog store created");
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
    await initializeDB();
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
    await initializeDB();
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
 */
export const getLatestBlog = async () => {
  const latestBlogId = localStorage.getItem(LATEST_BLOG_KEY);
  if (latestBlogId) {
    return getBlog(latestBlogId);
  }
  return null;
};

/**
 * Get all saved blogs from IndexedDB
 */
export const getAllBlogs = async () => {
  try {
    await initializeDB();
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
