import API from "./api";

export const authService = {
  // Unified Login (works for student, restaurant, admin)
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting login with:", { email, passwordLength: password.length });
      console.log("📡 API Base URL:", API.defaults.baseURL);
      
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("✅ Login response:", response.data);

      // Backend returns { success, message, data }
      // We only need the data object (contains user + token)
      const userData = response.data.data;

      // Store user + token in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      throw error.response?.data?.message || "Login failed";
    }
  },

  // Register (student or restaurant)
  register: async (data) => {
    try {
      const response = await API.post("/auth/register", data);
      
      // Backend returns { success, message, data }
      // Return just the data object for consistency
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("user");
  },

  // Get Current User
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },
};
