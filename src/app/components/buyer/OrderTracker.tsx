import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MessageCircle, Bike, CheckCircle, Clock, Package, ChefHat, MapPin } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import type { OrderStatus } from '../../context/AppContext';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'Waiting for kitchen to accept' },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle, desc: 'Kitchen has accepted your order' },
  { status: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Your food is being prepared' },
  { status: 'ready', label: 'Ready', icon: Package, desc: 'Order is ready for pickup' },
  { status: 'picked_up', label: 'Out for Delivery', icon: Bike, desc: 'Rider is on the way' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Order has been delivered!' },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];

export function OrderTracker() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, organizations, riders, isChatOpen } = useApp();
  const navigate = useNavigate();

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <MobileLayout>
        <TopBarSimple onBack={() => navigate('/buyer')} title="Order Tracking" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Order not found.</p>
        </div>
      </MobileLayout>
    );
  }

  const org = organizations.find(o => o.id === order.orgId);
  const rider = order.riderId ? riders.find(r => r.id === order.riderId) : null;
  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);
  const chatOpen = isChatOpen(order);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MobileLayout>
      <TopBarSimple onBack={() => navigate('/buyer')} title="Track Order" />

      <div className="flex-1 overflow-y-auto">
        {/* Order Header */}
        <div className="bg-orange-50 px-5 py-4 border-b border-orange-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-stone-800" style={{ fontWeight: 700 }}>
                Order #{order.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-stone-400 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
              {org && <p className="text-orange-600 text-sm mt-1" style={{ fontWeight: 500 }}>{org.orgName}</p>}
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Status Timeline */}
        <div className="px-5 py-5">
          <h3 className="text-stone-700 mb-4" style={{ fontWeight: 700 }}>Order Status</h3>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStatusIdx;
              const isCurrent = idx === currentStatusIdx;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-300'
                    }`}>
                      <Icon size={17} />
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 ${isCompleted && idx < currentStatusIdx ? 'bg-green-400' : 'bg-gray-200'}`}
                        style={{ minHeight: 24 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 flex-1 pt-1.5">
                    <p className={`${isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-stone-400'}`}
                      style={{ fontWeight: isCurrent ? 700 : 500, fontSize: '0.9rem' }}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-stone-400 text-xs mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rider Info */}
        {rider && (
          <div className="mx-5 bg-green-50 border border-green-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Bike size={19} color="white" />
              </div>
              <div>
                <p className="text-green-700" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Your Rider</p>
                <p className="text-green-600 text-sm">{rider.name}</p>
                {rider.phone && <p className="text-green-400 text-xs">{rider.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mx-5 bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <h4 className="text-stone-700 mb-3" style={{ fontWeight: 700 }}>Order Items</h4>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity}× {item.dish.name}</span>
                <span className="text-stone-500">Rs. {item.dish.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="text-stone-500 text-sm">Delivery</span>
              <span className="text-stone-500 text-sm">Rs. 50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-700" style={{ fontWeight: 700 }}>Total</span>
              <span className="text-orange-600" style={{ fontWeight: 700 }}>Rs. {order.total + 50}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mx-5 bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <h4 className="text-stone-700 mb-3" style={{ fontWeight: 700 }}>Delivery Info</h4>
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-stone-600 text-sm">{order.buyerAddress}</p>
          </div>
        </div>

        {/* Chat Button */}
        {chatOpen ? (
          <div className="mx-5 mb-6">
            <button
              onClick={() => navigate(`/chat/${order.id}`)}
              className="w-full bg-blue-500 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-md shadow-blue-200"
              style={{ fontWeight: 700 }}
            >
              <MessageCircle size={19} />
              Chat with Kitchen & Rider
            </button>
          </div>
        ) : order.status === 'delivered' ? (
          <div className="mx-5 mb-6 bg-gray-100 rounded-2xl p-3 text-center">
            <p className="text-stone-400 text-sm">Chat closed (1 hour after delivery)</p>
          </div>
        ) : null}
      </div>
    </MobileLayout>
  );
}

function TopBarSimple({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <ArrowLeft size={22} />
      </button>
      <h2 className="flex-1" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
    </div>
  );
}