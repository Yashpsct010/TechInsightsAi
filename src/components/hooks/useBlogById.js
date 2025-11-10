import { useState, useEffect, useCallback } from 'react';
import { fetchBlogById } from '../services/blogService';

/**
 * A custom hook to fetch a single blog post by its ID.
 * It handles loading, error, and retry logic.
 * @param {string} id - The ID of the blog post to fetch.
 */
export function useBlogById(id) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBlog = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("No blog ID provided.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const blogData = await fetchBlogById(id);
      setBlog(blogData);
    } catch (err) {
      console.error(`Failed to load blog with ID ${id}:`, err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  const retry = () => {
    loadBlog();
  };

  return { blog, loading, error, retry };
}
