import axios from 'axios';
import { config } from '../config/env';

/**
 * Executes a promise-returning function with exponential backoff retries.
 */
async function withRetries<T>(fn: () => Promise<T>, maxRetries = 2, baseDelayMs = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[ImageService] Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retries exceeded');
}

/**
 * Fetches an image URL for a blog post based on its title from Unsplash.
 */
export async function getImageForBlog(title: string): Promise<string> {
  if (!config.unsplashAccessKey) {
    console.log('[ImageService] No Unsplash key configured. Using curated tech fallback.');
    return getFallbackImage(title);
  }

  try {
    console.log('[ImageService] Querying Unsplash for blog cover...');
    const searchQuery = title
      .replace(/[^\w\s]/gi, '')
      .split(' ')
      .slice(0, 5)
      .join(' ');

    const unsplashResponse = await withRetries(
      async () => {
        return await axios.get(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            searchQuery
          )}&per_page=1&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${config.unsplashAccessKey}`,
            },
            timeout: 10000,
          }
        );
      },
      2,
      1000
    );

    if (unsplashResponse.data.results && unsplashResponse.data.results.length > 0) {
      const url = unsplashResponse.data.results[0].urls.regular;
      console.log('[ImageService] Successfully retrieved image from Unsplash:', url);
      return url;
    }

    throw new Error('No image results found from Unsplash search.');
  } catch (imageError: any) {
    console.warn('[ImageService] Unsplash search failed, using fallback:', imageError.message);
    return getFallbackImage(title);
  }
}

function getFallbackImage(title: string): string {
  const fallbackKeywords = ['technology', 'cyberpunk', 'artificial-intelligence', 'code', 'future'];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const keyword = fallbackKeywords[hash % fallbackKeywords.length];
  return `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80&sig=${hash % 1000}`;
}
