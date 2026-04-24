import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { MobileLayout } from './MobileLayout';

type Role = 'buyer' | 'kitchen' | 'rider';

type SimpleNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};

const buyerNotifications: SimpleNotification[] = [
  {
    id: '1',
    title: 'Order Placed',
    message: 'Your order has been placed successfully.',
    time: '2 min ago',
  },
  {
    id: '2',
    title: 'Accepted',
    message: 'Kitchen accepted your order.',
    time: '5 min ago',
  },
  {
    id: '3',
    title: 'Preparing',
    message: 'Your order is being prepared.',
    time: '9 min ago',
  },
  {
    id: '4',
    title: 'Ready',
    message: 'Your order is ready for pickup.',
    time: '14 min ago',
  },
  {
    id: '5',
    title: 'Out for Delivery',
    message: 'Rider is on the way with your order.',
    time: '18 min ago',
  },
  {
    id: '6',
    title: 'Delivered',
    message: 'Your order was delivered successfully.',
    time: '24 min ago',
  },
  {
    id: '7',
    title: 'Chat Message',
    message: 'Customer sent a new message.',
    time: '1 min ago',
    unread: true,
  },
  {
    id: '8',
    title: 'Rider Message',
    message: 'Rider sent a new message.',
    time: '3 min ago',
    unread: true,
  },
];

const kitchenNotifications: SimpleNotification[] = [
  {
    id: 'k1',
    title: 'New Order Message',
    message: 'A new order has been received from customer.',
    time: '1 min ago',
    unread: true,
  },
  {
    id: 'k2',
    title: 'Rider Message',
    message: 'Rider shared current location update.',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 'k3',
    title: 'Current Message',
    message: 'Customer sent a new current chat message.',
    time: '4 min ago',
    unread: true,
  },
];

const backPathByRole: Record<Role, string> = {
  buyer: '/buyer/profile',
  kitchen: '/kitchen/profile',
  rider: '/rider/profile',
};

function NotificationsScreen({ role }: { role: Role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultByRole = role === 'kitchen' ? kitchenNotifications : buyerNotifications;
  const [notifications, setNotifications] = useState<SimpleNotification[]>(defaultByRole);
  const backPath =
    role === 'kitchen' && typeof location.state?.from === 'string'
      ? location.state.from
      : backPathByRole[role];

  return (
    <MobileLayout>
      <div className="bg-red-700 px-5 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="text-white"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white text-lg font-bold">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3">
        {notifications.length > 0 && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setNotifications([])}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700"
            >
              Delete All
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No notifications yet</div>
        ) : (
          <ul className="space-y-2">
            {notifications.map(item => (
              <li key={item.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      {item.unread && (
                        <span className="h-2 w-2 rounded-full bg-red-600" aria-label="Unread notification" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MobileLayout>
  );
}

export function BuyerNotificationsScreen() {
  return <NotificationsScreen role="buyer" />;
}

export function KitchenNotificationsScreen() {
  return <NotificationsScreen role="kitchen" />;
}

export function RiderNotificationsScreen() {
  return <NotificationsScreen role="rider" />;
}
