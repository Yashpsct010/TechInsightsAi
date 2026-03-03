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

// Register user
const register = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error registering");
  }

  if (data.token) {
    localStorage.setItem("user", JSON.stringify(data));
  }

  return data;
};

// Login user
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error logging in");
  }

  if (data.token) {
    localStorage.setItem("user", JSON.stringify(data));
  }

  return data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

// Get user profile
const getProfile = async () => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers: {
      ...getAuthHeader(),
    },
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
const updatePreferences = async (preferences) => {
  const response = await fetch(`${API_URL}/auth/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ preferences }),
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
    localStorage.setItem("user", JSON.stringify(user));
  }

  return data.preferences;
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
