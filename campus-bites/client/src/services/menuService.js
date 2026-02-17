import API from "./api";

export const menuService = {
  // Get menu by restaurant
  getMenuByRestaurant: async (restaurantId, params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await API.get(`/menu/restaurant/${restaurantId}?${query}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch menu";
    }
  },

  // Get menu item by ID
  getMenuItemById: async (itemId) => {
    try {
      const response = await API.get(`/menu/${itemId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch menu item";
    }
  },

  // Get my menu items (restaurant owner)
  getMyMenuItems: async () => {
    try {
      const response = await API.get("/menu/my/items");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch menu items";
    }
  },

  // Create menu item
  createMenuItem: async (itemData) => {
    try {
      const response = await API.post("/menu", itemData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create menu item";
    }
  },

  // Update menu item
  updateMenuItem: async (itemId, itemData) => {
    try {
      const response = await API.put(`/menu/${itemId}`, itemData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update menu item";
    }
  },

  // Delete menu item
  deleteMenuItem: async (itemId) => {
    try {
      const response = await API.delete(`/menu/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete menu item";
    }
  },

  // Toggle availability
  toggleAvailability: async (itemId) => {
    try {
      const response = await API.patch(`/menu/${itemId}/availability`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to toggle availability";
    }
  },
};
