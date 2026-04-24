import React from 'react';
import { useParams } from 'react-router';
import { Phone, User } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function KitchenRiderInfo() {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, orders, riders } = useApp();

  const order = orders.find(o => o.id === orderId && o.orgId === currentUser?.orgId);
  const rider = riders.find(r => r.id === order?.riderId);
  const deliveredOrdersCount = rider
    ? orders.filter(
        o => o.orgId === currentUser?.orgId && o.riderId === rider.id && o.status === 'delivered',
      ).length
    : 0;

  if (!order) {
    return (
      <MobileLayout>
        <TopBar title="Rider Info" backTo="/kitchen/orders" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Rider information not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <TopBar title="Rider Info" backTo={`/kitchen/orders/${order.id}`} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
              {rider?.profilePicture ? (
                <img src={rider.profilePicture} alt={rider.name} className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-stone-500" />
              )}
            </div>
            <div>
              <p className="text-xs text-stone-500">Rider Name</p>
              <p className="text-stone-800" style={{ fontWeight: 700 }}>
                {rider?.name || 'Not Assigned'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-stone-500 mb-1">Phone Number</p>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-stone-500" />
              <p className="text-stone-700 text-sm">{rider?.phone || 'Not Available'}</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs text-stone-500">Delivered Orders</p>
            <p className="text-stone-900 text-lg" style={{ fontWeight: 700 }}>
              {deliveredOrdersCount}
            </p>
          </div>
        </div>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
