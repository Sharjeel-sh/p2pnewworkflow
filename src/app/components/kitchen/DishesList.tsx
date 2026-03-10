import React, { useState } from 'react';
import { Plus, Trash2, X, UtensilsCrossed, Pencil, Eye, EyeOff } from 'lucide-react';
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
      {/* Header */}
      <div className="bg-red-600 px-5 pt-10 pb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Dishes Menu</h2>
          <button
            onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); }}
            className="bg-white text-red-600 rounded-full p-2 shadow-md"
          >
            <Plus size={20} />
          </button>
        </div>
        <p className="text-red-100 mt-1" style={{ fontSize: '0.82rem' }}>{orgDishes.length} items</p>
      </div>

      {/* Category Filter */}
      <div className="px-5 py-3 bg-red-50 border-b border-red-100">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${
                filterCat === cat ? 'bg-red-600 text-white' : 'bg-white text-stone-500 border border-gray-200'
              }`}
              style={{ fontWeight: filterCat === cat ? 600 : 400 }}
            >
              {cat}
            </button>
          ))}
        </div>
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
              className="mt-4 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
              style={{ fontSize: '0.9rem', fontWeight: 600 }}
            >
              Add First Dish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(dish => (
              <div key={dish.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-stone-800 truncate" style={{ fontWeight: 600 }}>{dish.name}</p>
                      <span className="inline-block bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full mt-0.5" style={{ fontWeight: 500 }}>
                        {dish.category}
                      </span>
                    </div>
                    <p className="text-red-700 flex-shrink-0" style={{ fontWeight: 700 }}>
                      Rs. {dish.price}
                    </p>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${dish.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {dish.isAvailable ? <Eye size={11} /> : <EyeOff size={11} />}
                      {dish.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {dish.description && (
                    <p className="text-stone-400 mt-1.5" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>{dish.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateDish(dish.id, { isAvailable: !dish.isAvailable })}
                    className={`${dish.isAvailable ? 'text-amber-500 hover:text-amber-700' : 'text-green-500 hover:text-green-700'} p-1`}
                    title={dish.isAvailable ? 'Set unavailable' : 'Set available'}
                  >
                    {dish.isAvailable ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => handleOpenEdit(dish)} className="text-blue-400 hover:text-blue-600 p-1">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteDish(dish.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <KitchenBottomNav />

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
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-red-500'}`}
                />
                {errors.name && <p className="text-red-600 text-xs mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-stone-600 mb-1.5 text-sm" style={{ fontWeight: 500 }}>Price (Rs.) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  placeholder="e.g. 350"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50 ${errors.price ? 'border-red-300' : 'border-gray-200 focus:border-red-500'}`}
                />
                {errors.price && <p className="text-red-600 text-xs mt-0.5">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-stone-600 mb-1.5 text-sm" style={{ fontWeight: 500 }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 bg-gray-50"
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
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 bg-gray-50 resize-none"
                />
              </div>
            </div>
            <button onClick={handleSave}
              className="w-full bg-red-600 text-white py-3.5 rounded-xl mt-5 hover:bg-red-700 transition-colors"
              style={{ fontWeight: 700 }}>
              {editId ? 'Save Changes' : 'Add Dish'}
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
