import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Utensils, Settings, RefreshCw, CheckCircle2, AlertCircle, Search, ClipboardList } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/items';

export default function ProductPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || !price) return;

    // 1. FRONTEND DUPLICATE CHECK (case-insensitive)
    const isDuplicate = items.some(
      (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setStatusMsg({
        type: 'error',
        text: `"${trimmedName}" is already in the menu!`,
      });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await axios.post(API_URL, { name: trimmedName, price: Number(price) });
      setStatusMsg({ type: 'success', text: `"${trimmedName}" added successfully!` });
      setName('');
      setPrice('');
      loadMenuItems();
    } catch (error) {
      // 2. BACKEND DUPLICATE / ERROR FALLBACK
      setStatusMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create item.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items dynamically based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Navigation Buttons */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-lg font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Add Menu Item</h1>
              <p className="text-xs text-slate-400">Quick entry for new hotel dishes</p>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* New KOT / Order Button */}
            <button
              onClick={() => navigate('/kot')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg text-xs transition shadow"
            >
              <ClipboardList className="w-4 h-4" /> New KOT / Order
            </button>

            {/* Manage / Edit Menu Button */}
            <button
              onClick={() => navigate('/manage-menu')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg text-xs border border-amber-500/20 transition"
            >
              <Settings className="w-4 h-4" /> Manage / Edit Menu
            </button>
          </div>
        </header>

        {/* Status Alert */}
        {statusMsg.text && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Create Form */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Item
          </h2>

          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-400 mb-1">Item / Dish Name</label>
              <input
                type="text"
                placeholder="e.g., Masala Dosa"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (statusMsg.type === 'error') setStatusMsg({ type: '', text: '' });
                }}
                className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Price (₹)</label>
              <input
                type="number"
                placeholder="e.g., 60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 text-sm"
                required
                min="0"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* Read-Only Preview with Live Search */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200">
              Current Menu ({filteredItems.length} of {items.length})
            </h2>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={loadMenuItems}
                className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 rounded-lg border border-slate-800 transition"
                title="Refresh List"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {searchTerm ? `No dishes found matching "${searchTerm}"` : 'No items found in the menu.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pt-1 pr-1">
              {filteredItems.map((item) => (
                <div key={item._id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                  <p className="text-xs text-amber-400 font-bold mt-0.5">₹{item.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}