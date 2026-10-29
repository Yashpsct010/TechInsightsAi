import { useQuery } from '@tanstack/react-query';
import { fetchBlogById, BlogItem } from '../services/blogService';

export function useBlogById(id?: string) {
  const query = useQuery<BlogItem, Error>({
    queryKey: ['blog', id],
    queryFn: () => {
      if (!id) throw new Error('No blog ID provided.');
      return fetchBlogById(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    blog: query.data || null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    retry: () => query.refetch(),
  };
}

export default useBlogById;
