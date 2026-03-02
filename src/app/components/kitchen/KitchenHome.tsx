import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Trash2, MapPin, User, ChevronRight, Store, X, AlertCircle,
  Bike, Phone, Lock, Copy, Check, Eye, EyeOff, CheckCircle2, ArrowRight,
  KeyRound, UserCircle2,
} from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';
import type { Rider } from '../../context/AppContext';

interface BranchForm {
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  managerPassword: string;
}

interface RiderForm {
  name: string;
  phone: string;
  password: string;
}

const EMPTY_BRANCH: BranchForm = { name: '', address: '', managerName: '', managerPhone: '', managerPassword: '' };
const EMPTY_RIDER: RiderForm = { name: '', phone: '', password: '' };

type ModalStep = 'branch' | 'rider' | 'credentials' | null;

function generateUsername(name: string): string {
  const base = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'rider';
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
}

function generateManagerUsername(name: string): string {
  const base = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'kitchen_manager';
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}_${suffix}`;
}

export function KitchenHome() {
  const { currentUser, organizations, branches, riders, addBranch, deleteBranch, addRider } = useApp();
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [branchForm, setBranchForm] = useState<BranchForm>(EMPTY_BRANCH);
  const [branchErrors, setBranchErrors] = useState<Partial<BranchForm>>({});
  const [riderForm, setRiderForm] = useState<RiderForm>(EMPTY_RIDER);
  const [riderErrors, setRiderErrors] = useState<Partial<RiderForm>>({});
  const [createdBranchId, setCreatedBranchId] = useState<string | null>(null);
  const [createdRider, setCreatedRider] = useState<Rider | null>(null);
  const [addManagerForBranch, setAddManagerForBranch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | 'all' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const org = organizations.find(o => o.id === currentUser?.orgId);
  const isBranchManager = Boolean(currentUser?.branchId);
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);
  const totalRiders = riders.filter(r => r.orgId === currentUser?.orgId).length;

  const resetModal = () => {
    setModalStep(null);
    setBranchForm(EMPTY_BRANCH);
    setBranchErrors({});
    setRiderForm(EMPTY_RIDER);
    setRiderErrors({});
    setCreatedBranchId(null);
    setCreatedRider(null);
    setAddManagerForBranch(false);
    setShowPassword(false);
    setCopiedField(null);
  };

  // ── Branch submit ──────────────────────────────────────────────────────────
  const handleCreateBranch = () => {
    const errs: Partial<BranchForm> = {};
    if (!branchForm.name.trim()) errs.name = 'Branch name is required';
    if (!branchForm.address.trim()) errs.address = 'Address is required';
    if (addManagerForBranch) {
      if (!branchForm.managerName.trim()) errs.managerName = 'Manager name is required';
      if (!branchForm.managerPhone.trim()) errs.managerPhone = 'Manager phone is required';
      if (!branchForm.managerPassword.trim()) errs.managerPassword = 'Manager password is required';
    }
    if (Object.keys(errs).length > 0) { setBranchErrors(errs); return; }

    const branch = addBranch({
      orgId: org!.id,
      name: branchForm.name.trim(),
      address: branchForm.address.trim(),
      managerName: addManagerForBranch ? branchForm.managerName.trim() : '',
      managerPhone: addManagerForBranch ? branchForm.managerPhone.trim() : '',
      managerUsername: addManagerForBranch ? generateManagerUsername(branchForm.managerName) : '',
      managerPassword: addManagerForBranch ? branchForm.managerPassword.trim() : '',
    });
    setCreatedBranchId(branch.id);
    setBranchErrors({});
    setModalStep('rider');
  };

  // ── Rider submit ───────────────────────────────────────────────────────────
  const handleAddRider = () => {
    const errs: Partial<RiderForm> = {};
    if (!riderForm.name.trim()) errs.name = 'Rider name is required';
    if (!riderForm.password.trim()) errs.password = 'Password is required';
    if (Object.keys(errs).length > 0) { setRiderErrors(errs); return; }

    const username = generateUsername(riderForm.name);
    const rider = addRider({
      orgId: org!.id,
      branchId: createdBranchId!,
      name: riderForm.name.trim(),
      phone: riderForm.phone.trim(),
      username,
      password: riderForm.password.trim(),
      isAvailable: true,
    });
    setCreatedRider(rider);
    setRiderErrors({});
    setModalStep('credentials');
  };

  const handleSkipRider = () => {
    resetModal();
  };

  // ── Copy helpers ───────────────────────────────────────────────────────────
  const copyText = async (text: string, field: 'username' | 'password' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2200);
    } catch { }
  };

  const updateBranch = (k: keyof BranchForm, v: string) => {
    setBranchForm(prev => ({ ...prev, [k]: v }));
    if (branchErrors[k]) setBranchErrors(prev => ({ ...prev, [k]: '' }));
  };

  const toggleAddManager = (checked: boolean) => {
    setAddManagerForBranch(checked);
    if (!checked) {
      setBranchForm(prev => ({ ...prev, managerName: '', managerPhone: '', managerPassword: '' }));
      setBranchErrors(prev => ({ ...prev, managerName: '', managerPhone: '', managerPassword: '' }));
    }
  };

  const updateRider = (k: keyof RiderForm, v: string) => {
    setRiderForm(prev => ({ ...prev, [k]: v }));
    if (riderErrors[k]) setRiderErrors(prev => ({ ...prev, [k]: '' }));
  };

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <p className="text-stone-600">No organization found. Please register first.</p>
            <button onClick={() => navigate('/kitchen/register')} className="mt-3 text-orange-500" style={{ fontWeight: 600 }}>
              Register Organization
            </button>
          </div>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  if (isBranchManager) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Store size={44} className="text-orange-300 mb-3" />
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Branch Manager Access</h3>
          <p className="text-stone-500 mt-1" style={{ fontSize: '0.85rem' }}>
            Use Orders, Menu, and Riders tabs to manage your assigned branch.
          </p>
          <button
            onClick={() => navigate('/kitchen/orders')}
            className="mt-4 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Open Branch Orders
          </button>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-orange-500 px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-orange-100" style={{ fontSize: '0.8rem' }}>Welcome back,</p>
            <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>{org.orgName}</h2>
          </div>
          <div className="bg-orange-400 rounded-2xl px-3 py-1.5">
            <p className="text-white" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {org.type === 'restaurant' ? '🏪 Restaurant' : '🏠 Home-Made'}
            </p>
          </div>
        </div>
        <p className="text-orange-100 flex items-center gap-1 mt-1" style={{ fontSize: '0.8rem' }}>
          <MapPin size={12} />
          {org.address}
        </p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 bg-orange-50 border-b border-orange-100">
        <div className="flex gap-4">
          <div className="bg-white rounded-xl px-4 py-2.5 flex-1 text-center shadow-sm">
            <p className="text-orange-500" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{orgBranches.length}</p>
            <p className="text-stone-500" style={{ fontSize: '0.72rem' }}>Branches</p>
          </div>
          <div className="bg-white rounded-xl px-4 py-2.5 flex-1 text-center shadow-sm">
            <p className="text-orange-500" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{totalRiders}</p>
            <p className="text-stone-500" style={{ fontSize: '0.72rem' }}>Riders</p>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Kitchen Branches</h3>
          <button
            onClick={() => setModalStep('branch')}
            className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors shadow-md"
          >
            <Plus size={18} />
          </button>
        </div>

        {orgBranches.length === 0 ? (
          <div className="text-center py-12">
            <Store size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>No branches yet</p>
            <p className="text-stone-400 mt-1" style={{ fontSize: '0.82rem' }}>Tap + to add your first branch</p>
            <button
              onClick={() => setModalStep('branch')}
              className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
              style={{ fontSize: '0.9rem', fontWeight: 600 }}
            >
              Add Branch
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orgBranches.map(branch => {
              const branchRiders = riders.filter(r => r.branchId === branch.id);

              return (
              <div key={branch.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => navigate(`/kitchen/branch/${branch.id}`)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Store size={16} className="text-orange-500" />
                      </div>
                      <p className="text-stone-800" style={{ fontWeight: 600 }}>{branch.name}</p>
                    </div>
                    <p className="text-stone-500 flex items-center gap-1 mb-1" style={{ fontSize: '0.8rem' }}>
                      <MapPin size={11} /> {branch.address}
                    </p>
                    <p className="text-stone-400 flex items-center gap-1" style={{ fontSize: '0.78rem' }}>
                      <User size={11} />
                      {branch.managerName ? branch.managerName : 'No manager assigned'}
                    </p>
                    <p className="text-stone-400 flex items-center gap-1 mt-1" style={{ fontSize: '0.78rem' }}>
                      <Bike size={11} />
                      {branchRiders.length} {branchRiders.length === 1 ? 'Rider' : 'Riders'}
                    </p>
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => navigate(`/kitchen/branch/${branch.id}`)}
                      className="text-xs text-orange-500 hover:text-orange-700 px-2 py-1"
                      style={{ fontWeight: 600 }}
                    >
                      Manage
                    </button>
                    <button onClick={() => navigate(`/kitchen/branch/${branch.id}`)} className="text-orange-400 hover:text-orange-600 p-1">
                      <ChevronRight size={18} />
                    </button>
                    <button onClick={() => setDeleteConfirm(branch.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      <KitchenBottomNav />

      {/* ── MODAL OVERLAY ──────────────────────────────────────────────────── */}
      {modalStep && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-30">
          <div className="bg-white w-full rounded-t-3xl overflow-hidden" style={{ maxHeight: '92vh' }}>

            {/* ── STEP 1: Branch Form ────────────────────────────────────── */}
            {modalStep === 'branch' && (
              <div className="overflow-y-auto" style={{ maxHeight: '92vh' }}>
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-6 pb-3 pt-2">
                  <div>
                    <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>New Branch</h3>
                    <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>Step 1 of 2 — Branch details</p>
                  </div>
                  <button onClick={resetModal} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* Step dots */}
                <div className="flex gap-2 px-6 mb-5">
                  <div className="h-1.5 flex-1 rounded-full bg-orange-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                </div>

                <div className="px-6 space-y-4 pb-6">
                  {[
                    { k: 'name' as const, label: 'Branch Name', placeholder: 'e.g. DHA Branch', required: true },
                    { k: 'address' as const, label: 'Address', placeholder: 'Full address', required: true },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                        {f.label} {f.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type="text"
                        value={branchForm[f.k]}
                        onChange={e => updateBranch(f.k, e.target.value)}
                        placeholder={f.placeholder}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
                          branchErrors[f.k] ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'
                        }`}
                        style={{ fontSize: '0.93rem' }}
                      />
                      {branchErrors[f.k] && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {branchErrors[f.k]}
                        </p>
                      )}
                    </div>
                  ))}

                  <label className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addManagerForBranch}
                      onChange={e => toggleAddManager(e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-stone-700" style={{ fontSize: '0.86rem', fontWeight: 500 }}>
                      Add a manager for this branch.
                    </span>
                  </label>

                  {addManagerForBranch && (
                    <>
                      {[
                        { k: 'managerName' as const, label: 'Manager Name', placeholder: 'e.g. Ahmed Khan' },
                        { k: 'managerPhone' as const, label: 'Phone Number', placeholder: '03XX-XXXXXXX' },
                        { k: 'managerPassword' as const, label: 'Password', placeholder: 'Manager password' },
                      ].map(f => (
                        <div key={f.k}>
                          <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                            {f.label} <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={branchForm[f.k]}
                            onChange={e => updateBranch(f.k, e.target.value)}
                            placeholder={f.placeholder}
                            className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
                              branchErrors[f.k] ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'
                            }`}
                            style={{ fontSize: '0.93rem' }}
                          />
                          {branchErrors[f.k] && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={11} /> {branchErrors[f.k]}
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  <button
                    onClick={handleCreateBranch}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200 mt-2"
                    style={{ fontWeight: 700, fontSize: '0.97rem' }}
                  >
                    Create Branch & Add Rider
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Rider Form ─────────────────────────────────────── */}
            {modalStep === 'rider' && (
              <div className="overflow-y-auto" style={{ maxHeight: '92vh' }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-6 pb-3 pt-2">
                  <div>
                    <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>Add a Rider</h3>
                    <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>Step 2 of 2 — Rider credentials</p>
                  </div>
                  <button onClick={resetModal} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* Step dots */}
                <div className="flex gap-2 px-6 mb-1">
                  <div className="h-1.5 flex-1 rounded-full bg-green-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-orange-500" />
                </div>
                <div className="flex gap-2 px-6 mb-4">
                  <p className="flex-1 text-green-600" style={{ fontSize: '0.68rem' }}>Branch created ✓</p>
                  <p className="flex-1 text-orange-500" style={{ fontSize: '0.68rem' }}>Rider info</p>
                </div>

                {/* Branch pill */}
                <div className="mx-6 mb-5 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                  <p className="text-green-700" style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                    Branch "{branchForm.name}" created successfully
                  </p>
                </div>

                <div className="px-6 space-y-4 pb-6">
                  {/* Rider Name */}
                  <div>
                    <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                      Rider Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <UserCircle2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={riderForm.name}
                        onChange={e => updateRider('name', e.target.value)}
                        placeholder="e.g. Ali Hassan"
                        className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none bg-gray-50 ${
                          riderErrors.name ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'
                        }`}
                        style={{ fontSize: '0.93rem' }}
                      />
                    </div>
                    {riderErrors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {riderErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                      Phone Number <span className="text-stone-400 ml-1" style={{ fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        value={riderForm.phone}
                        onChange={e => updateRider('phone', e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-orange-400 bg-gray-50"
                        style={{ fontSize: '0.93rem' }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={riderForm.password}
                        onChange={e => updateRider('password', e.target.value)}
                        placeholder="Create a password"
                        className={`w-full border-2 rounded-xl pl-10 pr-12 py-3 focus:outline-none bg-gray-50 ${
                          riderErrors.password ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'
                        }`}
                        style={{ fontSize: '0.93rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {riderErrors.password && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {riderErrors.password}
                      </p>
                    )}
                    <p className="text-stone-400 mt-1.5" style={{ fontSize: '0.72rem' }}>
                      A unique username will be auto-generated for this rider.
                    </p>
                  </div>

                  <button
                    onClick={handleAddRider}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200 mt-2"
                    style={{ fontWeight: 700, fontSize: '0.97rem' }}
                  >
                    <Bike size={18} />
                    Add Rider & View Credentials
                  </button>

                  <button
                    onClick={handleSkipRider}
                    className="w-full text-stone-400 py-2 text-center"
                    style={{ fontSize: '0.85rem', fontWeight: 500 }}
                  >
                    Skip — Add rider later
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Credentials Card ───────────────────────────────── */}
            {modalStep === 'credentials' && createdRider && (
              <div className="overflow-y-auto" style={{ maxHeight: '92vh' }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Success header */}
                <div className="px-6 pt-2 pb-5 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={34} className="text-green-500" />
                  </div>
                  <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.2rem' }}>Rider Added!</h3>
                  <p className="text-stone-500 mt-1" style={{ fontSize: '0.85rem' }}>
                    Share these credentials with <strong>{createdRider.name}</strong> to log in
                  </p>
                </div>

                {/* Rider info pill */}
                <div className="mx-6 mb-4 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bike size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-stone-800" style={{ fontWeight: 600 }}>{createdRider.name}</p>
                    {createdRider.phone && (
                      <p className="text-stone-400 flex items-center gap-1" style={{ fontSize: '0.78rem' }}>
                        <Phone size={11} /> {createdRider.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Credentials box */}
                <div className="mx-6 mb-4 bg-stone-900 rounded-2xl p-5 relative overflow-hidden">
                  {/* decorative */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-green-500/10 rounded-full" />

                  <div className="flex items-center justify-between mb-4 relative">
                    <div className="flex items-center gap-2">
                      <KeyRound size={15} className="text-orange-400" />
                      <p className="text-stone-300" style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Login Credentials
                      </p>
                    </div>
                    <button
                      onClick={() => copyText(`Username: ${createdRider.username}\nPassword: ${createdRider.password}`, 'all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                        copiedField === 'all' ? 'bg-green-500 text-white' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                      }`}
                      style={{ fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      {copiedField === 'all' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy All</>}
                    </button>
                  </div>

                  {/* Username row */}
                  <div className="relative mb-3">
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-stone-500" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</p>
                        <p className="text-white mt-0.5" style={{ fontWeight: 600, fontSize: '0.97rem', letterSpacing: '0.01em' }}>
                          {createdRider.username}
                        </p>
                      </div>
                      <button
                        onClick={() => copyText(createdRider.username, 'username')}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          copiedField === 'username' ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {copiedField === 'username' ? <Check size={14} color="white" /> : <Copy size={14} className="text-stone-300" />}
                      </button>
                    </div>
                  </div>

                  {/* Password row */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-stone-500" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</p>
                      <p className="text-white mt-0.5" style={{ fontWeight: 600, fontSize: '0.97rem', letterSpacing: '0.02em' }}>
                        {showPassword ? createdRider.password : '•'.repeat(createdRider.password.length)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPassword(p => !p)}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff size={14} className="text-stone-300" /> : <Eye size={14} className="text-stone-300" />}
                      </button>
                      <button
                        onClick={() => copyText(createdRider.password, 'password')}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          copiedField === 'password' ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {copiedField === 'password' ? <Check size={14} color="white" /> : <Copy size={14} className="text-stone-300" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-center text-stone-400 mx-6 mb-5" style={{ fontSize: '0.75rem' }}>
                  You can view these credentials anytime from the branch settings.
                </p>

                <div className="px-6 pb-8">
                  <button
                    onClick={resetModal}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200"
                    style={{ fontWeight: 700, fontSize: '0.97rem' }}
                  >
                    Go to Kitchen Dashboard
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 px-6">
          <div className="bg-white rounded-2xl p-6 w-full">
            <h3 className="text-stone-800 mb-2" style={{ fontWeight: 700 }}>Delete Branch?</h3>
            <p className="text-stone-500 mb-5" style={{ fontSize: '0.87rem' }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 border-2 border-gray-200 py-3 rounded-xl text-stone-600 hover:bg-gray-50 transition-colors"
                style={{ fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={() => { deleteBranch(deleteConfirm!); setDeleteConfirm(null); }}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors"
                style={{ fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
