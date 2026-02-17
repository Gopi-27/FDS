import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-3">CampusBites 🍔</h3>
            <p className="text-gray-400 text-sm">The ultimate multi-restaurant food ordering platform for campus.</p>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-bold mb-4 text-white">For Customers</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
              <li><Link to="/restaurants" className="hover:text-primary transition">Browse Restaurants</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition">My Orders</Link></li>
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h4 className="font-bold mb-4 text-white">For Restaurants</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="#register" className="hover:text-primary transition">Register Restaurant</a></li>
              <li><a href="#features" className="hover:text-primary transition">Features</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white">Contact</h4>
            <div className="flex gap-4 text-gray-400 mb-4">
              <Facebook size={20} className="cursor-pointer hover:text-primary transition" />
              <Instagram size={20} className="cursor-pointer hover:text-primary transition" />
              <Twitter size={20} className="cursor-pointer hover:text-primary transition" />
              <Mail size={20} className="cursor-pointer hover:text-primary transition" />
            </div>
            <p className="text-sm">support@campusbites.edu</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2026 CampusBites. Built for College Innovation.</p>
            <p className="mt-2 text-xs">Multi-Restaurant Food Ordering Platform</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
