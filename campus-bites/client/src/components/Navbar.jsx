import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-primary">
          CampusBites 🍔
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center font-medium">
          {!user ? (
            <>
              <Link to="/" className="hover:text-primary transition">Home</Link>
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Login
              </Link>
            </>
          ) : user.role === 'student' ? (
            <>
              <Link to="/restaurants" className="hover:text-primary transition">
                Restaurants
              </Link>
              <Link to="/orders" className="hover:text-primary transition">
                My Orders
              </Link>
              <Link to="/cart" className="hover:text-primary flex items-center gap-2 relative">
                <ShoppingBag size={20} />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : user.role === 'restaurant' ? (
            <>
              <Link to="/restaurant/dashboard" className="hover:text-primary transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : user.role === 'admin' ? (
            <>
              <Link to="/admin" className="hover:text-primary transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : null}
        </div>

        {/* User Info & Mobile Menu Button */}
        <div className="flex md:hidden gap-4 items-center">
          {user && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <User size={18} />
              <span className="text-sm font-bold">{user.role}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-primary transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-gray-50 p-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
          {!user ? (
            <>
              <Link to="/" className="block px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                Home
              </Link>
              <Link
                to="/login"
                className="block px-4 py-2 bg-primary text-white rounded-lg font-bold text-center"
              >
                Login
              </Link>
            </>
          ) : user.role === 'student' ? (
            <>
              <Link to="/restaurants" className="block px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                Restaurants
              </Link>
              <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                My Orders
              </Link>
              <Link to="/cart" className="block px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition text-left"
              >
                Logout
              </button>
            </>
          ) : user.role === 'restaurant' ? (
            <>
              <Link to="/restaurant/dashboard" className="block px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition text-left"
              >
                Logout
              </button>
            </>
          ) : user.role === 'admin' ? (
            <>
              <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition text-left"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
