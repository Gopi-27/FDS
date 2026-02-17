import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, ChefHat, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurants, loading, fetchRestaurants } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [error, setError] = useState(null);

  // Fetch restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        await fetchRestaurants({ approvalStatus: 'approved' });
      } catch (err) {
        console.error('Error loading restaurants:', err);
        setError('Failed to load restaurants. Please try again.');
      }
    };
    loadRestaurants();
  }, []);

  const locations = ['All', ...new Set(restaurants.map(r => r.location).filter(Boolean))];

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || r.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-primary" size={48} />
          <p className="ml-4 text-gray-600 text-lg">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-bold mb-2">Error Loading Restaurants</p>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Explore Restaurants</h1>
        <p className="text-gray-600">Discover delicious food from campus restaurants</p>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Search Bar */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <div
              key={restaurant._id}
              onClick={() => restaurant.isOpen ? handleRestaurantClick(restaurant._id) : null}
              className={`bg-white rounded-xl shadow-sm border transition overflow-hidden ${
                restaurant.isOpen 
                  ? 'hover:shadow-lg cursor-pointer' 
                  : 'opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Restaurant Image */}
              <div
                className="h-40 w-full bg-gray-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${restaurant.logo || 'https://via.placeholder.com/400x300?text=Restaurant'})` }}
              />

              {/* Restaurant Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{restaurant.description}</p>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin size={16} />
                  {restaurant.location}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(restaurant.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{restaurant.rating?.toFixed(1) || 0}</span>
                  <span className="text-xs text-gray-500">({restaurant.totalRatings || 0})</span>
                </div>

                {/* Open/Closed Status */}
                <div className="mb-3">
                  {restaurant.isOpen ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">
                      • Open Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
                      • Closed
                    </span>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {restaurant.categories && restaurant.categories.slice(0, 2).map(cat => (
                    <span key={cat} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {cat}
                    </span>
                  ))}
                  {restaurant.categories && restaurant.categories.length > 2 && (
                    <span className="text-xs text-gray-500">+{restaurant.categories.length - 2} more</span>
                  )}
                </div>

                {/* View Menu Button */}
                <button 
                  className={`w-full mt-4 py-2 rounded-lg font-bold transition ${
                    restaurant.isOpen 
                      ? 'bg-primary text-white hover:bg-red-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!restaurant.isOpen}
                >
                  {restaurant.isOpen ? 'View Menu' : 'Currently Closed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
