import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, UserCircle, UserCog, Bike, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function KitchenBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useApp();
  const isBranchManager = Boolean(currentUser?.branchId);
  const navItems = isBranchManager
    ? [
        { path: '/kitchen/orders', label: 'Orders', icon: ClipboardList },
        { path: '/kitchen/dishes', label: 'Menu', icon: UtensilsCrossed },
        { path: '/kitchen/rider', label: 'Riders', icon: Bike },
        { path: '/kitchen/profile', label: 'Account', icon: UserCircle },
      ]
    : [
        { path: '/kitchen', label: 'Home', icon: Home },
        { path: '/kitchen/manager', label: 'Manager', icon: UserCog },
        { path: '/kitchen/rider', label: 'Rider', icon: Bike },
        { path: '/kitchen/profile', label: 'Profile', icon: UserCircle },
      ];

  return (
    <div className="border-t border-gray-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 flex items-center sticky bottom-0 z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
              isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`rounded-xl px-3 py-1 transition-all ${isActive ? 'bg-orange-50 shadow-sm' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
