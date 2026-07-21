import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle, Clock, Utensils, AlertTriangle } from 'lucide-react';

const API_KOT_URL = 'http://localhost:5000/api/kot';
const GST_PERCENTAGE = 5; // Set your tax percentage here (e.g., 5 for 5% GST)

export default function BillPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid Bill ID provided in URL.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_KOT_URL}/${id}`);
        // Handle cases where data might be nested inside res.data or res.data.kot
        const fetchedOrder = res.data?.kot || res.data;
        setOrder(fetchedOrder);
      } catch (err) {
        console.error('Failed to fetch bill:', err);
        setError('Could not load bill details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // Helper function to safely extract quantity regardless of schema naming
  const getItemQty = (item) => Number(item?.qty || item?.quantity || 1);

  // --- Calculations ---
  // Calculates subtotal using safe property checks
  const subtotal = order?.items?.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * getItemQty(item),
    0
  ) || Number(order?.totalAmount) || 0;

  const gstAmount = (subtotal * GST_PERCENTAGE) / 100;
  const grandTotal = subtotal + gstAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-semibold">
        Loading Bill...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 flex flex-col items-center justify-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
        <p className="text-rose-600 font-semibold text-sm">{error || 'Bill not found'}</p>
        <button
          onClick={() => navigate('/kot')}
          className="bg-[#80164d] text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-rose-900 transition"
        >
          Back to New KOT
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 font-sans flex flex-col items-center">

      {/* Screen Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={() => navigate('/kot')}
          className="flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 px-3 py-2 rounded border border-slate-300 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" /> New KOT
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-bold bg-[#80164d] text-white px-4 py-2 rounded shadow hover:bg-rose-900 transition"
        >
          <Printer className="w-4 h-4" /> Print Bill
        </button>
      </div>

      {/* Printable Receipt Card */}
      <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded shadow-lg p-5 space-y-4 print:shadow-none print:border-none print:w-full">
        
        {/* Header */}
        <div className="text-center border-b border-dashed border-slate-300 pb-3">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center justify-center gap-2">
            <Utensils className="w-5 h-5 text-[#80164d]" /> Hotel Restaurant
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">Order Receipt / Tax Invoice</p>
        </div>

        {/* Order Info Bar */}
        <div className="flex justify-between text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div>
            <p>Table No: <span className="text-slate-900 font-bold">{order.tableNo || 'N/A'}</span></p>
            {(order.ref || order.refNo) && (
              <p>Ref: <span className="text-slate-900 font-bold">{order.ref || order.refNo}</span></p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">
              {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span
              className={`inline-block px-2 py-0.5 text-[10px] rounded font-bold mt-1 ${
                paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {paid ? 'PAID' : 'UNPAID'}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 uppercase border-b pb-1">
            <span className="col-span-6">Item</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Price</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 print:max-h-none">
            {order.items?.map((item, idx) => {
              const itemQty = getItemQty(item);
              const itemPrice = Number(item.price) || 0;
              return (
                <div key={idx} className="grid grid-cols-12 text-xs py-1.5 font-medium text-slate-700">
                  <span className="col-span-6 truncate uppercase font-semibold">{item.name}</span>
                  <span className="col-span-2 text-center text-slate-500">{itemQty}</span>
                  <span className="col-span-2 text-right text-slate-500">₹{itemPrice}</span>
                  <span className="col-span-2 text-right font-bold text-slate-800">
                    ₹{(itemPrice * itemQty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-1.5 text-xs text-slate-600 font-medium">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>GST ({GST_PERCENTAGE}%)</span>
            <span className="font-semibold text-slate-800">₹{gstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2 mt-1">
            <span>Grand Total</span>
            <span className="text-[#80164d]">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
          Thank you for dining with us!
        </div>

        {/* Mark as Paid Action Button */}
        <div className="pt-2 print:hidden">
          <button
            onClick={() => setPaid(!paid)}
            className={`w-full py-2.5 rounded font-bold text-xs transition flex items-center justify-center gap-2 ${
              paid
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {paid ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {paid ? 'Paid' : 'Mark as Paid'}
          </button>
        </div>

      </div>

    </div>
  );
}