import API from "./api";

export const orderService = {
  // Place order
  placeOrder: async (orderData) => {
    try {
      const response = await API.post("/orders", orderData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to place order";
    }
  },

  // Get my orders (student)
  getMyOrders: async () => {
    try {
      const response = await API.get("/orders/my");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch orders";
    }
  },

  // Get restaurant orders
  getRestaurantOrders: async (status = null) => {
    try {
      const query = status ? `?status=${status}` : "";
      const response = await API.get(`/orders/restaurant${query}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch restaurant orders";
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch order";
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await API.put(`/orders/${orderId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update order status";
    }
  },

  // Get all orders (admin)
  getAllOrders: async () => {
    try {
      const response = await API.get("/orders/admin/all");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch all orders";
    }
  },

  // Get platform statistics (admin)
  getPlatformStats: async () => {
    try {
      const response = await API.get("/orders/admin/stats");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch platform stats";
    }
  },

  // Get restaurant statistics
  getRestaurantStats: async () => {
    try {
      const response = await API.get("/orders/restaurant/stats");
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch restaurant stats";
    }
  },

  // Rate an order
  rateOrder: async (orderId, rating, review) => {
    try {
      const response = await API.post(`/orders/${orderId}/rate`, { rating, review });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to submit rating";
    }
  },
};
