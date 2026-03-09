import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardList, ChevronRight, MessageCircle, Bike, X, Check, UserMinus } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { StatusBadge } from '../shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import type { Order, OrderStatus } from '../../context/AppContext';

const STATUS_FLOW: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready'];
const STATUS_NEXT_LABEL: Record<string, string> = {
  pending: 'Accept Order',
  accepted: 'Start Preparing',
  preparing: 'Mark as Ready',
  ready: 'Ready for Pickup',
};

export function KitchenOrders() {
  const { currentUser, orders, riders, updateOrderStatus, assignRiderToOrder, unassignRiderFromOrder, createMockOrderForOrg, isChatOpen } = useApp();
  const navigate = useNavigate();
  // track which status tab is selected (pending, accepted, preparing, ready)
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRiderModal, setShowRiderModal] = useState(false);

  const managedBranchId = currentUser?.branchId;
  const orgOrders = orders.filter(o => o.orgId === currentUser?.orgId && (!managedBranchId || o.branchId === managedBranchId));

  // orders grouped by status
  const statusTabs: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];
  const displayOrders = activeFilter === 'delivered'
    ? []
    : orgOrders.filter(o => o.status === activeFilter);
  const newOrdersCount = orgOrders.filter(o => o.status === 'pending').length;
  const orgRiders = riders.filter(r =>
    r.orgId === currentUser?.orgId &&
    r.isAvailable &&
    (!managedBranchId || r.branchId === managedBranchId),
  );

  const handleStartPreparing = (order: Order) => {
    updateOrderStatus(order.id, 'preparing');
  };

  const handleMarkReady = (order: Order) => {
    updateOrderStatus(order.id, 'ready');
  };

  const handleReadyForPickup = (order: Order) => {
    updateOrderStatus(order.id, 'picked_up');
  };

  const handleAssignRider = (rider: typeof orgRiders[0]) => {
    if (!selectedOrder) return;
    assignRiderToOrder(selectedOrder.id, rider.id, rider.name, rider.branchId);
    setShowRiderModal(false);
    setSelectedOrder(null);
  };

  const openAssignModal = (order: Order) => {
    setSelectedOrder(order);
    setShowRiderModal(true);
  };

  const handleUnassignRider = (orderId: string) => {
    unassignRiderFromOrder(orderId);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return `Today, ${formatTime(iso)}`;
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) + ' ' + formatTime(iso);
  };

  const getPrimaryAction = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return { label: 'Accept Order', handler: () => updateOrderStatus(order.id, 'accepted') };
      case 'accepted':
        return { label: 'Start Preparing', handler: () => handleStartPreparing(order) };
      case 'preparing':
        return { label: 'Mark as Ready', handler: () => handleMarkReady(order) };
      case 'ready':
        return { label: 'Ready for Pickup', handler: () => handleReadyForPickup(order) };
      default:
        return null;
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 pt-10 pb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-white text-2xl font-bold">Orders</h2>
          {newOrdersCount > 0 && (
            <span className="bg-white text-orange-600 font-bold px-3 py-1 rounded-full shadow text-xs">
              +{newOrdersCount} New
            </span>
          )}
        </div>
        <div className="relative flex flex-col gap-1 mt-4">
          <div className="flex gap-2">
            {statusTabs.map(status => {
              const count = orgOrders.filter(o => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${activeFilter === status ? 'bg-white text-orange-600 shadow-lg' : 'bg-orange-200 text-orange-800'}`}
                  style={{ fontWeight: 600 }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              );
            })}
          </div>
          {/* sliding indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-orange-600 transition-all"
            style={{
              width: `calc(${100 / statusTabs.length}% - 0.5rem)`,
              left: `calc(${statusTabs.indexOf(activeFilter) * (100 / statusTabs.length)}% + 0.25rem)`
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {displayOrders.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList size={52} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>
              No {activeFilter} orders
            </p>
            {activeFilter === 'pending' && (
              <>
                <p className="text-stone-400 mt-1" style={{ fontSize: '0.82rem' }}>
                  New orders will appear here
                </p>
                <button
                  onClick={() => {
                    if (!currentUser?.orgId) return;
                    createMockOrderForOrg(currentUser.orgId, 3);
                  }}
                  className="mt-4 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
                  style={{ fontSize: '0.86rem', fontWeight: 600 }}
                >
                  Create 3 Mock Orders
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-stone-800" style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                {/* Buyer Info */}
                <div className="bg-[#F0F0F0] rounded-xl p-3 mb-3">
                  <p className="text-stone-700 text-sm font-semibold">{order.buyerName}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{order.buyerPhone}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{order.buyerAddress}</p>
                </div>

                {/* Items */}
                <div className="mb-3 space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-stone-600">{item.quantity}× {item.dish.name}</span>
                      <span className="text-stone-500">Rs. {item.dish.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-1 mt-1 flex justify-between">
                    <span className="text-stone-600 text-xs" style={{ fontWeight: 600 }}>Total</span>
                    <span className="text-orange-600 text-sm" style={{ fontWeight: 700 }}>Rs. {order.total}</span>
                  </div>
                </div>

                {order.riderName && (
                  <div className="inline-flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full mb-3">
                    <Check size={12} className="text-green-500" />
                    <span className="text-green-700 text-xs font-medium">
                      {order.riderName}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {(() => {
                    const act = getPrimaryAction(order);
                    if (act) {
                      return (
                        <button
                          onClick={act.handler}
                          className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-xs hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                          style={{ fontWeight: 600 }}
                        >
                          <Check size={13} />
                          {act.label}
                        </button>
                      );
                    }
                    return null;
                  })()}
                  {order.status !== 'delivered' && (
                    <button
                      onClick={() => openAssignModal(order)}
                      className="bg-green-50 text-green-700 py-2 px-3 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-1"
                      style={{ fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      <Bike size={14} />
                      {order.riderId ? 'Change Rider' : 'Assign Rider'}
                    </button>
                  )}
                  {order.status !== 'delivered' && order.riderId && (
                    <button
                      onClick={() => handleUnassignRider(order.id)}
                      className="bg-red-50 text-red-600 py-2 px-3 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1"
                      style={{ fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      <UserMinus size={14} />
                      De-assign
                    </button>
                  )}
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
            ))}
          </div>
        )}
      </div>

      <KitchenBottomNav />

      {/* Assign Rider Modal */}
      {showRiderModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-30">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Assign Rider</h3>
              <button onClick={() => setShowRiderModal(false)} className="text-gray-400 p-1"><X size={20} /></button>
            </div>
            {orgRiders.length === 0 ? (
              <div className="text-center py-6">
                <Bike size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="text-stone-400 text-sm">
                  No active riders available for this kitchen.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {orgRiders.map(rider => (
                  <button
                    key={rider.id}
                    onClick={() => handleAssignRider(rider)}
                    className="w-full flex items-center gap-3 p-3.5 border-2 border-gray-100 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                      <Bike size={17} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-stone-800 text-sm" style={{ fontWeight: 600 }}>{rider.name}</p>
                      <p className="text-stone-400 text-xs">{rider.phone}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
