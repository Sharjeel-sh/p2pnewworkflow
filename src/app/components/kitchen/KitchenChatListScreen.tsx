import React from 'react';
import { useNavigate } from 'react-router';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function KitchenChatListScreen() {
  const { currentUser, orders, branches, isChatOpen, chatMessages } = useApp();
  const navigate = useNavigate();
  const managedBranchId = currentUser?.branchId;

  const getLastMessageTime = (orderId: string) => {
    const msgs = chatMessages.filter(m => m.orderId === orderId);
    if (msgs.length === 0) return '';
    return msgs[msgs.length - 1].timestamp;
  };

  const chats = orders
    .filter(order =>
      order.orgId === currentUser?.orgId &&
      (!managedBranchId || order.branchId === managedBranchId) &&
      isChatOpen(order),
    )
    .sort((a, b) => {
      const aTime = getLastMessageTime(a.id) || a.createdAt;
      const bTime = getLastMessageTime(b.id) || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'Main';
    return branches.find(b => b.id === branchId)?.name || 'Branch';
  };

  const dishSummary = (order: any) => {
    if (!order.items || order.items.length === 0) return '';
    // list 1-2 names then ellipsis
    const names = order.items.map((i: any) => i.dish?.name).filter(Boolean);
    if (names.length <= 2) return names.join(', ');
    return names.slice(0, 2).join(', ') + '...';
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
      case 'accepted':
        return 'Pending';
      case 'preparing':
        return 'In Processing';
      case 'ready':
        return 'Ready';
      case 'picked_up':
        return 'Picked Up';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };
  
  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'accepted':
        return 'text-yellow-600';
      case 'preparing':
        return 'text-orange-600';
      case 'ready':
        return 'text-blue-600';
      case 'picked_up':
        return 'text-indigo-600';
      case 'delivered':
        return 'text-green-600';
      default:
        return 'text-stone-600';
    }
  };

  // background color for status pill variants
  const statusBgColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'accepted':
        return 'bg-yellow-100';
      case 'preparing':
        return 'bg-orange-100';
      case 'ready':
        return 'bg-blue-100';
      case 'picked_up':
        return 'bg-indigo-100';
      case 'delivered':
        return 'bg-green-100';
      default:
        return 'bg-stone-100';
    }
  };

  return (
    <MobileLayout>
      <div className="bg-red-700 px-5 pt-10 pb-5">
        <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Active Order Chats</h2>
        <p className="text-red-100 mt-1" style={{ fontSize: '0.8rem' }}>
          Tap an order to start the conversation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {chats.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>No open chats</p>
            <p className="text-stone-400 mt-1" style={{ fontSize: '0.82rem' }}>
              Chats will appear here when orders are active
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map(order => {
              const orderMessages = chatMessages.filter(m => m.orderId === order.id);
              const lastMessage = orderMessages[orderMessages.length - 1];
              // if the last message came from buyer we treat it as unread
              const isUnread = lastMessage && lastMessage.senderRole === 'buyer';
              // count placeholder for badge; since we don't track read state use 1
              const unreadCount = isUnread ? 1 : 0;
              const status = statusLabel(order.status);
              const statusCls = statusColor(order.status);
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/chat/${order.id}`)}
                  className={`w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left hover:border-red-200 transition-colors relative ${isUnread ? 'bg-red-50' : ''}`}
                >
                  {/* unread badge */}
                  {isUnread && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 1 ? unreadCount : '•'}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-baseline gap-1">
                          <p className="text-stone-800 truncate" style={{ fontWeight: 700 }}>
                            {order.buyerName}
                          </p>
                          <p className="text-stone-400 text-xs truncate">#{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="flex flex-col items-end max-w-[50%]">
                          {lastMessage && (
                            <p className="text-stone-500 text-xs truncate" style={{ fontSize: '0.78rem' }}>
                              {lastMessage.senderName}: {lastMessage.message}
                            </p>
                          )}
                          <p className="text-stone-400 text-xs flex-shrink-0 mt-1">
                            {formatTime(lastMessage?.timestamp || order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls} ${statusBgColor(order.status)}`}> 
                          {status}
                        </span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <p className="text-stone-500 mt-1 truncate" style={{ fontSize: '0.78rem' }}>
                          {dishSummary(order)}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-stone-300 flex-shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
