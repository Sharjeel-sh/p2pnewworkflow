import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Share2, Heart, Plus, Minus, Star, UtensilsCrossed } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1604908554915-5c60a8c059af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxkaXNoJTIwaW1hZ2V8ZW58MHx8fHwxNzcyMDE5MzI1&ixlib=rb-4.1.0&q=80&w=1080';

export function DishDetail() {
  const { orgId, dishId } = useParams<{ orgId: string; dishId: string }>();
  const navigate = useNavigate();
  const { organizations, dishes, cart, addToCart, updateCartItem, removeFromCart, favoriteDishes, toggleFavoriteDish } = useApp();

  const org = organizations.find(o => o.id === orgId);
  const dish = dishes.find(d => d.id === dishId && d.orgId === orgId);

  const [selectedSize, setSelectedSize] = useState<'small' | 'large'>('small');
  const currentQty = dish ? cart.find(i => i.dish.id === dish.id)?.quantity ?? 0 : 0;

  const handleAddToCart = () => {
    if (!dish || !orgId) return;

    const existingQty = cart.find(i => i.dish.id === dish.id)?.quantity ?? 0;
    if (existingQty > 0) {
      updateCartItem(dish.id, existingQty + 1);
    } else {
      addToCart(dish, 1);
    }

    navigate(`/buyer/restaurant/${orgId}`);
  };

  const increment = () => {
    if (!dish) return;
    updateCartItem(dish.id, currentQty + 1);
  };

  const decrement = () => {
    if (!dish) return;
    if (currentQty <= 1) removeFromCart(dish.id);
    else updateCartItem(dish.id, currentQty - 1);
  };

  if (!org || !dish) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <p className="text-stone-500">Dish or restaurant not found. Please return to the restaurant list.</p>
          <button onClick={() => navigate('/buyer')} className="mt-4 px-4 py-2 bg-red-700 text-white rounded-xl">Go Back</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="relative h-44">
        <img src={dish.image || DEFAULT_IMAGE} alt={dish.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/60" />
        <div className="absolute top-3 left-3">
          <button
            onClick={() => navigate(`/buyer/restaurant/${orgId}`)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm"
          >
            <ArrowLeft size={18} className="text-stone-700" />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm"
          >
            <Share2 size={18} className="text-stone-700" />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 pb-28">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-stone-900">{dish.name}</h2>
          <button onClick={() => toggleFavoriteDish(dish.id)} className="p-2 rounded-lg">
            <Heart size={20} className={favoriteDishes.includes(dish.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-4">{dish.description || 'Delicious meal prepared fresh for you.'}</p>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Cuisine Type:</span>
            <span className="text-stone-600">{dish.cuisineType || 'General'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Ingredients:</span>
            <span className="text-stone-600">{dish.ingredients?.join(', ') || 'Not specified'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Dietary Information:</span>
            <span className="text-stone-600">{dish.dietaryInfo?.join(', ') || 'None'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Kitchen:</span>
            <span className="text-red-600 font-semibold">{org.orgName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Available Quantity:</span>
            <span className="text-red-600 font-bold">{dish.availableQty ?? 0}</span>
          </div>
        </div>

        <div className="border border-red-200 rounded-xl bg-red-50 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-red-700">Size</p>
            <span className="text-xs text-red-600 font-semibold">Required</span>
          </div>

          <div className="space-y-2">
            {['small', 'large'].map(option => {
              const label = option === 'small' ? 'Small' : 'Large';
              const unitPrice = option === 'small' ? 100 : 200;
              return (
                <button
                  key={option}
                  onClick={() => setSelectedSize(option as 'small' | 'large')}
                  className={`w-full rounded-lg px-3 py-3 border ${selectedSize === option ? 'border-red-700 bg-white' : 'border-transparent bg-red-100'} flex items-center justify-between`}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm font-semibold">Rs. {unitPrice.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-sm font-semibold">Rs. {selectedSize === 'small' ? '100.00' : '200.00'}</p>
        </div>

        <div className="mt-6"></div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 z-50">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={decrement} className="px-3 py-2 text-red-700 font-bold">-</button>
            <span className="px-4 py-2 font-bold">{currentQty}</span>
            <button onClick={increment} className="px-3 py-2 text-red-700 font-bold">+</button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-red-700 text-white rounded-xl px-4 py-3 font-bold text-sm hover:bg-red-800 transition-colors"
          >
            Add to Cart
          </button>
        </div>
        <div className="text-xs text-gray-500 text-center">Total: Rs. {(selectedSize === 'small' ? 100 : 200) * Math.max(currentQty, 1)}</div>
      </div>
    </MobileLayout>
  );
}
