import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams
} from 'react-router-dom';
import { ArrowRight, Check, AlertCircle, Loader } from 'lucide-react';

// ===== CONTEXTS =====
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';

// ===== PAGES =====
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import StudentOrdersPage from './pages/StudentOrdersPage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import AdminDashboard from './pages/AdminDashboard';

// ===== COMPONENTS =====
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CartModal from './components/CartModal';
import { ProtectedRoute, GuestOnlyRoute } from './components/ProtectedRoute';
import { useCart } from './contexts/CartContext';
import { useOrder } from './contexts/OrderContext';

// ============ HOME PAGE ============
const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { restaurants, fetchRestaurants } = useRestaurant();
  const [restaurantCount, setRestaurantCount] = useState(0);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants({ approvalStatus: 'approved' });
        setRestaurantCount(data.length);
      } catch (error) {
        console.error('Error loading restaurants:', error);
      }
    };
    loadRestaurants();
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      <section className="bg-gradient-to-r from-primary to-red-500 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Fresh Food, <span className="text-yellow-300">Zero Queues.</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-gray-100">
            Order from multiple campus restaurants. Fast, easy, delicious.
          </p>
          <button
            onClick={() => navigate(user ? '/restaurants' : '/signup')}
            className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition flex items-center justify-center gap-2 mx-auto"
          >
            {user ? 'Order Now' : 'Get Started'} <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CampusBites?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-2">
                {restaurantCount > 0 ? `${restaurantCount}+` : '5+'} Restaurants
              </h3>
              <p className="text-gray-600">Browse diverse restaurants in one app</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Fast & Easy</h3>
              <p className="text-gray-600">Order in seconds, skip the queue</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">Watch your order being prepared live</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">For Restaurant Owners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-2xl font-bold mb-4">Grow Your Business</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-center gap-2"><Check className="text-green-500" /> Reach more students</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" /> Reduce manual orders</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" /> Increase sales</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" /> Track analytics</li>
              </ul>
              <button
                onClick={() => navigate('/register-restaurant')}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Register Your Restaurant
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-2xl font-bold mb-4">Easy Dashboard</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2"><Check className="text-green-500" /> Manage menu</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" /> See live orders</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" /> Update status</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" /> View analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

// ============ LOGIN PAGE ============
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else {
        navigate('/restaurants');
      }
    } catch (err) {
      setError(err || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border">
        <h2 className="text-3xl font-bold text-center mb-2">Sign In</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email and password
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-600"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-primary font-bold hover:underline"
          >
            Sign Up
          </button>
        </div>

        <div className="mt-4 text-sm text-center text-gray-600">
          Restaurant owner?{' '}
          <button
            onClick={() => navigate('/register-restaurant')}
            className="text-primary font-bold hover:underline"
          >
            Register Restaurant
          </button>
        </div>

        {/* <div className="mt-6 text-sm text-center text-gray-500">
          Admin Demo: admin@campus.edu / admin123
        </div> */}
        
      </div>
    </div>
  );
};

// ============ STUDENT SIGNUP PAGE ============
const StudentSignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'student'
      });

      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-gray-600 text-center mb-6">
          Sign up as a student
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="email"
            placeholder="College Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-600"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-bold hover:underline"
          >
            Sign In
          </button>
        </div>

        <div className="mt-4 text-sm text-center text-gray-600">
          Restaurant owner?{' '}
          <button
            onClick={() => navigate('/register-restaurant')}
            className="text-primary font-bold hover:underline"
          >
            Register Restaurant
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ RESTAURANT REGISTRATION ============
const RestaurantRegistrationPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantData: {
      name: '',
      description: '',
      location: '',
      customerCareNumber: '',
      categories: '',
      logo: ''
    }
  });
  const [error, setError] = useState('');

  const locations = [
    'North Campus',
    'Central Campus',
    'South Campus',
    'East Campus',
    'Library Building'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.restaurantData.name || !formData.restaurantData.description || !formData.restaurantData.location || !formData.restaurantData.customerCareNumber) {
      setError('Please fill all required restaurant details');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.restaurantData.customerCareNumber.replace(/[-\s]/g, ''))) {
      setError('Please enter a valid 10-digit customer care number');
      return;
    }

    try {
      const categoriesArray = formData.restaurantData.categories
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'restaurant',
        restaurantData: {
          name: formData.restaurantData.name,
          description: formData.restaurantData.description,
          location: formData.restaurantData.location,
          customerCareNumber: formData.restaurantData.customerCareNumber,
          categories: categoriesArray,
          logo: formData.restaurantData.logo || undefined
        }
      });

      alert('Restaurant registered successfully! Awaiting admin approval.');
      navigate('/login');
    } catch (err) {
      setError(err || 'Registration failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 mt-6 mb-10">
      <h1 className="text-3xl font-bold mb-2">Register Your Restaurant</h1>
      <p className="text-gray-600 mb-8">
        Fill in the details below to register your restaurant on CampusBites
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-sm border space-y-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div>
          <h3 className="font-bold text-lg mb-4">Owner Details</h3>

          <input
            type="text"
            placeholder="Your Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">Restaurant Details</h3>

          <input
            type="text"
            placeholder="Restaurant Name"
            value={formData.restaurantData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantData: { ...formData.restaurantData, name: e.target.value }
              })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <textarea
            placeholder="Restaurant Description"
            value={formData.restaurantData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantData: { ...formData.restaurantData, description: e.target.value }
              })
            }
            rows="3"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <select
            value={formData.restaurantData.location}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantData: { ...formData.restaurantData, location: e.target.value }
              })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <input
            type="tel"
            placeholder="Customer Care Number (10 digits)"
            value={formData.restaurantData.customerCareNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantData: { ...formData.restaurantData, customerCareNumber: e.target.value }
              })
            }
            required
            maxLength="10"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <input
            type="text"
            placeholder="Categories (e.g., Pizza, Italian, Burgers)"
            value={formData.restaurantData.categories}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantData: { ...formData.restaurantData, categories: e.target.value }
              })
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />

          <input
            type="url"
            placeholder="Logo URL (optional)"
            value={formData.restaurantData.logo}
            onChange={(e) =>
              setFormData({
                ...formData,
                restaurantData: { ...formData.restaurantData, logo: e.target.value }
              })
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-600"
        >
          Register Restaurant
        </button>

        <div className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

// ============ CART PAGE ============
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateItemQuantity, clearCart, getCartTotal, prepareOrderData } = useCart();
  const { placeOrder } = useOrder();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [method, setMethod] = useState('');
  const total = getCartTotal();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-10">
        <p className="text-gray-500 mb-4">Cart is empty</p>
        <button onClick={() => navigate('/restaurants')} className="bg-primary text-white px-6 py-2 rounded-lg">
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleOrder = async () => {
    try {
      const orderData = prepareOrderData(method);
      await placeOrder(orderData);
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Order placement error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 mt-6 mb-10">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>

      <div className="bg-white rounded-xl border overflow-hidden mb-6">
        {cart.items.map(item => (
          <div key={item.id} className="p-4 border-b flex justify-between items-center">
            <div className="flex-1">
              <h4 className="font-bold">{item.name}</h4>
              <p className="text-sm text-gray-600">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateItemQuantity(item.id, item.qty - 1)} className="w-8 h-8 border rounded">-</button>
              <span className="font-bold">{item.qty}</span>
              <button onClick={() => updateItemQuantity(item.id, item.qty + 1)} className="w-8 h-8 border rounded">+</button>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 ml-4">Remove</button>
            </div>
          </div>
        ))}
        <div className="p-4 bg-gray-50 flex justify-between font-bold border-t">
          <span>Total</span>
          <span className="text-primary text-xl">₹{total}</span>
        </div>
      </div>

      {!showPayment ? (
        <button onClick={() => setShowPayment(true)} className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800">
          Proceed to Payment
        </button>
      ) : (
        <div className="bg-white border-2 border-primary p-6 rounded-lg">
          <h3 className="font-bold mb-4">Payment Method</h3>
          <div className="space-y-3 mb-4">
            {[{id: 'UPI', label: 'UPI'}, {id: 'Cash', label: 'Cash'}, {id: 'Card', label: 'Card'}].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full p-3 border rounded-lg text-left ${method === m.id ? 'border-primary bg-primary/5' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {method && (
            <button onClick={handleOrder} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold">
              Confirm Order ₹{total}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============ ORDER TRACKING ============
const OrderTrackingPage = () => {
  const { id } = useParams();
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const steps = ['Placed', 'Preparing', 'Ready', 'Completed'];
  const currentStep = steps.indexOf(order?.status || 'Placed');

  useEffect(() => {
    const loadOrder = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    loadOrder();

    // Auto-refresh every 15 seconds silently for live updates
    const interval = setInterval(() => {
      loadOrder(true); // Silent refresh
    }, 15000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!order) return <div className="text-center mt-10">Order not found</div>;

  return (
    <div className="max-w-md mx-auto p-8 mt-10">
      <div className="bg-white rounded-2xl border p-8">
        <h2 className="text-2xl font-bold text-center mb-4">Track Order</h2>
        <p className="text-center text-primary font-bold text-lg mb-8 uppercase">
          {order.status}
        </p>
        
        <div className="space-y-6 mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                  i <= currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${i <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step === 'Ready' ? 'Ready for Pickup' : step === 'Completed' ? 'Collected' : step}
                </p>
                {i === currentStep && order.statusHistory && order.statusHistory[i] && (
                  <p className="text-xs text-gray-500">
                    {new Date(order.statusHistory[i].timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.href = '/orders'}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

// ============ MAIN APP ============
function AppContent() {
  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
          <Route path="/signup" element={<GuestOnlyRoute><StudentSignupPage /></GuestOnlyRoute>} />
          <Route path="/register-restaurant" element={<RestaurantRegistrationPage />} />

          <Route
            path="/restaurants"
            element={<ProtectedRoute requiredRole="student"><RestaurantsPage /></ProtectedRoute>}
          />
          <Route
            path="/restaurant/:restaurantId"
            element={<ProtectedRoute requiredRole="student"><RestaurantMenuPage /></ProtectedRoute>}
          />
          <Route
            path="/cart"
            element={<ProtectedRoute requiredRole="student"><CartPage /></ProtectedRoute>}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute requiredRole="student"><StudentOrdersPage /></ProtectedRoute>}
          />
          <Route
            path="/track/:id"
            element={<ProtectedRoute requiredRole="student"><OrderTrackingPage /></ProtectedRoute>}
          />

          <Route
            path="/restaurant/dashboard"
            element={<ProtectedRoute requiredRole="restaurant"><RestaurantDashboard /></ProtectedRoute>}
          />

          <Route
            path="/admin"
            element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
      <CartModal />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <MenuProvider>
            <CartProvider>
              <OrderProvider>
                <AppContent />
              </OrderProvider>
            </CartProvider>
          </MenuProvider>
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
