import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';

const Toast = () => {
  const { toast } = useOrder();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
      isSuccess
        ? 'bg-green-500 text-white'
        : 'bg-orange-500 text-white'
    }`}>
      {isSuccess ? (
        <CheckCircle size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
};

export default Toast;
