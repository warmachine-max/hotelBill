import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Check, X, Search, Utensils } from 'lucide-react';

const API_URL = 'https://hotel-bill-backend.onrender.com/api/items';

export default function ManageMenuPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditPrice(item.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
  };

  // Save updated item
  const handleUpdate = async (id) => {
    if (!editName.trim() || editPrice === '') return;
    try {
      await axios.put(`${API_URL}/${id}`, {
        name: editName.trim(),
        price: Number(editPrice),
      });
      cancelEdit();
      loadMenuItems();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  // Delete item
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      loadMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <header className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Back to Add Product"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Manage Menu Items</h1>
              <p className="text-xs text-slate-400">Edit prices, names, or remove existing dishes</p>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search dish name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>

        {/* Items Management Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No items found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-950/40 transition"
                >
                  {editingId === item._id ? (
                    /* Inline Editing Mode */
                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-950 text-slate-100 px-3 py-1.5 rounded border border-amber-500/50 text-sm flex-1"
                      />
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="bg-slate-950 text-slate-100 px-3 py-1.5 rounded border border-amber-500/50 text-sm w-24"
                      />
                      <button
                        onClick={() => handleUpdate(item._id)}
                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Normal Display Mode */
                    <>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">{item.name}</h3>
                        <span className="text-xs text-amber-400 font-bold">₹{item.price}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}