import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Bike, Phone, User, Pencil, Save, LogOut, Image as ImageIcon, X, ChevronRight } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImagePick: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setForm(prev => ({ ...prev, profilePicture: String(reader.result) }));
      }
    };
    reader.readAsDataURL(file);
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
      {/* header gradient */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-5 pt-10 pb-6 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center">
              {rider.profilePicture ? (
                <img src={rider.profilePicture} alt="Rider" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold leading-tight">{rider.name}</h2>
              <p className="text-green-100 text-sm mt-1">{rider.phone || 'No contact'}</p>
            </div>
          </div>
          <button
            onClick={editing ? () => setEditing(false) : startEdit}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
          >
            {editing ? <X size={18} className="text-green-600" /> : <Pencil size={18} className="text-green-600" />}
          </button>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 bg-[#F8F9FB]">
        {editing ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                {form.profilePicture ? (
                  <img src={form.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-green-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-green-600 text-sm underline"
              >
                Change photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 bg-white shadow-sm"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-green-500 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow"
              style={{ fontWeight: 700 }}
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={startEdit}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Name</p>
                  <p className="text-stone-800 font-semibold">{rider.name}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={startEdit}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Contact</p>
                  <p className="text-stone-800 font-semibold">{rider.phone || 'Not set'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            <button
              onClick={startEdit}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ImageIcon size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-stone-400 text-xs">Profile Picture</p>
                  <p className="text-stone-800 font-semibold">{rider.profilePicture ? 'Configured' : 'Not set'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-700 border border-red-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
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
