import React, { useState } from 'react';
import { Plus, Trash2, X, UtensilsCrossed, Pencil, Eye, EyeOff, Star, Bell } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

interface DishForm {
  name: string;
  price: string;
  description: string;
  category: string;
}

const EMPTY_FORM: DishForm = { name: '', price: '', description: '', category: 'Main Course' };
const CATEGORIES = ['Main Course', 'Starters', 'Rice', 'Bread', 'Desserts', 'Drinks', 'Breakfast', 'Snacks'];

export function DishesList() {
  const { currentUser, dishes, addDish, deleteDish, updateDish } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DishForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<DishForm>>({});
  const [filterCat, setFilterCat] = useState<string>('All');

  const orgDishes = dishes.filter(d => d.orgId === currentUser?.orgId);
  const categories = ['All', ...Array.from(new Set(orgDishes.map(d => d.category)))];
  const filtered = filterCat === 'All' ? orgDishes : orgDishes.filter(d => d.category === filterCat);

  const update = (k: keyof DishForm, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const handleOpenEdit = (dish: typeof orgDishes[0]) => {
    setEditId(dish.id);
    setForm({ name: dish.name, price: String(dish.price), description: dish.description, category: dish.category });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSave = () => {
    const errs: Partial<DishForm> = {};
    if (!form.name.trim()) errs.name = 'Name required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (editId) {
      updateDish(editId, { name: form.name.trim(), price: Number(form.price), description: form.description.trim(), category: form.category });
    } else {
      addDish({
        orgId: currentUser?.orgId || '',
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        category: form.category,
        isAvailable: true,
      });
    }
    handleClose();
  };

  return (
    <MobileLayout>
      {/* Header bar */}
      <div className="bg-red-700 px-5 pt-6 pb-4 flex items-center justify-between">
        <span className="text-white font-bold" style={{ fontSize: '0.9rem' }}>P2P</span>
        <Bell size={24} className="text-white" />
      </div>
      {/* title */}
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-stone-600 text-xl font-semibold">My Dishes</h2>
      </div>



      {/* Dishes List */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-stone-400" style={{ fontWeight: 500 }}>No dishes yet</p>
            <p className="text-stone-400 mt-1" style={{ fontSize: '0.82rem' }}>Add dishes to your menu</p>
            <button
              onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); }}
              className="mt-4 bg-red-700 text-white px-6 py-2.5 rounded-xl hover:bg-red-800 transition-colors"
              style={{ fontSize: '0.9rem', fontWeight: 600 }}
            >
              Add First Dish
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(dish => (
              <div
                key={dish.id}
                className="bg-white rounded-2xl shadow p-4 flex items-center gap-4"
              >
                <img
                  src={(dish as any).image || 'https://via.placeholder.com/80'}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-stone-900 font-semibold truncate mb-1">{dish.name}</p>
                  <p className="text-stone-500 text-sm line-clamp-2">{dish.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={12} />
                    ))}
                  </div>
                </div>
                <button className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  AVAILABLE ▼
                </button>
              </div>
            ))}

          </div>
        )}
      </div>

      <KitchenBottomNav />
      {/* floating add button */}
      <button
        onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); }}
        className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-red-700 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Add/Edit Dish Modal */}
      {showModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-30">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-stone-800" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editId ? 'Edit Dish' : 'New Dish'}
              </h3>
              <button onClick={handleClose} className="text-gray-400 p-1"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-stone-600 mb-1.5 text-sm" style={{ fontWeight: 500 }}>Dish Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Chicken Karahi"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                />
                {errors.name && <p className="text-red-700 text-xs mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-stone-600 mb-1.5 text-sm" style={{ fontWeight: 500 }}>Price (Rs.) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  placeholder="e.g. 350"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.price ? 'border-red-300' : 'border-gray-200 focus:border-red-600'}`}
                />
                {errors.price && <p className="text-red-700 text-xs mt-0.5">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-stone-600 mb-1.5 text-sm" style={{ fontWeight: 500 }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-600 mb-1.5 text-sm" style={{ fontWeight: 500 }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Short description of the dish..."
                  rows={2}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600 bg-gray-50 resize-none"
                />
              </div>
            </div>
            <button onClick={handleSave}
              className="w-full bg-red-700 text-white py-3.5 rounded-xl mt-5 hover:bg-red-800 transition-colors"
              style={{ fontWeight: 700 }}>
              {editId ? 'Save Changes' : 'Add Dish'}
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
