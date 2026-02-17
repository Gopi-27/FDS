import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartModal = () => {
  const { cartModal, setCartModal } = useCart();

  if (!cartModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl animate-in scale-in duration-300">
        <div className="flex items-center gap-4 mb-6">
          <AlertCircle className="text-orange-500" size={32} />
          <h2 className="text-xl font-bold">Clear Cart?</h2>
        </div>

        <p className="text-gray-600 mb-6">
          {cartModal.message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={cartModal.onCancel}
            className="flex-1 px-4 py-2 border rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Keep Items
          </button>
          <button
            onClick={cartModal.onConfirm}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-600 transition"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
