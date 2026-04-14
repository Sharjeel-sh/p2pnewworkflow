import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Utensils, Bike, ShoppingBag, Heart } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../context/AppContext';

const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=260&fit=crop', // puri
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=420&fit=crop', // paneer (center tall top)
  'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=200&h=260&fit=crop', // biryani right top
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=260&fit=crop', // paratha left mid
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=260&fit=crop', // nihari right mid
  'https://images.unsplash.com/photo-1567337710282-00832b415979?w=200&h=260&fit=crop', // bhindi left bot
  'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=200&h=420&fit=crop', // curry (center tall bot)
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=260&fit=crop', // biryani right bot
];

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'buyer', label: 'Buyer', icon: <ShoppingBag size={20} />, desc: 'Browse & order food' },
  { value: 'kitchen', label: 'Restaurant', icon: <Utensils size={20} />, desc: 'Manage your kitchen' },
  { value: 'manager', label: 'Manager', icon: <Utensils size={20} />, desc: 'Manage your branch' },
  { value: 'rider', label: 'Rider', icon: <Bike size={20} />, desc: 'Deliver orders' },
];

export function WelcomeScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser, createApplicationMockData, resetApplicationData } = useApp();

  const selectedOption = ROLE_OPTIONS.find(r => r.value === selectedRole)!;

  const handleGetStarted = () => {
    if (selectedRole === 'buyer') {
      setCurrentUser({ role: 'buyer', buyerName: 'Guest' });
      navigate('/buyer');
    } else if (selectedRole === 'kitchen') {
      navigate('/vendor/register');
    } else if (selectedRole === 'manager') {
      navigate('/kitchen/manager/login');
    } else if (selectedRole === 'rider') {
      navigate('/rider/login');
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-full bg-red-800 flex flex-col overflow-y-auto">

        {/* Food Image Grid */}
        <div className="px-5 pt-10 pb-8">
          <div className="grid grid-cols-3 gap-2" style={{ height: '17rem' }}>
            {/* Left column — 3 equal rows */}
            <div className="flex flex-col gap-2">
              <div className="rounded-2xl overflow-hidden flex-1">
                <img src={FOOD_IMGS[0]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1">
                <img src={FOOD_IMGS[3]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1">
                <img src={FOOD_IMGS[5]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Center column — tall / heart / tall */}
            <div className="flex flex-col gap-2">
              <div className="rounded-2xl overflow-hidden" style={{ flex: 2.2 }}>
                <img src={FOOD_IMGS[1]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center" style={{ flex: 0.7 }}>
                <Heart size={26} color="white" strokeWidth={1.5} />
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ flex: 2.2 }}>
              </div>
            </div>

            {/* Right column — 3 equal rows */}
            <div className="flex flex-col gap-2">
              <div className="rounded-2xl overflow-hidden flex-1">
                <img src={FOOD_IMGS[2]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1">
                <img src={FOOD_IMGS[4]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden flex-1">
                <img src={FOOD_IMGS[7]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center px-25 pt-25 pb-10">
          <h1 className="text-white" style={{ fontSize: '2.0rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
            P2P
          </h1>
          <p className="text-white mt-1" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Food Delivery App
          </p>
        </div>

        {/* Role Selector */}
        <div className="px-6 py-6">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full rounded-2xl px-4 py-3.5 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-white">{selectedOption.icon}</span>
                <div className="text-left">
                  <p className="text-white" style={{ fontWeight: 600 }}>{selectedOption.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{selectedOption.desc}</p>
                </div>
              </div>
              <ChevronDown
                size={20}
                color="rgba(255,255,255,0.8)"
                className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelectedRole(opt.value); setShowDropdown(false); }}
                    className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors ${selectedRole === opt.value ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={selectedRole === opt.value ? 'text-red-700' : 'text-stone-400'}>
                      {opt.icon}
                    </span>
                    <div className="text-left">
                      <p className={selectedRole === opt.value ? 'text-red-800' : 'text-stone-800'} style={{ fontWeight: 600 }}>
                        {opt.label}
                      </p>
                      <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>{opt.desc}</p>
                    </div>
                    {selectedRole === opt.value && (
                      <div className="ml-auto w-2 h-2 bg-red-700 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="px-6 ">
          {selectedRole === 'buyer' && (
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                As a <strong>Buyer</strong>, you can browse restaurants and place orders without signing up.
              </p>
            </div>
          )}
          {selectedRole === 'kitchen' && (
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                As a <strong>Kitchen</strong>, register your organization to manage branches, menus, and orders.
              </p>
            </div>
          )}
          {selectedRole === 'manager' && (
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                As a <strong>Manager</strong>, log in using credentials provided by your kitchen owner to manage your branch.
              </p>
            </div>
          )}
          {selectedRole === 'rider' && (
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                As a <strong>Rider</strong>, log in using credentials provided by your kitchen manager.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 mb-5 space-y-3">
          <button
            onClick={() => navigate('/kitchen/register')}
            className="w-full py-3 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Organization Screen
          </button>
          <button
            onClick={() => {
              resetApplicationData();
              createApplicationMockData();
            }}
            className="w-full py-3 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Mock Data
          </button>
          <button
            onClick={resetApplicationData}
            className="w-full py-3 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.22)', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Clear Mock Data
          </button>
          <button
            onClick={handleGetStarted}
            className="w-full py-4 rounded-full bg-white active:scale-95 transition-all shadow-lg"
            style={{ fontWeight: 800, fontSize: '1.1rem', color: '#dc2626' }}
          >
            Get Started
          </button>
        </div>

        {/* Terms */}
        <div className="text-center py-5">
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>Terms &amp; Conditions</p>
        </div>

      </div>
    </MobileLayout>
  );
}
