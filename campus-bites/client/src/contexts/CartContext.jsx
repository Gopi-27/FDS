import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // { restaurantId, restaurantName, items: [] }
  const [cartModal, setCartModal] = useState(null); // For showing confirmation modal

  // Add item to cart
  const addToCart = (item, restaurantId, restaurantName) => {
    // Check if cart is empty or from same restaurant
    if (cart && cart.restaurantId !== restaurantId) {
      // Show modal to ask user
      setCartModal({
        type: 'clear-confirmation',
        message: `Your cart contains items from ${cart.restaurantName || cart.restaurantId}. Clear cart?`,
        onConfirm: () => {
          createNewCart(item, restaurantId, restaurantName);
          setCartModal(null);
        },
        onCancel: () => setCartModal(null),
      });
      return;
    }

    if (!cart) {
      createNewCart(item, restaurantId, restaurantName);
    } else {
      // Add to existing cart
      updateCartItem(item, restaurantId);
    }
  };

  // Create new cart
  const createNewCart = (item, restaurantId, restaurantName) => {
    setCart({
      restaurantId,
      restaurantName,
      items: [{ ...item, qty: 1 }],
    });
  };

  // Update quantity in cart
  const updateCartItem = (item, restaurantId) => {
    if (!cart) return;

    const itemId = item._id || item.id;

    setCart(prev => {
      const existingItem = prev.items.find(i => (i._id || i.id) === itemId);
      if (existingItem) {
        // Item already in cart, increase quantity
        return {
          ...prev,
          items: prev.items.map(i =>
            (i._id || i.id) === itemId ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      // New item, add it to cart
      return {
        ...prev,
        items: [...prev.items, { ...item, qty: 1 }],
      };
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    if (!cart) return;

    const updatedItems = cart.items.filter(i => i.id !== itemId);
    if (updatedItems.length === 0) {
      setCart(null);
    } else {
      setCart({ ...cart, items: updatedItems });
    }
  };

  // Update item quantity
  const updateItemQuantity = (itemId, qty) => {
    if (!cart) return;

    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.id === itemId ? { ...i, qty } : i
        ),
      }));
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCart(null);
  };

  // Get cart total
  const getCartTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.price * item.qty, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    if (!cart) return 0;
    return cart.items.reduce((count, item) => count + item.qty, 0);
  };

  // Prepare order data for API
  const prepareOrderData = (paymentMethod) => {
    if (!cart) return null;
    
    return {
      restaurantId: cart.restaurantId,
      items: cart.items.map(item => ({
        menuItem: item._id || item.id, // Support both _id (from API) and id (old format)
        quantity: item.qty,
      })),
      paymentMethod,
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        prepareOrderData,
        cartModal,
        setCartModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
