import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';

export function CartScreen() {
  const { cart, updateCartItem, removeFromCart, placeOrder, organizations } = useApp();
  const navigate = useNavigate();
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0);
  const orgId = cart[0]?.dish.orgId || '';
  const org = organizations.find(o => o.id === orgId);

  const handleInc = (dishId: string, qty: number) => updateCartItem(dishId, qty + 1);
  const handleDec = (dishId: string, qty: number) => {
    if (qty <= 1) removeFromCart(dishId);
    else updateCartItem(dishId, qty - 1);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!buyerName.trim()) e.name = 'Name is required';
    if (!buyerPhone.trim()) e.phone = 'Phone number is required';
    if (!buyerAddress.trim()) e.address = 'Delivery address is required';
    return e;
  };

  const handlePlaceOrder = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (cart.length === 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const order = placeOrder({ name: buyerName.trim(), phone: buyerPhone.trim(), address: buyerAddress.trim(), orgId });
    setLoading(false);
    navigate(`/buyer/order/${order.id}`);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-orange-500 px-5 pt-10 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-1">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-white" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Cart</h2>
          {cart.length > 0 && org && (
            <span className="text-orange-100 text-xs ml-auto">{org.orgName}</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <ShoppingCart size={60} className="text-gray-200 mb-4" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>Your cart is empty</p>
            <p className="text-stone-400 mt-1 text-sm">Add items from a restaurant to get started</p>
            <button onClick={() => navigate('/buyer')}
              className="mt-5 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
              style={{ fontWeight: 600 }}>
              Browse Restaurants
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="px-5 pt-4 space-y-3">
              {cart.map(item => (
                <div key={item.dish.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 truncate" style={{ fontWeight: 600 }}>{item.dish.name}</p>
                    <p className="text-orange-500 mt-0.5" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      Rs. {item.dish.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
                    <button onClick={() => handleDec(item.dish.id, item.quantity)}
                      className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                      {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={13} />}
                    </button>
                    <span className="text-orange-700 w-5 text-center" style={{ fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => handleInc(item.dish.id, item.quantity)}
                      className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Price Summary */}
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-stone-500 text-sm">Subtotal</span>
                  <span className="text-stone-700 text-sm" style={{ fontWeight: 500 }}>Rs. {cartTotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-stone-500 text-sm">Delivery Fee</span>
                  <span className="text-stone-700 text-sm" style={{ fontWeight: 500 }}>Rs. 50</span>
                </div>
                <div className="border-t border-orange-100 pt-2 flex justify-between">
                  <span className="text-stone-700" style={{ fontWeight: 700 }}>Total</span>
                  <span className="text-orange-600" style={{ fontWeight: 700, fontSize: '1.05rem' }}>Rs. {cartTotal + 50}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info Form */}
            <div className="px-5 py-4">
              <h3 className="text-stone-700 mb-3" style={{ fontWeight: 700 }}>Delivery Details</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => { setBuyerName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                    placeholder="Your Full Name *"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => { setBuyerPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: '' })); }}
                    placeholder="Phone Number *"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 ${errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1"><AlertCircle size={11} />{errors.phone}</p>}
                </div>
                <div>
                  <textarea
                    value={buyerAddress}
                    onChange={e => { setBuyerAddress(e.target.value); if (errors.address) setErrors(p => ({ ...p, address: '' })); }}
                    placeholder="Delivery Address *"
                    rows={2}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 resize-none ${errors.address ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'}`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1"><AlertCircle size={11} />{errors.address}</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Place Order Button */}
      {cart.length > 0 && (
        <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200 disabled:opacity-60"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            {loading ? 'Placing Order...' : `Place Order • Rs. ${cartTotal + 50}`}
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
