import React from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';

export function KitchenCoupons() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="bg-red-700 px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white flex-1 text-center" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            Coupons
          </h2>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="text-center text-stone-500">Manage your coupons here.</p>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
