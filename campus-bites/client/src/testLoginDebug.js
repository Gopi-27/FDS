// Test script to debug login issue
import API from "./api";

const testLogin = async () => {
  try {
    console.log("🧪 Testing login with axios...");
    console.log("Base URL:", API.defaults.baseURL);
    
    const response = await API.post("/auth/login", {
      email: "admin@campus.edu",
      password: "admin123",
    });

    console.log("✅ Login successful!");
    console.log("Response:", response.data);
    
    // Check the data structure
    if (response.data.data) {
      console.log("User data:", response.data.data);
    }
  } catch (error) {
    console.error("❌ Login failed!");
    console.error("Error:", error.response?.data || error.message);
  }
};

testLogin();
