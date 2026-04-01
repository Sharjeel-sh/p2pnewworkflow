import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ChevronLeft, Loader, MapPin, Navigation, Save } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

const DEFAULT_MAP_CENTER = { lat: 24.8607, lng: 67.0011 };
const MAP_ZOOM = 15;
const MAP_WIDTH = 640;
const MAP_HEIGHT = 280;

type BranchForm = {
  name: string;
  houseNo: string;
  streetBlock: string;
  city: string;
  stateProvince: string;
  country: string;
  openingTime: string;
  closingTime: string;
  deliveryTime: string;
  latitude: number;
  longitude: number;
};

function parseAddress(address: string): Partial<BranchForm> {
  const parts = address.split(',').map(p => p.trim());
  return {
    houseNo: parts[0] || '',
    streetBlock: parts[1] || '',
    city: parts[2] || '',
    stateProvince: parts[3] || '',
    country: parts[4] || '',
  };
}

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

export function KitchenBranchEdit() {
  const navigate = useNavigate();
  const { currentUser, branches, updateBranch } = useApp();
  const [activeBranchId, setActiveBranchId] = useState<string | undefined>(undefined);
  const [branchForm, setBranchForm] = useState<BranchForm>({
    name: '',
    houseNo: '',
    streetBlock: '',
    city: '',
    stateProvince: '',
    country: '',
    openingTime: '',
    closingTime: '',
    deliveryTime: '',
    latitude: DEFAULT_MAP_CENTER.lat,
    longitude: DEFAULT_MAP_CENTER.lng,
  });
  const [errors, setErrors] = useState<Partial<BranchForm>>({});
  const [isLocatingOnMap, setIsLocatingOnMap] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const mapPickerRef = useRef<HTMLDivElement>(null);

  const orgBranches = useMemo(
    () => branches.filter(b => b.orgId === currentUser?.orgId),
    [branches, currentUser?.orgId],
  );

  const branch = useMemo(() => {
    if (!activeBranchId) return undefined;
    return branches.find(b => b.id === activeBranchId);
  }, [branches, activeBranchId]);

  useEffect(() => {
    if (currentUser?.branchId) {
      setActiveBranchId(currentUser.branchId);
    } else if (orgBranches.length > 0) {
      setActiveBranchId(orgBranches[0].id);
    }
  }, [currentUser?.branchId, orgBranches]);

  useEffect(() => {
    if (!branch) return;
    const addressFields = parseAddress(branch.address || '');
    setBranchForm({
      name: branch.name || '',
      houseNo: addressFields.houseNo || '',
      streetBlock: addressFields.streetBlock || '',
      city: addressFields.city || '',
      stateProvince: addressFields.stateProvince || '',
      country: addressFields.country || '',
      openingTime: branch.openingTime || '',
      closingTime: branch.closingTime || '',
      deliveryTime: branch.deliveryTime || '',
      latitude: branch.latitude ?? DEFAULT_MAP_CENTER.lat,
      longitude: branch.longitude ?? DEFAULT_MAP_CENTER.lng,
    });
    setMapCenter({
      lat: branch.latitude ?? DEFAULT_MAP_CENTER.lat,
      lng: branch.longitude ?? DEFAULT_MAP_CENTER.lng,
    });
    setErrors({});
  }, [branch]);

  const getMapImageUrl = (lat: number, lng: number) =>
    `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${MAP_ZOOM}&size=${MAP_WIDTH}x${MAP_HEIGHT}&markers=${lat},${lng},red-pushpin`;

  const handleMapClick: React.MouseEventHandler<HTMLDivElement> = event => {
    const rect = mapPickerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const centerWorld = lngLatToWorld(mapCenter.lat, mapCenter.lng, MAP_ZOOM);
    const worldX = centerWorld.x + (clickX - rect.width / 2);
    const worldY = centerWorld.y + (clickY - rect.height / 2);
    const picked = worldToLngLat(worldX, worldY, MAP_ZOOM);

    setMapCenter(picked);
    setBranchForm(prev => ({ ...prev, latitude: picked.lat, longitude: picked.lng }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocatingOnMap(true);

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapCenter({ lat, lng });
        setBranchForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setIsLocatingOnMap(false);
      },
      () => setIsLocatingOnMap(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const validate = (): Partial<BranchForm> => {
    const next: Partial<BranchForm> = {};
    if (!branchForm.name.trim()) next.name = 'Branch name is required';
    if (!branchForm.houseNo.trim()) next.houseNo = 'House No is required';
    if (!branchForm.streetBlock.trim()) next.streetBlock = 'Street & Block is required';
    if (!branchForm.city.trim()) next.city = 'City is required';
    if (!branchForm.stateProvince.trim()) next.stateProvince = 'State/Province is required';
    if (!branchForm.country.trim()) next.country = 'Country is required';
    if (!branchForm.openingTime) next.openingTime = 'Opening time is required';
    if (!branchForm.closingTime) next.closingTime = 'Closing time is required';
    return next;
  };

  const handleSave = () => {
    if (!branch) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const address = [branchForm.houseNo, branchForm.streetBlock, branchForm.city, branchForm.stateProvince, branchForm.country]
      .filter(Boolean)
      .join(', ');

    updateBranch(branch.id, {
      name: branchForm.name.trim(),
      address,
      openingTime: branchForm.openingTime,
      closingTime: branchForm.closingTime,
      deliveryTime: branchForm.deliveryTime,
      latitude: branchForm.latitude,
      longitude: branchForm.longitude,
    });

    navigate('/kitchen/profile');
  };

  if (!currentUser?.orgId || orgBranches.length === 0) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-stone-500">No branch available to edit.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  if (!branch) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-stone-500">Please select a branch.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="bg-red-700 px-5 pt-10 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Edit Branch Details</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          {(!currentUser?.branchId && orgBranches.length > 1) && (
            <div className="mb-3">
              <label className="block text-stone-600 mb-1 text-sm" style={{ fontWeight: 500 }}>Select Branch</label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50"
                value={activeBranchId}
                onChange={e => setActiveBranchId(e.target.value)}
              >
                {orgBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {[
            { key: 'name', label: 'Branch Name', type: 'text' },
            { key: 'houseNo', label: 'House No', type: 'text' },
            { key: 'streetBlock', label: 'Street & Block', type: 'text' },
            { key: 'city', label: 'City', type: 'text' },
            { key: 'stateProvince', label: 'State/Province', type: 'text' },
            { key: 'country', label: 'Country', type: 'text' },
            { key: 'deliveryTime', label: 'Delivery Time', type: 'text' },
            { key: 'openingTime', label: 'Kitchen Opening Time', type: 'time' },
            { key: 'closingTime', label: 'Kitchen Closing Time', type: 'time' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.83rem', fontWeight: 500 }}>
                {field.label} <span className="text-red-600">*</span>
              </label>
              <input
                type={field.type}
                value={branchForm[field.key as keyof BranchForm]}
                onChange={e => {
                  const value = e.target.value;
                  setBranchForm(prev => ({ ...prev, [field.key]: value }));
                  if (errors[field.key as keyof BranchForm]) {
                    setErrors(prev => ({ ...prev, [field.key]: '' }));
                  }
                }}
                className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
                  errors[field.key as keyof BranchForm] ? 'border-red-300' : 'border-gray-200 focus:border-red-600'
                }`}
                style={{ fontSize: '0.93rem' }}
              />
              {errors[field.key as keyof BranchForm] && (
                <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors[field.key as keyof BranchForm]}
                </p>
              )}
            </div>
          ))}

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-stone-800" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Branch Location</p>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocatingOnMap}
                className="inline-flex items-center gap-1 text-red-800 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg disabled:opacity-60"
                style={{ fontSize: '0.72rem', fontWeight: 600 }}
              >
                {isLocatingOnMap ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />} Current
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
            <p className="text-stone-400 mt-1" style={{ fontSize: '0.72rem' }}>
              Tap map to move branch location
            </p>
            <p className="text-stone-400 mt-1" style={{ fontSize: '0.72rem' }}>
              Lat: {mapCenter.lat.toFixed(5)}, Lng: {mapCenter.lng.toFixed(5)}
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 mt-2"
            style={{ fontWeight: 700, fontSize: '0.97rem' }}
          >
            <Save size={18} /> Save Branch
          </button>
        </div>
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
