import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, MapPin, Navigation, Search, Loader } from 'lucide-react';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface AddressDetails {
  address: string;
  landmark?: string;
  coords: LocationCoords;
}
import { MobileLayout } from '../shared/MobileLayout';
import { BuyerBottomNav } from './BuyerBottomNav';
import { useApp } from '../../context/AppContext';

export function DeliveryScreen() {
  const navigate = useNavigate();
  const { cart, organizations } = useApp();
  const [deliverySelected, setDeliverySelected] = useState<boolean>(true);

  // address selection state (copied from AddressSelection component)
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [mapCenter, setMapCenter] = useState<LocationCoords>({ lat: 24.8607, lng: 67.0011 }); // Karachi default

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0);
  const deliveryFee = deliverySelected ? 50 : 0;
  const total = cartTotal + deliveryFee;
  const orgId = cart[0]?.dish.orgId || '';
  const org = organizations.find(o => o.id === orgId);

  useEffect(() => {
    // if a previous choice exists, load it so the toggle isn't reset when navigating back
    const stored = localStorage.getItem('deliveryOption');
    if (stored) {
      const isDelivery = stored !== 'pickup';
      setDeliverySelected(isDelivery);
      if (isDelivery) {
        const savedAddr = localStorage.getItem('deliveryAddress');
        if (savedAddr) {
          try {
            const parsed = JSON.parse(savedAddr);
            setSelectedAddress(parsed);
            setMapCenter(parsed.coords);
          } catch {}
        }
      }
    }
  }, []);

  const handleContinue = () => {
    if (cart.length === 0) return;
    localStorage.setItem('deliveryOption', deliverySelected ? 'delivery' : 'pickup');
    localStorage.setItem('deliveryFee', deliveryFee.toString());
    if (deliverySelected) {
      if (!selectedAddress) {
        // nothing chosen yet
        alert('Please select a delivery address.');
        return;
      }
      localStorage.setItem('deliveryAddress', JSON.stringify(selectedAddress));
      navigate('/buyer/payment-confirmation');
    } else {
      // self pickup – clear any stale address
      localStorage.removeItem('deliveryAddress');
      navigate('/buyer/payment-confirmation');
    }
  };

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

  const applyCoupon = () => {
    // placeholder, just toggle state
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  // mock saved addresses
  const [savedAddresses] = useState([
    { id: '1', label: 'Home', address: 'House 123, Block B, Gulshan-e-Iqbal, Karachi', coords: { lat: 24.9056, lng: 67.0822 } },
    { id: '2', label: 'Office', address: 'Office 45, Main Clifton Road, Karachi', coords: { lat: 24.8138, lng: 67.0299 } },
    { id: '3', label: 'Friend\'s Place', address: 'Flat 7, DHA Phase 2, Karachi', coords: { lat: 24.8103, lng: 67.0703 } },
  ]);

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-700 text-white px-4 py-9 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Delivery Options</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Delivery toggle */}
        <div className="px-5 py-4 border-b border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deliverySelected}
              onChange={(e) => setDeliverySelected(e.target.checked)}
              className="form-checkbox h-5 w-5 text-red-700"
            />
            <span className="text-stone-700 font-semibold">
              {deliverySelected ? 'Deliver to my address (Rs. 50)' : 'Self Pickup (No charge)'}
            </span>
          </label>
        </div>

        {/* Address selection inline when delivery chosen */}
        {deliverySelected && (
          <>
            {/* Map Area */}
            <div className="bg-gradient-to-br from-red-100 to-blue-100 h-48 relative flex items-center justify-center border-b border-gray-200">
              <div className="text-center">
                <MapPin size={40} className="text-red-700 mx-auto mb-2" />
                <p className="text-stone-600 text-sm">Map View</p>
                <p className="text-stone-400 text-xs">Lat: {mapCenter.lat.toFixed(4)}, Lng: {mapCenter.lng.toFixed(4)}</p>
              </div>
              <button
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
              >
                {isLocating ? <Loader size={20} className="animate-spin text-red-700" /> : <Navigation size={20} className="text-red-700" />}
              </button>
            </div>

            <div className="p-5 space-y-4">
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
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedAddress?.address === addr.address ? 'bg-red-700' : 'bg-gray-200'
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
                className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-600 hover:bg-red-50 transition-colors"
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
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 bg-white resize-none"
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
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 bg-white"
                    />
                  </div>
                  <button
                    onClick={handleManualAddressSubmit}
                    className="w-full bg-red-700 text-white py-3 rounded-xl hover:bg-red-800 transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Order Summary */}
        <div className="bg-red-50 px-5 py-4 border-b border-red-100">
          <h3 className="text-stone-700 font-bold mb-3">Order Summary</h3>
          {org && (
            <p className="text-red-800 font-semibold mb-2">{org.orgName}</p>
          )}
          <div className="space-y-1">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-stone-600">{item.quantity}× {item.dish.name}</span>
                <span className="text-stone-700 font-medium">Rs. {item.dish.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-red-200 pt-1 mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-700">Rs. {cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery Fee</span>
                <span className="text-stone-700">Rs. {deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-stone-800">Total</span>
                <span className="text-red-800">Rs. {total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-stone-700 font-bold mb-3">Apply Coupon</h3>
          {!couponApplied ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50"
              />
              <button
                onClick={applyCoupon}
                className="bg-red-700 text-white px-4 py-3 rounded-xl hover:bg-red-800 transition-colors"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-stone-700 text-sm">{couponCode} applied</span>
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleContinue}
          className="w-full bg-red-700 text-white py-4 rounded-2xl hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 font-bold"
        >
          Continue
        </button>
      </div>

      <BuyerBottomNav />
    </MobileLayout>
  );
}
