import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ShoppingBag, CheckCircle, ArrowLeft, Loader, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useMenu } from '../contexts/MenuContext';

const RestaurantMenuPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const { getRestaurantById } = useRestaurant();
  const { menuItems, loading: menuLoading, fetchRestaurantMenu } = useMenu();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [animatingId, setAnimatingId] = useState(null);

  // Fetch restaurant and menu data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const restaurantData = await getRestaurantById(restaurantId);
        setRestaurant(restaurantData);
        
        // Check if restaurant is open before fetching menu
        if (!restaurantData.isOpen) {
          setError('Restaurant is currently closed');
          setLoading(false);
          return;
        }
        
        await fetchRestaurantMenu(restaurantId);
      } catch (err) {
        console.error('Error loading restaurant data:', err);
        const errorMessage = err?.message || err || 'Failed to load restaurant details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  const categories = [...new Set(menuItems.map(item => item.category))];

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-6">
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-primary" size={48} />
          <p className="ml-4 text-gray-600 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-6">
        <button
          onClick={() => navigate('/restaurants')}
          className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline"
        >
          <ArrowLeft size={20} /> Back to Restaurants
        </button>
        <div className="text-center py-12 bg-white rounded-xl border">
          {error === 'Restaurant is currently closed' ? (
            <>
              <div className="text-6xl mb-4">🚪</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant is Currently Closed</h2>
              <p className="text-gray-600 mb-6">This restaurant is not accepting orders at the moment.</p>
              <p className="text-sm text-gray-500 mb-6">Please check back later or explore other restaurants.</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-lg mb-4">{error || 'Restaurant not found'}</p>
            </>
          )}
          <button
            onClick={() => navigate('/restaurants')}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600"
          >
            Explore Other Restaurants
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (item) => {
    addToCart(item, restaurantId, restaurant?.name || 'this restaurant');
    setAnimatingId(item._id);
    setTimeout(() => setAnimatingId(null), 2000);
  };

  const currentCategoryItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto p-4 mt-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/restaurants')}
        className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline"
      >
        <ArrowLeft size={20} /> Back to Restaurants
      </button>

      {/* Restaurant Header */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
        <div
          className="h-48 w-full bg-gray-200 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.logo || 'https://via.placeholder.com/800x400?text=Restaurant'})` }}
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-600 mb-4">{restaurant.description}</p>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-500" size={18} />
              <span className="text-gray-700">{restaurant.location}</span>
            </div>

            {/* Customer Care */}
            {restaurant.customerCareNumber && (
              <div className="flex items-center gap-2">
                <Phone className="text-green-600" size={18} />
                <a 
                  href={`tel:${restaurant.customerCareNumber}`}
                  className="text-green-600 font-semibold hover:underline"
                >
                  {restaurant.customerCareNumber}
                </a>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(restaurant.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
              <span className="font-bold text-gray-900">{restaurant.rating?.toFixed(1) || 0}</span>
              <span className="text-sm text-gray-500">({restaurant.totalRatings || 0} ratings)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="md:w-1/4">
          <h3 className="font-bold text-xl mb-4">Categories</h3>
          <div className="space-y-2 sticky top-20">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="md:flex-1">
          <h2 className="text-2xl font-bold mb-6">{activeCategory}</h2>
          {menuLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary" size={40} />
            </div>
          ) : currentCategoryItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No items in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentCategoryItems.map(item => (
                <div
                  key={item._id}
                className="bg-white rounded-xl shadow-sm border p-4 flex flex-col h-full hover:shadow-md transition"
              >
                {/* Item Image */}
                <div
                  className="h-40 w-full bg-gray-200 rounded-lg mb-4 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image || 'https://via.placeholder.com/400x300?text=Food'})` }}
                />

                {/* Item Type Badge */}
                <span
                  className={`text-xs uppercase font-bold px-2 py-1 rounded w-fit mb-2 ${
                    item.type === 'veg'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.type}
                </span>

                {/* Item Name & Price */}
                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <span className="text-primary font-bold text-lg mb-4">₹{item.price}</span>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={animatingId === item._id || !item.isAvailable}
                  className={`w-full mt-auto py-2.5 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-2 ${
                    !item.isAvailable
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : animatingId === item._id
                      ? 'bg-green-500 text-white scale-95'
                      : 'bg-secondary text-white hover:bg-teal-600'
                  }`}
                >
                  {animatingId === item._id ? (
                    <>
                      Added <CheckCircle size={18} />
                    </>
                  ) : !item.isAvailable ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart && cart.restaurantId === restaurantId && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Cart ({cart.items.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;
