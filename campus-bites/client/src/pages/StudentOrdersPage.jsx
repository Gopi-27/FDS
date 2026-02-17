import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Package, ChevronRight, Loader, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrder } from '../contexts/OrderContext';

const StudentOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, fetchUserOrders, rateOrder } = useOrder();
  const [activeTab, setActiveTab] = useState('active');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch user orders on mount and set up auto-refresh
  useEffect(() => {
    const loadOrders = async () => {
      try {
        await fetchUserOrders();
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadOrders();
    
    // Auto-refresh every 30 seconds silently for live status updates
    const interval = setInterval(() => {
      fetchUserOrders(true); // Silent refresh - no loading spinner
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRestaurantName = (restaurant) => {
    if (typeof restaurant === 'string') return 'Restaurant';
    return restaurant?.name || 'Restaurant';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 text-blue-600';
      case 'placed':
        return 'bg-blue-100 text-blue-600';
      case 'preparing':
        return 'bg-orange-100 text-orange-600';
      case 'ready':
        return 'bg-green-100 text-green-600';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleRateOrder = (order) => {
    setSelectedOrder(order);
    setRating(0);
    setReview('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await rateOrder(selectedOrder._id, rating, review);
      setShowRatingModal(false);
      setSelectedOrder(null);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Order Card Component
  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">Order #{order._id.slice(-6)}</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{getRestaurantName(order.restaurant)}</p>
        </div>
        <ChevronRight className="text-gray-400" />
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs mb-1">Items</p>
          <p className="font-bold">{order.items?.length || 0} items</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Total</p>
          <p className="font-bold text-primary">₹{order.totalAmount || 0}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Payment</p>
          <p className="font-bold">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Time</p>
          <p className="font-bold flex items-center gap-1">
            <Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-600 mb-2">Items:</p>
        <div className="space-y-1">
          {order.items?.slice(0, 3).map((item, idx) => (
            <p key={idx} className="text-sm text-gray-700">
              {item.quantity}x {item.menuItem?.name || 'Item'}
            </p>
          ))}
          {order.items?.length > 3 && (
            <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
          )}
        </div>
      </div>

      {/* Rating Section */}
      {order.status === 'Completed' && (
        <div className="mt-3 pt-3 border-t">
          {order.rating ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= order.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">You rated this order</span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRateOrder(order);
              }}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold transition flex items-center justify-center gap-2"
            >
              <Star size={18} />
              Rate Your Experience
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Group orders by status
  const activeOrders = orders.filter(o => ['Placed', 'Preparing', 'Ready'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'Completed');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-primary" size={48} />
          <p className="ml-4 text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 mt-6">
      <h2 className="text-3xl font-bold mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg mb-4">No orders placed yet</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
          >
            Order Now
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-bold border-b-2 transition ${
                activeTab === 'active'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              🔥 Active Orders ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 font-bold border-b-2 transition ${
                activeTab === 'completed'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              ✅ Completed ({completedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-3 font-bold border-b-2 transition ${
                activeTab === 'cancelled'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              ❌ Cancelled ({cancelledOrders.length})
            </button>
          </div>

          {/* Active Orders Tab */}
          {activeTab === 'active' && (
            <div>
              {activeOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">No active orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map(order => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Orders Tab */}
          {activeTab === 'completed' && (
            <div>
              {completedOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">No completed orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedOrders.map(order => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cancelled Orders Tab */}
          {activeTab === 'cancelled' && (
            <div>
              {cancelledOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">No cancelled orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cancelledOrders.map(order => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Rate Your Order</h3>
            <p className="text-gray-600 mb-4">
              How was your experience with {getRestaurantName(selectedOrder.restaurant)}?
            </p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transform hover:scale-110 transition"
                >
                  <Star
                    size={40}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience (optional)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              rows="4"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedOrder(null);
                  setRating(0);
                  setReview('');
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border rounded-lg font-bold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submitting || rating === 0}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOrdersPage;
