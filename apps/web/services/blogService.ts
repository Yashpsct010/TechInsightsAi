import apiClient from './apiClient';
import { getLatestBlog, saveLatestBlog, getBlog, saveBlog } from './offlineDataService';

export interface BlogItem {
  _id: string;
  id?: string;
  title: string;
  body: string;
  image: string;
  imageAlt?: string;
  imageCaption?: string;
  genre: string;
  links?: {
    title: string;
    url: string;
    description?: string;
    image?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogArchiveResponse {
  blogs: BlogItem[];
  totalPages: number;
  currentPage: number;
}

export const blogService = {
  /**
   * Fetch the latest blog (with genre filter & offline fallback)
   */
  async fetchLatestBlog(genre?: string | null): Promise<BlogItem> {
    try {
      const params = genre ? { genre } : {};
      const response = await apiClient.get<{ blog: BlogItem }>('/blogs/latest', { params });
      if (response.data?.blog) {
        saveLatestBlog(response.data.blog).catch(() => {});
        return response.data.blog;
      }
      throw new Error('No blog found');
    } catch (err: any) {
      // Fallback to offline store
      const offline = await getLatestBlog();
      if (offline) {
        return offline;
      }
      throw new Error(err.response?.data?.error || err.message || 'Failed to fetch latest blog');
    }
  },

  /**
   * Fetch a single blog by ID (with offline cache fallback)
   */
  async fetchBlogById(id: string): Promise<BlogItem> {
    try {
      const response = await apiClient.get<BlogItem>(`/blogs/${id}`);
      if (response.data) {
        saveBlog(response.data).catch(() => {});
        return response.data;
      }
      throw new Error('Blog not found');
    } catch (err: any) {
      // Offline fallback
      const offline = await getBlog(id);
      if (offline) {
        return offline;
      }
      throw new Error(err.response?.data?.error || err.message || 'Failed to load blog');
    }
  },

  /**
   * Fetch paginated and filtered blog archive
   */
  async fetchBlogArchive(
    page: number = 1,
    limit: number = 9,
    genre?: string | null,
    searchTerm?: string | null,
    dateFilter?: string | null,
    preferredGenres?: string[] | null
  ): Promise<BlogArchiveResponse> {
    const params: Record<string, any> = { page, limit };
    if (genre) params.genre = genre;
    if (searchTerm) params.searchTerm = searchTerm;
    if (dateFilter && dateFilter !== 'all') params.dateFilter = dateFilter;
    if (preferredGenres && preferredGenres.length > 0) {
      params.preferredGenres = preferredGenres.join(',');
    }

    const response = await apiClient.get<BlogArchiveResponse>('/blogs', { params });
    return response.data;
  },
};

export const fetchLatestBlog = blogService.fetchLatestBlog.bind(blogService);
export const fetchBlogById = blogService.fetchBlogById.bind(blogService);
export const fetchBlogArchive = blogService.fetchBlogArchive.bind(blogService);

export default blogService;
