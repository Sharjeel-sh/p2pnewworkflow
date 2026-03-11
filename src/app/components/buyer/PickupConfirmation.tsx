import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Phone, MessageCircle } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { BuyerBottomNav } from './BuyerBottomNav';
import { useApp } from '../../context/AppContext';

export function PickupConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, organizations } = useApp();

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Order not found.</p>
        </div>
      </MobileLayout>
    );
  }

  const org = organizations.find(o => o.id === order.orgId);
  const steps = ['pending', 'accepted', 'preparing', 'ready'];
  const labels = ['Order Confirmed', 'Preparing', 'Ready for Pickup'];
  const currentIdx = steps.indexOf(order.status);

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const pickupTime = formatDate(new Date(Date.parse(order.createdAt) + 30 * 60 * 1000).toISOString());

  const paymentLabel = order.paymentMethod === 'cod' ? 'Cash on Pickup' : order.paymentMethod;

  return (
    <MobileLayout>
      {/* Success header */}
      <div className=" bg-red-700 text-white px-5 py-9 flex items-center gap-3">
        <CheckCircle size={22} />
        <h2 className="flex-1 font-bold">Order Placed Successfully</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Basic info */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <p className="text-stone-700 text-sm">Order no</p>
          <p className="font-semibold">#{order.id.slice(-6).toUpperCase()}</p>
          {org && (
            <>
              <p className="mt-2 text-stone-700 text-sm">Restaurant</p>
              <p className="font-semibold">{org.orgName}</p>
            </>
          )}
          {org && (
            <>
              <p className="mt-2 text-stone-700 text-sm">Pickup Location</p>
              <p className="text-stone-600 text-sm">{org.address}</p>
            </>
          )}
          <p className="mt-2 text-stone-700 text-sm">Estimated Pickup Time</p>
          <p className="font-semibold">{pickupTime}</p>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h3 className="text-stone-700 font-bold mb-2">Order Summary</h3>
          <div className="space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity}× {item.dish.name}</span>
                <span className="text-stone-700">Rs. {item.dish.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-1 mt-2 flex justify-between font-bold">
              <span className="text-stone-800">Total</span>
              <span className="text-red-800">Rs. {order.total}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <p className="text-stone-700 text-sm">Payment Method</p>
          <p className="font-semibold">{paymentLabel}</p>
        </div>

        {/* Status steps */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h3 className="text-stone-700 font-bold mb-2">Order Status</h3>
          <div className="space-y-2">
            {labels.map((label, idx) => {
              const done = idx <= currentIdx;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${done ? 'bg-green-600' : 'bg-gray-300'}`} />
                  <span className={`${done ? 'text-stone-800 font-semibold' : 'text-stone-400'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pickup message */}
        <div className="bg-green-50 rounded-2xl shadow-md p-4">
          <p className="text-green-800 text-sm">Please collect your order from the restaurant at the selected pickup time.</p>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="p-5 bg-white border-t border-gray-100 space-y-3">
        <button
          onClick={() => navigate(`/buyer/order/${order.id}`)}
          className="w-full bg-gray-100 text-stone-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors"
        >
          View Order Details
        </button>
        { /* chat is always available for pickup too */ }
        <button
          onClick={() => navigate(`/chat/${order.id}`)}
          className="w-full bg-blue-500 text-white py-3 rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} /> Chat with Kitchen & Rider
        </button>
        <button
          onClick={() => navigate('/buyer')}
          className="w-full bg-red-700 text-white py-3 rounded-2xl hover:bg-red-800 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <BuyerBottomNav />
    </MobileLayout>
  );
}
