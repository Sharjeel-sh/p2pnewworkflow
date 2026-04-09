import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Utensils, Bike, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
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

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { value: 'buyer', label: 'Buyer', icon: <ShoppingBag size={24} />, desc: 'Browse & order food', color: 'from-amber-50 to-orange-50' },
  { value: 'kitchen', label: 'Kitchen', icon: <Utensils size={24} />, desc: 'Manage your restaurant', color: 'from-red-50 to-pink-50' },
  { value: 'rider', label: 'Rider', icon: <Bike size={24} />, desc: 'Deliver orders', color: 'from-blue-50 to-cyan-50' },
];

export function WelcomeScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  const selectedOption = ROLE_OPTIONS.find(r => r.value === selectedRole)!;

  const handleGetStarted = () => {
    if (selectedRole === 'buyer') {
      setCurrentUser({ role: 'buyer', buyerName: 'Guest' });
      navigate('/buyer');
    } else if (selectedRole === 'kitchen') {
      navigate('/kitchen/onboarding');
    } else if (selectedRole === 'rider') {
      navigate('/rider/login');
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-full bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-col overflow-y-auto">

        {/* Food Image Grid with Overlay */}
        <div className="relative px-5 pt-8 pb-12">
          <div className="relative">
            <div className="grid grid-cols-3 gap-2.5" style={{ height: '16rem' }}>
              {/* Left column — 3 equal rows */}
              <div className="flex flex-col gap-2.5">
                <div className="rounded-3xl overflow-hidden flex-1 shadow-md hover:shadow-lg transition-shadow">
                  <img src={FOOD_IMGS[0]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden flex-1 shadow-md hover:shadow-lg transition-shadow">
                  <img src={FOOD_IMGS[3]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden flex-1 shadow-md hover:shadow-lg transition-shadow">
                  <img src={FOOD_IMGS[5]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Center column — tall / heart / tall */}
              <div className="flex flex-col gap-2.5">
                <div className="rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow" style={{ flex: 2.2 }}>
                  <img src={FOOD_IMGS[1]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 rounded-3xl shadow-md">
                  <Heart size={28} color="white" strokeWidth={1.5} className="drop-shadow-lg" />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow" style={{ flex: 2.2 }}>
                  <img src={FOOD_IMGS[6]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Right column — 3 equal rows */}
              <div className="flex flex-col gap-2.5">
                <div className="rounded-3xl overflow-hidden flex-1 shadow-md hover:shadow-lg transition-shadow">
                  <img src={FOOD_IMGS[2]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden flex-1 shadow-md hover:shadow-lg transition-shadow">
                  <img src={FOOD_IMGS[4]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden flex-1 shadow-md hover:shadow-lg transition-shadow">
                  <img src={FOOD_IMGS[7]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="px-6 pb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">P2P</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">P2P Delivery</h1>
            <p className="text-slate-600 font-medium">Connecting kitchens, riders, and hungry customers</p>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="px-6 pb-8">
          <div className="mb-2">
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Choose Your Role</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedRole(opt.value)}
                className={`group relative p-4 rounded-2xl text-left transition-all duration-300 transform ${
                  selectedRole === opt.value 
                    ? 'ring-2 ring-red-600 shadow-lg scale-100' 
                    : 'hover:shadow-md hover:scale-102'
                }`}
                style={{
                  background: selectedRole === opt.value
                    ? 'linear-gradient(135deg, rgba(255,255,255,1), rgba(254,242,242,1))'
                    : `linear-gradient(135deg, rgba(255,255,255,0.8), rgba(249,250,251,0.8))`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl transition-colors ${
                      selectedRole === opt.value
                        ? 'bg-gradient-to-br from-red-600 to-red-700'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200'
                    }`}>
                      <span className={selectedRole === opt.value ? 'text-white' : 'text-slate-700'}>
                        {opt.icon}
                      </span>
                    </div>
                    <div>
                      <p className={`font-bold text-lg transition-colors ${
                        selectedRole === opt.value ? 'text-red-700' : 'text-slate-900'
                      }`}>
                        {opt.label}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  {selectedRole === opt.value && (
                    <div className="text-red-600 animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="px-6 mb-8">
          <div className={`rounded-2xl p-4 backdrop-blur-sm border-2 transition-all ${
            selectedRole === 'buyer' 
              ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' 
              : selectedRole === 'kitchen'
              ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
              : 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50'
          }`}>
            {selectedRole === 'buyer' && (
              <p className="text-sm font-medium text-amber-900">
                ✨ Browse restaurants, customize orders, and track deliveries <strong>instantly</strong> without signup.
              </p>
            )}
            {selectedRole === 'kitchen' && (
              <p className="text-sm font-medium text-red-900">
                🏪 Register your organization, manage multiple branches, menus, and real-time orders.
              </p>
            )}
            {selectedRole === 'rider' && (
              <p className="text-sm font-medium text-blue-900">
                🚴 Accept deliveries, track earnings, and build your reputation on the platform.
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-8 flex-1 flex flex-col justify-end">
          <button
            onClick={handleGetStarted}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg transition-all duration-300 transform hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Secondary Info */}
          <p className="text-center text-xs text-slate-500 font-medium mt-4 uppercase tracking-widest">
            Terms & Conditions Apply
          </p>
        </div>

      </div>
    </MobileLayout>
  );
}
