import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User, Phone, KeyRound, Pencil, Copy, Check, Plus, X, Camera, MoreVertical, Trash2 } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';
import { Switch } from '../ui/switch';

interface ManagerForm {
  branchId: string;
  managerName: string;
  managerImage: string;
  managerPhone: string;
  managerPassword: string;
}

const EMPTY_FORM: ManagerForm = {
  branchId: '',
  managerName: '',
  managerImage: '',
  managerPhone: '',
  managerPassword: '',
};

const generateOneTimePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export function KitchenManagerScreen() {
  const { currentUser, branches, updateBranch } = useApp();
  const isBranchManager = Boolean(currentUser?.branchId);
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);
  const managerBranches = useMemo(
    () => orgBranches.filter(b => b.managerName || b.managerPhone || b.managerPassword || b.managerImage),
    [orgBranches],
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuBranchId, setOpenMenuBranchId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [isPasswordUpdateEnabled, setIsPasswordUpdateEnabled] = useState(false);
  const [form, setForm] = useState<ManagerForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ManagerForm>>({});
  const managerImageInputRef = useRef<HTMLInputElement>(null);
  const phoneDigits = form.managerPhone.replace(/\D/g, '');
  const isPhoneComplete = phoneDigits.length >= 10;

  // Auto-generate password for "Create Manager" once phone is complete.
  // For "Edit Manager", password changes are explicit via the toggle + Regenerate button.
  useEffect(() => {
    const isCreate = !editingBranchId;
    if (!isCreate) return;
    if (!isPhoneComplete) return;
    if (form.managerPassword.trim()) return;
    const newPassword = generateOneTimePassword();
    setForm(prev => ({ ...prev, managerPassword: newPassword }));
    if (errors.managerPassword) setErrors(prev => ({ ...prev, managerPassword: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingBranchId, isPhoneComplete, phoneDigits]);

  const openAdd = () => {
    setEditingBranchId(null);
    setIsPasswordUpdateEnabled(false);
    setErrors({});
    setForm({
      ...EMPTY_FORM,
      branchId: orgBranches[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEdit = (branchId: string) => {
    const branch = orgBranches.find(b => b.id === branchId);
    if (!branch) return;
    setEditingBranchId(branchId);
    setIsPasswordUpdateEnabled(false);
    setErrors({});
    setForm({
      branchId: branch.id,
      managerName: branch.managerName || '',
      managerImage: branch.managerImage || '',
      managerPhone: branch.managerPhone || '',
      managerPassword: branch.managerPassword || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const nextErrors: Partial<ManagerForm> = {};
    if (!form.branchId) nextErrors.branchId = 'Branch is required';
    if (!form.managerName.trim()) nextErrors.managerName = 'Manager name is required';
    if (!form.managerImage.trim()) nextErrors.managerImage = 'Manager image is required';
    if (!form.managerPhone.trim()) nextErrors.managerPhone = 'Phone is required';
    if (!form.managerPassword.trim()) nextErrors.managerPassword = 'Password is required';
    
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingBranchId && editingBranchId !== form.branchId) {
      updateBranch(editingBranchId, {
        managerName: '',
        managerImage: '',
        managerPhone: '',
        managerPassword: '',
      });
    }

    updateBranch(form.branchId, {
      managerName: form.managerName.trim(),
      managerImage: form.managerImage.trim(),
      managerPhone: form.managerPhone.trim(),
      managerPassword: form.managerPassword.trim(),
    });

    setShowModal(false);
    setEditingBranchId(null);
    setIsPasswordUpdateEnabled(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleManagerImagePick: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      setForm(prev => ({ ...prev, managerImage: result }));
      if (errors.managerImage) setErrors(prev => ({ ...prev, managerImage: '' }));
    };
    reader.readAsDataURL(file);
  };

  const copyManagerDetails = async (
    branchId: string,
    branchName: string,
    managerName?: string,
    managerPhone?: string,
    managerPassword?: string,
  ) => {
    const text = [
      `Branch: ${branchName}`,
      `Manager Name: ${managerName || 'Not set'}`,
      `Manager Phone: ${managerPhone || 'Not set'}`,
      `Manager Password: ${managerPassword || 'Not set'}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(branchId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch { }
  };

  const handleDeleteManager = (branchId: string, branchName: string) => {
    if (!window.confirm(`Delete manager from "${branchName}"?`)) return;
    updateBranch(branchId, {
      managerName: '',
      managerImage: '',
      managerPhone: '',
      managerPassword: '',
    });
  };

  if (isBranchManager) {
    return (
      <MobileLayout>
        <TopBar title="Kitchen Manager" />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-stone-500">Only organization owner can manage branch manager credentials.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <TopBar title="Kitchen Manager" />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Kitchen Login Credentials</h3>
          <button
            onClick={openAdd}
            className="bg-red-700 text-white rounded-full p-2 hover:bg-red-800 transition-colors shadow-md"
            aria-label="Add manager"
          >
            <Plus size={18} />
          </button>
        </div>

        {managerBranches.length === 0 ? (
          <div className="text-center py-8">
            <User size={46} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>No managers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {managerBranches.map(branch => (
              <div key={branch.id} className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                      {branch.managerImage ? (
                        <img src={branch.managerImage} alt={branch.managerName || 'Manager'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-stone-700" style={{ fontWeight: 600 }}>{branch.managerName}</p>
                      <p className="text-stone-400" style={{ fontSize: '0.76rem' }}>Assigned Branch: {branch.name}</p>
                    </div>
                  </div>
                  <div className="relative">
                    {/* three-dot menu for edit/delete */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuBranchId(prev => (prev === branch.id ? null : branch.id));
                      }}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 flex items-center justify-center"
                      aria-label="Open actions"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenuBranchId === branch.id && (
                      <div
                        className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-20"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { openEdit(branch.id); setOpenMenuBranchId(null); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-sm hover:bg-gray-100 text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { handleDeleteManager(branch.id, branch.name); setOpenMenuBranchId(null); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-sm hover:bg-red-50 text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-stone-500 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                    <Phone size={12} />
                    Phone: {branch.managerPhone || 'Not set'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-stone-500 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                      <KeyRound size={12} />
                      Password: {branch.managerPassword || 'Not set'}
                    </p>
                    <button
                      onClick={() => copyManagerDetails(
                        branch.id,
                        branch.name,
                        branch.managerName,
                        branch.managerPhone,
                        branch.managerPassword,
                      )}
                      className="w-6 h-6 rounded-lg border border-gray-200 bg-white text-red-700 flex items-center justify-center hover:bg-gray-50"
                      aria-label="Copy credentials"
                    >
                      {copiedId === branch.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <KitchenBottomNav />

      {showModal && (
        <div className="absolute inset-0 bg-white z-30 overflow-y-auto">
          <div className="min-h-full px-6 pb-6 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>
                {editingBranchId ? 'Edit Manager' : 'Add Manager'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsPasswordUpdateEnabled(false);
                }}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
                aria-label="Close"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex flex-col items-center pb-1">
                <input
                  ref={managerImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleManagerImagePick}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => managerImageInputRef.current?.click()}
                    className="w-44 h-44 rounded-full border-4 border-red-700 bg-gray-100 overflow-hidden flex items-center justify-center"
                    aria-label="Upload manager image"
                  >
                    {form.managerImage ? (
                      <img src={form.managerImage} alt="Manager" className="w-full h-full object-cover" />
                    ) : (
                      <User size={62} className="text-gray-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => managerImageInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-white border-2 border-stone-700 flex items-center justify-center"
                    aria-label="Open image picker"
                  >
                    <Camera size={20} className="text-stone-800" />
                  </button>
                </div>
                {errors.managerImage && <p className="text-red-700 text-xs mt-1">{errors.managerImage}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Branch *</label>
                <select
                  value={form.branchId}
                  onChange={e => { setForm(prev => ({ ...prev, branchId: e.target.value })); if (errors.branchId) setErrors(prev => ({ ...prev, branchId: '' })); }}
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.branchId ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                >
                  <option value="">Select Branch</option>
                  {orgBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                {errors.branchId && <p className="text-red-700 text-xs mt-0.5">{errors.branchId}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Manager Name *</label>
                <input
                  type="text"
                  value={form.managerName}
                  onChange={e => { setForm(prev => ({ ...prev, managerName: e.target.value })); if (errors.managerName) setErrors(prev => ({ ...prev, managerName: '' })); }}
                  placeholder="Manager name"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.managerName ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                />
                {errors.managerName && <p className="text-red-700 text-xs mt-0.5">{errors.managerName}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Phone Number *</label>
                <input
                  type="text"
                  value={form.managerPhone}
                  onChange={e => { setForm(prev => ({ ...prev, managerPhone: e.target.value })); if (errors.managerPhone) setErrors(prev => ({ ...prev, managerPhone: '' })); }}
                  placeholder="03XX-XXXXXXX"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.managerPhone ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                />
                {errors.managerPhone && <p className="text-red-700 text-xs mt-0.5">{errors.managerPhone}</p>}
              </div>

              {editingBranchId && (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-stone-700" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Update Password</p>
                    <p className="text-stone-500 mt-0.5" style={{ fontSize: '0.72rem' }}>
                      Turn this on to change password. Keep it off to leave current password unchanged.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch checked={isPasswordUpdateEnabled} onCheckedChange={setIsPasswordUpdateEnabled} />
                  </div>
                </div>
              )}

              {(!editingBranchId || isPasswordUpdateEnabled) && (
                <div>
                  <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Password *</label>
                  <p className="text-stone-500 mb-2" style={{ fontSize: '0.72rem' }}>This is a one-time password</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 break-all min-h-10 flex items-center">
                      {form.managerPassword ? form.managerPassword : <span className="text-stone-400">Click Generate to create password</span>}
                    </div>
                    {Boolean(editingBranchId) && isPhoneComplete && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPassword = generateOneTimePassword();
                          setForm(prev => ({ ...prev, managerPassword: newPassword }));
                          if (errors.managerPassword) setErrors(prev => ({ ...prev, managerPassword: '' }));
                        }}
                        className="flex-shrink-0 bg-red-700 text-white px-4 py-2.5 rounded-xl hover:bg-red-800 transition-colors text-sm font-medium"
                        aria-label={editingBranchId ? 'Regenerate password' : 'Generate password'}
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  {errors.managerPassword && <p className="text-red-700 text-xs mt-0.5">{errors.managerPassword}</p>}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-red-700 text-white py-3.5 rounded-xl hover:bg-red-800 transition-colors"
              style={{ fontWeight: 700 }}
            >
              {editingBranchId ? 'Update Manager' : 'Create Manager'}
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
