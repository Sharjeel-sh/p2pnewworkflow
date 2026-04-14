import React from 'react';
import { useNavigate } from 'react-router';
import { Utensils, Bike, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { useApp } from '../../context/AppContext';

export function SignupScreen() {
  const navigate = useNavigate();
  const { setCurrentUser, organizations } = useApp();

  const handleDemoKitchen = (orgId: string) => {
    setCurrentUser({ role: 'kitchen', orgId });
    navigate('/kitchen/dashboard');
  };

  return (
    <MobileLayout>
      <TopBar title="Create Account" backTo="/" />

      <div className="flex-1 px-6 pt-8 pb-8 flex flex-col overflow-y-auto">
        {/* Demo Quick Login for Kitchen */}
        {organizations.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap size={14} className="text-amber-600" />
              <p className="text-amber-700" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Demo: Quick Login as existing Kitchen
              </p>
            </div>
            <div className="space-y-2">
              {organizations.map(org => (
                <button
                  key={org.id}
                  onClick={() => handleDemoKitchen(org.id)}
                  className="w-full text-left px-3.5 py-2.5 bg-white border border-amber-100 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center justify-between"
                >
                  <span className="text-stone-700" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {org.orgName}
                  </span>
                  <span className="text-stone-400" style={{ fontSize: '0.82rem' }}>
                    {org.type === 'restaurant' ? '🏪 Restaurant' : '🏠 Home-Made'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <button
            onClick={() => navigate('/kitchen/onboarding')}
            className="w-full text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-red-700 hover:bg-red-800 shadow-red-200"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            Register New Organization
            <ArrowRight size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/kitchen/login')}
            className="w-full mt-3 border border-gray-200 text-stone-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            style={{ fontSize: '0.86rem', fontWeight: 600 }}
          >
            Kitchen Owner Sign In
          </button>

          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => navigate('/kitchen/manager/login')}
              className="w-full border border-gray-200 text-stone-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-center"
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Branch Manager
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/rider/login')}
              className="w-full border border-gray-200 text-stone-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-center"
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Bike size={14} />
                Rider Login
              </span>
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
