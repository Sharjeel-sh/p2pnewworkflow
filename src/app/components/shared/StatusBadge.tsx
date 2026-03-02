import React from 'react';
import { OrderStatus } from '../../context/AppContext';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  accepted: { label: 'Accepted', bg: 'bg-blue-100', text: 'text-blue-700' },
  preparing: { label: 'Preparing', bg: 'bg-purple-100', text: 'text-purple-700' },
  ready: { label: 'Ready for Pickup', bg: 'bg-orange-100', text: 'text-orange-700' },
  picked_up: { label: 'Out for Delivery', bg: 'bg-teal-100', text: 'text-teal-700' },
  delivered: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`${config.bg} ${config.text} ${padding} rounded-full font-medium`}>
      {config.label}
    </span>
  );
}
