import React, { useMemo, useState } from 'react';
import { Bike, Store, User, Phone, CheckCircle, Pencil, Copy, Check, Plus, X } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

interface RiderForm {
  branchId: string;
  name: string;
  phone: string;
  username: string;
  password: string;
}

const EMPTY_FORM: RiderForm = {
  branchId: '',
  name: '',
  phone: '',
  username: '',
  password: '',
};

export function KitchenRiderScreen() {
  const { currentUser, riders, branches, orders, addRider, updateRider } = useApp();
  const managedBranchId = currentUser?.branchId;
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);
  const scopedBranches = managedBranchId ? orgBranches.filter(b => b.id === managedBranchId) : orgBranches;
  const orgRiders = riders.filter(r => r.orgId === currentUser?.orgId && (!managedBranchId || r.branchId === managedBranchId));

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRiderId, setEditingRiderId] = useState<string | null>(null);
  const [form, setForm] = useState<RiderForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<RiderForm>>({});

  const deliveredCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const rider of orgRiders) {
      map[rider.id] = orders.filter(o => o.riderId === rider.id && o.status === 'delivered').length;
    }
    return map;
  }, [orgRiders, orders]);

  const getBranchName = (branchId: string) => {
    const branch = orgBranches.find(b => b.id === branchId);
    return branch?.name ?? 'Unknown Branch';
  };

  const openAdd = () => {
    setEditingRiderId(null);
    setErrors({});
    setForm({
      ...EMPTY_FORM,
      branchId: scopedBranches[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEdit = (riderId: string) => {
    const rider = orgRiders.find(r => r.id === riderId);
    if (!rider) return;
    setEditingRiderId(riderId);
    setErrors({});
    setForm({
      branchId: rider.branchId,
      name: rider.name,
      phone: rider.phone,
      username: rider.username,
      password: rider.password,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const nextErrors: Partial<RiderForm> = {};
    if (!form.branchId) nextErrors.branchId = 'Branch is required';
    if (!form.name.trim()) nextErrors.name = 'Rider name is required';
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingRiderId) {
      updateRider(editingRiderId, {
        branchId: form.branchId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
      });
    } else {
      addRider({
        orgId: currentUser?.orgId || '',
        branchId: form.branchId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        isAvailable: true,
      });
    }

    setShowModal(false);
    setEditingRiderId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const copyRiderDetails = async (riderId: string, name: string, phone: string, branchName: string, username: string, deliveredCount: number) => {
    const text = [
      `Rider Name: ${name}`,
      `Phone: ${phone || 'Not set'}`,
      `Branch: ${branchName}`,
      `Username: ${username}`,
      `Delivered Orders: ${deliveredCount}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(riderId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch { }
  };

  return (
    <MobileLayout>
      <TopBar title="Rider" showBack={false} />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Riders</h3>
          <button
            onClick={openAdd}
            className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors shadow-md"
            aria-label="Add rider"
          >
            <Plus size={18} />
          </button>
        </div>

        {orgRiders.length === 0 ? (
          <div className="text-center py-8">
            <Bike size={46} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>No riders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orgRiders.map(rider => (
              <div key={rider.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <button
                    onClick={() => openEdit(rider.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    style={{ fontWeight: 600 }}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => copyRiderDetails(
                      rider.id,
                      rider.name,
                      rider.phone,
                      getBranchName(rider.branchId),
                      rider.username,
                      deliveredCountMap[rider.id] || 0,
                    )}
                    className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1"
                    style={{ fontWeight: 600 }}
                  >
                    {copiedId === rider.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === rider.id ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="min-w-0">
                  <p className="text-stone-800 truncate" style={{ fontWeight: 600 }}>{rider.name}</p>
                  {rider.phone && (
                    <p className="text-stone-400 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                      <Phone size={11} /> {rider.phone}
                    </p>
                  )}
                  <p className="text-stone-400 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                    <Store size={11} /> Assigned Branch: {getBranchName(rider.branchId)}
                  </p>
                  <p className="text-stone-400 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                    <User size={11} /> Username: {rider.username}
                  </p>
                  <p className="text-stone-400 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                    <CheckCircle size={11} />
                    Delivered Orders: {deliveredCountMap[rider.id] || 0}
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
                {editingRiderId ? 'Edit Rider' : 'Add Rider'}
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
                  {scopedBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                {errors.branchId && <p className="text-red-500 text-xs mt-0.5">{errors.branchId}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Rider Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(prev => ({ ...prev, name: e.target.value })); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="Rider name"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="03XX-XXXXXXX"
                  className="w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 border-gray-200 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Username *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => { setForm(prev => ({ ...prev, username: e.target.value })); if (errors.username) setErrors(prev => ({ ...prev, username: '' })); }}
                  placeholder="Login username"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.username ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-0.5">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Password *</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={e => { setForm(prev => ({ ...prev, password: e.target.value })); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                  placeholder="Login password"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl hover:bg-orange-600 transition-colors"
              style={{ fontWeight: 700 }}
            >
              {editingRiderId ? 'Update Rider' : 'Create Rider'}
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
