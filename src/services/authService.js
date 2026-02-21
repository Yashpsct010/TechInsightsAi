const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const response = await fetch(`${API_URL}/api/auth/register`, {
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
  const response = await fetch(`${API_URL}/api/auth/login`, {
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
  const response = await fetch(`${API_URL}/api/auth/profile`, {
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

const authService = {
  register,
  login,
  logout,
  getProfile,
  getAuthHeader,
};

export default authService;
