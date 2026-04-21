const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Helper to get auth header
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};

// Custom Error Classes
export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
    this.isRetryable = true;
  }
}

export class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.isRetryable = false;
  }
}

// Retry Wrapper for Transient Network Errors
const withRetries = async (fn, maxRetries = 3, backoff = 1000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Only retry on retryable errors
      if (!error.isRetryable) {
        throw error;
      }

      if (attempt < maxRetries) {
        const wait = backoff * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  throw lastError;
};

// Register user
const register = async (email, password) => {
  return withRetries(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new AuthError(data.message || "Error registering", response.status);
      }

      if (data.token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(`Network error: ${error.message}`);
      }
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      throw error;
    }
  });
};

// Login user
const login = async (email, password) => {
  return withRetries(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new AuthError(data.message || "Error logging in", response.status);
      }

      if (data.token) {
        localStorage.setItem("user", JSON.stringify(data));
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(`Network error: ${error.message}`);
      }
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      throw error;
    }
  });
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

// Get user profile
const getProfile = async (options = {}) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers: {
      ...getAuthHeader(),
    },
    ...options, // Allow passing AbortSignals
  });

  const data = await response.json();

  if (!response.ok) {
    // If token is invalid/expired, log out automatically
    if (response.status === 401) {
      logout();
    }
    throw new Error(data.message || "Error fetching profile");
  }

  return data;
};

// Update user preferences
const updatePreferences = async (preferences, newsletterSubscribed) => {
  const response = await fetch(`${API_URL}/auth/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ preferences, newsletterSubscribed }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    throw new Error(data.message || "Error updating preferences");
  }

  // Update localStorage with new preferences
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    user.preferences = data.preferences;
    user.newsletterSubscribed = data.newsletterSubscribed;
    localStorage.setItem("user", JSON.stringify(user));
  }

  return data;
};

// Toggle bookmark for user
const toggleBookmark = async (blogId) => {
  const response = await fetch(`${API_URL}/auth/bookmarks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ blogId }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    throw new Error(data.message || "Error toggling bookmark");
  }

  // Update localStorage with new bookmarks
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    user.bookmarks = data.bookmarks;
    localStorage.setItem("user", JSON.stringify(user));
  }

  return data.bookmarks;
};

// Get user bookmarks
const getBookmarks = async () => {
  const response = await fetch(`${API_URL}/auth/bookmarks`, {
    method: "GET",
    headers: {
      ...getAuthHeader(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    throw new Error(data.message || "Error fetching bookmarks");
  }

  return data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updatePreferences,
  toggleBookmark,
  getBookmarks,
  getAuthHeader,
};

export default authService;
