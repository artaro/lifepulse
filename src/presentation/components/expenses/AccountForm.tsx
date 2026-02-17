'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, X, DollarSign, Building2 } from 'lucide-react';
import { CreateAccountInput, UpdateAccountInput, Account } from '@/domain/entities';
import { AccountType } from '@/domain/enums/accountType';

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountInput | UpdateAccountInput) => void;
  initialData?: Account | null;
  loading?: boolean;
}

export default function AccountForm({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: AccountFormProps) {
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<AccountType>(initialData?.type || AccountType.BANK);
  const [balance, setBalance] = useState(String(initialData?.balance ?? 0));
  const [bankName, setBankName] = useState(initialData?.bankName || '');
  const [last4, setLast4] = useState(initialData?.accountNumberLast4 || '');

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line
      setName(initialData?.name || '');

      setType(initialData?.type || AccountType.BANK);

      setBalance(String(initialData?.balance ?? 0));

      setBankName(initialData?.bankName || '');

      setLast4(initialData?.accountNumberLast4 || '');
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      type,
      balance: parseFloat(balance) || 0,
      bankName: bankName || undefined,
      accountNumberLast4: last4 || undefined,
    };
    onSubmit(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Account ✏️' : 'Add Account 🏦'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           {/* Account Name */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
             <input 
               type="text"
               required
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 placeholder-gray-400"
               placeholder="e.g. KBank Savings" 
             />
           </div>

           {/* Account Type */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setType(AccountType.BANK)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border transition-all ${
                        type === AccountType.BANK
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                    <Landmark size={18} /> Bank
                </button>
                <button
                    type="button"
                    onClick={() => setType(AccountType.CREDIT_CARD)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border transition-all ${
                        type === AccountType.CREDIT_CARD
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                    <CreditCard size={18} /> Credit Card
                </button>
            </div>
           </div>

           {/* Balance */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
             <div className="relative">
               <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="number"
                 step="0.01"
                 value={balance}
                 onChange={(e) => setBalance(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 font-medium" 
                 placeholder="0.00"
               />
             </div>
           </div>

           {/* Bank Name */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name (optional)</label>
             <div className="relative">
               <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text"
                 value={bankName}
                 onChange={(e) => setBankName(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 placeholder-gray-400" 
                 placeholder="e.g. Kasikorn Bank"
               />
             </div>
           </div>

           {/* Last 4 Digits */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 digits (optional)</label>
             <input 
               type="text"
               maxLength={4}
               value={last4}
               onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
               className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 placeholder-gray-400 tracking-widest" 
               placeholder="1234"
             />
           </div>

           {/* Actions */}
           <div className="pt-4 flex justify-end gap-3">
             <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={loading}
             >
                Cancel
             </button>
             <button 
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={loading || !name.trim()}
             >
                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}
