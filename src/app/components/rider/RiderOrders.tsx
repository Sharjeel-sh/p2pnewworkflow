import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, CheckCircle, MessageCircle, MapPin, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { MobileLayout } from '../shared/MobileLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import { RiderBottomNav } from './RiderBottomNav';
import type { Order } from '../../context/AppContext';

export function RiderOrders() {
  const { currentUser, orders, riders, updateOrderStatus, acceptAssignedOrder, createMockOrdersForRider, isChatOpen } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pickup' | 'delivery'>('pickup');

  const rider = riders.find(r => r.id === currentUser?.riderId);

  const assignedOrders = useMemo(
    () =>
      orders.filter(o =>
        o.riderId === currentUser?.riderId &&
        (o.branchId ? o.branchId === rider?.branchId : true),
      ),
    [orders, currentUser?.riderId, rider?.branchId],
  );

  const pendingAssignedOrders = assignedOrders.filter(o => !o.riderAccepted && o.status !== 'delivered');
  const pickupOrders = assignedOrders.filter(o => o.riderAccepted && o.status === 'ready');
  const deliveryOrders = assignedOrders.filter(o => o.status === 'picked_up');
  const previousAssignedIdsRef = useRef<string[]>([]);

  const displayList = activeTab === 'pickup' ? pickupOrders : deliveryOrders;

  useEffect(() => {
    const currentIds = pendingAssignedOrders.map(o => o.id);
    const previousIds = previousAssignedIdsRef.current;
    const newIds = currentIds.filter(id => !previousIds.includes(id));

    if (newIds.length > 0) {
      toast.success(`New order${newIds.length > 1 ? 's' : ''} assigned`, {
        description: `${newIds.length} order${newIds.length > 1 ? 's are' : ' is'} automatically accepted and will appear under Pickup once ready.`,
      });
    }

    // auto accept any new pending orders so rider doesn't have to click
    newIds.forEach(id => acceptAssignedOrder(id));

    previousAssignedIdsRef.current = currentIds;
  }, [pendingAssignedOrders, acceptAssignedOrder]);


  const handlePickup = (order: Order) => {
    updateOrderStatus(order.id, 'picked_up');
  };

  const handleDeliver = (order: Order) => {
    updateOrderStatus(order.id, 'delivered');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  if (!rider) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Rider not found. Please login again.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="bg-green-500 px-5 pt-10 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-green-100" style={{ fontSize: '0.8rem' }}>Assigned Branch</p>
            <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{rider.name}</h2>
          </div>
          <button
            onClick={() => createMockOrdersForRider(rider.id, 1)}
            className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs hover:bg-white/30 transition-colors"
            style={{ fontWeight: 600 }}
          >
            +Mock
          </button>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pickup')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all whitespace-nowrap ${activeTab === 'pickup' ? 'bg-white text-green-600' : 'bg-green-400 text-white'}`}
            style={{ fontWeight: 600 }}
          >
            Pickup ({pickupOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-1.5 rounded-full text-sm transition-all whitespace-nowrap ${activeTab === 'delivery' ? 'bg-white text-green-600' : 'bg-green-400 text-white'}`}
            style={{ fontWeight: 600 }}
          >
            Delivery ({deliveryOrders.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {displayList.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList size={52} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>
              {activeTab === 'assigned'
                ? 'No assigned orders'
                : activeTab === 'pickup'
                  ? 'No pickup orders'
                  : 'No delivery orders'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map(order => {
              const chatOpen = isChatOpen(order);
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/rider/order/${order.id}`)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-stone-800" style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-stone-400 text-xs mt-0.5">{formatTime(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} size="sm" />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-stone-700 text-sm" style={{ fontWeight: 600 }}>{order.buyerName}</p>
                    <p className="text-stone-400 text-xs">{order.buyerPhone}</p>
                    <div className="flex items-start gap-1 mt-1">
                      <MapPin size={11} className="text-stone-400 mt-0.5 flex-shrink-0" />
                      <p className="text-stone-400 text-xs">{order.buyerAddress}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-stone-600 text-xs">{item.quantity}× {item.dish.name}</span>
                          <span className="text-stone-400 text-xs">Rs. {item.dish.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex justify-between">
                      <span className="text-stone-600 text-xs" style={{ fontWeight: 600 }}>Total</span>
                      <span className="text-green-600 text-sm" style={{ fontWeight: 700 }}>Rs. {order.total}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {activeTab === 'assigned' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAccept(order); }}
                        className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        <BellRing size={15} />
                        Accept Order
                      </button>
                    )}
                    {activeTab === 'pickup' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePickup(order); }}
                        className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        <Package size={15} />
                        Ready for Delivery
                      </button>
                    )}
                    {activeTab === 'delivery' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeliver(order); }}
                        className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        <CheckCircle size={15} />
                        Mark Delivered
                      </button>
                    )}
                    {chatOpen && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${order.id}`); }}
                        className="bg-blue-50 text-blue-600 py-2.5 px-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1"
                        style={{ fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        <MessageCircle size={14} />
                        Chat
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <RiderBottomNav />
    </MobileLayout>
  );
}
