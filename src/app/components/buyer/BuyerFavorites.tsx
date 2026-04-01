import React, { useState } from 'react';
import { Heart, Star, MapPin, Clock, Utensils, Store, ChevronLeft } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router';

const KITCHEN_IMG = 'https://images.unsplash.com/photo-1768314669089-480e608a0143?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwa2l0Y2hlbiUyMGNvb2tpbmclMjBmb29kfGVufDF8fHx8MTc3MjAyMjM5MHww&ixlib=rb-4.1.0&q=80&w=1080';
const HOMEMADE_IMG = 'https://images.unsplash.com/photo-1672477179695-7276b0602fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcGFraXN0YW5pJTIwdHJhZGl0aW9uYWwlMjBmb29kfGVufDF8fHx8MTc3MjAyMjM5Mnww&ixlib=rb-4.1.0&q=80&w=1080';

const ORG_IMAGES: Record<string, string> = {
  'org-001': KITCHEN_IMG,
  'org-002': HOMEMADE_IMG,
};

const ORG_RATINGS: Record<string, number> = {
  'org-001': 4.5,
  'org-002': 4.8,
};

const ORG_DELIVERY: Record<string, string> = {
  'org-001': '30–45 min',
  'org-002': '40–55 min',
};

const ORG_DISTANCE: Record<string, number> = {
  'org-001': 2.1,
  'org-002': 4.2,
};

export function BuyerFavorites() {
  const { organizations, dishes, favoriteKitchens, favoriteDishes, toggleFavoriteKitchen, toggleFavoriteDish } = useApp();
  const [activeTab, setActiveTab] = useState<'kitchen' | 'dishes'>('kitchen');
  const navigate = useNavigate();

  const favoriteOrgs = organizations.filter(org => favoriteKitchens.includes(org.id));
  const favoriteDishItems = dishes.filter(dish => favoriteDishes.includes(dish.id));

  const getOrgDishCount = (orgId: string) => dishes.filter(d => d.orgId === orgId && d.isAvailable).length;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-50 px-5 pt-8 pb-5 border-b border-red-100">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={18} className="text-red-700" />
          </button>
          <h1 className="text-red-700 font-black" style={{ fontSize: '1.75rem' }}>Favorites</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
        <p className="text-red-900 font-bold" style={{ fontSize: '1.5rem' }}>Your Favorite Picks</p>
        <p className="text-red-500 mt-1" style={{ fontSize: '0.92rem' }}>Quick access to your loved kitchens and dishes.</p>
      </div>

      {/* Tab Navigation */}
      <div className="px-5 mt-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'kitchen'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Kitchen ({favoriteOrgs.length})
          </button>
          <button
            onClick={() => setActiveTab('dishes')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'dishes'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Dishes ({favoriteDishItems.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'kitchen' ? (
          <div className="px-5 py-4">
            <h2 className="text-stone-800 font-bold mb-4" style={{ fontSize: '1.1rem' }}>Kitchen Favorites</h2>
            {favoriteOrgs.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-stone-400">No favorite kitchens yet</p>
                <p className="text-stone-300 text-sm mt-1">Tap the heart icon on kitchens to add them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteOrgs.map(org => (
                  <div
                    key={org.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="h-32 overflow-hidden relative">
                      <img
                        src={ORG_IMAGES[org.id] || KITCHEN_IMG}
                        alt={org.orgName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => toggleFavoriteKitchen(org.id)}
                          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                        >
                          <Heart size={16} className="text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-3">
                        <span className={`text-white text-xs px-2 py-0.5 rounded-full ${org.type === 'restaurant' ? 'bg-red-700' : 'bg-purple-500'}`} style={{ fontWeight: 600 }}>
                          {org.type === 'restaurant' ? '🏪 Restaurant' : '🏠 Home-Made'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1rem' }}>{org.orgName}</h3>
                        <div className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-red-800" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {ORG_RATINGS[org.id] || '4.5'}
                          </span>
                        </div>
                      </div>
                      <p className="text-stone-400 flex items-center gap-1 mb-2" style={{ fontSize: '0.78rem' }}>
                        <MapPin size={11} /> {org.address}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-stone-500" style={{ fontSize: '0.75rem' }}>
                          <Clock size={11} />
                          <span>{ORG_DELIVERY[org.id] || '30–45 min'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-stone-400" style={{ fontSize: '0.75rem' }}>
                          <Utensils size={11} />
                          <span>{getOrgDishCount(org.id)} dishes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-4">
            <h2 className="text-stone-800 font-bold mb-4" style={{ fontSize: '1.1rem' }}>Dish Favorites</h2>
            {favoriteDishItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-stone-400">No favorite dishes yet</p>
                <p className="text-stone-300 text-sm mt-1">Tap the heart icon on dishes to add them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteDishItems.map(dish => {
                  const org = organizations.find(o => o.id === dish.orgId);
                  return (
                    <div
                      key={dish.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {dish.image ? (
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Utensils size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-stone-800 font-semibold truncate" style={{ fontSize: '0.95rem' }}>
                              {dish.name}
                            </h3>
                            <button
                              onClick={() => toggleFavoriteDish(dish.id)}
                              className="ml-2 flex-shrink-0"
                            >
                              <Heart size={16} className="text-red-500 fill-red-500" />
                            </button>
                          </div>
                          <p className="text-stone-500 text-sm mb-1">{org?.orgName}</p>
                          <p className="text-stone-400 text-xs mb-2 line-clamp-2">{dish.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-red-700 font-bold" style={{ fontSize: '0.9rem' }}>
                              Rs. {dish.price}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              dish.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {dish.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}