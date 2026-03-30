import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Star, Clock, ShoppingCart, Store, Utensils, Check } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import { BuyerBottomNav } from './BuyerBottomNav';


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

export function BuyerHome() {
  const { organizations, dishes, cart, orders, currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'homemade'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const activeOrders = orders.filter(o => o.buyerName && o.status !== 'delivered');

  const filtered = organizations.filter(org => {
    const matchSearch = org.orgName.toLowerCase().includes(search.toLowerCase()) ||
      org.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || org.type === filter;
    return matchSearch && matchFilter;
  });

  const sortedOrganizations = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') {
      const scoreA = ORG_RATINGS[a.id] || 0;
      const scoreB = ORG_RATINGS[b.id] || 0;
      return scoreB - scoreA;
    }

    // distance default
    const distA = ORG_DISTANCE[a.id] ?? Number.MAX_VALUE;
    const distB = ORG_DISTANCE[b.id] ?? Number.MAX_VALUE;
    return distA - distB;
  });

  const getOrgDishCount = (orgId: string) => dishes.filter(d => d.orgId === orgId && d.isAvailable).length;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-50 px-5 pt-8 pb-5 border-b border-red-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-red-700 font-black" style={{ fontSize: '1.75rem' }}>P2P</h1>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 p-1 rounded-full"
            aria-label="Favorite"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
        </div>

        <p className="text-red-900 font-bold" style={{ fontSize: '1.5rem' }}>Order your favourite food!</p>
        <p className="text-red-500 mt-1" style={{ fontSize: '0.92rem' }}>Find dishes and kitchens near you.</p>

        {/* Search */}
        <div className="mt-4 bg-white rounded-2xl flex items-center px-4 py-3 gap-3 shadow-sm">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for dishes or kitchens..."
            className="flex-1 outline-none text-stone-700 bg-transparent"
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Active Orders Banner */}
        {activeOrders.length > 0 && (
          <div className="mx-5 mt-4">
            <button
              onClick={() => navigate(`/buyer/order/${activeOrders[0].id}`)}
              className="w-full bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <Clock size={15} color="white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-red-900" style={{ fontWeight: 600, fontSize: '0.87rem' }}>
                  You have an active order!
                </p>
                <p className="text-red-700" style={{ fontSize: '0.75rem' }}>
                  Tap to track order #{activeOrders[0].id.slice(-6).toUpperCase()}
                </p>
              </div>
              <div className="text-red-600">›</div>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="px-5 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                filter === 'all' ? 'bg-red-700 text-white' : 'bg-gray-100 text-stone-600'
              }`}
              style={{ fontWeight: filter === 'all' ? 600 : 400 }}
            >
              🍽 All
            </button>

            <button
              type="button"
              onClick={() => setIsSortOpen(prev => !prev)}
              className="px-3.5 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-stone-700 hover:bg-gray-50 transition"
            >
              Sort by: {sortBy === 'distance' ? 'Distance' : 'Rating'}
            </button>

            {isSortOpen && (
              <div className="w-full mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold text-stone-800">Sort by</p>
                <p className="text-xs text-stone-500">Select how restaurants are ordered</p>
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'distance', label: 'Distance' },
                    { value: 'rating', label: 'Rating' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value as 'distance' | 'rating');
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs ${
                        sortBy === opt.value
                          ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                          : 'border-gray-200 text-stone-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <Check size={16} className="text-red-700" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setFilter('restaurant')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                filter === 'restaurant' ? 'bg-red-700 text-white' : 'bg-gray-100 text-stone-600'
              }`}
              style={{ fontWeight: filter === 'restaurant' ? 600 : 400 }}
            >
              🏪 Restaurant
            </button>

            <button
              onClick={() => setFilter('homemade')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                filter === 'homemade' ? 'bg-red-700 text-white' : 'bg-gray-100 text-stone-600'
              }`}
              style={{ fontWeight: filter === 'homemade' ? 600 : 400 }}
            >
              🏠 Home-Made
            </button>
          </div>

          <div className="mt-2" style={{ minHeight: 1 }}>
            {/* spacer to separate filters from list */}
          </div>
        </div>

        {/* Restaurant Cards */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-stone-700" style={{ fontWeight: 600 }}>
            {sortedOrganizations.length} {sortedOrganizations.length === 1 ? 'Restaurant' : 'Restaurants'} Near You
          </p>

          {sortedOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Store size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-stone-400">No restaurants found</p>
            </div>
          ) : (
            sortedOrganizations.map(org => (
              <button
                key={org.id}
                onClick={() => navigate(`/buyer/restaurant/${org.id}`)}
                className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-99 transition-all text-left"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={ORG_IMAGES[org.id] || KITCHEN_IMG}
                    alt={org.orgName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
              </button>
            ))
          )}
        </div>
      </div>
      <BuyerBottomNav />
    </MobileLayout>
  );
}
