import React, { useState, useEffect } from 'react';
import { Check, X, TrendingUp, Users, Building2 } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useOrder } from '../contexts/OrderContext';

const AdminDashboard = () => {
  const { 
    approveRestaurant, 
    rejectRestaurant, 
    getPendingRestaurants,
    fetchRestaurants,
    deleteRestaurant,
    restaurants 
  } = useRestaurant();
  const { getPlatformStats } = useOrder();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const pending = await getPendingRestaurants();
      setPendingRestaurants(pending || []);
      await fetchRestaurants();
      
      // Fetch platform stats
      try {
        const platformStats = await getPlatformStats();
        setStats(platformStats || {
          totalOrders: 0,
          totalRevenue: 0,
          completedOrders: 0,
          averageOrderValue: 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPendingRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId) => {
    try {
      await approveRestaurant(restaurantId);
      alert('Restaurant approved!');
      // Reload data to update the lists
      await loadData();
    } catch (error) {
      console.error('Error approving restaurant:', error);
      alert('Failed to approve restaurant');
    }
  };

  const handleReject = async (restaurantId) => {
    try {
      await rejectRestaurant(restaurantId);
      alert('Restaurant rejected!');
      // Reload data to update the lists
      await loadData();
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      alert('Failed to reject restaurant');
    }
  };

  const handleRemove = async (restaurantId, restaurantName) => {
    if (window.confirm(`Are you sure you want to remove ${restaurantName}? This action cannot be undone.`)) {
      try {
        await deleteRestaurant(restaurantId);
        alert('Restaurant removed successfully!');
      } catch (error) {
        console.error('Error removing restaurant:', error);
        alert('Failed to remove restaurant');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform and restaurants</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <TrendingUp className="text-primary mb-2" />
              <p className="text-gray-600 text-sm mb-1">Platform Orders</p>
              <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <TrendingUp className="text-green-500 mb-2" />
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.totalRevenue || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <Building2 className="text-secondary mb-2" />
              <p className="text-gray-600 text-sm mb-1">Active Restaurants</p>
              <p className="text-3xl font-bold">{restaurants?.length || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <Users className="text-blue-500 mb-2" />
              <p className="text-gray-600 text-sm mb-1">Pending Approvals</p>
              <p className="text-3xl font-bold">{pendingRestaurants?.length || 0}</p>
            </div>
          </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-bold border-b-2 transition relative ${
            activeTab === 'pending'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Pending Restaurants
          {pendingRestaurants?.length > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingRestaurants.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-bold border-b-2 transition ${
            activeTab === 'active'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Active Restaurants
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-bold border-b-2 transition ${
            activeTab === 'stats'
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Platform Stats
        </button>
      </div>

      {/* Pending Restaurants Tab */}
      {activeTab === 'pending' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Pending Restaurant Approvals</h2>
          {!pendingRestaurants || pendingRestaurants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Check className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-500">All pending approvals completed!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRestaurants.map(restaurant => (
                <div key={restaurant._id} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{restaurant.email}</p>
                      <p className="text-sm text-gray-500">Owner: {restaurant.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Location</p>
                      <p className="font-bold">{restaurant.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.categories && restaurant.categories.slice(0, 2).map(cat => (
                          <span key={cat} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(restaurant._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(restaurant._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Restaurants Tab */}
      {activeTab === 'active' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Active Restaurants</h2>
          {!restaurants || restaurants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No active restaurants</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurants.map(restaurant => (
                <div key={restaurant._id} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{restaurant.email}</p>
                      <div className="flex items-center gap-2">
                        ⭐ {restaurant.rating} / 5 ({restaurant.totalRatings} ratings)
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(restaurant._id, restaurant.name)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Remove restaurant"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Owner:</strong> {restaurant.ownerName}</p>
                    <p><strong>Location:</strong> {restaurant.location}</p>
                    <p><strong>Joined:</strong> {restaurant.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Platform Stats Tab */}
      {activeTab === 'stats' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Orders */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <p className="text-gray-600 mb-2">Total Orders</p>
              <p className="text-5xl font-bold text-primary mb-4">{stats?.totalOrders || 0}</p>
              <p className="text-sm text-gray-500">Across all restaurants</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <p className="text-gray-600 mb-2">Total Revenue</p>
              <p className="text-5xl font-bold text-green-500 mb-4">₹{stats?.totalRevenue || 0}</p>
              <p className="text-sm text-gray-500">Platform wide income</p>
            </div>

            {/* Completed Orders */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <p className="text-gray-600 mb-2">Completed Orders</p>
              <p className="text-5xl font-bold text-blue-500 mb-4">{stats?.completedOrders || 0}</p>
              <p className="text-sm text-gray-500">Successfully delivered</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <p className="text-gray-600 mb-2">Average Order Value</p>
              <p className="text-5xl font-bold text-secondary mb-4">₹{stats?.averageOrderValue ? Math.round(stats.averageOrderValue) : 0}</p>
              <p className="text-sm text-gray-500">Per order average</p>
            </div>
          </div>

          {/* Health Check */}
          <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Check className="text-green-500" /> Platform Health
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ <strong>{restaurants?.length || 0}</strong> restaurants active</p>
              <p>✓ Platform running smoothly</p>
              <p>✓ All systems operational</p>
            </div>
          </div>
        </div>
      )}
      </>
    )}
    </div>
  );
};

export default AdminDashboard;
