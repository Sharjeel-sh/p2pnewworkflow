import React from 'react';
import { useNavigate } from 'react-router';
import { Bell, User, GitBranch, FileText, LogOut, Camera, ChevronRight } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function KitchenProfile() {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <MobileLayout>
      {/* header */}
      <div className="bg-red-700 px-5 pt-9 pb-4 flex items-center justify-between">
        <div className="w-8" />
        <h2 className="text-white text-lg font-bold">Profile Settings</h2>
        <button
          type="button"
          onClick={() => navigate('/kitchen/notifications')}
          className="text-white"
          aria-label="Open notifications"
        >
          <Bell size={24} className="text-white" />
        </button>
      </div>

      {/* avatar */}
      <div className="flex justify-center mt-4">
        <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-red-700">
          <User size={40} className="text-gray-400" />
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md z-20">
            <Camera size={16} className="text-red-700" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-3">
          {([
            { icon: User,     label: 'Edit Organization', action: () => navigate('/kitchen/profile/edit') },
            { icon: GitBranch, label: 'Edit branch details', action: () => navigate('/kitchen/profile/branch-edit') },
            { icon: FileText, label: 'Coupons',                action: () => navigate('/kitchen/profile/coupons') },
            { icon: FileText, label: 'Discounts',              action: () => navigate('/kitchen/profile/discounts') },           
            { icon: FileText, label: 'Terms & Conditions',         action: () => navigate('/terms') },
            { icon: Bell,     label: 'Help & Support',             action: () => navigate('/help') },
            { icon: GitBranch, label: 'Back to Organization',   action: () => navigate('/kitchen') },
            { icon: LogOut,   label: 'Log out',                action: handleLogout, isDestructive: true },
          ] as Array<{ icon: any; label: string; action: () => void; isDestructive?: boolean }>).map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm ${
                item.isDestructive ? 'text-red-700' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <item.icon size={18} />
                </div>
                <span className="flex-1 text-left" style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
              {!item.isDestructive && <ChevronRight size={16} className="text-gray-400" />}
            </button>
          ))}
        </div>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
