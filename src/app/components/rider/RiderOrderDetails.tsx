import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle, MapPin, MessageCircle, Package, BellRing } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { StatusBadge } from '../shared/StatusBadge';
import { RiderBottomNav } from './RiderBottomNav';
import { useApp } from '../../context/AppContext';

export function RiderOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentUser, orders, updateOrderStatus, acceptAssignedOrder, isChatOpen } = useApp();

  const order = orders.find(o => o.id === orderId && o.riderId === currentUser?.riderId);

  if (!order) {
    return (
      <MobileLayout>
        <TopBar title="Order Details" backTo="/rider/orders" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Order not found.</p>
        </div>
        <RiderBottomNav />
      </MobileLayout>
    );
  }

  const handleAccept = () => acceptAssignedOrder(order.id);
  const handlePickup = () => updateOrderStatus(order.id, 'picked_up');
  const handleDeliver = () => updateOrderStatus(order.id, 'delivered');

  return (
    <MobileLayout>
      <TopBar title="Order Details" backTo="/rider/orders" />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-stone-800" style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</p>
              <p className="text-stone-400 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString('en-PK')}</p>
            </div>
            <StatusBadge status={order.status} size="sm" />
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-stone-700 text-sm" style={{ fontWeight: 600 }}>{order.buyerName}</p>
            <p className="text-stone-400 text-xs">{order.buyerPhone}</p>
            <div className="flex items-start gap-1 mt-1">
              <MapPin size={11} className="text-stone-400 mt-0.5 flex-shrink-0" />
              <p className="text-stone-400 text-xs">{order.buyerAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-stone-700 mb-2" style={{ fontWeight: 700 }}>Items</p>
          <div className="space-y-1.5">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity} x {item.dish.name}</span>
                <span className="text-stone-500">Rs. {item.dish.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
            <span className="text-stone-700" style={{ fontWeight: 700 }}>Total</span>
            <span className="text-green-600" style={{ fontWeight: 700 }}>Rs. {order.total}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex gap-2">
          {!order.riderAccepted && order.status !== 'delivered' && (
            <button
              onClick={handleAccept}
              className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
              style={{ fontWeight: 600 }}
            >
              <BellRing size={15} />
              Accept Order
            </button>
          )}
          {order.riderAccepted && order.status === 'ready' && (
            <button
              onClick={handlePickup}
              className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
              style={{ fontWeight: 600 }}
            >
              <Package size={15} />
              Ready for Delivery
            </button>
          )}
          {order.status === 'picked_up' && (
            <button
              onClick={handleDeliver}
              className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
              style={{ fontWeight: 600 }}
            >
              <CheckCircle size={15} />
              Mark Delivered
            </button>
          )}
          {isChatOpen(order) && (
            <button
              onClick={() => navigate(`/chat/${order.id}`)}
              className="bg-blue-50 text-blue-600 py-2.5 px-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1"
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            >
              <MessageCircle size={14} />
              Chat
            </button>
          )}
        </div>
      </div>

      <RiderBottomNav />
    </MobileLayout>
  );
}
