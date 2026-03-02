import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, ArrowLeft, Lock, Clock, MessageCircle } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../context/AppContext';

const ROLE_COLORS: Record<UserRole, { bubble: string; name: string; bg: string }> = {
  buyer: { bubble: 'bg-blue-500 text-white', name: 'text-blue-600', bg: 'bg-blue-50' },
  kitchen: { bubble: 'bg-orange-500 text-white', name: 'text-orange-600', bg: 'bg-orange-50' },
  rider: { bubble: 'bg-green-500 text-white', name: 'text-green-600', bg: 'bg-green-50' },
};

const ROLE_EMOJI: Record<UserRole, string> = {
  buyer: '🛍️',
  kitchen: '🍳',
  rider: '🚴',
};

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

function CountdownTimer({ deliveredAt }: { deliveredAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = 3600000 - (Date.now() - new Date(deliveredAt).getTime());
      setRemaining(Math.max(0, diff));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [deliveredAt]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="font-mono text-amber-700">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

export function ChatScreen() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, chatMessages, sendChatMessage, isChatOpen, currentUser, riders, organizations } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const order = orders.find(o => o.id === orderId);
  const orderMessages = chatMessages.filter(m => m.orderId === orderId);
  const chatOpen = order ? isChatOpen(order) : false;

  // Determine current user's info for chat
  const getCurrentUserInfo = (): { name: string; role: UserRole } => {
    if (!currentUser) return { name: 'Guest', role: 'buyer' };
    if (currentUser.role === 'kitchen') {
      const org = organizations.find(o => o.id === currentUser.orgId);
      return { name: org?.orgName || 'Kitchen', role: 'kitchen' };
    }
    if (currentUser.role === 'rider') {
      const rider = riders.find(r => r.id === currentUser.riderId);
      return { name: rider?.name || 'Rider', role: 'rider' };
    }
    return { name: order?.buyerName || 'Buyer', role: 'buyer' };
  };

  const userInfo = getCurrentUserInfo();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [orderMessages]);

  const handleSend = () => {
    if (!message.trim() || !chatOpen || !orderId) return;
    sendChatMessage(orderId, message.trim(), userInfo.name, userInfo.role);
    setMessage('');
  };

  const getBackPath = () => {
    if (currentUser?.role === 'kitchen') return '/kitchen/orders';
    if (currentUser?.role === 'rider') return '/rider/orders';
    return `/buyer/order/${orderId}`;
  };

  if (!order) {
    return (
      <MobileLayout>
        <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={22} /></button>
          <h2 style={{ fontWeight: 600 }}>Order Chat</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Order not found.</p>
        </div>
      </MobileLayout>
    );
  }

  const org = organizations.find(o => o.id === order.orgId);
  const rider = order.riderId ? riders.find(r => r.id === order.riderId) : null;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(getBackPath())} className="text-white p-1 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h2 className="text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>
            Order #{order.id.slice(-6).toUpperCase()}
          </h2>
          <p className="text-blue-100" style={{ fontSize: '0.72rem' }}>
            Group Chat • {ROLE_EMOJI.buyer} Buyer · {ROLE_EMOJI.kitchen} Kitchen · {ROLE_EMOJI.rider} Rider
          </p>
        </div>
        <div className="flex -space-x-1">
          {(['buyer', 'kitchen', 'rider'] as UserRole[]).map(role => (
            <div key={role}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white ${ROLE_COLORS[role].bubble}`}>
              {ROLE_EMOJI[role]}
            </div>
          ))}
        </div>
      </div>

      {/* Participants Info */}
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs">{ROLE_EMOJI.buyer}</span>
          <span className="text-blue-700 text-xs" style={{ fontWeight: 500 }}>{order.buyerName}</span>
        </div>
        <span className="text-blue-300 text-xs">•</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs">{ROLE_EMOJI.kitchen}</span>
          <span className="text-orange-700 text-xs" style={{ fontWeight: 500 }}>{org?.orgName || 'Kitchen'}</span>
        </div>
        {rider && (
          <>
            <span className="text-blue-300 text-xs">•</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs">{ROLE_EMOJI.rider}</span>
              <span className="text-green-700 text-xs" style={{ fontWeight: 500 }}>{rider.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Chat Closed / Countdown Banner */}
      {order.status === 'delivered' && order.deliveredAt && (
        <div className={`px-4 py-2 flex items-center gap-2 ${chatOpen ? 'bg-amber-50 border-b border-amber-100' : 'bg-red-50 border-b border-red-100'}`}>
          {chatOpen ? (
            <>
              <Clock size={13} className="text-amber-500 flex-shrink-0" />
              <p className="text-amber-700 text-xs">
                Chat closes in <CountdownTimer deliveredAt={order.deliveredAt} />
              </p>
            </>
          ) : (
            <>
              <Lock size={13} className="text-red-400 flex-shrink-0" />
              <p className="text-red-500 text-xs">Chat closed — 1 hour after delivery</p>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {orderMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <MessageCircle size={40} className="text-gray-200 mb-3" />
            <p className="text-stone-400 text-sm">No messages yet</p>
            <p className="text-stone-400 text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          orderMessages.map(msg => {
            const isMe = msg.senderName === userInfo.name && msg.senderRole === userInfo.role;
            const colors = ROLE_COLORS[msg.senderRole];
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] ${isMe ? '' : ''}`}>
                  {!isMe && (
                    <p className={`text-xs mb-1 flex items-center gap-1 ${colors.name}`} style={{ fontWeight: 600 }}>
                      {ROLE_EMOJI[msg.senderRole]} {msg.senderName}
                      <span className="text-stone-400 font-normal">{formatTimeAgo(msg.timestamp)}</span>
                    </p>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isMe ? `${colors.bubble} rounded-br-sm` : `bg-white border border-gray-100 text-stone-800 rounded-bl-sm shadow-sm`
                  }`}>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.45 }}>{msg.message}</p>
                  </div>
                  {isMe && (
                    <p className="text-stone-400 text-xs mt-1 text-right">{formatTimeAgo(msg.timestamp)}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {chatOpen ? (
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-3 items-end">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-center">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message as ${userInfo.name}...`}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-stone-700"
              style={{ fontSize: '0.9rem', maxHeight: 80 }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
          >
            <Send size={17} />
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 bg-white border-t border-gray-100 flex items-center justify-center gap-2">
          <Lock size={15} className="text-gray-400" />
          <p className="text-stone-400 text-sm">Chat has been closed</p>
        </div>
      )}
    </MobileLayout>
  );
}
