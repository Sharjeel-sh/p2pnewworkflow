import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ClipboardList, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/rider/orders', label: 'Orders', icon: ClipboardList },
  { path: '/rider/profile', label: 'Profile', icon: UserCircle },
];

export function RiderBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="border-t border-gray-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 flex items-center sticky bottom-0 z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
              isActive ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`rounded-xl px-3 py-1 transition-all ${isActive ? 'bg-green-50 shadow-sm' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
