import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, UserCircle, ClipboardList, UtensilsCrossed, GitBranch, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function KitchenBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser } = useApp();
  const isBranchManager = Boolean(currentUser?.branchId);

  // Org-mode paths always show org nav regardless of branch manager status
  const isOrgSection =
    location.pathname === '/kitchen' ||
    location.pathname === '/kitchen/dashboard' ||
    location.pathname.startsWith('/kitchen/branches') ||
    location.pathname.startsWith('/kitchen/profile/organization') ||
    location.pathname.startsWith('/kitchen/profile/info') ||
    location.pathname.startsWith('/kitchen/profile/org-edit');

  // Kitchen-mode paths
  const isKitchenSection =
    location.pathname === '/kitchen/order/dashboard' ||
    location.pathname === '/kitchen/orders' ||
    location.pathname.startsWith('/kitchen/orders/') ||
    location.pathname.startsWith('/kitchen/dishes') ||
    location.pathname.startsWith('/kitchen/chat-list') ||
    location.pathname.startsWith('/kitchen/branch/') ||
    location.pathname === '/kitchen/profile' ||
    location.pathname.startsWith('/kitchen/profile/coupons') ||
    location.pathname.startsWith('/kitchen/profile/discounts') ||
    location.pathname.startsWith('/kitchen/profile/kitchen-info') ||
    location.pathname.startsWith('/kitchen/profile/edit');

  // Org paths take priority; branch manager flag only applies when NOT on an org path
  const useKitchenNav = !isOrgSection && (isBranchManager || isKitchenSection);

  const navItems = useKitchenNav

    ? [
        { path: '/kitchen/order/dashboard', label: 'Home', icon: Home },
        { path: '/kitchen/orders', label: 'Orders', icon: ClipboardList },
        { path: '/kitchen/dishes', label: 'Dishes', icon: UtensilsCrossed },
        { path: '/kitchen/chat-list', label: 'Chat List', icon: MessageCircle },
        { path: '/kitchen/profile', label: 'Profile', icon: UserCircle },
      ]
    : [
        { path: '/kitchen', label: 'Home', icon: Home },
        // pressing branches sends to branch list
        { path: '/kitchen/branches', label: 'Branches', icon: GitBranch },
        // organization profile should show org details
        { path: '/kitchen/profile/organization', label: 'Profile', icon: UserCircle },
      ];

  return (
    <div className="border-t border-gray-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 flex items-center sticky bottom-0 z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
      {navItems.map(item => {
        const isActive = (() => {
          if (location.pathname === item.path) return true;
          if (item.path === '/kitchen/orders' && location.pathname.startsWith('/kitchen/orders')) return true;
          if (item.path !== '/kitchen' && location.pathname.startsWith(`${item.path}/`)) return true;
          return false;
        })();
        const Icon = item.icon;
        return (
          <button
              key={item.path}
                onClick={() => {
                  // ensure the 'Branches' button always goes to branch list
                  try {
                    if (item.label === 'Branches') {
                      // clear any active branch selection so org branch list is shown
                      if (currentUser) setCurrentUser({ ...currentUser, branchId: undefined });
                      navigate('/kitchen/branches');
                    } else navigate(item.path);
                  } catch (e) {
                    navigate(item.path);
                  }
                }}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
              isActive ? 'text-red-800' : 'text-gray-400 hover:text-gray-600'
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
