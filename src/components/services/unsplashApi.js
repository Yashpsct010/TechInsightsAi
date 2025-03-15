/**
 * Unsplash API service for image search
 * You'll need to get an API key from Unsplash (https://unsplash.com/developers)
 * and add it to your .env file as VITE_UNSPLASH_ACCESS_KEY
 */

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const API_URL = "https://api.unsplash.com";

/**
 * Search for an image on Unsplash based on a query
 * @param {string} query - The search query for image
 * @returns {Promise<string>} URL of a relevant image
 */
export async function searchImage(query) {
  try {
    if (!ACCESS_KEY) {
      throw new Error(
        "Unsplash API key is missing. Please add VITE_UNSPLASH_ACCESS_KEY to your .env file."
      );
    }

    // Create a search-friendly query by removing special characters
    const searchQuery = query
      .replace(/[^\w\s]/gi, "")
      .split(" ")
      .slice(0, 5)
      .join(" ");

    const response = await fetch(
      `${API_URL}/search/photos?query=${encodeURIComponent(
        searchQuery
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Unsplash API error: ${errorData.errors?.[0] || response.statusText}`
      );
    }

    const data = await response.json();

    // If no results found, use a generic tech image
    if (data.results.length === 0) {
      return fetchRandomTechImage();
    }

    // Return the URL of the first image
    return data.results[0].urls.regular;
  } catch (error) {
    console.warn("Error searching image with Unsplash:", error);
    // Fallback to random tech image
    return fetchRandomTechImage();
  }
}

/**
 * Fetch a random tech-related image
 * @returns {Promise<string>} URL of a random tech image
 */
export async function fetchRandomTechImage() {
  try {
    if (!ACCESS_KEY) {
      throw new Error(
        "Unsplash API key is missing. Please add VITE_UNSPLASH_ACCESS_KEY to your .env file."
      );
    }

    const techTerms = [
      "technology",
      "programming",
      "software",
      "computer",
      "code",
      "digital",
    ];
    const randomTerm = techTerms[Math.floor(Math.random() * techTerms.length)];

    const response = await fetch(
      `${API_URL}/photos/random?query=${randomTerm}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch random tech image: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.error("Failed to fetch random tech image:", error);
    // Ultimate fallback - use a placeholder
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  }
}
