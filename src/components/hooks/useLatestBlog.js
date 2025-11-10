import { useState, useEffect, useCallback } from 'react';
import { fetchLatestBlog } from '../services/blogService';

/**
 * A custom hook to fetch and manage the state for the latest blog post.
 * It handles loading, error, and retry logic, and debounces genre changes.
 * @param {string | null} initialGenre - The initial genre to fetch.
 */
export function useLatestBlog(initialGenre = null) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState(initialGenre);
  const [isRetrying, setIsRetrying] = useState(false);

  // useCallback to memoize the fetching function
  const loadBlog = useCallback(async (currentGenre) => {
    try {
      // Set loading state only if it's not a background refresh
      setLoading(true);
      setError(null);
      setIsRetrying(false);

      const blogData = await fetchLatestBlog(currentGenre);
      
      if (!blogData) {
        throw new Error("No blog data returned from server.");
      }
      
      setBlog(blogData);
    } catch (err) {
      console.error("Failed to load blog:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect to handle the debounced fetching when the genre changes
  useEffect(() => {
    // Debounce the request to avoid rapid-fire API calls
    const handler = setTimeout(() => {
      loadBlog(genre);
    }, 300);

    // Cleanup function to clear the timeout if the genre changes again
    return () => {
      clearTimeout(handler);
    };
  }, [genre, loadBlog]);

  // A function to allow the component to trigger a retry
  const retry = useCallback(() => {
    setIsRetrying(true);
    loadBlog(genre);
  }, [genre, loadBlog]);

  return { blog, loading, error, isRetrying, setGenre, retry };
}
