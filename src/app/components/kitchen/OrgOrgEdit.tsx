import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Save, Camera } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function OrgOrgEdit() {
  const { currentUser, organizations, updateOrganization } = useApp();
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === currentUser?.orgId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    orgName: org?.orgName || '',
    address: org?.address || '',
    phone: org?.phone || '',
    description: org?.description || '',
    logoUrl: org?.profilePicture || org?.logoUrl || '',
    password: '',
    confirmPassword: '',
  });

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Organization not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  const handleImagePick: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setForm(prev => ({ ...prev, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // validate password match if provided
    if (form.password && form.password !== form.confirmPassword) {
      return;
    }
    const updates: any = {
      orgName: form.orgName.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      profilePicture: form.logoUrl.trim(),
    };
    if (form.password) updates.ownerPassword = form.password.trim();
    updateOrganization(org.id, updates);
    navigate('/kitchen/profile');
  };

  return (
    <MobileLayout>
      <div className="bg-red-700 px-5 pt-10 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Edit Organization</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 z-10"
              />
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera size={36} />
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                <Camera size={16} className="text-red-700" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
            <p className="text-sm text-stone-500">Organization logo</p>
          </div>

          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Organization Name</label>
            <input
              type="text"
              value={form.orgName}
              onChange={e => setForm(prev => ({ ...prev, orgName: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
          </div>
          <div>
          </div>
          <div>

          </div>
          <div>

          </div>
          <button
            onClick={handleSave}
            className="w-full bg-red-700 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 transition-colors"
            style={{ fontWeight: 700 }}
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
      <KitchenBottomNav />
    </MobileLayout>
  );
}
