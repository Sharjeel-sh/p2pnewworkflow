import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';

export function CartScreen() {
  const { cart, updateCartItem, removeFromCart, organizations } = useApp();
  const navigate = useNavigate();

  const cartTotal = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0);
  const orgId = cart[0]?.dish.orgId || '';
  const org = organizations.find(o => o.id === orgId);

  const handleInc = (dishId: string, qty: number) => updateCartItem(dishId, qty + 1);
  const handleDec = (dishId: string, qty: number) => {
    if (qty <= 1) removeFromCart(dishId);
    else updateCartItem(dishId, qty - 1);
  };

  const handleProceedToAddress = () => {
    if (cart.length === 0) return;
    // Contact details removed from cart UI; keep stable defaults for checkout flow.
    localStorage.setItem('buyerName', 'Guest Buyer');
    localStorage.setItem('buyerPhone', 'N/A');
    // Navigate to address selection
    navigate('/buyer/address-selection');
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-600 px-5 pt-10 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-1">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-white" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Cart</h2>
          {cart.length > 0 && org && (
            <span className="text-red-100 text-xs ml-auto">{org.orgName}</span>
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
              className="mt-5 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
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
                    <p className="text-red-600 mt-0.5" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      Rs. {item.dish.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 rounded-xl p-1">
                    <button onClick={() => handleDec(item.dish.id, item.quantity)}
                      className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                      {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={13} />}
                    </button>
                    <span className="text-red-800 w-5 text-center" style={{ fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => handleInc(item.dish.id, item.quantity)}
                      className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Price Summary */}
              <div className="bg-red-50 rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-stone-500 text-sm">Subtotal</span>
                  <span className="text-stone-700 text-sm" style={{ fontWeight: 500 }}>Rs. {cartTotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-stone-500 text-sm">Delivery Fee</span>
                  <span className="text-stone-700 text-sm" style={{ fontWeight: 500 }}>Rs. 50</span>
                </div>
                <div className="border-t border-red-100 pt-2 flex justify-between">
                  <span className="text-stone-700" style={{ fontWeight: 700 }}>Total</span>
                  <span className="text-red-700" style={{ fontWeight: 700, fontSize: '1.05rem' }}>Rs. {cartTotal + 50}</span>
                </div>
              </div>
            </div>

          </>
        )}
      </div>

      {/* Continue to Address Button */}
      {cart.length > 0 && (
        <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
          <button
            onClick={handleProceedToAddress}
            className="w-full bg-red-600 text-white py-4 rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            Continue to Address • Rs. {cartTotal + 50}
          </button>
        </div>
      )}
      <BuyerBottomNav />
    </MobileLayout>
  );
}
