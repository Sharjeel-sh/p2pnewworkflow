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

  return (
    <MobileLayout>
      <div className="bg-red-600 px-5 pt-10 pb-5">
        <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Chat List</h2>
        <p className="text-red-100 mt-1" style={{ fontSize: '0.8rem' }}>
          Open order conversations
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
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/chat/${order.id}`)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left hover:border-red-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-stone-800 truncate" style={{ fontWeight: 700 }}>
                          #{order.id.slice(-6).toUpperCase()} - {order.buyerName}
                        </p>
                        <p className="text-stone-400 text-xs flex-shrink-0">
                          {formatTime(lastMessage?.timestamp || order.createdAt)}
                        </p>
                      </div>
                      <p className="text-stone-500 mt-0.5 truncate" style={{ fontSize: '0.8rem' }}>
                        {getBranchName(order.branchId)}
                      </p>
                      <p className="text-stone-400 mt-1 truncate" style={{ fontSize: '0.78rem' }}>
                        {lastMessage ? `${lastMessage.senderName}: ${lastMessage.message}` : 'No messages yet'}
                      </p>
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
