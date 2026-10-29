import apiClient from './apiClient';

export interface AuthResponse {
  token: string;
  _id: string;
  email: string;
  role: 'user' | 'admin';
  preferences: string[];
  bookmarks: string[];
  newsletterSubscribed: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', { email, password });
    return response.data;
  },

  async getProfile(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/auth/profile');
    return response.data;
  },

  async updatePreferences(
    preferences?: string[],
    newsletterSubscribed?: boolean
  ): Promise<{ preferences: string[]; newsletterSubscribed: boolean }> {
    const response = await apiClient.put('/auth/preferences', {
      preferences,
      newsletterSubscribed,
    });
    return response.data;
  },

  async toggleBookmark(blogId: string): Promise<string[]> {
    const response = await apiClient.post<{ bookmarks: string[] }>(`/auth/bookmarks/${blogId}`);
    return response.data.bookmarks;
  },

  async getBookmarks(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/auth/bookmarks');
    return response.data;
  },
};

export default authService;
