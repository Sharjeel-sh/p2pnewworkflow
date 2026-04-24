import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle, MapPin, MessageCircle, Phone, User } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { StatusBadge } from '../shared/StatusBadge';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';
import type { Order, OrderStatus } from '../../context/AppContext';

export function KitchenOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    orders,
    riders,
    updateOrderStatus,
    assignRiderToOrder,
    unassignRiderFromOrder,
    isChatOpen,
  } = useApp();

  const managedBranchId = currentUser?.branchId;
  const order = orders.find(
    o =>
      o.id === orderId &&
      o.orgId === currentUser?.orgId &&
      (!managedBranchId || o.branchId === managedBranchId),
  );

  if (!order) {
    return (
      <MobileLayout>
        <TopBar title="Order Details" backTo="/kitchen/orders" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Order not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return `Today, ${formatTime(iso)}`;
    return (
      d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) +
      ' ' +
      formatTime(iso)
    );
  };

  const managedRiders = riders.filter(r =>
    r.orgId === currentUser?.orgId &&
    r.isAvailable &&
    (!managedBranchId || r.branchId === managedBranchId),
  );
  const assignedRider = riders.find(r => r.id === order.riderId);

  const assignAvailableRiderIfNeeded = (targetOrder: Order) => {
    if (targetOrder.deliveryMethod === 'pickup') return;
    if (targetOrder.riderId) return;
    const rider = managedRiders[0];
    if (!rider) return;
    assignRiderToOrder(targetOrder.id, rider.id, rider.name, rider.branchId);
  };

  const getPrimaryAction = (order: Order) => {
    const isPickup = order.deliveryMethod === 'pickup';
    if (isPickup) {
      switch (order.status) {
        case 'pending':
          return { label: 'Accept Order', handler: () => updateOrderStatus(order.id, 'accepted') };
        case 'accepted':
          return { label: 'Start Preparing', handler: () => updateOrderStatus(order.id, 'preparing') };
        case 'preparing':
          return { label: 'Mark Ready for Pickup', handler: () => updateOrderStatus(order.id, 'ready') };
        case 'ready':
          return { label: 'Mark Completed', handler: () => updateOrderStatus(order.id, 'delivered') };
        default:
          return null;
      }
    }
    switch (order.status) {
      case 'pending':
        return { label: 'Accept Order', handler: () => updateOrderStatus(order.id, 'accepted') };
      case 'accepted':
        return { label: 'Start Preparing', handler: () => updateOrderStatus(order.id, 'preparing') };
      case 'preparing':
        return {
          label: 'Mark as Ready',
          handler: () => {
            updateOrderStatus(order.id, 'ready');
            assignAvailableRiderIfNeeded(order);
          },
        };
      case 'ready':
        return { label: 'Ready for Pickup', handler: () => updateOrderStatus(order.id, 'picked_up') };
      default:
        return null;
    }
  };


  return (
    <MobileLayout>
      <TopBar title="Order Details" backTo="/kitchen/orders" />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-stone-800" style={{ fontWeight: 700 }}>
                #{order.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-stone-400 text-xs mt-0.5">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <StatusBadge status={order.status} size="sm" />
          </div>

          <button
            type="button"
            onClick={() => navigate(`/kitchen/orders/${order.id}/customer`)}
            className="w-full bg-gray-50 rounded-xl p-3 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <User size={16} className="text-stone-500" />
              </div>
              <div className="flex-1">
                <p className="text-stone-700 text-sm" style={{ fontWeight: 600 }}>
                  {order.buyerName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={11} className="text-stone-400" />
                  <p className="text-stone-400 text-xs">{order.buyerPhone}</p>
                </div>
                {order.deliveryMethod !== 'pickup' && (
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin size={11} className="text-stone-400 mt-0.5 flex-shrink-0" />
                    <p className="text-stone-400 text-xs">{order.buyerAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </button>

          {order.deliveryMethod !== 'pickup' && (
            <button
              type="button"
              onClick={() => navigate(`/kitchen/orders/${order.id}/rider`)}
              className="w-full mt-2 bg-gray-50 rounded-xl p-3 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                  {assignedRider?.profilePicture ? (
                    <img src={assignedRider.profilePicture} alt={assignedRider.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-stone-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-stone-700 text-sm" style={{ fontWeight: 600 }}>
                    {assignedRider?.name || 'Rider not assigned'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-stone-400" />
                    <p className="text-stone-400 text-xs">{assignedRider?.phone || 'No phone available'}</p>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-stone-700 mb-2" style={{ fontWeight: 700 }}>
            Items
          </p>
          <div className="space-y-1.5">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-stone-600">
                  {item.quantity} x {item.dish.name}
                </span>
                <span className="text-stone-500">
                  Rs. {item.dish.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
            <span className="text-stone-700" style={{ fontWeight: 700 }}>
              Total
            </span>
            <span className="text-red-700" style={{ fontWeight: 700 }}>
              Rs. {order.total}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex gap-2">
          {(() => {
            const act = getPrimaryAction(order);
            if (act) {
              return (
                <button
                  onClick={act.handler}
                  className="flex-1 bg-red-700 text-white py-2.5 rounded-xl text-sm hover:bg-red-800 transition-colors flex items-center justify-center gap-1.5"
                  style={{ fontWeight: 600 }}
                >
                  <CheckCircle size={15} />
                  {act.label}
                </button>
              );
            }
            return null;
          })()}
          {isChatOpen(order) && (
            <button
              onClick={() => navigate(`/chat/${order.id}`)}
              className="bg-blue-50 text-blue-600 py-2 px-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1"
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            >
              <MessageCircle size={14} />
              Chat
            </button>
          )}
        </div>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
