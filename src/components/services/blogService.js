import APIMonitor from '../utils/APIMonitor';
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
  const endpoint = `${API_URL}/blogs/latest${genre ? `?genre=${genre}` : ""}`;
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      if (isOnline()) {
        const startTime = Date.now();
        const response = await fetch(endpoint);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (!response.ok) {
          APIMonitor.recordRequest(endpoint, false, responseTime);
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        APIMonitor.recordRequest(endpoint, true, responseTime);

        if (data.blog) {
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
      console.error(`Attempt ${retries + 1} failed for ${endpoint}:`, error);
      if (isOnline() && retries < MAX_RETRIES) {
        retries++;
        const backoffTime = APIMonitor.getBackoffTime(endpoint);
        console.log(`Retrying ${endpoint} in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue; // Try again
      } else {
        // If offline or max retries reached, try to get from cache as fallback
        if (error.message !== "No cached blog available while offline") {
          const cachedBlog = await getLatestBlog();
          if (cachedBlog) {
            console.log("Using cached blog as fallback");
            return cachedBlog;
          }
        }
        throw error; // Re-throw if no fallback
      }
    }
  }
}

/**
 * Fetch blog posts with pagination
 * @param {number} page - Page number
 * @param {number} limit - Number of blog posts per page
 * @param {string} genre - Optional genre to filter by
 * @returns {Promise<Object>} Blog posts data with pagination info
 */
export async function fetchBlogArchive(
  page = 1,
  limit = 10,
  genre = null,
  searchTerm = null,
  dateFilter = null
) {
  const url = new URL(`${API_URL}/blogs/all`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  if (genre) {
    url.searchParams.append("genre", genre);
  }
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm);
  }
  if (dateFilter) {
    url.searchParams.append("dateFilter", dateFilter);
  }

  const endpoint = url.toString(); // Use the full URL as the endpoint identifier
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        APIMonitor.recordRequest(endpoint, false, responseTime);
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      APIMonitor.recordRequest(endpoint, true, responseTime);
      return data;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed for ${endpoint}:`, error);
      if (retries < MAX_RETRIES) {
        retries++;
        const backoffTime = APIMonitor.getBackoffTime(endpoint);
        console.log(`Retrying ${endpoint} in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue; // Try again
      } else {
        throw error; // Re-throw if max retries reached
      }
    }
  }
}

/**
 * Fetch a single blog post by ID with offline support
 * @param {string} id - The ID of the blog post
 * @returns {Promise<Object>} Blog post data
 */
export async function fetchBlogById(id) {
  const endpoint = `${API_URL}/blogs/${id}`;
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      if (isOnline()) {
        const startTime = Date.now();
        const response = await fetch(endpoint);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (!response.ok) {
          APIMonitor.recordRequest(endpoint, false, responseTime);
          throw new Error(`API error: ${response.statusText}`);
        }

        const blog = await response.json();
        APIMonitor.recordRequest(endpoint, true, responseTime);

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
      console.error(`Attempt ${retries + 1} failed for ${endpoint}:`, error);
      if (isOnline() && retries < MAX_RETRIES) {
        retries++;
        const backoffTime = APIMonitor.getBackoffTime(endpoint);
        console.log(`Retrying ${endpoint} in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue; // Try again
      } else {
        // If offline or max retries reached, try to get from cache as fallback
        if (error.message !== "Requested blog not available offline") {
          const cachedBlog = await getBlog(id);
          if (cachedBlog) {
            console.log("Using cached blog as fallback");
            return cachedBlog;
          }
        }
        throw error; // Re-throw if no fallback
      }
    }
  }
}
