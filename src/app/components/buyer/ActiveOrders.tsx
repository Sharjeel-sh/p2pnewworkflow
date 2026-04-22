import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, MapPin, Clock, CheckCircle, Bike, ChefHat } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';

export function ActiveOrders() {
  const { orders, organizations } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const historyOnly = location.state?.historyOnly === true;
  const [activeTab, setActiveTab] = useState<'active' | 'history'>(historyOnly ? 'history' : 'active');

  const activeOrdersList = orders.filter(o => o.buyerName && o.status !== 'delivered');
  const orderHistory = orders.filter(o => o.buyerName && o.status === 'delivered');

  // If there are 2 or more active orders, redirect to active orders tab automatically (unless in historyOnly mode)
  React.useEffect(() => {
    if (!historyOnly && activeOrdersList.length >= 2) {
      setActiveTab('active');
    }
  }, [activeOrdersList.length, historyOnly]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-PK', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'preparing':
        return <ChefHat size={16} className="text-orange-600" />;
      case 'ready':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'picked_up':
        return <Bike size={16} className="text-indigo-600" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const displayOrders = activeTab === 'active' ? activeOrdersList : orderHistory;

  return (
    <MobileLayout>
      {/* Top Bar */}
      <div className="bg-red-50 px-5 py-4 border-b border-red-100 flex items-center gap-3">
        <button
          onClick={() => navigate(historyOnly ? '/buyer/profile' : '/buyer')}
          className="text-red-700 hover:bg-red-100 p-1.5 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-red-900 font-bold text-lg">{historyOnly ? 'Order History' : 'Your Orders'}</h1>
          <p className="text-red-600 text-xs">{historyOnly ? 'View your completed orders' : 'Track active orders and view history'}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      {!historyOnly && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center px-5">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 px-3 text-sm font-semibold transition-all relative ${
                activeTab === 'active' 
                  ? 'text-red-700' 
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Active Orders
              {activeTab === 'active' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-700 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-3 text-sm font-semibold transition-all relative ${
                activeTab === 'history' 
                  ? 'text-red-700' 
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Order History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-700 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          {displayOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MapPin size={24} className="text-gray-400" />
              </div>
              <p className="text-stone-600 font-semibold">
                {activeTab === 'active' ? 'No active orders' : 'No order history'}
              </p>
              <p className="text-stone-400 text-sm mt-1 text-center">
                {activeTab === 'active' 
                  ? 'Start ordering to see your active orders here'
                  : 'Your completed orders will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayOrders.map((order) => {
                const org = organizations.find(o => o.id === order.orgId);
                return (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/buyer/order/${order.id}`)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-stone-800 font-semibold text-sm">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="text-xs font-medium text-stone-600 capitalize">
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Restaurant & Items */}
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      {org && (
                        <p className="text-sm font-semibold text-red-700 mb-1">{org.orgName}</p>
                      )}
                      <p className="text-xs text-stone-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-500">Total Amount</p>
                        <p className="text-sm font-semibold text-stone-800">
                          Rs. {order.total}
                        </p>
                      </div>
                      <div className="text-red-600 font-semibold">›</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BuyerBottomNav />
    </MobileLayout>
  );
}
