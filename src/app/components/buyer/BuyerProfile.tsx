import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Phone, MapPin, Edit, LogOut, Save, X } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';

export function BuyerProfile() {
  const { currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.buyerName || 'Guest',
    phone: '0300-1234567',
    address: 'Karachi, Pakistan',
  });

  const handleSave = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        buyerName: form.name.trim(),
      });
    }
    setEditing(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-600 px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Profile</h2>
          <button
            onClick={editing ? () => setEditing(false) : () => setEditing(true)}
            className="bg-white/20 text-white rounded-xl p-2 hover:bg-white/30 transition-colors"
          >
            {editing ? <X size={18} /> : <Edit size={18} />}
          </button>
        </div>

        <div className="bg-white/15 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg px-3 py-2 w-full"
                placeholder="Your name"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />
            ) : (
              <h3 className="text-white" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{form.name}</h3>
            )}
            <p className="text-red-100" style={{ fontSize: '0.85rem' }}>Food Lover</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {/* Phone */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Phone size={20} className="text-red-600" />
              <span className="text-stone-700" style={{ fontWeight: 600 }}>Phone Number</span>
            </div>
            {editing ? (
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-stone-700"
                placeholder="Phone number"
              />
            ) : (
              <p className="text-stone-500 ml-8">{form.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={20} className="text-red-600" />
              <span className="text-stone-700" style={{ fontWeight: 600 }}>Delivery Address</span>
            </div>
            {editing ? (
              <textarea
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-stone-700 resize-none"
                placeholder="Delivery address"
                rows={2}
              />
            ) : (
              <p className="text-stone-500 ml-8">{form.address}</p>
            )}
          </div>

          {editing && (
            <button
              onClick={handleSave}
              className="w-full bg-red-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md shadow-red-200"
              style={{ fontWeight: 700 }}
            >
              <Save size={18} />
              Save Changes
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md shadow-red-200 mt-8"
            style={{ fontWeight: 700 }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
      <BuyerBottomNav />
    </MobileLayout>
  );
}