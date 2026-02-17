import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Package, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { useOrder } from '../contexts/OrderContext';
import { useRestaurant } from '../contexts/RestaurantContext';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { menuItems, loading: menuLoading, fetchMyMenuItems, addMenuItem, deleteMenuItem } = useMenu();
  const { orders, loading: ordersLoading, fetchRestaurantOrders, updateOrderStatus, getRestaurantStats } = useOrder();
  const { updateRestaurant, getRestaurantById } = useRestaurant();
  const [activeTab, setActiveTab] = useState('preparing');
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, totalRevenue: 0, averageOrderValue: 0 });
  const [restaurantData, setRestaurantData] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    type: '',
    image: '',
  });

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get restaurant data first
        if (user?.restaurant) {
          const restaurantId = user.restaurant._id || user.restaurant;
          const restaurant = await getRestaurantById(restaurantId);
          setRestaurantData(restaurant);
          setIsOpen(restaurant?.isOpen ?? true);
        }
        
        await Promise.all([
          fetchMyMenuItems(),
          fetchRestaurantOrders()
        ]);
        // Fetch stats
        const statsData = await getRestaurantStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newItem.name || !newItem.price || !newItem.category || !newItem.type) {
      alert('Please fill in all required fields: Name, Price, Category, and Type');
      return;
    }

    try {
      const itemData = {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        category: newItem.category,
        type: newItem.type,
        image: newItem.image || 'https://via.placeholder.com/400x300?text=Food',
      };
      
      console.log('Adding menu item:', itemData);
      
      await addMenuItem(itemData);
      
      // Clear form and hide it
      setNewItem({ name: '', description: '', price: '', category: '', type: '', image: '' });
      setShowAddForm(false);
      
      // Refresh menu items to ensure we have latest data
      await fetchMyMenuItems();
      
      alert('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = typeof error === 'string' ? error : 'Failed to add menu item. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(itemId);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete menu item.');
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    // Refresh stats after status update
    const statsData = await getRestaurantStats();
    setStats(statsData);
  };

  const handleToggleOpen = async () => {
    try {
      if (!user?.restaurant) return;
      
      const restaurantId = user.restaurant._id || user.restaurant;
      const newOpenStatus = !isOpen;
      
      await updateRestaurant(restaurantId, { isOpen: newOpenStatus });
      setIsOpen(newOpenStatus);
      
      alert(`Restaurant ${newOpenStatus ? 'opened' : 'closed'} successfully!`);
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      alert('Failed to update restaurant status');
    }
  };

  // Get next valid status for an order
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Placed': 'Preparing',
      'Preparing': 'Ready',
      'Ready': 'Completed',
      'Completed': null
    };
    return statusFlow[currentStatus];
  };

  // Filter orders by status
  const preparingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Preparing');
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Restaurant Dashboard</h1>
            <p className="text-gray-600">Manage your menu and orders</p>
          </div>
          
          {/* Open/Closed Toggle */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Restaurant Status:</span>
              <button
                onClick={handleToggleOpen}
                className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors ${
                  isOpen ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isOpen ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-bold ${
                isOpen ? 'text-green-600' : 'text-gray-600'
              }`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isOpen ? 'Currently accepting orders' : 'Not accepting orders'}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingUp className="text-primary mb-2" />
          <p className="text-gray-600 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingUp className="text-green-500 mb-2" />
          <p className="text-gray-600 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold">{stats.completedOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingUp className="text-secondary mb-2" />
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">₹{stats.totalRevenue || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <TrendingUp className="text-blue-500 mb-2" />
          <p className="text-gray-600 text-sm mb-1">Avg Order</p>
          <p className="text-3xl font-bold">₹{stats.averageOrderValue ? Math.round(stats.averageOrderValue) : 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('preparing')}
          className={`px-6 py-3 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'preparing'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🔥 Preparing Orders ({preparingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`px-6 py-3 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'ready'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          ✅ Ready for Pickup ({readyOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'completed'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🎉 Completed ({completedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'cancelled'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          ❌ Cancelled ({cancelledOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-3 font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'menu'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Menu Management
        </button>
      </div>

      {/* Preparing Orders Tab */}
      {activeTab === 'preparing' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">🔥 Preparing Orders</h2>
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : preparingOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No orders preparing</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparingOrders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500">
                  {/* Order Header */}
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-lg">#{order._id.slice(-6)}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-orange-100 text-orange-600">
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 font-bold mb-2">Items:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.menuItem?.name || 'Item'}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Total */}
                  <p className="text-lg font-bold text-primary mb-3">₹{order.totalAmount || 0}</p>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Next Status Button */}
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                        disabled={ordersLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold transition disabled:opacity-50"
                      >
                        Mark as {getNextStatus(order.status)}
                      </button>
                    )}
                    
                    {/* Cancel Button - Only for Placed status (before preparation) */}
                    {order.status === 'Placed' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                            handleUpdateStatus(order._id, 'Cancelled');
                          }
                        }}
                        disabled={ordersLoading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ready for Pickup Tab */}
      {activeTab === 'ready' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">✅ Ready for Pickup</h2>
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : readyOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No orders ready for pickup</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
                  {/* Order Header */}
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-lg">#{order._id.slice(-6)}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-green-100 text-green-600">
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 font-bold mb-2">Items:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.menuItem?.name || 'Item'}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Total */}
                  <p className="text-lg font-bold text-primary mb-3">₹{order.totalAmount || 0}</p>

                  {/* Next Status Button */}
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                      disabled={ordersLoading}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition disabled:opacity-50"
                    >
                      Mark as {getNextStatus(order.status)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Orders Tab */}
      {activeTab === 'completed' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">🎉 Completed Orders</h2>
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No completed orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-gray-400 opacity-75">
                  {/* Order Header */}
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-lg">#{order._id.slice(-6)}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-gray-100 text-gray-600">
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 font-bold mb-2">Items:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.menuItem?.name || 'Item'}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Total */}
                  <p className="text-lg font-bold text-primary">₹{order.totalAmount || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancelled Orders Tab */}
      {activeTab === 'cancelled' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">❌ Cancelled Orders</h2>
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : cancelledOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No cancelled orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cancelledOrders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-400 opacity-60">
                  {/* Order Header */}
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-lg">#{order._id.slice(-6)}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-red-100 text-red-600">
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 font-bold mb-2">Items:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.menuItem?.name || 'Item'}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Total */}
                  <p className="text-lg font-bold text-primary mb-2">₹{order.totalAmount || 0}</p>
                  
                  {/* Cancelled Date */}
                  <p className="text-xs text-gray-500">
                    Cancelled: {new Date(order.updatedAt).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Menu Items</h2>
            <button
              onClick={() => {
                if (!showAddForm) {
                  // Reset form when opening
                  setNewItem({ name: '', description: '', price: '', category: '', type: '', image: '' });
                }
                setShowAddForm(!showAddForm);
              }}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                showAddForm ? 'bg-gray-500 text-white' : 'bg-primary text-white'
              }`}
            >
              <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Item'}
            </button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <form 
              onSubmit={handleAddItem} 
              className="bg-white p-6 rounded-xl shadow-sm border border-primary/20 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={(e) => {
                    console.log('Name changed to:', e.target.value);
                    setNewItem({ ...newItem, name: e.target.value });
                  }}
                  required
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => {
                    console.log('Price changed to:', e.target.value);
                    setNewItem({ ...newItem, price: e.target.value });
                  }}
                  required
                  step="0.01"
                  min="0"
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Burger">Burger</option>
                  <option value="Biryani">Biryani</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Salad">Salad</option>
                  <option value="Sandwich">Sandwich</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Indian">Indian</option>
                  <option value="Continental">Continental</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  required
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Type</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Image URL"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
                Add Item
              </button>
            </form>
          )}

          {/* Menu Items List */}
          {menuLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-gray-500">No menu items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white p-5 rounded-xl shadow-sm border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      )}
                      <p className="text-primary font-bold">₹{item.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        disabled={menuLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    item.type === 'veg'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
