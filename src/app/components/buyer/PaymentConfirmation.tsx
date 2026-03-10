import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, CreditCard, Smartphone, Wallet, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { BuyerBottomNav } from './BuyerBottomNav';
import { useApp } from '../../context/AppContext';

interface AddressDetails {
  address: string;
  landmark?: string;
  coords: {
    lat: number;
    lng: number;
  };
}

type PaymentMethod = 'cod' | 'card' | 'mobile' | 'wallet';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: Wallet,
    description: 'Pay when your order is delivered',
    enabled: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay securely with your card',
    enabled: false, // Disabled for demo
  },
  {
    id: 'mobile',
    name: 'Mobile Banking',
    icon: Smartphone,
    description: 'JazzCash, Easypaisa, etc.',
    enabled: false, // Disabled for demo
  },
];

export function PaymentConfirmation() {
  const navigate = useNavigate();
  const { cart, placeOrder, organizations } = useApp();
  const [deliveryAddress, setDeliveryAddress] = useState<AddressDetails | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cartTotal = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0);
  const deliveryFee = 50;
  const total = cartTotal + deliveryFee;
  
  const orgId = cart[0]?.dish.orgId || '';
  const org = organizations.find(o => o.id === orgId);

  useEffect(() => {
    // Load delivery address from localStorage
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      setDeliveryAddress(JSON.parse(savedAddress));
    } else {
      // If no address selected, redirect back to address selection
      navigate('/buyer/address-selection');
    }

    // Load buyer details if previously entered
    const savedBuyerName = localStorage.getItem('buyerName');
    const savedBuyerPhone = localStorage.getItem('buyerPhone');
    if (savedBuyerName) setBuyerName(savedBuyerName);
    if (savedBuyerPhone) setBuyerPhone(savedBuyerPhone);
  }, [navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!buyerName.trim()) e.name = 'Name is required';
    if (!buyerPhone.trim()) e.phone = 'Phone number is required';
    if (!deliveryAddress) e.address = 'Please select a delivery address';
    return e;
  };

  const handlePlaceOrder = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    if (!deliveryAddress || cart.length === 0) return;

    setLoading(true);

    try {
      // Save buyer details for future use
      localStorage.setItem('buyerName', buyerName.trim());
      localStorage.setItem('buyerPhone', buyerPhone.trim());

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 1500));

      // Place the order
      const order = placeOrder({
        name: buyerName.trim(),
        phone: buyerPhone.trim(),
        address: deliveryAddress.address + (deliveryAddress.landmark ? ` (Near: ${deliveryAddress.landmark})` : ''),
        orgId,
        paymentMethod: selectedPayment,
        specialInstructions: specialInstructions.trim() || undefined,
      });

      // Clear stored data
      localStorage.removeItem('deliveryAddress');

      // Navigate to order tracking
      navigate(`/buyer/order/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setLoading(false);
    }
  };

  if (!deliveryAddress) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-600 mx-auto mb-3" />
            <p className="text-stone-600">Loading delivery details...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Confirm Order</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Order Summary */}
        <div className="bg-red-50 px-5 py-4 border-b border-red-100">
          <h3 className="text-stone-700 font-bold mb-3">Order Summary</h3>
          {org && (
            <p className="text-red-700 font-semibold mb-2">{org.orgName}</p>
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
                <span className="text-red-700">Rs. {total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-stone-700 font-bold mb-2">Delivery Address</h3>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-stone-600 text-sm">{deliveryAddress.address}</p>
                  {deliveryAddress.landmark && (
                    <p className="text-stone-500 text-xs mt-0.5">Near: {deliveryAddress.landmark}</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/buyer/address-selection')}
              className="text-red-600 text-sm font-semibold hover:text-red-700 transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Contact Details */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-stone-700 font-bold mb-3">Contact Details</h3>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => {
                  setBuyerName(e.target.value);
                  if (errors.name) setErrors(p => ({ ...p, name: '' }));
                }}
                placeholder="Your Full Name *"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 ${
                  errors.name ? 'border-red-300' : 'border-gray-200 focus:border-red-500'
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-0.5 flex items-center gap-1">
                  <AlertCircle size={11} />{errors.name}
                </p>
              )}
            </div>
            <div>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => {
                  setBuyerPhone(e.target.value);
                  if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
                }}
                placeholder="Phone Number *"
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 ${
                  errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-red-500'
                }`}
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-0.5 flex items-center gap-1">
                  <AlertCircle size={11} />{errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-stone-700 font-bold mb-3">Payment Method</h3>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => option.enabled && setSelectedPayment(option.id)}
                  disabled={!option.enabled}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${
                    selectedPayment === option.id && option.enabled
                      ? 'border-red-500 bg-red-50'
                      : option.enabled
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedPayment === option.id && option.enabled ? 'bg-red-600' : 'bg-gray-200'
                  }`}>
                    {selectedPayment === option.id && option.enabled && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>
                  <Icon size={20} className={option.enabled ? 'text-stone-600' : 'text-gray-400'} />
                  <div className="flex-1">
                    <p className={`font-semibold ${option.enabled ? 'text-stone-800' : 'text-gray-500'}`}>
                      {option.name}
                      {!option.enabled && ' (Coming Soon)'}
                    </p>
                    <p className={`text-sm ${option.enabled ? 'text-stone-500' : 'text-gray-400'}`}>
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="px-5 py-4">
          <h3 className="text-stone-700 font-bold mb-3">Special Instructions (Optional)</h3>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any specific instructions for the restaurant or delivery rider..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 bg-gray-50 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Place Order Button */}
      <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock size={14} className="text-gray-500" />
          <p className="text-gray-500 text-xs">Your order details are secure</p>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-red-600 text-white py-4 rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200 disabled:opacity-60 font-bold"
        >
          {loading ? 'Placing Order...' : `Place Order • Rs. ${total}`}
        </button>
      </div>

      <BuyerBottomNav />
    </MobileLayout>
  );
}