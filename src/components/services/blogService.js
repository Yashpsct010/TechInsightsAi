/**
 * Service to fetch blog posts from the backend API
 */

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Fetch the latest blog post
 * @param {string} genre - Optional genre to filter by
 * @returns {Promise<Object>} Blog post data
 */
export async function fetchLatestBlog(genre = null) {
  try {
    const url = new URL(`${API_URL}/blogs/latest`);

    if (genre) {
      url.searchParams.append("genre", genre);
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error("Error fetching blog content:", error);
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
