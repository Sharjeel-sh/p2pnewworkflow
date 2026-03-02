import React, { useMemo, useState } from 'react';
import { User, Phone, KeyRound, Pencil, Copy, Check, Plus, X } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

interface ManagerForm {
  branchId: string;
  managerName: string;
  managerPhone: string;
  managerUsername: string;
  managerPassword: string;
}

const EMPTY_FORM: ManagerForm = {
  branchId: '',
  managerName: '',
  managerPhone: '',
  managerUsername: '',
  managerPassword: '',
};

export function KitchenManagerScreen() {
  const { currentUser, branches, updateBranch } = useApp();
  const isBranchManager = Boolean(currentUser?.branchId);
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);
  const managerBranches = useMemo(
    () => orgBranches.filter(b => b.managerName || b.managerPhone || b.managerPassword),
    [orgBranches],
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [form, setForm] = useState<ManagerForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ManagerForm>>({});

  const openAdd = () => {
    setEditingBranchId(null);
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
    setErrors({});
    setForm({
      branchId: branch.id,
      managerName: branch.managerName || '',
      managerPhone: branch.managerPhone || '',
      managerUsername: branch.managerUsername || '',
      managerPassword: branch.managerPassword || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const nextErrors: Partial<ManagerForm> = {};
    if (!form.branchId) nextErrors.branchId = 'Branch is required';
    if (!form.managerName.trim()) nextErrors.managerName = 'Manager name is required';
    if (!form.managerPhone.trim()) nextErrors.managerPhone = 'Phone is required';
    if (!form.managerUsername.trim()) nextErrors.managerUsername = 'Username is required';
    if (!form.managerPassword.trim()) nextErrors.managerPassword = 'Password is required';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingBranchId && editingBranchId !== form.branchId) {
      updateBranch(editingBranchId, {
        managerName: '',
        managerPhone: '',
        managerPassword: '',
      });
    }

    updateBranch(form.branchId, {
      managerName: form.managerName.trim(),
      managerPhone: form.managerPhone.trim(),
      managerUsername: form.managerUsername.trim(),
      managerPassword: form.managerPassword.trim(),
    });

    setShowModal(false);
    setEditingBranchId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const copyManagerDetails = async (
    branchId: string,
    branchName: string,
    managerName?: string,
    managerPhone?: string,
    managerUsername?: string,
    managerPassword?: string,
  ) => {
    const text = [
      `Branch: ${branchName}`,
      `Manager Name: ${managerName || 'Not set'}`,
      `Manager Phone: ${managerPhone || 'Not set'}`,
      `Manager Username: ${managerUsername || 'Not set'}`,
      `Manager Password: ${managerPassword || 'Not set'}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(branchId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch { }
  };

  if (isBranchManager) {
    return (
      <MobileLayout>
        <TopBar title="Kitchen Manager" showBack={false} />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-stone-500">Only organization owner can manage branch manager credentials.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <TopBar title="Kitchen Manager" showBack={false} />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Kitchen Login Credentials</h3>
          <button
            onClick={openAdd}
            className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors shadow-md"
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
                  <div>
                    <p className="text-stone-700" style={{ fontWeight: 600 }}>{branch.managerName}</p>
                    <p className="text-stone-400" style={{ fontSize: '0.76rem' }}>Assigned Branch: {branch.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(branch.id)}
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      style={{ fontWeight: 600 }}
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => copyManagerDetails(
                        branch.id,
                        branch.name,
                        branch.managerName,
                        branch.managerPhone,
                        branch.managerUsername,
                        branch.managerPassword,
                      )}
                      className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1"
                      style={{ fontWeight: 600 }}
                    >
                      {copiedId === branch.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === branch.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-stone-500 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                    <Phone size={12} />
                    Phone: {branch.managerPhone || 'Not set'}
                  </p>
                  <p className="text-stone-500 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                    <User size={12} />
                    Username: {branch.managerUsername || 'Not set'}
                  </p>
                  <p className="text-stone-500 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                    <KeyRound size={12} />
                    Password: {branch.managerPassword || 'Not set'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <KitchenBottomNav />

      {showModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-30">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-800" style={{ fontWeight: 700 }}>
                {editingBranchId ? 'Edit Manager' : 'Add Manager'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Branch *</label>
                <select
                  value={form.branchId}
                  onChange={e => { setForm(prev => ({ ...prev, branchId: e.target.value })); if (errors.branchId) setErrors(prev => ({ ...prev, branchId: '' })); }}
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.branchId ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                >
                  <option value="">Select Branch</option>
                  {orgBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                {errors.branchId && <p className="text-red-500 text-xs mt-0.5">{errors.branchId}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Manager Name *</label>
                <input
                  type="text"
                  value={form.managerName}
                  onChange={e => { setForm(prev => ({ ...prev, managerName: e.target.value })); if (errors.managerName) setErrors(prev => ({ ...prev, managerName: '' })); }}
                  placeholder="Manager name"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.managerName ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.managerName && <p className="text-red-500 text-xs mt-0.5">{errors.managerName}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Phone Number *</label>
                <input
                  type="text"
                  value={form.managerPhone}
                  onChange={e => { setForm(prev => ({ ...prev, managerPhone: e.target.value })); if (errors.managerPhone) setErrors(prev => ({ ...prev, managerPhone: '' })); }}
                  placeholder="03XX-XXXXXXX"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.managerPhone ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.managerPhone && <p className="text-red-500 text-xs mt-0.5">{errors.managerPhone}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Username *</label>
                <input
                  type="text"
                  value={form.managerUsername}
                  onChange={e => { setForm(prev => ({ ...prev, managerUsername: e.target.value })); if (errors.managerUsername) setErrors(prev => ({ ...prev, managerUsername: '' })); }}
                  placeholder="kitchen_manager_123"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.managerUsername ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.managerUsername && <p className="text-red-500 text-xs mt-0.5">{errors.managerUsername}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Password *</label>
                <input
                  type="text"
                  value={form.managerPassword}
                  onChange={e => { setForm(prev => ({ ...prev, managerPassword: e.target.value })); if (errors.managerPassword) setErrors(prev => ({ ...prev, managerPassword: '' })); }}
                  placeholder="Manager password"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.managerPassword ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.managerPassword && <p className="text-red-500 text-xs mt-0.5">{errors.managerPassword}</p>}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl hover:bg-orange-600 transition-colors"
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
