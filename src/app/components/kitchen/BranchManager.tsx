import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Bike, Plus, Trash2, Eye, EyeOff, X, Copy, Check } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

interface RiderForm {
  name: string;
  phone: string;
  username: string;
  password: string;
}

const EMPTY_RIDER: RiderForm = { name: '', phone: '', username: '', password: '' };

export function BranchManager() {
  const { branchId } = useParams<{ branchId: string }>();
  const { branches, riders, addRider, deleteRider, updateBranch, updateRider, currentUser } = useApp();
  const [showAddRider, setShowAddRider] = useState(false);
  const [riderForm, setRiderForm] = useState<RiderForm>(EMPTY_RIDER);
  const [riderErrors, setRiderErrors] = useState<Partial<RiderForm>>({});
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editManager, setEditManager] = useState(false);
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerUsername, setManagerUsername] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [editingRiderId, setEditingRiderId] = useState<string | null>(null);

  const branch = branches.find(b => b.id === branchId);
  const branchRiders = riders.filter(r => r.branchId === branchId);

  if (!branch) {
    return (
      <MobileLayout>
        <TopBar title="Branch Not Found" backTo="/kitchen" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Branch not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  const updateRiderForm = (k: keyof RiderForm, v: string) => {
    setRiderForm(prev => ({ ...prev, [k]: v }));
    if (riderErrors[k]) setRiderErrors(prev => ({ ...prev, [k]: '' }));
  };

  const handleEditRider = (rider: typeof branchRiders[0]) => {
    setEditingRiderId(rider.id);
    setRiderForm({
      name: rider.name,
      phone: rider.phone,
      username: rider.username,
      password: rider.password,
    });
    setRiderErrors({});
    setShowAddRider(false);
  };

  const handleUpdateRider = () => {
    if (!editingRiderId) return;
    const errs: Partial<RiderForm> = {};
    if (!riderForm.name.trim()) errs.name = 'Name required';
    if (!riderForm.username.trim()) errs.username = 'Username required';
    if (!riderForm.password.trim()) errs.password = 'Password required';
    if (Object.keys(errs).length > 0) { setRiderErrors(errs); return; }
    updateRider(editingRiderId, {
      name: riderForm.name.trim(),
      phone: riderForm.phone.trim(),
      username: riderForm.username.trim(),
      password: riderForm.password.trim(),
    });
    setEditingRiderId(null);
    setRiderForm(EMPTY_RIDER);
    setRiderErrors({});
  };

  const handleCancelEditRider = () => {
    setEditingRiderId(null);
    setRiderForm(EMPTY_RIDER);
    setRiderErrors({});
  };
  const handleAddRider = () => {
    const errs: Partial<RiderForm> = {};
    if (!riderForm.name.trim()) errs.name = 'Name required';
    if (!riderForm.username.trim()) errs.username = 'Username required';
    if (!riderForm.password.trim()) errs.password = 'Password required';
    if (Object.keys(errs).length > 0) { setRiderErrors(errs); return; }
    addRider({
      orgId: currentUser?.orgId || branch.orgId,
      branchId: branch.id,
      name: riderForm.name.trim(),
      phone: riderForm.phone.trim(),
      username: riderForm.username.trim(),
      password: riderForm.password.trim(),
      isAvailable: true,
    });
    setRiderForm(EMPTY_RIDER);
    setShowAddRider(false);
  };

  const handleSaveManager = () => {
    updateBranch(branch.id, {
      managerName: managerName.trim(),
      managerPhone: managerPhone.trim(),
      managerUsername: managerUsername.trim(),
      managerPassword: managerPassword.trim(),
    });
    setEditManager(false);
  };

  const copyCredentials = async (rider: typeof branchRiders[0]) => {
    const text = `Username: ${rider.username}\nPassword: ${rider.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(rider.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { }
  };

  return (
    <MobileLayout>
      <TopBar title={branch.name} backTo="/kitchen" />

      <div className="flex-1 overflow-y-auto">
        {/* Branch Info */}
        <div className="bg-orange-50 px-5 py-4 border-b border-orange-100">
          <p className="text-stone-500" style={{ fontSize: '0.82rem' }}>{branch.address}</p>
        </div>

        {/* Manager Section */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-stone-700" style={{ fontWeight: 700 }}>Branch Manager</h3>
            <button
              onClick={() => {
                setEditManager(!editManager);
                setManagerName(branch.managerName || '');
                setManagerPhone(branch.managerPhone || '');
                setManagerUsername(branch.managerUsername || '');
                setManagerPassword(branch.managerPassword || '');
              }}
              className="text-orange-500 text-sm" style={{ fontWeight: 600 }}>
              {editManager ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editManager ? (
            <div className="space-y-2">
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                placeholder="Manager Name"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              />
              <input
                type="text"
                value={managerPhone}
                onChange={e => setManagerPhone(e.target.value)}
                placeholder="Manager Phone"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              />
              <input
                type="text"
                value={managerUsername}
                onChange={e => setManagerUsername(e.target.value)}
                placeholder="Manager Username"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              />
              <input
                type="text"
                value={managerPassword}
                onChange={e => setManagerPassword(e.target.value)}
                placeholder="Manager Password"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              />
              <button onClick={handleSaveManager}
                className="w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors"
                style={{ fontWeight: 600 }}>
                Save Manager Info
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              {branch.managerName ? (
                <>
                  <p className="text-stone-800" style={{ fontWeight: 600 }}>{branch.managerName}</p>
                  {branch.managerPhone && (
                    <p className="text-stone-500 text-sm mt-0.5">{branch.managerPhone}</p>
                  )}
                  {branch.managerUsername && (
                    <p className="text-stone-500 text-sm mt-0.5">Username: {branch.managerUsername}</p>
                  )}
                  {branch.managerPassword && (
                    <p className="text-stone-500 text-sm mt-0.5">Password: {branch.managerPassword}</p>
                  )}
                </>
              ) : (
                <p className="text-stone-400 text-sm">No manager assigned. Tap Edit to add one.</p>
              )}
            </div>
          )}
        </div>

        {/* Riders Section */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-700" style={{ fontWeight: 700 }}>Riders ({branchRiders.length})</h3>
            <button
              onClick={() => setShowAddRider(true)}
              className="bg-orange-500 text-white rounded-full p-1.5 hover:bg-orange-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {branchRiders.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <Bike size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-stone-400 text-sm">No riders added yet</p>
              <button onClick={() => setShowAddRider(true)}
                className="mt-3 text-orange-500 text-sm" style={{ fontWeight: 600 }}>
                + Add Rider
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {branchRiders.map(rider => (
                <div key={rider.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Bike size={15} className="text-green-500" />
                        </div>
                        <div>
                          <p className="text-stone-800" style={{ fontWeight: 600, fontSize: '0.93rem' }}>{rider.name}</p>
                          {rider.phone && <p className="text-stone-400" style={{ fontSize: '0.75rem' }}>{rider.phone}</p>}
                        </div>
                      </div>
                      {/* Credentials */}
                      <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>Login Credentials</p>
                          <button onClick={() => copyCredentials(rider)} className="flex items-center gap-1 text-orange-500" style={{ fontSize: '0.72rem' }}>
                            {copiedId === rider.id ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                          </button>
                        </div>
                        <p className="text-stone-600" style={{ fontSize: '0.8rem' }}>
                          <span className="text-stone-400">User: </span>{rider.username}
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-stone-600" style={{ fontSize: '0.8rem' }}>
                            <span className="text-stone-400">Pass: </span>
                            {showPassMap[rider.id] ? rider.password : '••••••'}
                          </p>
                          <button onClick={() => setShowPassMap(p => ({ ...p, [rider.id]: !p[rider.id] }))}
                            className="text-gray-400 ml-1">
                            {showPassMap[rider.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button onClick={() => handleEditRider(rider)}
                        className="text-blue-500 hover:text-blue-700 p-1 text-xs">
                        Edit
                      </button>
                      <button onClick={() => deleteRider(rider.id)}
                        className="text-red-400 hover:text-red-600 p-1 mt-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <KitchenBottomNav />

      {/* Add/Edit Rider Modal */}
      {(showAddRider || editingRiderId) && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-30">
          <div className="bg-white w-full rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-800" style={{ fontWeight: 700 }}>{editingRiderId ? 'Edit Rider' : 'Add Rider'}</h3>
              <button onClick={() => {
                if (editingRiderId) handleCancelEditRider();
                else { setShowAddRider(false); setRiderForm(EMPTY_RIDER); setRiderErrors({}); }
              }}
                className="text-gray-400 p-1"><X size={20} /></button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { k: 'name' as const, label: 'Rider Name *', placeholder: 'e.g. Ali Hassan' },
                { k: 'phone' as const, label: 'Phone Number', placeholder: 'Optional' },
                { k: 'username' as const, label: 'Username *', placeholder: 'Login username' },
                { k: 'password' as const, label: 'Password *', placeholder: 'Login password' },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-stone-600 mb-1" style={{ fontSize: '0.82rem', fontWeight: 500 }}>{f.label}</label>
                  <input
                    type={f.k === 'password' ? 'text' : 'text'}
                    value={riderForm[f.k]}
                    onChange={e => updateRiderForm(f.k, e.target.value)}
                    placeholder={f.placeholder}
                    className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${riderErrors[f.k] ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                  />
                  {riderErrors[f.k] && <p className="text-red-500 text-xs mt-0.5">{riderErrors[f.k]}</p>}
                </div>
              ))}
            </div>
            {editingRiderId ? (
              <button onClick={handleUpdateRider}
                className="w-full bg-blue-500 text-white py-3.5 rounded-xl hover:bg-blue-600 transition-colors"
                style={{ fontWeight: 700 }}>
                Update Rider
              </button>
            ) : (
              <button onClick={handleAddRider}
                className="w-full bg-orange-500 text-white py-3.5 rounded-xl hover:bg-orange-600 transition-colors"
                style={{ fontWeight: 700 }}>
                Add Rider
              </button>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
