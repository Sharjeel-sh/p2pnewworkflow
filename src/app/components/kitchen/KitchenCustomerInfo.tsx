import React from 'react';
import { useParams } from 'react-router';
import { MapPin, Phone, User } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function KitchenCustomerInfo() {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, orders } = useApp();

  const order = orders.find(o => o.id === orderId && o.orgId === currentUser?.orgId);
  const pastOrders = order
    ? orders
        .filter(
          o =>
            o.orgId === currentUser?.orgId &&
            o.buyerPhone === order.buyerPhone &&
            o.id !== order.id,
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  if (!order) {
    return (
      <MobileLayout>
        <TopBar title="Customer Info" backTo="/kitchen/orders" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Customer information not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <TopBar title="Customer Info" backTo={`/kitchen/orders/${order.id}`} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-3">
            <User size={22} className="text-stone-500" />
          </div>

          <p className="text-stone-800" style={{ fontWeight: 700 }}>{order.buyerName}</p>

          <div className="flex items-center gap-2 mt-2">
            <Phone size={14} className="text-stone-500" />
            <p className="text-stone-600 text-sm">{order.buyerPhone}</p>
          </div>

          <div className="flex items-start gap-2 mt-2">
            <MapPin size={14} className="text-stone-500 mt-0.5" />
            <p className="text-stone-600 text-sm">{order.buyerAddress}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mt-3">
          <p className="text-stone-800 mb-2" style={{ fontWeight: 700 }}>
            Past Orders ({pastOrders.length})
          </p>
          {pastOrders.length === 0 ? (
            <p className="text-stone-500 text-sm">No past orders found.</p>
          ) : (
            <div className="space-y-2">
              {pastOrders.map(item => (
                <div key={item.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-stone-700 text-sm" style={{ fontWeight: 600 }}>
                      #{item.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-stone-500 text-xs capitalize">{item.status.replace('_', ' ')}</p>
                  </div>
                  <p className="text-stone-500 text-xs mt-1">
                    {new Date(item.createdAt).toLocaleString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-red-700 text-sm mt-1" style={{ fontWeight: 600 }}>
                    Rs. {item.total}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
