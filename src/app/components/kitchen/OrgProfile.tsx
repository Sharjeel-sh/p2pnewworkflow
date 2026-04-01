import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Home, Phone, MapPin, User, Pencil, LogOut, Save, X, FileText, Image, Camera, CreditCard, Hash, CheckCircle2, UserCog, Bike, ChevronRight, ChevronLeft, GitBranch, UtensilsCrossed, Clock, Truck, BarChart2, Bell, ShieldCheck, Globe, Trash2, AlertTriangle } from 'lucide-react';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(org?.notificationsEnabled ?? true);

  useEffect(() => {
    if (org?.notificationsEnabled !== undefined) {
      setNotificationsEnabled(org.notificationsEnabled);
    }
  }, [org]);

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    if (org) {
      updateOrganization(org.id, { notificationsEnabled: newValue });
    }
  };

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
      <div className="bg-red-700 px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white flex-1 text-center" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Organization Profile</h2>
          <button
            onClick={() => updateOrganization(org.id, { verified: !org.verified })}
            className="flex items-center"
          >
            {org?.verified ? <ShieldCheck size={55} className="text-green-400" /> : <AlertTriangle size={55} className="text-yellow-400" />}            <span className="ml-1 text-xs text-white">{org?.verified ? "Verified" : "Pending"}</span>          </button>
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
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md ">
            <Camera size={16} className="text-red-700" />
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
          {([
                { icon: FileText, label: 'Organization Registration Details', action: () => navigate('/kitchen/profile/info') },
              { icon: Building2, label: 'Edit Organization information', action: () => navigate('/kitchen/profile/org-edit') },
              { icon: Building2, label: 'Edit owner profile information', action: () => navigate('/kitchen/profile/edit') },
              { icon: BarChart2, label: 'App Setting', action: () => navigate('/kitchen/profile/app-setting') },
              { icon: UserCog,   label: 'Manager',                       action: () => navigate('/kitchen/manager') },
              { icon: Bike,      label: 'Rider',                         action: () => navigate('/kitchen/rider') },
              { icon: Bell,      label: 'Help & Support',               action: () => navigate('/help') },
              { icon: LogOut,    label: 'Logout',                       action: handleLogout, isDestructive: true },
            ] as Array<{icon:any; label:string; action:()=>void; isDestructive?:boolean; isToggle?:boolean}>).map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 bg-white r
                ounded-2xl shadow-sm ${item.isDestructive ? 'text-red-700' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <item.icon size={18} />
                </div>
                <span className="flex-1 text-left" style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
              {item.isToggle ? (
                <span
                  className={`inline-flex items-center h-7 px-2 rounded-full text-xs font-semibold ${
                    notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span className="relative inline-block w-10 h-5 mr-2 align-middle">
                    <span
                      className={`absolute left-0 top-0 h-5 w-10 rounded-full transition-colors duration-200 ${
                        notificationsEnabled ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span
                      className={`absolute left-0 top-0 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 transform ${
                        notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </span>
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              ) : !item.isDestructive && <ChevronRight size={16} className="text-gray-400" />}
            </button>
          ))}
        </div>
      </div>


      <KitchenBottomNav />
    </MobileLayout>
  );
}

export function AppSetting() {
  const navigate = useNavigate();
  const { currentUser, organizations, updateOrganization } = useApp();
  const org = organizations.find(o => o.id === currentUser?.orgId);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(org?.notificationsEnabled ?? true);

  useEffect(() => {
    if (org?.notificationsEnabled !== undefined) {
      setNotificationsEnabled(org.notificationsEnabled);
    }
  }, [org]);

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    if (org) {
      updateOrganization(org.id, { notificationsEnabled: newValue });
    }
  };

  return (
    <MobileLayout>
      <div className="bg-red-700 px-5 pt-10 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white flex-1 text-center" style={{ fontSize: '1.3rem', fontWeight: 700 }}>App Setting</h2>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button className="w-full text-left flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
            <span className="flex items-center gap-3 text-sm font-medium text-slate-900"><Globe size={16} /> Change Language</span>
            <span className="text-xs text-gray-500">English</span>
          </button>
          <button
            type="button"
            onClick={toggleNotifications}
            className="w-full text-left flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-slate-900"><ShieldCheck size={16} /> Push Notifications</span>
            <span className={`inline-flex items-center h-7 px-2 rounded-full text-xs font-semibold ${
              notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className="relative inline-block w-10 h-5 mr-2 align-middle">
                <span
                  className={`absolute left-0 top-0 h-5 w-10 rounded-full transition-colors duration-200 ${
                    notificationsEnabled ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span
                  className={`absolute left-0 top-0 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </button>
          <button className="w-full text-left flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
            <span className="flex items-center gap-3 text-sm font-medium text-red-600"><Trash2 size={16} /> Delete Account Data Only</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          <button className="w-full text-left flex items-center justify-between p-4 hover:bg-gray-50">
            <span className="flex items-center gap-3 text-sm font-medium text-red-600"><Trash2 size={16} /> Delete Account</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}

export function OrgEdit() {
  const { currentUser, organizations, updateOrganization } = useApp();
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === currentUser?.orgId);
  const [form, setForm] = useState({
    ownerName: org?.ownerName || '',
    ownerEmail: org?.ownerEmail || '',
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
    if (form.ownerEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.ownerEmail)) {
      return;
    }
    const updates: any = { ownerName: form.ownerName.trim() };
    if (form.ownerEmail) updates.ownerEmail = form.ownerEmail.trim();
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
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Owner Name</label>
            <input
              type="text"
              value={form.ownerName}
              onChange={e => setForm(prev => ({ ...prev, ownerName: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={form.ownerEmail}
              onChange={e => setForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>New Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
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
