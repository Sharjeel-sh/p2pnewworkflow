import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Home, Search, ShoppingCart, UserCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { path: '/buyer', label: 'Home', icon: Home },
  { path: '/buyer/search', label: 'Search', icon: Search },
  { path: '/buyer/cart', label: 'Cart', icon: ShoppingCart },
  { path: '/buyer/profile', label: 'Profile', icon: UserCircle },
];

export function BuyerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="border-t border-gray-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 flex items-center sticky bottom-0 z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        const isCart = item.path === '/buyer/cart';
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
              isActive ? 'text-red-800' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`rounded-xl px-3 py-1 transition-all relative ${isActive ? 'bg-red-50 shadow-sm' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}