import axios from 'axios';

/**
 * Global Axios Client with centralized interceptors
 * Automatically attaches the JWT Bearer token to outgoing requests
 * Intercepts 401 Unauthorized responses to notify AuthContext
 */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Dispatch custom event so AuthContext can clean up state without hard redirect
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
