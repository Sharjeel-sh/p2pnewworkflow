import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Eye, EyeOff, Store } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { useApp } from '../../context/AppContext';

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length > 11 && digits.startsWith('92')) {
    return `0${digits.slice(-10)}`;
  }
  if (digits.length === 10) {
    return `0${digits}`;
  }
  return digits.slice(0, 11);
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function VendorLoginScreen() {
  const navigate = useNavigate();
  const { loginKitchenOwner, setCurrentUser } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || !password.trim()) {
      setError('Please enter phone number and password.');
      return;
    }
    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 500));

    const org = loginKitchenOwner(normalizePhone(phoneDigits), password.trim());
    setLoading(false);

    if (!org) {
      setError('Invalid phone number or password.');
      return;
    }

    if (org.verificationStatus === 'pending') {
      setError('Your organization is still under verification. Please wait for approval.');
      return;
    }

    setCurrentUser({ role: 'kitchen', orgId: org.id });
    navigate('/kitchen/dashboard');
  };

  return (
    <MobileLayout>
      <TopBar title="Restaurant Sign In" backTo="/vendor/register" />

      <div className="flex-1 px-6 pt-8 pb-8 flex flex-col">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
            <Store size={38} className="text-red-700" />
          </div>
          <h2 className="text-stone-800 text-center" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Sign in to your Restaurant
          </h2>
          <p className="text-stone-500 text-center mt-1" style={{ fontSize: '0.87rem' }}>
            Login with your phone number and password.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-700 flex-shrink-0" />
            <p className="text-red-800" style={{ fontSize: '0.82rem' }}>{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-stone-600 mb-2" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => {
                setPhone(formatPhoneInput(e.target.value));
                if (error) setError('');
              }}
              placeholder="03XX-XXXXXXX"
              inputMode="numeric"
              maxLength={12}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-600 bg-gray-50"
              style={{ fontSize: '0.95rem' }}
            />
            <p className="text-gray-500 text-xs mt-1">Use 10 to 11 digits</p>
          </div>

          <div>
            <label className="block text-stone-600 mb-2" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-red-600 bg-gray-50"
                style={{ fontSize: '0.95rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-700 text-white py-4 rounded-2xl hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 disabled:opacity-60"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
