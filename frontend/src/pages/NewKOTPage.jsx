import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Home, FileText, Plus, Minus, Trash2 } from 'lucide-react';

const API_ITEMS_URL = 'https://hotel-bill-backend.onrender.com/api/items';
const API_KOT_URL = 'https://hotel-bill-backend.onrender.com/api/kot';

// LocalStorage Keys for Draft Auto-Save
const DRAFT_KOT_KEY = 'draft_kot_items';
const DRAFT_TABLE_KEY = 'draft_kot_table';
const DRAFT_REF_KEY = 'draft_kot_ref';

export default function NewKOTPage() {
  const navigate = useNavigate();

  // Data & Loading States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initialize input states directly from localStorage if a draft exists
  const [tableNo, setTableNo] = useState(() => localStorage.getItem(DRAFT_TABLE_KEY) || '');
  const [refNo, setRefNo] = useState(() => localStorage.getItem(DRAFT_REF_KEY) || '');
  const [orderItems, setOrderItems] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KOT_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Load Menu Items on Mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(API_ITEMS_URL);
        setItems(res.data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false); // Fixed: Properly clears the loading spinner!
      }
    };
    fetchItems();
  }, []);

  // 2. Auto-save form changes to localStorage so navigating away won't lose data
  useEffect(() => {
    localStorage.setItem(DRAFT_KOT_KEY, JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    localStorage.setItem(DRAFT_TABLE_KEY, tableNo);
  }, [tableNo]);

  useEffect(() => {
    localStorage.setItem(DRAFT_REF_KEY, refNo);
  }, [refNo]);

  // Helper to completely wipe the pending draft
  const clearDraft = () => {
    setOrderItems([]);
    setTableNo('');
    setRefNo('');
    localStorage.removeItem(DRAFT_KOT_KEY);
    localStorage.removeItem(DRAFT_TABLE_KEY);
    localStorage.removeItem(DRAFT_REF_KEY);
  };

  // Filter available menu items by live search input
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Add Item to KOT List (or increment if already added)
  const handleSelectItem = (item) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.itemId === item._id);
      if (existing) {
        return prev.map((o) =>
          o.itemId === item._id ? { ...o, qty: o.qty + 1 } : o
        );
      }
      return [...prev, { itemId: item._id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  // Increment item quantity
  const handleIncrement = (itemId) => {
    setOrderItems((prev) =>
      prev.map((o) => (o.itemId === itemId ? { ...o, qty: o.qty + 1 } : o))
    );
  };

  // Decrement item quantity or remove if it hits 0
  const handleDecrement = (itemId) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.itemId === itemId);
      if (!existing) return prev;
      if (existing.qty === 1) {
        return prev.filter((o) => o.itemId !== itemId);
      }
      return prev.map((o) => (o.itemId === itemId ? { ...o, qty: o.qty - 1 } : o));
    });
  };

  // 3. Save KOT Order & Redirect to Bill Page
  const handleSaveOrder = async () => {
    if (!tableNo.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter Table No.' });
      return;
    }
    if (orderItems.length === 0) {
      setStatusMsg({ type: 'error', text: 'Select at least one item for KOT.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Send 'quantity' (Mongoose schema) and 'qty' together to be safe
    const mappedItems = orderItems.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.qty),
      qty: Number(item.qty),
    }));

    const payload = {
      tableNo: tableNo.trim(),
      ref: refNo.trim(),
      refNo: refNo.trim(),
      items: mappedItems,
      totalAmount,
    };

    try {
      const res = await axios.post(API_KOT_URL, payload);

      // Clear draft storage after successful submission
      clearDraft();

      // Extract the created order ID (backend mongoose object)
      const orderId = res.data._id || res.data.kot?._id;

      if (orderId) {
        // Redirect directly to the bill page
        navigate(`/bill/${orderId}`);
      } else {
        setStatusMsg({ type: 'success', text: 'KOT Saved successfully!' });
      }
    } catch (err) {
      console.error('Save KOT error:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save KOT.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 pb-20">

      {/* 1. Deep Maroon Top Header Banner */}
      <header className="bg-[#80164d] text-white text-center py-2.5 font-bold text-lg shadow-md relative">
        New KOT
        {orderItems.length > 0 && (
          <button
            onClick={clearDraft}
            className="absolute right-3 top-2.5 text-xs bg-rose-900/80 hover:bg-rose-900 px-2 py-1 rounded text-rose-100 border border-rose-700 flex items-center gap-1"
            title="Clear current draft"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </header>

      <div className="p-3 space-y-3 max-w-md mx-auto w-full flex-1">

        {/* Status Toast Alert */}
        {statusMsg.text && (
          <div
            className={`p-2 text-xs font-semibold rounded text-center ${
              statusMsg.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                : 'bg-rose-100 text-rose-800 border border-rose-400'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* 2. Table No & Ref Row */}
        <div className="border-2 border-blue-600 bg-white p-2 rounded flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-500 font-medium text-sm whitespace-nowrap">Table No.</span>
            <input
              type="text"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="bg-[#f3b548] text-slate-900 font-bold px-2 py-1.5 rounded w-16 text-center outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-slate-500 font-medium text-sm whitespace-nowrap">Ref:</span>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              className="bg-[#f3b548] text-slate-900 font-bold px-2 py-1.5 rounded w-28 outline-none"
            />
          </div>
        </div>

        {/* 3. Search Bar */}
        <div className="relative border-2 border-emerald-500 rounded bg-white shadow-sm">
          <input
            type="text"
            placeholder="Search Item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-sm text-slate-700 outline-none"
          />
          <Search className="w-5 h-5 absolute right-2.5 top-2.5 text-slate-600" />
        </div>

        {/* 4. Available List Section */}
        <div className="border-2 border-cyan-300 rounded overflow-hidden shadow-sm bg-[#cbf8f8]">
          <div className="bg-[#040884] text-white font-bold text-center py-1.5 text-base tracking-wide">
            Available List
          </div>

          <div className="p-2 space-y-2 max-h-56 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500">Loading items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No items available</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleSelectItem(item)}
                  className="w-full text-left bg-white text-slate-800 font-bold text-sm px-4 py-2.5 rounded-full shadow border border-slate-200 active:bg-slate-100 transition uppercase tracking-wide truncate"
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 5. KOT List Section */}
        <div className="border-2 border-slate-400 rounded overflow-hidden shadow-sm bg-white">
          <div className="bg-[#df9b00] text-slate-900 font-bold text-center py-1.5 text-base tracking-wide flex justify-between items-center px-4">
            <span>KOT List</span>
            {orderItems.length > 0 && (
              <span className="text-[11px] bg-slate-800 text-white px-2 py-0.5 rounded-full font-normal">
                Draft Saved
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-200 min-h-[100px] max-h-44 overflow-y-auto">
            {orderItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No items added to KOT yet
              </div>
            ) : (
              orderItems.map((item, idx) => (
                <div
                  key={item.itemId}
                  className={`flex items-center justify-between px-3 py-2 ${
                    idx % 2 === 1 ? 'bg-rose-50' : 'bg-white'
                  }`}
                >
                  <span className="font-semibold text-slate-600 text-sm uppercase truncate pr-2">
                    {item.name}
                  </span>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleDecrement(item.itemId)}
                      className="w-7 h-7 bg-[#1da94d] text-white rounded-full flex items-center justify-center hover:opacity-90 font-bold shadow"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-semibold text-slate-800 text-sm min-w-[14px] text-center">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => handleIncrement(item.itemId)}
                      className="w-7 h-7 bg-[#1da94d] text-white rounded-full flex items-center justify-center hover:opacity-90 font-bold shadow"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. Save Button */}
        <div>
          <button
            onClick={handleSaveOrder}
            disabled={submitting}
            className="bg-[#0302ce] hover:bg-blue-800 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2 rounded shadow transition"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>

      </div>

      {/* 7. Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#80164d] text-white flex items-center justify-around py-2 border-t border-rose-900 shadow-lg z-50">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-xs font-semibold opacity-80 hover:opacity-100 transition"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Dash Board</span>
        </button>

        <button
          onClick={() => navigate('/kot')}
          className="flex flex-col items-center text-xs font-semibold opacity-100 text-white"
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>New KOT</span>
        </button>
      </footer>

    </div>
  );
}