import API from "./api";

export const restaurantService = {
  // Get all approved restaurants
  getAllRestaurants: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await API.get(`/restaurants?${query}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch restaurants";
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (restaurantId) => {
    try {
      const response = await API.get(`/restaurants/${restaurantId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch restaurant";
    }
  },

  // Get my restaurant (for restaurant owners)
  getMyRestaurant: async () => {
    try {
      const response = await API.get("/restaurants/my/profile");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch restaurant profile";
    }
  },

  // Update restaurant
  updateRestaurant: async (restaurantId, data) => {
    try {
      const response = await API.put(`/restaurants/${restaurantId}`, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update restaurant";
    }
  },

  // Rate restaurant
  rateRestaurant: async (restaurantId, rating) => {
    try {
      const response = await API.post(`/restaurants/${restaurantId}/rate`, { rating });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to rate restaurant";
    }
  },

  // Get pending restaurants (admin)
  getPendingRestaurants: async () => {
    try {
      const response = await API.get("/restaurants/admin/pending");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch pending restaurants";
    }
  },

  // Approve restaurant (admin)
  approveRestaurant: async (restaurantId) => {
    try {
      const response = await API.put(`/restaurants/${restaurantId}/approve`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to approve restaurant";
    }
  },

  // Reject restaurant (admin)
  rejectRestaurant: async (restaurantId) => {
    try {
      const response = await API.put(`/restaurants/${restaurantId}/reject`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to reject restaurant";
    }
  },

  // Delete restaurant (admin)
  deleteRestaurant: async (restaurantId) => {
    try {
      const response = await API.delete(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete restaurant";
    }
  },
};
