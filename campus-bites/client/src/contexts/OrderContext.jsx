import React, { createContext, useContext, useState } from 'react';
import { orderService } from '../services/orderService';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Place new order
  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      const newOrder = await orderService.placeOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      showToast('Order placed successfully! 🎉', 'success');
      return newOrder;
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order. Please try again.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update order status (Restaurant)
  const updateOrderStatus = async (orderId, status) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      setOrders(prev =>
        prev.map(order => (order._id === orderId ? updated : order))
      );
      showToast(`Order status updated to ${status}`, 'success');
      return updated;
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
      throw error;
    }
  };

  // Fetch user orders
  const fetchUserOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
      return data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch restaurant orders
  const fetchRestaurantOrders = async (status = '', silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await orderService.getRestaurantOrders(status);
      setOrders(data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch all orders (Admin)
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      return data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get single order
  const getOrderById = async (orderId) => {
    try {
      return await orderService.getOrderById(orderId);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  };

  // Get platform statistics (Admin)
  const getPlatformStats = async () => {
    try {
      return await orderService.getPlatformStats();
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  };

  // Get restaurant statistics (Restaurant owner)
  const getRestaurantStats = async () => {
    try {
      return await orderService.getRestaurantStats();
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      throw error;
    }
  };

  // Rate an order
  const rateOrder = async (orderId, rating, review) => {
    try {
      const updatedOrder = await orderService.rateOrder(orderId, rating, review);
      setOrders(prev =>
        prev.map(order => (order._id === orderId ? updatedOrder : order))
      );
      showToast('Thank you for your rating!', 'success');
      return updatedOrder;
    } catch (error) {
      console.error('Error rating order:', error);
      showToast(error.toString() || 'Failed to submit rating', 'error');
      throw error;
    }
  };

  // Local filters (work with already fetched orders)
  const getUserOrders = (userId) => {
    return orders.filter(order => order.user === userId);
  };

  const getRestaurantOrdersLocal = (restaurantId) => {
    return orders.filter(order => order.restaurant === restaurantId);
  };

  const getOrder = (orderId) => {
    return orders.find(order => order._id === orderId);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        placeOrder,
        updateOrderStatus,
        fetchUserOrders,
        fetchRestaurantOrders,
        fetchAllOrders,
        getOrderById,
        getPlatformStats,
        getRestaurantStats,
        rateOrder,
        getUserOrders,
        getRestaurantOrdersLocal,
        getOrder,
        toast,
        showToast,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};
