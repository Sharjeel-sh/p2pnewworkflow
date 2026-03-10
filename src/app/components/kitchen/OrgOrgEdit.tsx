import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Save } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function OrgOrgEdit() {
  const { currentUser, organizations, updateOrganization } = useApp();
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === currentUser?.orgId);
  const [form, setForm] = useState({
    orgName: org?.orgName || '',
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

  const handleSave = () => {
    // validate password match if provided
    if (form.password && form.password !== form.confirmPassword) {
      return;
    }
    const updates: any = { orgName: form.orgName.trim() };
    if (form.password) updates.ownerPassword = form.password.trim();
    updateOrganization(org.id, updates);
    navigate('/kitchen/profile');
  };

  return (
    <MobileLayout>
      <div className="bg-red-600 px-5 pt-10 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Edit Organization</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-4">
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Organization Name</label>
            <input
              type="text"
              value={form.orgName}
              onChange={e => setForm(prev => ({ ...prev, orgName: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>New Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 bg-gray-50"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-red-600 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
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
