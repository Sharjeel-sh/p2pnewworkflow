import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Home, Phone, MapPin, User, Pencil, LogOut, Save, X, FileText, Image, CreditCard, Hash, CheckCircle2 } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function OrgProfile() {
  const { currentUser, organizations, updateOrganization, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const org = organizations.find(o => o.id === currentUser?.orgId);
  const isBranchManager = Boolean(currentUser?.branchId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ownerName: org?.ownerName || '',
    orgName: org?.orgName || '',
    address: org?.address || '',
    phone: org?.phone || '',
    cnic: org?.cnic || '',
    ntn: org?.ntn || '',
  });

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center"><p className="text-stone-500">Organization not found.</p></div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  if (isBranchManager) {
    const handleLogout = () => {
      setCurrentUser(null);
      navigate('/');
    };

    return (
      <MobileLayout>
        <div className="bg-orange-500 px-5 pt-10 pb-8">
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Manager Account</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>Organization</p>
            <p className="text-stone-800" style={{ fontWeight: 600 }}>{org.orgName}</p>
            <p className="text-stone-400 mt-3" style={{ fontSize: '0.72rem' }}>Logged in as</p>
            <p className="text-stone-800" style={{ fontWeight: 600 }}>{currentUser?.managerName || 'Branch Manager'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full border-2 border-red-100 text-red-500 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors mt-6"
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

  const startEdit = () => {
    setForm({ ownerName: org.ownerName, orgName: org.orgName, address: org.address, phone: org.phone, cnic: org.cnic || '', ntn: org.ntn || '' });
    setEditing(true);
  };

  const handleSave = () => {
    updateOrganization(org.id, {
      ownerName: form.ownerName.trim(),
      orgName: form.orgName.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      ...(org.type === 'homemade' ? { cnic: form.cnic.trim() } : { ntn: form.ntn.trim() }),
    });
    setEditing(false);
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
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Organization Profile</h2>
          <button onClick={editing ? () => setEditing(false) : startEdit}
            className="bg-white/20 text-white rounded-xl p-2 hover:bg-white/30 transition-colors">
            {editing ? <X size={18} /> : <Pencil size={18} />}
          </button>
        </div>
        <div className="bg-white/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
            {org.type === 'restaurant' ? (
              <Building2 size={28} className="text-orange-500" />
            ) : (
              <Home size={28} className="text-orange-500" />
            )}
          </div>
          <div>
            <p className="text-white" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{org.orgName}</p>
            <span className="text-orange-100 text-xs px-2 py-0.5 bg-orange-600/50 rounded-full" style={{ fontWeight: 500 }}>
              {org.type === 'restaurant' ? 'Restaurant' : 'Home-Made'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {editing ? (
          <div className="space-y-4">
            {[
              { key: 'ownerName', label: 'Owner Name' },
              { key: 'orgName', label: 'Organization Name' },
              { key: 'address', label: 'Address' },
              { key: 'phone', label: 'Phone Number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>{f.label}</label>
                <input
                  type="text"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                />
              </div>
            ))}
            {org.type === 'homemade' ? (
              <div>
                <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>CNIC</label>
                <input
                  type="text"
                  value={form.cnic}
                  onChange={e => setForm(prev => ({ ...prev, cnic: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                />
              </div>
            ) : (
              <div>
                <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>NTN</label>
                <input
                  type="text"
                  value={form.ntn}
                  onChange={e => setForm(prev => ({ ...prev, ntn: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                />
              </div>
            )}
            <button onClick={handleSave}
              className="w-full bg-orange-500 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors mt-2"
              style={{ fontWeight: 700 }}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { icon: User, label: 'Owner', value: org.ownerName },
              { icon: Phone, label: 'Phone', value: org.phone },
              { icon: MapPin, label: 'Address', value: org.address },
              ...(org.type === 'homemade' && org.cnic ? [{ icon: CreditCard, label: 'CNIC', value: org.cnic }] : []),
              ...(org.type === 'restaurant' && org.ntn ? [{ icon: Hash, label: 'NTN', value: org.ntn }] : []),
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>{item.label}</p>
                  <p className="text-stone-800" style={{ fontWeight: 500 }}>{item.value}</p>
                </div>
              </div>
            ))}

            {/* Documents Section */}
            {(org.cnicFrontPhoto || org.cnicBackPhoto || org.legalAgreementDoc) && (
              <div className="mt-2">
                <p className="text-stone-500 mb-2 px-1" style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Uploaded Documents
                </p>
                <div className="space-y-2">
                  {org.cnicFrontPhoto && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Image size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>CNIC Front Photo</p>
                        <p className="text-stone-700 truncate" style={{ fontWeight: 500, fontSize: '0.85rem' }}>{org.cnicFrontPhoto}</p>
                      </div>
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    </div>
                  )}
                  {org.cnicBackPhoto && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Image size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>CNIC Back Photo</p>
                        <p className="text-stone-700 truncate" style={{ fontWeight: 500, fontSize: '0.85rem' }}>{org.cnicBackPhoto}</p>
                      </div>
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    </div>
                  )}
                  {org.legalAgreementDoc && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>
                          Legal Agreement {org.type === 'restaurant' ? '(Required)' : '(Optional)'}
                        </p>
                        <p className="text-stone-700 truncate" style={{ fontWeight: 500, fontSize: '0.85rem' }}>{org.legalAgreementDoc}</p>
                      </div>
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            )}
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

      <KitchenBottomNav />
    </MobileLayout>
  );
}
