import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Utensils, Bike, ShoppingBag } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../context/AppContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1598546937882-4fa25fa29418?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaXZlcnklMjBhcHAlMjBoZXJvJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzIwMjIzODl8MA&ixlib=rb-4.1.0&q=80&w=1080';

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'buyer', label: 'Buyer', icon: <ShoppingBag size={20} />, desc: 'Browse & order food' },
  { value: 'kitchen', label: 'Kitchen', icon: <Utensils size={20} />, desc: 'Manage your restaurant' },
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
      navigate('/kitchen/onboarding');
    } else if (selectedRole === 'rider') {
      navigate('/rider/login');
    }
  };

  return (
    <MobileLayout>
      {/* Hero Section */}
      <div className="relative h-72 overflow-hidden">
        <img src={HERO_IMG} alt="Food Delivery" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-500 rounded-xl p-2">
              <Utensils size={24} color="white" />
            </div>
          </div>
          <h1 className="text-white text-center" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>
            QuickBite
          </h1>
          <p className="text-white/80 text-center mt-1" style={{ fontSize: '0.95rem' }}>
            Fresh food, fast delivery
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-8">
        <div className="mb-8">
          <h2 className="text-stone-800 mb-1" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Welcome!</h2>
          <p className="text-stone-500" style={{ fontSize: '0.9rem' }}>Select your role to get started</p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-stone-600 mb-2" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            I am a...
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full border-2 border-orange-200 rounded-2xl px-4 py-3.5 flex items-center justify-between bg-orange-50 hover:border-orange-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-orange-500">{selectedOption.icon}</span>
                <div className="text-left">
                  <p className="text-stone-800" style={{ fontWeight: 600 }}>{selectedOption.label}</p>
                  <p className="text-stone-500" style={{ fontSize: '0.78rem' }}>{selectedOption.desc}</p>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-orange-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelectedRole(opt.value); setShowDropdown(false); }}
                    className={`w-full px-4 py-3.5 flex items-center gap-3 hover:bg-orange-50 transition-colors ${selectedRole === opt.value ? 'bg-orange-50' : ''}`}
                  >
                    <span className={`${selectedRole === opt.value ? 'text-orange-500' : 'text-stone-400'}`}>{opt.icon}</span>
                    <div className="text-left">
                      <p className={`${selectedRole === opt.value ? 'text-orange-600' : 'text-stone-800'}`} style={{ fontWeight: 600 }}>
                        {opt.label}
                      </p>
                      <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>{opt.desc}</p>
                    </div>
                    {selectedRole === opt.value && (
                      <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Role Description Cards */}

        {/* Info box */}
        {selectedRole === 'buyer' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 mb-6">
            <p className="text-blue-700" style={{ fontSize: '0.82rem' }}>
              As a <strong>Buyer</strong>, you can browse restaurants and place orders without signing up.
            </p>
          </div>
        )}
        {selectedRole === 'kitchen' && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3.5 mb-6">
            <p className="text-orange-700" style={{ fontSize: '0.82rem' }}>
              As a <strong>Kitchen</strong>, register your organization to manage branches, menus, and orders.
            </p>
          </div>
        )}
        {selectedRole === 'rider' && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-3.5 mb-6">
            <p className="text-green-700" style={{ fontSize: '0.82rem' }}>
              As a <strong>Rider</strong>, log in using credentials provided by your kitchen manager.
            </p>
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={createApplicationMockData}
            className="w-full mb-3 border-2 border-orange-200 text-orange-600 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
            style={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            Load Full Mock Data
          </button>
          <button
            onClick={resetApplicationData}
            className="w-full mb-3 border-2 border-red-200 text-red-600 py-3 rounded-2xl hover:bg-red-50 transition-colors"
            style={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            Clear All Data
          </button>
          <button
            onClick={handleGetStarted}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            Get Started →
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
