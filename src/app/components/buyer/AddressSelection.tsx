import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Navigation, CheckCircle, Search, Loader } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { BuyerBottomNav } from './BuyerBottomNav';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface AddressDetails {
  address: string;
  landmark?: string;
  coords: LocationCoords;
}

export function AddressSelection() {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [mapCenter, setMapCenter] = useState<LocationCoords>({ lat: 24.8607, lng: 67.0011 }); // Karachi default

  // Mock addresses for demonstration
  const [savedAddresses] = useState([
    { id: '1', label: 'Home', address: 'House 123, Block B, Gulshan-e-Iqbal, Karachi', coords: { lat: 24.9056, lng: 67.0822 } },
    { id: '2', label: 'Office', address: 'Office 45, Main Clifton Road, Karachi', coords: { lat: 24.8138, lng: 67.0299 } },
    { id: '3', label: 'Friend\'s Place', address: 'Flat 7, DHA Phase 2, Karachi', coords: { lat: 24.8103, lng: 67.0703 } },
  ]);

  const getCurrentLocation = useCallback(() => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(coords);
          
          // Mock reverse geocoding - in real app, use Google Maps API
          const mockAddress = `Current Location, Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`;
          setSelectedAddress({
            address: mockAddress,
            coords,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          // Fallback to default location
          setMapCenter({ lat: 24.8607, lng: 67.0011 });
        }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  const handleSavedAddressSelect = (address: any) => {
    setSelectedAddress({
      address: address.address,
      coords: address.coords,
    });
    setMapCenter(address.coords);
    setShowManualInput(false);
  };

  const handleManualAddressSubmit = () => {
    if (manualAddress.trim()) {
      // In real app, geocode the address
      const mockCoords = { lat: 24.8607 + Math.random() * 0.1, lng: 67.0011 + Math.random() * 0.1 };
      setSelectedAddress({
        address: manualAddress.trim(),
        landmark: landmark.trim() || undefined,
        coords: mockCoords,
      });
      setMapCenter(mockCoords);
      setShowManualInput(false);
    }
  };

  const handleConfirmAddress = () => {
    if (selectedAddress) {
      // Store selected address and navigate to payment confirmation
      localStorage.setItem('deliveryAddress', JSON.stringify(selectedAddress));
      navigate('/buyer/payment-confirmation');
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Delivery Address</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Map Area - Mock representation */}
        <div className="bg-gradient-to-br from-green-100 to-blue-100 h-48 relative flex items-center justify-center border-b border-gray-200">
          <div className="text-center">
            <MapPin size={40} className="text-orange-500 mx-auto mb-2" />
            <p className="text-stone-600 text-sm">Map View</p>
            <p className="text-stone-400 text-xs">Lat: {mapCenter.lat.toFixed(4)}, Lng: {mapCenter.lng.toFixed(4)}</p>
          </div>
          
          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {isLocating ? <Loader size={20} className="animate-spin text-orange-500" /> : <Navigation size={20} className="text-orange-500" />}
          </button>
        </div>

        {/* Address Selection Options */}
        <div className="p-5 space-y-4">
          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isLocating ? <Loader size={20} className="animate-spin text-blue-600" /> : <Navigation size={20} className="text-blue-600" />}
            <div className="flex-1 text-left">
              <p className="text-blue-700 font-semibold">Use Current Location</p>
              <p className="text-blue-500 text-sm">We'll detect your location automatically</p>
            </div>
          </button>

          {/* Saved Addresses */}
          <div>
            <h3 className="text-stone-700 mb-3 font-semibold">Saved Addresses</h3>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => handleSavedAddressSelect(addr)}
                  className={`w-full flex items-start gap-3 p-4 border-2 rounded-xl text-left transition-all ${
                    selectedAddress?.address === addr.address
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedAddress?.address === addr.address ? 'bg-orange-500' : 'bg-gray-200'
                  }`}>
                    {selectedAddress?.address === addr.address && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800">{addr.label}</p>
                    <p className="text-stone-600 text-sm truncate">{addr.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add New Address */}
          <button
            onClick={() => setShowManualInput(true)}
            className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors"
          >
            <Search size={20} className="text-gray-500" />
            <div className="flex-1 text-left">
              <p className="text-stone-700 font-semibold">Enter New Address</p>
              <p className="text-stone-500 text-sm">Type your delivery address manually</p>
            </div>
          </button>

          {/* Manual Address Input */}
          {showManualInput && (
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <div>
                <label className="block text-stone-700 text-sm font-semibold mb-2">Address *</label>
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter your complete address..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-stone-700 text-sm font-semibold mb-2">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near hospital, school, etc."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualAddress('');
                    setLandmark('');
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-stone-600 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualAddressSubmit}
                  disabled={!manualAddress.trim()}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Address Button */}
      {selectedAddress && (
        <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
          <div className="mb-3">
            <p className="text-stone-700 font-semibold">Selected Address:</p>
            <p className="text-stone-600 text-sm">{selectedAddress.address}</p>
            {selectedAddress.landmark && <p className="text-stone-500 text-xs">Near: {selectedAddress.landmark}</p>}
          </div>
          <button
            onClick={handleConfirmAddress}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200 font-bold"
          >
            Confirm Delivery Address
          </button>
        </div>
      )}
      
      <BuyerBottomNav />
    </MobileLayout>
  );
}