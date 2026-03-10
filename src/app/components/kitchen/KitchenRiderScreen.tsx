import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bike, Store, User, Phone, CheckCircle, Pencil, Plus, X, Camera, Trash2, Search, MoreVertical, Package, Copy, Check } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';
import { Switch } from '../ui/switch';

interface RiderForm {
  branchId: string;
  profilePicture: string;
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: RiderForm = {
  branchId: '',
  profilePicture: '',
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export function KitchenRiderScreen() {
  const { currentUser, riders, branches, orders, addRider, updateRider, deleteRider } = useApp();
  const managedBranchId = currentUser?.branchId;
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);
  const scopedBranches = managedBranchId ? orgBranches.filter(b => b.id === managedBranchId) : orgBranches;
  const orgRiders = riders.filter(r => r.orgId === currentUser?.orgId && (!managedBranchId || r.branchId === managedBranchId));

  const [showModal, setShowModal] = useState(false);
  const [editingRiderId, setEditingRiderId] = useState<string | null>(null);
  const [isPasswordUpdateEnabled, setIsPasswordUpdateEnabled] = useState(false);
  const [copiedRiderId, setCopiedRiderId] = useState<string | null>(null);
  const [form, setForm] = useState<RiderForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<RiderForm>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Offline' | 'On Delivery'>('All');
  const [openMenuRiderId, setOpenMenuRiderId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const riderImageInputRef = useRef<HTMLInputElement>(null);

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


  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || 'R';

  const getRiderStatus = (riderId: string, isAvailable: boolean): 'Active' | 'Offline' | 'On Delivery' => {
    const onDelivery = orders.some(
      o =>
        o.riderId === riderId &&
        ['accepted', 'preparing', 'ready', 'picked_up'].includes(o.status),
    );
    if (onDelivery) return 'On Delivery';
    return isAvailable ? 'Active' : 'Offline';
  };

  const openAdd = () => {
    setEditingRiderId(null);
    setIsPasswordUpdateEnabled(true);
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
    setIsPasswordUpdateEnabled(false);
    setErrors({});
    setForm({
      branchId: rider.branchId,
      profilePicture: rider.profilePicture || '',
      name: rider.name,
      phone: rider.phone,
      password: rider.password,
      confirmPassword: rider.password,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const nextErrors: Partial<RiderForm> = {};
    const shouldValidatePassword = !editingRiderId || isPasswordUpdateEnabled;
    if (!form.branchId) nextErrors.branchId = 'Branch is required';
    if (!form.profilePicture.trim()) nextErrors.profilePicture = 'Rider image is required';
    if (!form.name.trim()) nextErrors.name = 'Rider name is required';
    if (shouldValidatePassword && !form.password.trim()) nextErrors.password = 'Password is required';
    if (shouldValidatePassword && !form.confirmPassword.trim()) nextErrors.confirmPassword = 'Confirm password is required';
    if (
      shouldValidatePassword &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      form.password.trim() !== form.confirmPassword.trim()
    ) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingRiderId) {
      updateRider(editingRiderId, {
        branchId: form.branchId,
        profilePicture: form.profilePicture.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(isPasswordUpdateEnabled ? { password: form.password.trim() } : {}),
      });
    } else {
      addRider({
        orgId: currentUser?.orgId || '',
        branchId: form.branchId,
        profilePicture: form.profilePicture.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        // username is optional and not used for login
        password: form.password.trim(),
        isAvailable: true,
      });
    }

    setShowModal(false);
    setEditingRiderId(null);
    setIsPasswordUpdateEnabled(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleRiderImagePick: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') return;
      setForm(prev => ({ ...prev, profilePicture: String(reader.result) }));
      if (errors.profilePicture) setErrors(prev => ({ ...prev, profilePicture: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteRider = (riderId: string, riderName: string) => {
    if (!window.confirm(`Delete rider "${riderName}"?`)) return;
    deleteRider(riderId);
  };

  const copyRiderDetails = async (riderId: string, name: string, phone: string, branchName: string, deliveredCount: number, status: string) => {
    const text = [
      `Rider Name: ${name}`,
      `Phone: ${phone || 'Not set'}`,
      `Branch: ${branchName}`,
      `Delivered Orders: ${deliveredCount}`,
      `Status: ${status}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRiderId(riderId);
      setTimeout(() => setCopiedRiderId(prev => (prev === riderId ? null : prev)), 1500);
    } catch { }
  };

  const filteredRiders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orgRiders.filter(rider => {
      const status = getRiderStatus(rider.id, rider.isAvailable);
      const statusOk = statusFilter === 'All' || status === statusFilter;
      const searchOk =
        !q ||
        rider.name.toLowerCase().includes(q) ||
        (rider.phone || '').toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [orgRiders, searchTerm, statusFilter, orders]);

  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm, statusFilter]);

  const displayedRiders = filteredRiders.slice(0, visibleCount);

  return (
    <MobileLayout>
      <TopBar title="Rider" showBack={false} />

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-stone-100" onClick={() => setOpenMenuRiderId(null)}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-stone-900 text-lg truncate" style={{ fontWeight: 800 }}>
              Riders <span className="text-stone-500 text-base">({filteredRiders.length})</span>
            </h3>
          </div>
          <button
            onClick={e => { e.stopPropagation(); openAdd(); }}
            className="inline-flex items-center gap-1.5 bg-red-700 text-white px-3.5 py-2 rounded-xl shadow-sm hover:bg-red-800 transition-colors flex-shrink-0"
            style={{ fontWeight: 700, fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            Add Rider
          </button>
        </div>

        {displayedRiders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <Bike size={42} className="text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500" style={{ fontWeight: 700 }}>
              {orgRiders.length === 0 ? 'No riders added yet' : 'No riders match your search/filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedRiders.map(rider => {
              const status = getRiderStatus(rider.id, rider.isAvailable);

              return (
                <div key={rider.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-red-50 border border-red-200 flex items-center justify-center text-red-800 flex-shrink-0">
                        {rider.profilePicture ? (
                          <img src={rider.profilePicture} alt={rider.name} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{getInitials(rider.name)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-stone-900 truncate" style={{ fontWeight: 700 }}>{rider.name}</p>
                        <p className="text-stone-500 flex items-center gap-1 mt-1" style={{ fontSize: '0.78rem' }}>
                          <Phone size={11} />
                          {rider.phone || 'Not set'}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                          <Store size={11} />
                          {getBranchName(rider.branchId)}
                        </p>
                        <p className="text-stone-500 flex items-center gap-1 mt-0.5" style={{ fontSize: '0.78rem' }}>
                          <Package size={11} />
                          Delivered Orders: {deliveredCountMap[rider.id] || 0}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0 self-stretch flex flex-col items-end justify-between">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenMenuRiderId(prev => (prev === rider.id ? null : rider.id));
                        }}
                        className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 flex items-center justify-center"
                        aria-label="Open rider actions"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {openMenuRiderId === rider.id && (
                        <div
                          className="absolute right-0 top-9 w-36 bg-white border border-stone-200 rounded-xl shadow-lg p-1 z-20"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => { openEdit(rider.id); setOpenMenuRiderId(null); }}
                            className="w-full text-left px-2.5 py-2 rounded-lg text-sm hover:bg-stone-100 text-stone-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => { handleDeleteRider(rider.id, rider.name); setOpenMenuRiderId(null); }}
                            className="w-full text-left px-2.5 py-2 rounded-lg text-sm hover:bg-red-50 text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          copyRiderDetails(
                            rider.id,
                            rider.name,
                            rider.phone,
                            getBranchName(rider.branchId),
                            deliveredCountMap[rider.id] || 0,
                            status,
                          );
                        }}
                        className="w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 flex items-center justify-center"
                        aria-label="Copy rider details"
                      >
                        {copiedRiderId === rider.id ? <Check size={14} className="text-red-700" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {displayedRiders.length < filteredRiders.length && (
          <button
            onClick={e => { e.stopPropagation(); setVisibleCount(prev => prev + 8); }}
            className="w-full mt-4 bg-white border border-stone-200 text-stone-700 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
            style={{ fontWeight: 700 }}
          >
            Load More Riders
          </button>
        )}
      </div>

      <KitchenBottomNav />

      {showModal && (
        <div className="absolute inset-0 bg-white z-30 overflow-y-auto">
          <div className="min-h-full px-6 pb-6 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>
                {editingRiderId ? 'Edit Rider' : 'Add Rider'}
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
                  ref={riderImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleRiderImagePick}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => riderImageInputRef.current?.click()}
                    className="w-44 h-44 rounded-full border-4 border-red-700 bg-gray-100 overflow-hidden flex items-center justify-center"
                    aria-label="Upload rider image"
                  >
                    {form.profilePicture ? (
                      <img src={form.profilePicture} alt="Rider" className="w-full h-full object-cover" />
                    ) : (
                      <User size={62} className="text-gray-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => riderImageInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-white border-2 border-stone-700 flex items-center justify-center"
                    aria-label="Open image picker"
                  >
                    <Camera size={20} className="text-stone-800" />
                  </button>
                </div>
                {errors.profilePicture && <p className="text-red-700 text-xs mt-1">{errors.profilePicture}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Branch *</label>
                <select
                  value={form.branchId}
                  onChange={e => { setForm(prev => ({ ...prev, branchId: e.target.value })); if (errors.branchId) setErrors(prev => ({ ...prev, branchId: '' })); }}
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.branchId ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                >
                  <option value="">Select Branch</option>
                  {scopedBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                {errors.branchId && <p className="text-red-700 text-xs mt-0.5">{errors.branchId}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Rider Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(prev => ({ ...prev, name: e.target.value })); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="Rider name"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                />
                {errors.name && <p className="text-red-700 text-xs mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="03XX-XXXXXXX"
                  className="w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 border-gray-200 focus:border-red-600"
                />
              </div>

              {editingRiderId && (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-stone-700" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Update Password</p>
                    <p className="text-stone-500 mt-0.5" style={{ fontSize: '0.72rem' }}>
                      Turn this on to change password. Keep it off to leave current password unchanged.
                    </p>
                  </div>
                  <Switch checked={isPasswordUpdateEnabled} onCheckedChange={setIsPasswordUpdateEnabled} />
                </div>
              )}

              {(!editingRiderId || isPasswordUpdateEnabled) && (
                <>
                  <div>
                    <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Password *</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => { setForm(prev => ({ ...prev, password: e.target.value })); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                      placeholder="Login password"
                      className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                    />
                    {errors.password && <p className="text-red-700 text-xs mt-0.5">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>Confirm Password *</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => { setForm(prev => ({ ...prev, confirmPassword: e.target.value })); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                      placeholder="Confirm password"
                      className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                    />
                    {errors.confirmPassword && <p className="text-red-700 text-xs mt-0.5">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-red-700 text-white py-3.5 rounded-xl hover:bg-red-800 transition-colors"
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
