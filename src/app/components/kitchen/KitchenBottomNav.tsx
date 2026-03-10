import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, UserCircle, ClipboardList, UtensilsCrossed, GitBranch, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function KitchenBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useApp();
  const isBranchManager = Boolean(currentUser?.branchId);
  const isBranchScopeScreen = location.pathname.startsWith('/kitchen/branch/');
  const useBranchNav = isBranchManager || isBranchScopeScreen;
  const navItems = useBranchNav
    ? [
        { path: '/kitchen/orders', label: 'Orders', icon: ClipboardList },
        { path: '/kitchen/dishes', label: 'Dishes', icon: UtensilsCrossed },
        { path: '/kitchen/chat-list', label: 'Chat List', icon: MessageCircle },
        { path: '/kitchen/profile', label: 'Profile', icon: UserCircle },
      ]
    : [
        { path: '/kitchen', label: 'Home', icon: Home },
        { path: '/kitchen/branches', label: 'Branches', icon: GitBranch },
        { path: '/kitchen/profile', label: 'Profile', icon: UserCircle },
      ];

  return (
    <div className="border-t border-gray-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 flex items-center sticky bottom-0 z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
      {navItems.map(item => {
        const isActive = (() => {
          if (location.pathname === item.path) return true;
          if (isBranchScopeScreen && item.path === '/kitchen/orders') return true;
          if (item.path !== '/kitchen' && location.pathname.startsWith(`${item.path}/`)) return true;
          return false;
        })();
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
              isActive ? 'text-red-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`rounded-xl px-3 py-1 transition-all ${isActive ? 'bg-red-50 shadow-sm' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
