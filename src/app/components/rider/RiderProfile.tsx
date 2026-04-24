import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone, User, LogOut, ChevronRight, Bell, CheckCircle, XCircle, Package } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { RiderBottomNav } from './RiderBottomNav';

export function RiderProfile() {
  const { currentUser, riders, updateRider, setCurrentUser, orders } = useApp();
  const navigate = useNavigate();
  const rider = riders.find(r => r.id === currentUser?.riderId);
  const [view, setView] = useState<'main' | 'edit' | 'history'>('main');
  const [name, setName] = useState(rider?.name || '');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');

  if (!rider) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Rider profile not found.</p>
        </div>
      </MobileLayout>
    );
  }

  const riderOrders = orders.filter(o => o.riderId === rider.id);

  const canUpdatePassword = password.length >= 8 && password === confirmPassword;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleUpdatePassword = () => {
    if (!canUpdatePassword) {
      setPasswordFeedback('Password must be at least 8 characters and match confirmation.');
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setIsPasswordEnabled(false);
    setPasswordFeedback('Password updated successfully.');
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      setPasswordFeedback('Please enter a valid name.');
      return;
    }
    updateRider(rider?.id || '', { name: name.trim() });
    setView('main');
    setPasswordFeedback('Profile updated successfully.');
  };

  return (
    <MobileLayout>
      <div className="bg-gradient-to-r from-red-700 to-red-600 px-4 pt-10 pb-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <User size={18} className="text-red-700" />
            </div>
            <h1 className="text-white text-lg font-bold">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/rider/notifications')}
              className="text-white"
              aria-label="Open notifications"
            >
              <Bell size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 bg-[#F8F9FB]">
        {view === 'main' ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-white rounded-full overflow-hidden border-4 border-red-100 flex items-center justify-center">
                {rider.profilePicture ? (
                  <img src={rider.profilePicture} alt="Rider" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-red-700" />
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setName(rider.name || '');
                setView('edit');
                setIsPasswordEnabled(false);
              }}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <span className="text-stone-700 font-medium">Edit my profile information</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={() => setView('history')}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <span className="text-stone-700 font-medium">History</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        ) : view === 'edit' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <div>
                <p className="text-stone-400 text-xs">Name</p>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 bg-white"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <p className="text-stone-400 text-xs">Phone</p>
                <input
                  type="text"
                  value={rider.phone || 'Not set'}
                  readOnly
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-100 text-stone-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-stone-600 font-medium">Change Password</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordEnabled(prev => !prev);
                    setPasswordFeedback('');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full ${isPasswordEnabled ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}                
                >
                  {isPasswordEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {isPasswordEnabled && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-stone-600 mb-1 text-sm">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 bg-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 text-sm">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 bg-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              )}

              {isPasswordEnabled && (
                <button
                  onClick={handleUpdatePassword}
                  disabled={!canUpdatePassword}
                  className={`w-full mt-3 py-3.5 rounded-2xl text-white ${canUpdatePassword ? 'bg-red-600 hover:bg-red-700' : 'bg-red-200 cursor-not-allowed'}`}
                >
                  Update Password
                </button>
              )}

              {passwordFeedback && <p className="mt-2 text-sm text-green-600">{passwordFeedback}</p>}
            </div>

            <button
              onClick={() => setView('main')}
              className="w-full bg-red-50 text-red-800 border border-red-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <ChevronRight size={18} /> Back
            </button>
          </div>
        ) : (
          // History view
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</h2>
              <div className="space-y-3">
                {riderOrders.slice(-10).reverse().map(order => (
                  <div key={order.id} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100' :
                      (order.status as string) === 'cancelled' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {order.status === 'delivered' ? <CheckCircle size={14} className="text-green-600" /> :
                       (order.status as string) === 'cancelled' ? <XCircle size={14} className="text-red-600" /> :
                       <Package size={14} className="text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700">
                        <span className="font-semibold">#{order.id.slice(-6)}</span> - {order.status}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                {!riderOrders.length && (
                  <p className="text-xs text-gray-400 text-center py-4">No recent orders yet</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setView('main')}
              className="w-full bg-red-50 text-red-800 border border-red-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <ChevronRight size={18} /> Back
            </button>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-800 border border-red-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <RiderBottomNav />
    </MobileLayout>
  );
}
