import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bike, Phone, User, Pencil, Save, LogOut, Image as ImageIcon, X } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { RiderBottomNav } from './RiderBottomNav';

export function RiderProfile() {
  const { currentUser, riders, updateRider, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const rider = riders.find(r => r.id === currentUser?.riderId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: rider?.name || '',
    phone: rider?.phone || '',
    profilePicture: rider?.profilePicture || '',
  });

  if (!rider) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Rider profile not found.</p>
        </div>
      </MobileLayout>
    );
  }

  const startEdit = () => {
    setForm({
      name: rider.name,
      phone: rider.phone || '',
      profilePicture: rider.profilePicture || '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    updateRider(rider.id, {
      name: form.name.trim(),
      phone: form.phone.trim(),
      profilePicture: form.profilePicture.trim(),
    });
    setEditing(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <MobileLayout>
      <div className="bg-green-500 px-5 pt-10 pb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Rider Profile</h2>
          <button
            onClick={editing ? () => setEditing(false) : startEdit}
            className="bg-green-400/50 text-white rounded-xl p-2 hover:bg-green-400/70 transition-colors"
          >
            {editing ? <X size={18} /> : <Pencil size={18} />}
          </button>
        </div>

        <div className="bg-white/15 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
            {rider.profilePicture ? (
              <img src={rider.profilePicture} alt="Rider" className="w-full h-full object-cover" />
            ) : (
              <Bike size={26} className="text-green-600" />
            )}
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{rider.name}</p>
            <p className="text-green-100" style={{ fontSize: '0.78rem' }}>{rider.username}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Contact Number (Optional)</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Profile Picture URL (Optional)</label>
              <input
                type="text"
                value={form.profilePicture}
                onChange={e => setForm(prev => ({ ...prev, profilePicture: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-green-500 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Save size={18} /> Save Profile
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <User size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>Name</p>
                <p className="text-stone-800" style={{ fontWeight: 500 }}>{rider.name}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Phone size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>Contact</p>
                <p className="text-stone-800" style={{ fontWeight: 500 }}>{rider.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <ImageIcon size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>Profile Picture</p>
                <p className="text-stone-800" style={{ fontWeight: 500 }}>{rider.profilePicture ? 'Configured' : 'Not set'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full border-2 border-red-100 text-red-500 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <RiderBottomNav />
    </MobileLayout>
  );
}
