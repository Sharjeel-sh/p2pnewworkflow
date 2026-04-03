import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Plus, Minus, Star, MapPin, Clock, UtensilsCrossed, Heart } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';

const ORG_IMG = 'https://images.unsplash.com/photo-1768314669089-480e608a0143?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwa2l0Y2hlbiUyMGNvb2tpbmclMjBmb29kfGVufDF8fHx8MTc3MjAyMjM5MHww&ixlib=rb-4.1.0&q=80&w=1080';
const HOMEMADE_IMG = 'https://images.unsplash.com/photo-1672477179695-7276b0602fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcGFraXN0YW5pJTIwdHJhZGl0aW9uYWwlMjBmb29kfGVufDF8fHx8MTc3MjAyMjM5Mnww&ixlib=rb-4.1.0&q=80&w=1080';

export function RestaurantDetail() {
  const { orgId } = useParams<{ orgId: string }>();
  const { organizations, dishes, cart, addToCart, updateCartItem, removeFromCart, favoriteDishes, toggleFavoriteDish } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const org = organizations.find(o => o.id === orgId);
  const orgDishes = dishes.filter(d => d.orgId === orgId && d.isAvailable);
  const categories = ['All', ...Array.from(new Set(orgDishes.map(d => d.category)))];
  const filtered = activeCategory === 'All' ? orgDishes : orgDishes.filter(d => d.category === activeCategory);

  const cartTotal = cart.reduce((s, i) => s + i.dish.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const getCartQty = (dishId: string) => cart.find(i => i.dish.id === dishId)?.quantity ?? 0;

  const handleAdd = (dish: typeof orgDishes[0]) => addToCart(dish, 1);
  const handleInc = (dishId: string) => {
    const curr = getCartQty(dishId);
    updateCartItem(dishId, curr + 1);
  };
  const handleDec = (dishId: string) => {
    const curr = getCartQty(dishId);
    if (curr <= 1) removeFromCart(dishId);
    else updateCartItem(dishId, curr - 1);
  };

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">Restaurant not found.</p>
        </div>
      </MobileLayout>
    );
  }

  const heroImg = org.type === 'homemade' ? HOMEMADE_IMG : ORG_IMG;

  return (
    <MobileLayout>
      {/* Hero Image */}
      <div className="relative h-52">
        <img src={heroImg} alt={org.orgName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/buyer')}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
            <ArrowLeft size={20} className="text-stone-700" />
          </button>
        </div>
        {cartCount > 0 && (
          <div className="absolute top-4 right-4">
            <button onClick={() => navigate('/buyer/cart')}
              className="bg-red-700 text-white rounded-full p-2 shadow-md relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-700 text-white text-xs rounded-full flex items-center justify-center"
                style={{ width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700 }}>
                {cartCount}
              </span>
            </button>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{org.orgName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-white/80 flex items-center gap-1" style={{ fontSize: '0.78rem' }}>
              <MapPin size={11} /> {org.address}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs" style={{ fontWeight: 600 }}>4.5</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
              <Clock size={11} className="text-white" />
              <span className="text-white text-xs">30–45 min</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${org.type === 'restaurant' ? 'bg-red-700' : 'bg-purple-500'} text-white`} style={{ fontWeight: 600 }}>
              {org.type === 'restaurant' ? 'Restaurant' : 'Home-Made'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                activeCategory === cat ? 'bg-red-700 text-white' : 'bg-gray-100 text-stone-600'
              }`}
              style={{ fontWeight: activeCategory === cat ? 600 : 400 }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed size={44} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400">No items available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(dish => {
              const qty = getCartQty(dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => navigate(`/buyer/restaurant/${orgId}/dish/${dish.id}`)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed size={24} className="text-red-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-stone-800" style={{ fontWeight: 600 }}>{dish.name}</p>
                        <p className="text-stone-400 mt-0.5" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                          {dish.description}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteDish(dish.id);
                        }}
                        className="flex-shrink-0 p-1"
                      >
                        <Heart
                          size={16}
                          className={favoriteDishes.includes(dish.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-red-800" style={{ fontWeight: 700 }}>Rs. {dish.price}</p>
                      {qty === 0 ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdd(dish); }}
                          className="bg-red-700 text-white rounded-xl px-3.5 py-1.5 hover:bg-red-800 transition-colors flex items-center gap-1"
                          style={{ fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-red-50 rounded-xl p-1">
                          <button onClick={(e) => { e.stopPropagation(); handleDec(dish.id); }}
                            className="w-7 h-7 bg-red-700 text-white rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
                            <Minus size={13} />
                          </button>
                          <span className="text-red-900 w-5 text-center" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{qty}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleInc(dish.id); }}
                            className="w-7 h-7 bg-red-700 text-white rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Bottom Bar */}
      {cartCount > 0 && (
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => navigate('/buyer/cart')}
            className="w-full bg-red-700 text-white py-3.5 rounded-2xl flex items-center justify-between px-5 hover:bg-red-800 transition-colors shadow-lg shadow-red-200"
          >
            <div className="bg-red-800 text-white text-xs rounded-lg w-6 h-6 flex items-center justify-center" style={{ fontWeight: 700 }}>
              {cartCount}
            </div>
            <span style={{ fontWeight: 700 }}>View Cart</span>
            <span style={{ fontWeight: 700 }}>Rs. {cartTotal}</span>
          </button>
        </div>
      )}
      <BuyerBottomNav />
    </MobileLayout>
  );
}
