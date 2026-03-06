import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MessageCircle, Bike, Phone, MapPin, Navigation, Clock } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';

export function DeliveryTracker() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, organizations, riders, isChatOpen } = useApp();
  const navigate = useNavigate();

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <MobileLayout>
        <TopBarSimple onBack={() => navigate('/buyer')} title="Delivery Tracking" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Order not found.</p>
        </div>
        <BuyerBottomNav />
      </MobileLayout>
    );
  }

  const org = organizations.find(o => o.id === order.orgId);
  const rider = order.riderId ? riders.find(r => r.id === order.riderId) : null;
  const chatOpen = isChatOpen(order);
  
  const isOutForDelivery = order.status === 'picked_up';
  const isDelivered = order.status === 'delivered';

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MobileLayout>
      <TopBarSimple onBack={() => navigate(`/buyer/order/${orderId}`)} title="Live Tracking" />

      <div className="flex-1 flex flex-col">
        {/* Map Placeholder - Simple Version */}
        <div className="h-80 relative bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-bold text-lg">Live Delivery Tracking</p>
            <p className="text-green-600 text-sm">Your order location</p>
          </div>
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isDelivered ? 'bg-green-500' : isOutForDelivery ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-stone-800 text-sm font-semibold">
                    {isDelivered ? 'Delivered' : isOutForDelivery ? 'Out for Delivery' : 'Preparing'}
                  </span>
                </div>
                <StatusBadge status={order.status} size="sm" />
              </div>
              
              {isOutForDelivery && (
                <p className="text-stone-600 text-xs">
                  Estimated arrival: {Math.floor(Math.random() * 15 + 10)} minutes
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address Pin */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-orange-500 text-white rounded-2xl p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-orange-200 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-orange-100 text-xs">Delivery Address</p>
                  <p className="text-white font-medium text-sm">{order.buyerAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="flex-1 overflow-y-auto">
          {/* Rider Info */}
          {rider && (
            <div className="mx-5 mt-4 bg-green-50 border border-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Bike size={22} color="white" />
                </div>
                <div className="flex-1">
                  <p className="text-green-700 font-bold">{rider.name}</p>
                  <p className="text-green-600 text-sm">Your delivery rider</p>
                  {rider.phone && <p className="text-green-500 text-xs">{rider.phone}</p>}
                </div>
                <div className="flex gap-2">
                  {rider.phone && (
                    <button 
                      onClick={() => window.open(`tel:${rider.phone}`)}
                      className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors"
                    >
                      <Phone size={16} />
                    </button>
                  )}
                  {chatOpen && (
                    <button 
                      onClick={() => navigate(`/chat/${order.id}`)}
                      className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                    >
                      <MessageCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {isOutForDelivery && (
                <div className="bg-green-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Navigation size={14} />
                    <span className="text-sm font-medium">On the way to you</span>
                  </div>
                  <p className="text-green-600 text-xs mt-1">
                    Estimated delivery: {formatTime(new Date(Date.now() + Math.random() * 20 * 60 * 1000).toISOString())}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Order Summary */}
          <div className="mx-5 mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-stone-700 font-bold">Order #{order.id.slice(-6).toUpperCase()}</h4>
              {org && <span className="text-orange-600 text-sm font-medium">{org.orgName}</span>}
            </div>
            
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.quantity}× {item.dish.name}</span>
                  <span className="text-stone-500">Rs. {item.dish.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-stone-700 font-bold">Total</span>
                <span className="text-orange-600 font-bold">Rs. {order.total + 50}</span>
              </div>
            </div>
          </div>

          {/* Back to Order Tracking */}
          <div className="mx-5 my-4">
            <button
              onClick={() => navigate(`/buyer/order/${orderId}`)}
              className="w-full bg-gray-100 text-stone-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors"
              style={{ fontWeight: 600 }}
            >
              View Full Order Details
            </button>
          </div>
        </div>
      </div>
      
      <BuyerBottomNav />
    </MobileLayout>
  );
}

function TopBarSimple({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="bg-green-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
      <button onClick={onBack} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <ArrowLeft size={22} />
      </button>
      <h2 className="flex-1" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
    </div>
  );
}