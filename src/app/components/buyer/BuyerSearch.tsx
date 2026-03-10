import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Star, Clock, Store, Utensils } from 'lucide-react';
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

export function BuyerSearch() {
  const { organizations, dishes } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'homemade'>('all');

  const filtered = organizations.filter(org => {
    const matchSearch = search === '' || 
      org.orgName.toLowerCase().includes(search.toLowerCase()) ||
      org.address.toLowerCase().includes(search.toLowerCase()) ||
      dishes.some(dish => 
        dish.orgId === org.id && 
        dish.name.toLowerCase().includes(search.toLowerCase())
      );
    const matchFilter = filter === 'all' || org.type === filter;
    return matchSearch && matchFilter;
  });

  const getOrgDishCount = (orgId: string) => dishes.filter(d => d.orgId === orgId && d.isAvailable).length;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-red-600 px-5 pt-10 pb-6">
        <h2 className="text-white mb-4" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
          Search
        </h2>

        {/* Search */}
        <div className="bg-white rounded-2xl flex items-center px-4 py-3 gap-3 mb-4">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants, dishes..."
            className="flex-1 outline-none text-stone-700 bg-transparent"
            style={{ fontSize: '0.9rem' }}
          />
        </div>

        {/* Filters */}
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
                filter === f.val ? 'bg-white text-red-700' : 'bg-white/20 text-white/80'
              }`}
              style={{ fontWeight: filter === f.val ? 600 : 400 }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Results */}
        <div className="px-5 py-4">
          {search && (
            <p className="text-stone-700 mb-4" style={{ fontWeight: 600 }}>
              {filtered.length} results for "{search}"
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Store size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-stone-400">
                {search ? 'No results found' : 'Start searching for restaurants and dishes'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(org => (
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
                      <span className={`text-white text-xs px-2 py-0.5 rounded-full ${org.type === 'restaurant' ? 'bg-red-600' : 'bg-purple-500'}`} style={{ fontWeight: 600 }}>
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
              ))}
            </div>
          )}
        </div>
      </div>
      <BuyerBottomNav />
    </MobileLayout>
  );
}