'use client';

import React, { useState } from 'react';
import { Plus, Receipt, Upload } from 'lucide-react';
import { useUIStore } from '@/presentation/stores';

export default function TransactionFAB() {
  const { openTransactionModal, openImportModal } = useUIStore();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
      {/* Actions */}
      <div 
        className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom z-50 ${
          open ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <button 
          onClick={() => {
            openImportModal();
            setOpen(false);
          }}
          className="flex items-center gap-3 group"
        >
          <span className="bg-white px-2 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-md transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
            Upload Statement
          </span>
          <div className="w-12 h-12 bg-white text-indigo-600 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Upload size={20} />
          </div>
        </button>

        <button 
          onClick={() => {
            openTransactionModal();
            setOpen(false);
          }}
          className="flex items-center gap-3 group"
        >
           <span className="bg-white px-2 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-md transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
            Add Manually
          </span>
          <div className="w-12 h-12 bg-white text-emerald-600 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Receipt size={20} />
          </div>
        </button>
      </div>

      {/* Main Button */}
      <button
        onClick={toggle}
        className={`w-14 h-14 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white transition-all duration-300 z-50 ${
          open ? 'bg-indigo-600 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
        }`}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
