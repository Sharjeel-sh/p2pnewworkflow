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
  const isVerified = Boolean(org?.verified) || org?.verificationStatus === 'verified';
  const isPendingReview = org?.verificationStatus === 'pending' || !isVerified;
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
          <div className="w-8" />
        </div>
      </div>

 {/* Organization image */}
      <div className="flex justify-center mt-4 items-center gap-3">
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
      <div className="flex justify-end items-start px-5 mt-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
          {isVerified ? <ShieldCheck size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-yellow-500" />}
        </div>
      </div>
      <div className="px-5 mt-2 flex justify-end">
        <span className={`text-xs px-2.5 py-1 rounded-full ${isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {isVerified ? 'Verified' : isPendingReview ? 'Under Review' : 'Unverified'}
        </span>
      </div>
      
      

      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* list menu */}
        <div className="space-y-3">
          {([
                { icon: FileText, label: 'Organization Registration Details', action: () => navigate('/kitchen/profile/info') },
              { icon: Building2, label: 'Edit Organization', action: () => navigate('/kitchen/profile/edit') },
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
  const cnicFrontInputRef = useRef<HTMLInputElement>(null);
  const cnicBackInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    phone: org?.phone || '',
    orgName: org?.orgName || '',
    ownerEmail: org?.ownerEmail || '',
    cnic: org?.cnic || '',
    cnicFrontPhoto: org?.cnicFrontPhoto || '',
    cnicBackPhoto: org?.cnicBackPhoto || '',
    legalAgreementDoc: org?.legalAgreementDoc || '',
    logoUrl: org?.profilePicture || org?.logoUrl || '',
  });
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center"><p className="text-stone-500">Organization not found.</p></div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  const handleFilePick =
    (key: 'cnicFrontPhoto' | 'cnicBackPhoto' | 'legalAgreementDoc' | 'logoUrl'): React.ChangeEventHandler<HTMLInputElement> =>
    e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setForm(prev => ({ ...prev, [key]: result }));
        }
      };
      reader.readAsDataURL(file);
    };

  const handleSave = () => {
    if (form.ownerEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.ownerEmail)) {
      return;
    }
    const updates: any = {
      phone: form.phone.trim(),
      orgName: form.orgName.trim(),
      ownerEmail: form.ownerEmail.trim(),
      cnic: form.cnic.trim(),
      cnicFrontPhoto: form.cnicFrontPhoto,
      cnicBackPhoto: form.cnicBackPhoto,
      legalAgreementDoc: form.legalAgreementDoc,
      profilePicture: form.logoUrl,
      logoUrl: form.logoUrl,
      verificationStatus: 'pending',
      verified: false,
    };

    updateOrganization(org.id, updates);
    setShowReviewPopup(true);
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
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 z-10"
              />
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Organization logo" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-400" />
              )}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md">
                <Camera size={14} className="text-red-700" />
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFilePick('logoUrl')}
            />
            <p className="text-xs text-stone-500">Tap image icon to update logo</p>
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
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              value={form.ownerEmail}
              onChange={e => setForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>CNIC Number</label>
            <input
              type="text"
              value={form.cnic}
              onChange={e => setForm(prev => ({ ...prev, cnic: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
            />
          </div>

          <div className="pt-2">
            <p className="text-stone-700 text-sm mb-3" style={{ fontWeight: 600 }}>Document &amp; Image Update Options</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => cnicFrontInputRef.current?.click()}
                className="w-full text-left p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-stone-800" style={{ fontWeight: 600 }}>CNIC Upload Option - Front Side Image</p>
                <p className="text-xs text-stone-500 mt-1">{form.cnicFrontPhoto ? 'Front image selected' : 'Tap to upload/update front side image'}</p>
              </button>
              <input
                ref={cnicFrontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePick('cnicFrontPhoto')}
              />

              <button
                type="button"
                onClick={() => cnicBackInputRef.current?.click()}
                className="w-full text-left p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-stone-800" style={{ fontWeight: 600 }}>CNIC Upload Option - Back Side Image</p>
                <p className="text-xs text-stone-500 mt-1">{form.cnicBackPhoto ? 'Back image selected' : 'Tap to upload/update back side image'}</p>
              </button>
              <input
                ref={cnicBackInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePick('cnicBackPhoto')}
              />

              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="w-full text-left p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-stone-800" style={{ fontWeight: 600 }}>Document Upload Option</p>
                <p className="text-xs text-stone-500 mt-1">{form.legalAgreementDoc ? 'Document selected' : 'Tap to upload/update required documents'}</p>
              </button>
              <input
                ref={documentInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFilePick('legalAgreementDoc')}
              />
            </div>

          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-[12px] text-amber-800" style={{ fontWeight: 500 }}>
              Disclaimer: When you update organization details, your organization status becomes unverified and is sent for a new review. It will be verified again after successful checking.
            </p>
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

      {showReviewPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl">
            <h3 className="text-stone-900 text-lg mb-2" style={{ fontWeight: 700 }}>
              Update Submitted
            </h3>
            <p className="text-sm text-stone-600">
              Your updated organization details were submitted. Organization status is now unverified and pending review until verified again.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowReviewPopup(false);
                navigate('/kitchen/profile/organization');
              }}
              className="w-full mt-4 bg-red-700 text-white py-2.5 rounded-xl hover:bg-red-800 transition-colors"
              style={{ fontWeight: 700 }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
