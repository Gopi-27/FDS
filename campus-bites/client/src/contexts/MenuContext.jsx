import React, { createContext, useContext, useState } from 'react';
import { menuService } from '../services/menuService';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch menu for a specific restaurant
  const fetchRestaurantMenu = async (restaurantId, params = {}) => {
    try {
      setLoading(true);
      const data = await menuService.getMenuByRestaurant(restaurantId, params);
      setMenuItems(data);
      return data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add menu item (restaurant owner)
  const addMenuItem = async (itemData) => {
    try {
      console.log('MenuContext: Adding item with data:', itemData);
      const newItem = await menuService.createMenuItem(itemData);
      console.log('MenuContext: Item created successfully:', newItem);
      setMenuItems(prev => {
        const updated = [...prev, newItem];
        console.log('MenuContext: Updated menu items:', updated);
        return updated;
      });
      return newItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  };

  // Update menu item
  const updateMenuItem = async (itemId, updatedData) => {
    try {
      const updated = await menuService.updateMenuItem(itemId, updatedData);
      setMenuItems(prev =>
        prev.map(item => (item._id === itemId ? updated : item))
      );
      return updated;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  // Delete menu item
  const deleteMenuItem = async (itemId) => {
    try {
      await menuService.deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  // Toggle item availability
  const toggleItemAvailability = async (itemId) => {
    try {
      const updated = await menuService.toggleAvailability(itemId);
      setMenuItems(prev =>
        prev.map(item => (item._id === itemId ? updated : item))
      );
      return updated;
    } catch (error) {
      console.error('Error toggling availability:', error);
      throw error;
    }
  };

  // Fetch my menu items (restaurant owner)
  const fetchMyMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMyMenuItems();
      setMenuItems(data);
      return data;
    } catch (error) {
      console.error('Error fetching my menu:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get menu items for specific restaurant (local filter if already loaded)
  const getRestaurantMenu = (restaurantId) => {
    return menuItems.filter(item => item.restaurant === restaurantId);
  };

  // Get single menu item (local filter)
  const getMenuItem = (itemId) => {
    return menuItems.find(item => item._id === itemId);
  };

  // Get menu items by category (local filter)
  const getMenuByCategory = (category) => {
    return menuItems.filter(item => item.category === category);
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        fetchRestaurantMenu,
        fetchMyMenuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        getRestaurantMenu,
        getMenuItem,
        getMenuByCategory,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};
