import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Home, Phone, MapPin, User, Pencil, LogOut, Save, X, FileText, Image, CreditCard, Hash, CheckCircle2, UserCog, Bike, ChevronRight, ChevronLeft, GitBranch, UtensilsCrossed, Clock, Truck, BarChart2, Bell, ShieldCheck } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function OrgProfile() {
  const { currentUser, organizations, updateOrganization, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === currentUser?.orgId);
  const isBranchManager = Boolean(currentUser?.branchId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    profilePicture: org?.profilePicture || '',
  });

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center"><p className="text-stone-500">Organization not found.</p></div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }


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

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-orange-500 px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white flex-1 text-center" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Organization Profile</h2>
          <div className="w-8" />
        </div>
      </div>

 {/* Organization image */}
      <div className="flex justify-center mt-4">
        <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 z-10"
          />
          {form.profilePicture ? (
            <img src={form.profilePicture} alt="Org" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-gray-400" />
          )}
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
            <Image size={16} className="text-orange-500" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* list menu */}
        <div className="space-y-3">
          {[
              { icon: Building2, label: 'Edit my profile information', action: () => navigate('/kitchen/profile/edit') },
              { icon: UserCog,   label: 'Manager',                       action: () => navigate('/kitchen/manager') },
              { icon: Bike,      label: 'Rider',                         action: () => navigate('/kitchen/rider') },
              { icon: Bell,      label: 'Help & Support',               action: () => navigate('/help') },
            ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <item.icon size={18} />
                </div>
                <span className="flex-1 text-left" style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

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

      <KitchenBottomNav />
    </MobileLayout>
  );
}

export function OrgEdit() {
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
        <div className="flex-1 flex items-center justify-center"><p className="text-stone-500">Organization not found.</p></div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  const handleSave = () => {
    // validate password only if provided
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
      <div className="bg-orange-500 px-5 pt-10 pb-8">
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
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>New Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-orange-500 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
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
