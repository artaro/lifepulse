'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  FileText, 
  DollarSign, 
  ChevronDown 
} from 'lucide-react';
import { TransactionType } from '@/domain/enums';
import { Account, Category, CreateTransactionInput } from '@/domain/entities';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput) => void;
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<CreateTransactionInput>;
  loading?: boolean;
  isEdit?: boolean;
}

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  accounts,
  categories,
  initialData,
  loading = false,
  isEdit = false,
}: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.EXPENSE,
    accountId: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // eslint-disable-next-line
        setFormData({
            description: initialData.description || '',
            amount: initialData.amount?.toString() || '',
            type: initialData.type || TransactionType.EXPENSE,
            accountId: initialData.accountId || '',
            categoryId: initialData.categoryId || '',
            transactionDate: initialData.transactionDate || new Date().toISOString().split('T')[0],
        });
      } else {
        setFormData({
            description: '',
            amount: '',
            type: TransactionType.EXPENSE,
            accountId: accounts.length > 0 ? accounts[0].id : '',
            categoryId: '',
            transactionDate: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [open, initialData, accounts]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        amount: Number(formData.amount),
    });
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Transaction ✏️' : 'New Transaction 💸'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
                type="button"
                onClick={() => setFormData({...formData, type: TransactionType.EXPENSE, categoryId: ''})}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    formData.type === TransactionType.EXPENSE
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Expense
            </button>
            <button
                type="button"
                onClick={() => setFormData({...formData, type: TransactionType.INCOME, categoryId: ''})}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    formData.type === TransactionType.INCOME
                    ? 'bg-white text-teal-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Amount</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    <DollarSign size={18} />
                </div>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-lg font-bold text-gray-900 placeholder-gray-300"
                    required
                    autoFocus={!isEdit}
                />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Description</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FileText size={18} />
                </div>
                <input
                    type="text"
                    placeholder="What was this for?"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900"
                    required
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Category</label>
                <div className="relative">
                    <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white font-medium text-sm truncate"
                        required
                    >
                        <option value="" disabled>Select...</option>
                        {filteredCategories.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.icon} {c.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Date</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <CalendarIcon size={16} />
                    </div>
                    <input
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-sm"
                        required
                    />
                </div>
              </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Account</label>
            <div className="relative">
                <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full pl-3 pr-8 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white font-medium"
                    required
                >
                    <option value="" disabled>Select Account</option>
                    {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.type === 'bank' ? '🏦' : '💳'} {a.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
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
                disabled={loading || !formData.amount || !formData.description || !formData.accountId || !formData.categoryId}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
