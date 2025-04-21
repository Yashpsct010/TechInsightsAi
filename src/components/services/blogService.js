import {
  saveLatestBlog,
  getLatestBlog,
  saveBlog,
  getBlog,
  getAllBlogs,
} from "../../services/offlineDataService";

/**
 * Service to fetch blog posts from the backend API
 */

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Check if the device is currently online
 */
const isOnline = () => {
  return navigator.onLine;
};

/**
 * Fetch the latest blog post with offline support
 * @param {string} genre - Optional genre to filter by
 * @returns {Promise<Object>} Blog post data
 */
export async function fetchLatestBlog(genre = null) {
  try {
    if (isOnline()) {
      // Online mode: fetch from API
      const url = `${API_URL}/blogs/latest${genre ? `?genre=${genre}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.blog) {
        // Save to offline storage for later use
        await saveLatestBlog(data.blog);
        return data.blog;
      }

      throw new Error("No blog data received from server");
    } else {
      // Offline mode: get from storage
      console.log("Device is offline, using cached data");
      const cachedBlog = await getLatestBlog();

      if (!cachedBlog) {
        throw new Error("No cached blog available while offline");
      }

      return cachedBlog;
    }
  } catch (error) {
    console.error("Error fetching latest blog:", error);

    // Try to get from cache as fallback even if we're online but request failed
    if (error.message !== "No cached blog available while offline") {
      const cachedBlog = await getLatestBlog();
      if (cachedBlog) {
        console.log("Using cached blog as fallback");
        return cachedBlog;
      }
    }

    throw error;
  }
}

/**
 * Fetch blog posts with pagination
 * @param {number} page - Page number
 * @param {number} limit - Number of blog posts per page
 * @param {string} genre - Optional genre to filter by
 * @returns {Promise<Object>} Blog posts data with pagination info
 */
export async function fetchBlogArchive(page = 1, limit = 10, genre = null) {
  try {
    const url = new URL(`${API_URL}/blogs/all`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    if (genre) {
      url.searchParams.append("genre", genre);
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching blog archive:", error);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID with offline support
 * @param {string} id - The ID of the blog post
 * @returns {Promise<Object>} Blog post data
 */
export async function fetchBlogById(id) {
  try {
    if (isOnline()) {
      // Online mode: fetch from API
      const response = await fetch(`${API_URL}/blogs/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const blog = await response.json();

      // Save to offline storage
      await saveBlog(blog);
      return blog;
    } else {
      // Offline mode: get from storage
      console.log("Device is offline, using cached blog");
      const cachedBlog = await getBlog(id);

      if (!cachedBlog) {
        throw new Error("Requested blog not available offline");
      }

      return cachedBlog;
    }
  } catch (error) {
    console.error("Error fetching blog by ID:", error);

    // Try to get from cache as fallback
    if (error.message !== "Requested blog not available offline") {
      const cachedBlog = await getBlog(id);
      if (cachedBlog) {
        console.log("Using cached blog as fallback");
        return cachedBlog;
      }
    }

    throw error;
  }
}
