import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Trash2, MapPin, User, ChevronRight, ChevronLeft, Store, X, AlertCircle,
  Bike, ArrowRight, Navigation, Loader,
} from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { Switch } from '../ui/switch';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

interface BranchForm {
  name: string;
  houseNo: string;
  streetBlock: string;
  city: string;
  stateProvince: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  openingTime: string;
  closingTime: string;
  isDeliveryEnabled: boolean;
  deliveryPrice: string;
  deliveryTime: string;
  managerName: string;
  managerPhone: string;
  managerPassword: string;
  selectedManagerBranchId: string;
}

const EMPTY_BRANCH: BranchForm = {
  name: '',
  houseNo: '',
  streetBlock: '',
  city: '',
  stateProvince: '',
  country: '',
  latitude: null,
  longitude: null,
  openingTime: '',
  closingTime: '',
  isDeliveryEnabled: false,
  deliveryPrice: '',
  deliveryTime: '',
  managerName: '',
  managerPhone: '',
  managerPassword: '',
  selectedManagerBranchId: '',
};
type ModalStep = 'branchDetails' | 'branchOperations' | 'branchLocation' | null;

const DEFAULT_MAP_CENTER = { lat: 24.8607, lng: 67.0011 };
const MAP_ZOOM = 15;
const MAP_WIDTH = 640;
const MAP_HEIGHT = 280;
type AddressSuggestion = Pick<BranchForm, 'houseNo' | 'streetBlock' | 'city' | 'stateProvince' | 'country'>;

function lngLatToWorld(lat: number, lng: number, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldToLngLat(x: number, y: number, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
}

export function KitchenBranchesScreen() {
  const { currentUser, organizations, branches, riders, orders, addBranch, deleteBranch, setCurrentUser } = useApp();
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [branchForm, setBranchForm] = useState<BranchForm>(EMPTY_BRANCH);
  const [branchErrors, setBranchErrors] = useState<Partial<BranchForm>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [isLocatingOnMap, setIsLocatingOnMap] = useState(false);
  const [isResolvingMapAddress, setIsResolvingMapAddress] = useState(false);
  const [mapSuggestedAddress, setMapSuggestedAddress] = useState<AddressSuggestion | null>(null);
  const [addressEditedManually, setAddressEditedManually] = useState(false);
  const mapPickerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const org = organizations.find(o => o.id === currentUser?.orgId);
  const isBranchManager = Boolean(currentUser?.branchId);
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);
  const managerBranches = useMemo(
    () => orgBranches.filter(b => b.managerName || b.managerPhone || b.managerPassword),
    [orgBranches],
  );

  const openBranchKitchen = (branchId: string) => {
    if (!currentUser?.orgId) return;
    setCurrentUser({
      role: 'kitchen',
      orgId: currentUser.orgId,
      branchId,
    });
    navigate('/kitchen/orders');
  };

  const getBranchRating = (branchId: string): string => {
    const deliveredCount = orders.filter(o => o.branchId === branchId && o.status === 'delivered').length;
    const rating = Math.min(5, 4.2 + deliveredCount * 0.1);
    return rating.toFixed(1);
  };

  const getDeliveryPreview = (branch: typeof orgBranches[number]): string => {
    if (!branch.isDeliveryEnabled) return '';
    if (branch.deliveryTime?.trim()) return `Delivery Available (${branch.deliveryTime})`;
    return 'Delivery Available';
  };

  const resetModal = () => {
    setModalStep(null);
    setBranchForm(EMPTY_BRANCH);
    setBranchErrors({});
    setMapCenter(DEFAULT_MAP_CENTER);
    setIsLocatingOnMap(false);
    setIsResolvingMapAddress(false);
    setMapSuggestedAddress(null);
    setAddressEditedManually(false);
  };

  const getMapImageUrl = (lat: number, lng: number) =>
    `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${MAP_ZOOM}&size=${MAP_WIDTH}x${MAP_HEIGHT}&markers=${lat},${lng},red-pushpin`;

  const reverseGeocodeAddress = async (lat: number, lng: number) => {
    setIsResolvingMapAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      const result = await response.json();
      if (result?.display_name || result?.address) {
        const addr = (result?.address ?? {}) as Record<string, string | undefined>;
        const suggested: AddressSuggestion = {
          houseNo: addr.house_number?.trim() || '',
          streetBlock: [addr.road, addr.suburb].filter(Boolean).join(', ').trim() || String(result?.display_name ?? '').split(',').slice(0, 2).join(',').trim(),
          city: addr.city?.trim() || addr.town?.trim() || addr.village?.trim() || '',
          stateProvince: addr.state?.trim() || addr.province?.trim() || '',
          country: addr.country?.trim() || '',
        };
        setMapSuggestedAddress(suggested);
        const hasManualAddress =
          branchForm.houseNo.trim() ||
          branchForm.streetBlock.trim() ||
          branchForm.city.trim() ||
          branchForm.stateProvince.trim() ||
          branchForm.country.trim();
        if (!addressEditedManually || !hasManualAddress) {
          setBranchForm(prev => ({
            ...prev,
            houseNo: suggested.houseNo,
            streetBlock: suggested.streetBlock,
            city: suggested.city,
            stateProvince: suggested.stateProvince,
            country: suggested.country,
          }));
          setBranchErrors(prev => ({
            ...prev,
            houseNo: '',
            streetBlock: '',
            city: '',
            stateProvince: '',
            country: '',
          }));
        }
      }
    } catch {
      // Ignore reverse geocoding errors and keep manual address input available.
    } finally {
      setIsResolvingMapAddress(false);
    }
  };

  const setMapLocation = async (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setBranchForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
    await reverseGeocodeAddress(lat, lng);
  };

  const handleMapClick: React.MouseEventHandler<HTMLDivElement> = async event => {
    const rect = mapPickerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const centerWorld = lngLatToWorld(mapCenter.lat, mapCenter.lng, MAP_ZOOM);
    const worldX = centerWorld.x + (clickX - rect.width / 2);
    const worldY = centerWorld.y + (clickY - rect.height / 2);
    const picked = worldToLngLat(worldX, worldY, MAP_ZOOM);

    await setMapLocation(picked.lat, picked.lng);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocatingOnMap(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await setMapLocation(lat, lng);
        setIsLocatingOnMap(false);
      },
      () => setIsLocatingOnMap(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const validateBranchDetails = () => {
    const errs: Partial<BranchForm> = {};
    if (!branchForm.name.trim()) errs.name = 'Branch name is required';
    if (!branchForm.houseNo.trim()) errs.houseNo = 'House no is required';
    if (!branchForm.streetBlock.trim()) errs.streetBlock = 'Street & block is required';
    if (!branchForm.city.trim()) errs.city = 'City is required';
    if (!branchForm.stateProvince.trim()) errs.stateProvince = 'State/Province is required';
    if (!branchForm.country.trim()) errs.country = 'Country is required';
    return errs;
  };

  const validateBranchOperations = () => {
    const errs: Partial<BranchForm> = {};
    if (!branchForm.openingTime) errs.openingTime = 'Opening time is required';
    if (!branchForm.closingTime) errs.closingTime = 'Closing time is required';
    if (branchForm.isDeliveryEnabled) {
      if (!branchForm.deliveryPrice.trim()) errs.deliveryPrice = 'Delivery price is required';
      if (!branchForm.deliveryTime.trim()) errs.deliveryTime = 'Delivery time is required';
    }
    return errs;
  };

  const handleContinueToOperationsStep = () => {
    const errs = validateBranchDetails();
    if (Object.keys(errs).length > 0) {
      setBranchErrors(errs);
      return;
    }
    setBranchErrors({});
    setModalStep('branchOperations');
  };

  const handleContinueToLocationStep = () => {
    const errs = validateBranchOperations();
    if (Object.keys(errs).length > 0) {
      setBranchErrors(errs);
      return;
    }
    setBranchErrors({});
    setModalStep('branchLocation');
  };

  // ── Branch submit ──────────────────────────────────────────────────────────
  const handleCreateBranch = () => {
    const errs = { ...validateBranchDetails(), ...validateBranchOperations() };
    if (Object.keys(errs).length > 0) { setBranchErrors(errs); return; }
    const selectedManager = managerBranches.find(b => b.id === branchForm.selectedManagerBranchId);

    const combinedAddress = [
      branchForm.houseNo.trim(),
      branchForm.streetBlock.trim(),
      branchForm.city.trim(),
      branchForm.stateProvince.trim(),
      branchForm.country.trim(),
    ].join(', ');

    addBranch({
      orgId: org!.id,
      name: branchForm.name.trim(),
      address: combinedAddress,
      latitude: branchForm.latitude ?? undefined,
      longitude: branchForm.longitude ?? undefined,
      openingTime: branchForm.openingTime,
      closingTime: branchForm.closingTime,
      isDeliveryEnabled: branchForm.isDeliveryEnabled,
      deliveryPrice: branchForm.isDeliveryEnabled ? branchForm.deliveryPrice.trim() : '',
      deliveryTime: branchForm.isDeliveryEnabled ? branchForm.deliveryTime.trim() : '',
      managerName: selectedManager?.managerName?.trim() || '',
      managerPhone: selectedManager?.managerPhone?.trim() || '',
      managerPassword: selectedManager?.managerPassword?.trim() || '',
    });
    setBranchErrors({});
    resetModal();
    navigate('/kitchen/branches');
  };

  const updateBranchForm = (k: keyof BranchForm, v: string) => {
    setBranchForm(prev => ({ ...prev, [k]: v }));
    if (k === 'houseNo' || k === 'streetBlock' || k === 'city' || k === 'stateProvince' || k === 'country') {
      setAddressEditedManually(true);
    }
    if (branchErrors[k]) setBranchErrors(prev => ({ ...prev, [k]: '' }));
  };

  const toggleDeliveryDetails = (enabled: boolean) => {
    setBranchForm(prev => ({
      ...prev,
      isDeliveryEnabled: enabled,
      deliveryPrice: enabled ? prev.deliveryPrice : '',
      deliveryTime: enabled ? prev.deliveryTime : '',
    }));
    if (!enabled) {
      setBranchErrors(prev => ({ ...prev, deliveryPrice: '', deliveryTime: '' }));
    }
  };

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle size={40} className="text-red-600 mx-auto mb-3" />
            <p className="text-stone-600">No organization found. Please register first.</p>
            <button onClick={() => navigate('/kitchen/register')} className="mt-3 text-red-700" style={{ fontWeight: 600 }}>
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
          <Store size={44} className="text-red-300 mb-3" />
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Branch Manager Access</h3>
          <p className="text-stone-500 mt-1" style={{ fontSize: '0.85rem' }}>
            Use Orders, Dishes, Chat List, and Profile tabs to manage your assigned branch.
          </p>
          <button
            onClick={() => navigate('/kitchen/orders')}
            className="mt-4 bg-red-700 text-white px-5 py-2.5 rounded-xl hover:bg-red-800 transition-colors"
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
      <div className="bg-red-700 px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate(-1)} className="text-white mr-2">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <p className="text-red-200" style={{ fontSize: '0.78rem' }}>Welcome back,</p>
            <h2 className="text-white" style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.2 }}>{org.orgName}</h2>
          </div>
          <div className="bg-white rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Store size={13} className="text-red-700" />
            <p className="text-red-700" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {org.type === 'restaurant' ? 'Restaurant' : 'Home-Made'}
            </p>
          </div>
        </div>
        <p className="text-red-200 flex items-center gap-1 mt-2" style={{ fontSize: '0.78rem' }}>
          <MapPin size={12} />
          {org.address}
        </p>
      </div>

      {/* Branches */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-800" style={{ fontWeight: 700 }}>Kitchen Branches</h3>
          <button
            onClick={() => setModalStep('branchDetails')}
            className="bg-red-700 text-white rounded-full p-2 hover:bg-red-800 transition-colors shadow-md"
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
              onClick={() => setModalStep('branchDetails')}
              className="mt-4 bg-red-700 text-white px-6 py-2.5 rounded-xl hover:bg-red-800 transition-colors"
              style={{ fontSize: '0.9rem', fontWeight: 600 }}
            >
              Add Branch
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orgBranches.map(branch => {
              const branchRiders = riders.filter(r => r.branchId === branch.id);
              const activeRiders = branchRiders.filter(r => r.isAvailable).length;

              return (
              <div key={branch.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {/* Branch icon */}
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Store size={20} className="text-red-700" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name row */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-stone-800 font-bold truncate" style={{ fontSize: '1rem' }}>{branch.name}</p>
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5 flex-shrink-0">
                        <span className="text-amber-400" style={{ fontSize: '0.78rem' }}>★</span>
                        <p className="text-amber-700 font-bold" style={{ fontSize: '0.78rem' }}>
                          {getBranchRating(branch.id)}
                        </p>
                      </div>
                    </div>

                    {/* Manager */}
                    <p className="text-stone-500 flex items-center gap-1 mb-1" style={{ fontSize: '0.8rem' }}>
                      <User size={12} />
                      Manager: {branch.managerName?.trim() ? branch.managerName : 'Not assigned'}
                    </p>

                    {/* Address */}
                    <p className="text-stone-500 flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                      <MapPin size={12} />
                      <span className="truncate">{branch.address}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openBranchKitchen(branch.id)}
                      className="text-red-700 font-semibold text-sm"
                    >
                      Manage
                    </button>
                    <button onClick={() => openBranchKitchen(branch.id)} className="text-red-700">
                      <ChevronRight size={18} />
                    </button>
                    <button onClick={() => setDeleteConfirm(branch.id)} className="text-red-400 hover:text-red-700">
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
        <div className="absolute inset-0 bg-white z-30 overflow-y-auto">

            {/* ── STEP 1: Branch Form ────────────────────────────────────── */}
            {modalStep === 'branchDetails' && (
              <div className="min-h-full">
                <div className="flex items-center justify-between px-6 pb-3 pt-6">
                  <button onClick={resetModal} className="text-stone-500 mr-2">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>New Branch</h3>
                    <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>Step 1 of 3 — Branch details</p>
                  </div>
                </div>

                {/* Step dots */}
                <div className="flex gap-2 px-6 mb-5">
                  <div className="h-1.5 flex-1 rounded-full bg-red-700" />
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                </div>

                <div className="px-6 space-y-4 pb-6">
                  {[
                    { k: 'name' as const, label: 'Branch Name', placeholder: 'e.g. DHA Branch', required: true },
                    { k: 'houseNo' as const, label: 'House No', placeholder: 'e.g. 12-A', required: true },
                    { k: 'streetBlock' as const, label: 'Street & Block', placeholder: 'e.g. Street 4, Block C', required: true },
                    { k: 'city' as const, label: 'City', placeholder: 'e.g. Karachi', required: true },
                    { k: 'stateProvince' as const, label: 'State/Province', placeholder: 'e.g. Sindh', required: true },
                    { k: 'country' as const, label: 'Country', placeholder: 'e.g. Pakistan', required: true },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                        {f.label} {f.required && <span className="text-red-600">*</span>}
                      </label>
                      <input
                        type="text"
                        value={branchForm[f.k]}
                        onChange={e => updateBranchForm(f.k, e.target.value)}
                        placeholder={f.placeholder}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
                          branchErrors[f.k] ? 'border-red-300' : 'border-gray-200 focus:border-red-600'
                        }`}
                        style={{ fontSize: '0.93rem' }}
                      />
                      {branchErrors[f.k] && (
                        <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {branchErrors[f.k]}
                        </p>
                      )}
                      {f.k === 'stateProvince' && (
                        <p className="text-stone-400 mt-1" style={{ fontSize: '0.72rem' }}>
                          You can set or adjust these based on the map in the next step.
                        </p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                      Branch Manager
                    </label>
                    <select
                      value={branchForm.selectedManagerBranchId}
                      onChange={e => updateBranchForm('selectedManagerBranchId', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 focus:border-red-600 transition-colors"
                      style={{ fontSize: '0.93rem' }}
                    >
                      <option value="">No manager selected</option>
                      {managerBranches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.managerName || 'Unnamed Manager'} ({branch.name})
                        </option>
                      ))}
                    </select>
                    <p className="text-stone-400 mt-1" style={{ fontSize: '0.72rem' }}>
                      Select an existing manager profile for this branch.
                    </p>
                  </div>

                  <button
                    onClick={handleContinueToOperationsStep}
                    className="w-full bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 mt-2"
                    style={{ fontWeight: 700, fontSize: '0.97rem' }}
                  >
                    Next: Kitchen Operations
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Kitchen Operations ────────────────────────────── */}
            {modalStep === 'branchOperations' && (
              <div className="min-h-full">
                <div className="flex items-center justify-between px-6 pb-3 pt-6">
                  <button onClick={() => setModalStep('branchDetails')} className="text-stone-500 mr-2">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>Kitchen Operations</h3>
                    <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>Step 2 of 3 — Delivery and timings</p>
                  </div>
                </div>

                <div className="flex gap-2 px-6 mb-5">
                  <div className="h-1.5 flex-1 rounded-full bg-red-600" />
                  <div className="h-1.5 flex-1 rounded-full bg-red-700" />
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
                </div>

                <div className="px-6 space-y-4 pb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                        Kitchen Opening Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="time"
                        value={branchForm.openingTime}
                        onChange={e => updateBranchForm('openingTime', e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
                          branchErrors.openingTime ? 'border-red-300' : 'border-gray-200 focus:border-red-600'
                        }`}
                        style={{ fontSize: '0.93rem' }}
                      />
                      {branchErrors.openingTime && (
                        <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {branchErrors.openingTime}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                        Kitchen Closing Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="time"
                        value={branchForm.closingTime}
                        onChange={e => updateBranchForm('closingTime', e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
                          branchErrors.closingTime ? 'border-red-300' : 'border-gray-200 focus:border-red-600'
                        }`}
                        style={{ fontSize: '0.93rem' }}
                      />
                      {branchErrors.closingTime && (
                        <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {branchErrors.closingTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-stone-800" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          Delivery Service
                        </p>
                        <p className="text-stone-400" style={{ fontSize: '0.74rem' }}>
                          Status: {branchForm.isDeliveryEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <Switch
                        checked={branchForm.isDeliveryEnabled}
                        onCheckedChange={toggleDeliveryDetails}
                      />
                    </div>
                  </div>

                  {branchForm.isDeliveryEnabled && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                          Delivery Price <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={branchForm.deliveryPrice}
                          onChange={e => updateBranchForm('deliveryPrice', e.target.value)}
                          placeholder="e.g. 150 PKR"
                          className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-white transition-colors ${
                            branchErrors.deliveryPrice ? 'border-red-300' : 'border-gray-200 focus:border-red-600'
                          }`}
                          style={{ fontSize: '0.93rem' }}
                        />
                        {branchErrors.deliveryPrice && (
                          <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={11} /> {branchErrors.deliveryPrice}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                          Delivery Time <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={branchForm.deliveryTime}
                          onChange={e => updateBranchForm('deliveryTime', e.target.value)}
                          placeholder="e.g. 30-40 min"
                          className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-white transition-colors ${
                            branchErrors.deliveryTime ? 'border-red-300' : 'border-gray-200 focus:border-red-600'
                          }`}
                          style={{ fontSize: '0.93rem' }}
                        />
                        {branchErrors.deliveryTime && (
                          <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={11} /> {branchErrors.deliveryTime}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleContinueToLocationStep}
                    className="w-full bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 mt-2"
                    style={{ fontWeight: 700, fontSize: '0.97rem' }}
                  >
                    Next: Kitchen Location
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Kitchen Location ──────────────────────────────── */}
            {modalStep === 'branchLocation' && (
              <div className="min-h-full">
                <div className="flex items-center justify-between px-6 pb-3 pt-6">
                  <button onClick={() => setModalStep('branchOperations')} className="text-stone-500 mr-2">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.15rem' }}>Kitchen Location</h3>
                    <p className="text-stone-400" style={{ fontSize: '0.78rem' }}>Step 3 of 3 — Set location on map</p>
                  </div>
                </div>

                <div className="flex gap-2 px-6 mb-5">
                  <div className="h-1.5 flex-1 rounded-full bg-red-600" />
                  <div className="h-1.5 flex-1 rounded-full bg-red-600" />
                  <div className="h-1.5 flex-1 rounded-full bg-red-700" />
                </div>

                <div className="px-6 space-y-4 pb-6">
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-stone-800" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          Branch Location on Map
                        </p>
                        <p className="text-stone-400" style={{ fontSize: '0.74rem' }}>
                          Tap on map to pick kitchen location
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocatingOnMap}
                        className="inline-flex items-center gap-1 text-red-800 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg disabled:opacity-60"
                        style={{ fontSize: '0.72rem', fontWeight: 600 }}
                      >
                        {isLocatingOnMap ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />}
                        Current
                      </button>
                    </div>

                    <div
                      ref={mapPickerRef}
                      onClick={handleMapClick}
                      className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white cursor-crosshair"
                    >
                      <img
                        src={getMapImageUrl(mapCenter.lat, mapCenter.lng)}
                        alt="Map picker"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <MapPin size={20} className="text-red-700 drop-shadow" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>
                        Lat: {mapCenter.lat.toFixed(5)}, Lng: {mapCenter.lng.toFixed(5)}
                      </p>
                      {isResolvingMapAddress && (
                        <p className="text-red-700 flex items-center gap-1" style={{ fontSize: '0.72rem' }}>
                          <Loader size={11} className="animate-spin" />
                          Fetching address...
                        </p>
                      )}
                    </div>
                    {mapSuggestedAddress && addressEditedManually && (
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-2.5">
                        <p className="text-blue-700" style={{ fontSize: '0.72rem' }}>
                          Map suggested address available.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setBranchForm(prev => ({
                              ...prev,
                              houseNo: mapSuggestedAddress.houseNo || prev.houseNo,
                              streetBlock: mapSuggestedAddress.streetBlock || prev.streetBlock,
                              city: mapSuggestedAddress.city || prev.city,
                              stateProvince: mapSuggestedAddress.stateProvince || prev.stateProvince,
                              country: mapSuggestedAddress.country || prev.country,
                            }));
                            setBranchErrors(prev => ({
                              ...prev,
                              houseNo: '',
                              streetBlock: '',
                              city: '',
                              stateProvince: '',
                              country: '',
                            }));
                            setAddressEditedManually(false);
                          }}
                          className="text-blue-700 mt-1 underline"
                          style={{ fontSize: '0.72rem', fontWeight: 600 }}
                        >
                          Use map address
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCreateBranch}
                    className="w-full bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 mt-2"
                    style={{ fontWeight: 700, fontSize: '0.97rem' }}
                  >
                    Create Branch
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

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
                className="flex-1 bg-red-700 text-white py-3 rounded-xl hover:bg-red-800 transition-colors"
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
