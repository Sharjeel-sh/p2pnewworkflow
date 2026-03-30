import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Star, Clock, ShoppingCart, Store, Utensils, Check, Heart, Percent, ChevronDown, Gift, Repeat } from 'lucide-react';
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

const BANNERS = [
  {
    title: 'Up to 50% OFF',
    subtitle: 'Hot deals from top kitchens near you',
    cta: 'Order Now',
    tag: 'Limited Time',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1280&q=80',
  },
  {
    title: 'Free Delivery',
    subtitle: 'Just for today: zero delivery fee on selected restaurants',
    cta: 'Grab Offer',
    tag: 'Today Only',
    image: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1280&q=80',
  },
  {
    title: 'Buy 1 Get 1',
    subtitle: 'Add a second plate for free on popular dishes',
    cta: 'Explore Now',
    tag: 'Bundle',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1280&q=80',
  },
];

const CATEGORIES = [
  { id: 'pizza', label: 'Pizza', icon: '🍕' },
  { id: 'burgers', label: 'Burgers', icon: '🍔' },
  { id: 'desserts', label: 'Desserts', icon: '🍧' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'asian', label: 'Asian', icon: '🥡' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
];

export function BuyerHome() {
  const { organizations, dishes, cart, orders, currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'homemade'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Block 5, Clifton, Karachi');
  const [activeBanner, setActiveBanner] = useState(0);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const activeOrders = orders.filter(o => o.buyerName && o.status !== 'delivered');

  useEffect(() => {
    if (!BANNERS.length) return;
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const recommendedOrgs = sortedOrganizations.slice(0, 3);
  const popularOrgs = sortedOrganizations.slice(0, 5);
  const quickReorderItems = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getOrgDishCount = (orgId: string) => dishes.filter(d => d.orgId === orgId && d.isAvailable).length;

  return (
    <MobileLayout>
      {/* Top Header */}
      <div className="bg-red-50 px-5 pt-8 pb-4 border-b border-red-100 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => {
              const next = selectedLocation === 'Block 5, Clifton, Karachi'
                ? 'Phase 6, DHA, Karachi'
                : 'Block 5, Clifton, Karachi';
              setSelectedLocation(next);
            }}
            className="inline-flex items-center gap-2 text-stone-700 text-sm font-semibold"
          >
            <MapPin size={16} className="text-red-600" />
            <span className="truncate max-w-[160px]">{selectedLocation}</span>
            <ChevronDown size={14} />
          </button>
          <div className="flex items-center gap-3">
            <button type="button" className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Heart size={16} className="text-red-600" />
            </button>
            <button type="button" className="relative p-2 bg-white border border-gray-200 rounded-xl shadow-sm" onClick={() => navigate('/buyer/cart')}>
              <ShoppingCart size={16} className="text-red-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
        <div className="text-red-900 font-black text-2xl">Hi{currentUser?.buyerName ? `, ${currentUser.buyerName}` : ''} 👋</div>
        <p className="text-red-700 mt-1 text-sm font-medium">Fast delivery from local kitchens</p>

        {/* Search */}
        <div className="mt-4 bg-white rounded-2xl flex items-center px-4 py-3 gap-3 shadow-sm sticky top-[76px] z-20">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for restaurants, dishes…"
            className="flex-1 outline-none text-stone-700 bg-transparent"
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-3">
        {/* Hero Section */}
        <div className="px-5">
          <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={BANNERS[activeBanner]?.image}
              alt={BANNERS[activeBanner]?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <span className="inline-flex items-center gap-1 bg-white/90 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                <Percent size={14} /> {BANNERS[activeBanner]?.tag}
              </span>
              <div>
                <h2 className="text-white text-xl font-black leading-tight">{BANNERS[activeBanner]?.title}</h2>
                <p className="text-white/90 text-sm mt-1">{BANNERS[activeBanner]?.subtitle}</p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-red-600 font-semibold shadow hover:scale-[1.01] transition"
                >
                  {BANNERS[activeBanner]?.cta}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveBanner(i)}
                className={`w-2 h-2 rounded-full ${i === activeBanner ? 'bg-red-600' : 'bg-white/80'}`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4 px-5">
          <h3 className="text-stone-800 font-bold text-base">Browse by Category</h3>
          <p className="text-stone-500 text-xs mt-1">One-tap picks to satisfy your cravings</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map(item => (
              <button
                key={item.id}
                type="button"
                className="flex flex-col items-center justify-center min-w-[78px] bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold text-stone-700 mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="mt-4 px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-stone-800 font-bold">Recommended for You</h3>
            <button
              type="button"
              className="text-red-600 text-xs font-semibold"
              onClick={() => setSortBy('rating')}
            >
              See all
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {recommendedOrgs.map(org => (
              <button
                key={`rec-${org.id}`}
                onClick={() => navigate(`/buyer/restaurant/${org.id}`)}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left"
              >
                <div className="flex items-center gap-3 p-3">
                  <img src={ORG_IMAGES[org.id] || KITCHEN_IMG} alt={org.orgName} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-stone-800 font-semibold text-sm">{org.orgName}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <Star size={12} className="text-yellow-400" />
                      <span>{ORG_RATINGS[org.id] || 4.5}</span>
                      <span>•</span>
                      <span>{ORG_DISTANCE[org.id] ? `${ORG_DISTANCE[org.id]} km` : '—'} </span>
                      <span>• {ORG_DELIVERY[org.id] || '30–45 min'}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free Delivery</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Popular</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Offers & Deals Section */}
        <div className="mt-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-stone-800 font-bold">Offers & Deals</h3>
            <button type="button" className="text-red-600 text-xs font-semibold">View all</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">50% OFF</span>
                <Gift size={16} />
              </div>
              <p className="mt-2 text-sm font-semibold">Hot meals, half price</p>
            </div>
            <div className="rounded-2xl p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Buy 1 Get 1</span>
                <Repeat size={16} />
              </div>
              <p className="mt-2 text-sm font-semibold">Selected combos only</p>
            </div>
            <div className="rounded-2xl p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Free Delivery</span>
                <ShoppingCart size={16} />
              </div>
              <p className="mt-2 text-sm font-semibold">All day on 2+ items</p>
            </div>
            <div className="rounded-2xl p-3 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Daily Combo</span>
                <Heart size={16} />
              </div>
              <p className="mt-2 text-sm font-semibold">Curated picks for you</p>
            </div>
          </div>
        </div>

        {/* Quick Reorder Section */}
        <div className="mt-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-stone-800 font-bold">Quick Reorder</h3>
            <button type="button" className="text-red-600 text-xs font-semibold">See history</button>
          </div>
          <div className="space-y-3">
            {quickReorderItems.length === 0 ? (
              <p className="text-stone-400 text-sm">No previous orders yet. Start your first one now!</p>
            ) : quickReorderItems.map(order => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/buyer/order/${order.id}`)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-3 shadow-sm text-left hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-stone-800 text-sm font-semibold">Order #{order.id.slice(-4).toUpperCase()}</p>
                    <p className="text-stone-500 text-xs">{order.items.length} items · PKR {order.total}</p>
                  </div>
                  <span className="text-green-600 text-xs font-bold">Reorder</span>
                </div>
              </button>
            ))}
          </div>
        </div>

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

        {/* Popular Near You */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-stone-700" style={{ fontWeight: 600 }}>
            {popularOrgs.length} Trending Restaurants Near You
          </p>

          {popularOrgs.length === 0 ? (
            <div className="text-center py-12">
              <Store size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-stone-400">No restaurants found</p>
            </div>
          ) : (
            popularOrgs.map(org => (
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
