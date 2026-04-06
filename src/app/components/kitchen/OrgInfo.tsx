import React from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function OrgInfo() {
  const { currentUser, organizations } = useApp();
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === currentUser?.orgId);

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Organization not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-700 px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h2
            className="text-white flex-1 text-center"
            style={{ fontSize: '1.3rem', fontWeight: 700 }}
          >
            Organization Information
          </h2>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 text-stone-700">
          <div className="flex justify-between">
            <p className="text-sm text-stone-500">Phone Number</p>
            <p className="font-medium">{org.phone || 'N/A'}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-stone-500">Email</p>
            <p className="font-medium truncate max-w-[60%]">{org.ownerEmail || 'N/A'}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-stone-500">Address</p>
            <p className="font-medium truncate max-w-[60%]">{org.address || 'N/A'}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-stone-500">Cnic Number</p>
            <p className="font-medium">{org.ntn || 'N/A'}</p>
          </div>
        </div>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
