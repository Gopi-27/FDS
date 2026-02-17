import React, { createContext, useContext, useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all restaurants
  const fetchRestaurants = async (params = {}) => {
    try {
      setLoading(true);
      const data = await restaurantService.getAllRestaurants(params);
      setRestaurants(data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get restaurant by ID
  const getRestaurantById = async (restaurantId) => {
    try {
      return await restaurantService.getRestaurantById(restaurantId);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  };

  // Get my restaurant (for restaurant owners)
  const getMyRestaurant = async () => {
    try {
      return await restaurantService.getMyRestaurant();
    } catch (error) {
      console.error('Error fetching my restaurant:', error);
      throw error;
    }
  };

  // Update restaurant
  const updateRestaurant = async (restaurantId, data) => {
    try {
      const updated = await restaurantService.updateRestaurant(restaurantId, data);
      setRestaurants(prev =>
        prev.map(r => (r._id === restaurantId ? updated : r))
      );
      return updated;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  };

  // Rate restaurant
  const rateRestaurant = async (restaurantId, rating) => {
    try {
      const result = await restaurantService.rateRestaurant(restaurantId, rating);
      // Refresh restaurants list
      await fetchRestaurants();
      return result;
    } catch (error) {
      console.error('Error rating restaurant:', error);
      throw error;
    }
  };

  // Get pending restaurants (admin)
  const getPendingRestaurants = async () => {
    try {
      return await restaurantService.getPendingRestaurants();
    } catch (error) {
      console.error('Error fetching pending restaurants:', error);
      throw error;
    }
  };

  // Approve restaurant (admin)
  const approveRestaurant = async (restaurantId) => {
    try {
      return await restaurantService.approveRestaurant(restaurantId);
    } catch (error) {
      console.error('Error approving restaurant:', error);
      throw error;
    }
  };

  // Reject restaurant (admin)
  const rejectRestaurant = async (restaurantId) => {
    try {
      return await restaurantService.rejectRestaurant(restaurantId);
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      throw error;
    }
  };

  // Delete restaurant (admin)
  const deleteRestaurant = async (restaurantId) => {
    try {
      await restaurantService.deleteRestaurant(restaurantId);
      setRestaurants(prev => prev.filter(r => r._id !== restaurantId));
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  };

  // Get all approved restaurants (local filter)
  const getApprovedRestaurants = () => {
    return restaurants.filter(rest => rest.approvalStatus === 'approved');
  };

  // Search restaurants (local filter)
  const searchRestaurants = (query) => {
    return restaurants.filter(
      rest =>
        rest.name.toLowerCase().includes(query.toLowerCase()) ||
        rest.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter by category (local filter)
  const filterByCategory = (category) => {
    return restaurants.filter(rest =>
      rest.categories?.includes(category)
    );
  };

  // Get restaurants by location (local filter)
  const getRestaurantsByLocation = (location) => {
    return restaurants.filter(
      rest => rest.location?.toLowerCase().includes(location.toLowerCase())
    );
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        loading,
        fetchRestaurants,
        getRestaurantById,
        getMyRestaurant,
        updateRestaurant,
        rateRestaurant,
        getPendingRestaurants,
        approveRestaurant,
        rejectRestaurant,
        deleteRestaurant,
        getApprovedRestaurants,
        searchRestaurants,
        filterByCategory,
        getRestaurantsByLocation,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};
