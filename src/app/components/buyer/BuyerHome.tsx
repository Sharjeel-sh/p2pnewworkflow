import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Star, Clock, ShoppingCart, ArrowLeft, Store, Utensils } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';

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

export function BuyerHome() {
  const { organizations, dishes, cart, orders, currentUser, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'homemade'>('all');

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const activeOrders = orders.filter(o => o.buyerName && o.status !== 'delivered');

  const filtered = organizations.filter(org => {
    const matchSearch = org.orgName.toLowerCase().includes(search.toLowerCase()) ||
      org.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || org.type === filter;
    return matchSearch && matchFilter;
  });

  const getOrgDishCount = (orgId: string) => dishes.filter(d => d.orgId === orgId && d.isAvailable).length;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-orange-500 px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { setCurrentUser(null); navigate('/'); }}
            className="text-white/80 hover:text-white p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-orange-100" style={{ fontSize: '0.75rem' }}>Delivering to</p>
            <p className="text-white flex items-center gap-1" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              <MapPin size={13} /> Karachi, Pakistan
            </p>
          </div>
          <button
            onClick={() => navigate('/buyer/cart')}
            className="relative bg-white/20 rounded-xl p-2 text-white hover:bg-white/30 transition-colors"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4.5 h-4.5 rounded-full flex items-center justify-center" style={{ width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700 }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <h2 className="text-white mb-1" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
          Good day! 👋
        </h2>
        <p className="text-orange-100" style={{ fontSize: '0.85rem' }}>What are you craving today?</p>

        {/* Search */}
        <div className="mt-4 bg-white rounded-2xl flex items-center px-4 py-3 gap-3">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants..."
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
              className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <Clock size={15} color="white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-orange-700" style={{ fontWeight: 600, fontSize: '0.87rem' }}>
                  You have an active order!
                </p>
                <p className="text-orange-500" style={{ fontSize: '0.75rem' }}>
                  Tap to track order #{activeOrders[0].id.slice(-6).toUpperCase()}
                </p>
              </div>
              <div className="text-orange-400">›</div>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="px-5 mt-4">
          <div className="flex gap-2">
            {[
              { val: 'all', label: '🍽 All' },
              { val: 'restaurant', label: '🏪 Restaurant' },
              { val: 'homemade', label: '🏠 Home-Made' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val as typeof filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                  filter === f.val ? 'bg-orange-500 text-white' : 'bg-gray-100 text-stone-600'
                }`}
                style={{ fontWeight: filter === f.val ? 600 : 400 }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards */}
        <div className="px-5 py-4 space-y-4">
          <p className="text-stone-700" style={{ fontWeight: 600 }}>
            {filtered.length} {filtered.length === 1 ? 'Restaurant' : 'Restaurants'} Near You
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Store size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-stone-400">No restaurants found</p>
            </div>
          ) : (
            filtered.map(org => (
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
                    <span className={`text-white text-xs px-2 py-0.5 rounded-full ${org.type === 'restaurant' ? 'bg-orange-500' : 'bg-purple-500'}`} style={{ fontWeight: 600 }}>
                      {org.type === 'restaurant' ? '🏪 Restaurant' : '🏠 Home-Made'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1rem' }}>{org.orgName}</h3>
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-green-700" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
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
    </MobileLayout>
  );
}
