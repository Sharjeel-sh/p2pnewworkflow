import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Utensils, Bike, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { useApp } from '../../context/AppContext';

export function SignupScreen() {
  const [selectedRole, setSelectedRole] = useState<'kitchen' | 'branch_manager' | 'rider'>('kitchen');
  const navigate = useNavigate();
  const { setCurrentUser, organizations } = useApp();

  const handleProceed = () => {
    if (selectedRole === 'kitchen') {
      navigate('/kitchen/register');
    } else if (selectedRole === 'branch_manager') {
      navigate('/kitchen/manager/login');
    } else {
      navigate('/rider/login');
    }
  };

  const handleDemoKitchen = (orgId: string) => {
    setCurrentUser({ role: 'kitchen', orgId });
    navigate('/kitchen');
  };

  return (
    <MobileLayout>
      <TopBar title="Create Account" backTo="/" />

      <div className="flex-1 px-6 pt-8 pb-8 flex flex-col overflow-y-auto">
        <div className="mb-7">
          <h2 className="text-stone-800 mb-2" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            Join QuickBite
          </h2>
          <p className="text-stone-500" style={{ fontSize: '0.9rem' }}>
            Select your role to continue with registration
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4 mb-5">
          <button
            onClick={() => setSelectedRole('kitchen')}
            className={`w-full rounded-2xl p-5 border-2 text-left flex items-center gap-4 transition-all ${
              selectedRole === 'kitchen'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              selectedRole === 'kitchen' ? 'bg-orange-500' : 'bg-gray-100'
            }`}>
              <Utensils size={26} color={selectedRole === 'kitchen' ? 'white' : '#9ca3af'} />
            </div>
            <div className="flex-1">
              <p className={`mb-0.5 ${selectedRole === 'kitchen' ? 'text-orange-700' : 'text-stone-800'}`}
                style={{ fontWeight: 700, fontSize: '1rem' }}>
                Kitchen / Restaurant
              </p>
              <p className="text-stone-500" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                Register your organization, manage branches, dishes, and orders
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selectedRole === 'kitchen' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
            }`}>
              {selectedRole === 'kitchen' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('branch_manager')}
            className={`w-full rounded-2xl p-5 border-2 text-left flex items-center gap-4 transition-all ${
              selectedRole === 'branch_manager'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              selectedRole === 'branch_manager' ? 'bg-orange-500' : 'bg-gray-100'
            }`}>
              <ShieldCheck size={26} color={selectedRole === 'branch_manager' ? 'white' : '#9ca3af'} />
            </div>
            <div className="flex-1">
              <p className={`mb-0.5 ${selectedRole === 'branch_manager' ? 'text-orange-700' : 'text-stone-800'}`}
                style={{ fontWeight: 700, fontSize: '1rem' }}>
                Branch Manager
              </p>
              <p className="text-stone-500" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                Login with credentials shared by organization owner to manage one branch.
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selectedRole === 'branch_manager' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
            }`}>
              {selectedRole === 'branch_manager' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>
        </div>

        {/* Demo Quick Login for Kitchen */}
        {selectedRole === 'kitchen' && organizations.length > 0 && (
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

        {selectedRole !== 'kitchen' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-700" style={{ fontSize: '0.82rem' }}>
              <strong>Note:</strong> Branch managers and riders do not self-register. Use credentials shared by organization owner/kitchen.
            </p>
          </div>
        )}

        <div className="mt-auto pt-4">
          <button
            onClick={handleProceed}
            className={`w-full text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              selectedRole === 'kitchen'
                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                : selectedRole === 'branch_manager'
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                  : 'bg-green-500 hover:bg-green-600 shadow-green-200'
            }`}
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            {selectedRole === 'kitchen' ? 'Register New Organization' : 'Continue to Login'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
