import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Bike, AlertCircle } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { useApp } from '../../context/AppContext';

export function RiderLoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginRider, setCurrentUser, riders } = useApp();

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('Please enter both phone number and password.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const credentialsMatch = riders.find(
      r => r.phone === phone.trim() && r.password === password.trim(),
    );
    const rider = loginRider(phone.trim(), password.trim());
    setLoading(false);
    if (rider) {
      setCurrentUser({ role: 'rider', riderId: rider.id, orgId: rider.orgId });
      navigate('/rider');
    } else if (credentialsMatch && !credentialsMatch.isAvailable) {
      setError('Your rider account is inactive. Contact kitchen admin.');
    } else {
      setError('Invalid credentials. Please check with your Kitchen manager.');
    }
  };

  return (
    <MobileLayout>
      <TopBar title="Rider Login" backTo="/" />

      <div className="flex-1 px-6 pt-8 pb-8 flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
            <Bike size={40} className="text-red-600" />
          </div>
          <h2 className="text-stone-800 text-center" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            Rider Portal
          </h2>
          <p className="text-stone-500 text-center mt-1" style={{ fontSize: '0.87rem' }}>
            Sign in with credentials from your Kitchen
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <p className="text-blue-600" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Demo Credentials:</p>
          <p className="text-blue-500" style={{ fontSize: '0.75rem' }}>Phone: 0312-9876543 / 0333-2345678 / 0344-5678901</p>
          <p className="text-blue-500" style={{ fontSize: '0.75rem' }}>Password: pass123</p>
          <button
            type="button"
            onClick={() => { setPhone('0312-9876543'); setPassword('pass123'); }}
            className="mt-2 w-full text-center py-2 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition"
          >
            Use first demo login
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-700 flex-shrink-0" />
            <p className="text-red-800" style={{ fontSize: '0.82rem' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-stone-600 mb-2" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-500 bg-gray-50"
              style={{ fontSize: '0.95rem' }}
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-2" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-red-500 bg-gray-50"
                style={{ fontSize: '0.95rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200 disabled:opacity-60"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
