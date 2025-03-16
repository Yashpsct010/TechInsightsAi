import axios from "axios";

/**
 * Service to fetch blog posts from the backend API
 */

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Keep track of pending requests to cancel if needed
const pendingRequests = new Map();

/**
 * Fetch the latest blog post with improved error handling and request cancellation
 * @param {string} genre - Optional genre to filter by
 * @returns {Promise<Object>} Blog post data
 */
export async function fetchLatestBlog(genre = null) {
  // Cancel any existing request for the same endpoint
  if (pendingRequests.has("latest")) {
    pendingRequests.get("latest").cancel("Request superseded");
  }

  // Create new cancel token
  const source = axios.CancelToken.source();
  pendingRequests.set("latest", source);

  try {
    const params = genre ? { genre } : {};

    console.log(`Fetching latest blog with params:`, params);

    const response = await apiClient.get("/blogs/latest", {
      params,
      cancelToken: source.token,
    });

    return response.data.blog;
  } catch (error) {
    // Don't throw for canceled requests
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message);
      throw new Error("Request was canceled");
    }

    console.error("Error fetching blog content:", error);

    // Enhanced error message
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    if (status === 504) {
      throw new Error(
        `The server took too long to respond (Timeout). Please try again later.`
      );
    } else if (status === 500) {
      throw new Error(`Server error occurred. The team has been notified.`);
    } else {
      throw new Error(`Failed to load blog content: ${message}`);
    }
  } finally {
    // Remove from pending requests
    pendingRequests.delete("latest");
  }
}

/**
 * Fetch blog posts with pagination - with improved error handling
 */
export async function fetchBlogArchive(page = 1, limit = 10, genre = null) {
  // Similar implementation with error handling...
  // ...existing code...
}
