'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  AlertCircle
} from 'lucide-react';
import {
  TransactionForm,
} from '@/presentation/components/expenses';
import TransactionsListCards from '@/presentation/components/expenses/TransactionsListCards';
import { ConfirmDialog, EmptyState } from '@/presentation/components/common';
import { TransactionType, StatementSource } from '@/domain/enums';
import { Transaction } from '@/domain/entities';
import {
  useTransactions,
  useAccounts,
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/presentation/hooks';

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Increased default for split view
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchCategory, setBatchCategory] = useState('');
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);

  // Data fetching
  const {
    data: transactionData,
    isLoading,
    isError,
  } = useTransactions({
    search: searchQuery || undefined,
    type: filterType || undefined,
    categoryId: filterCategory || undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
    page,
    pageSize, // Can be larger since we have internal pagination
  });

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const transactions = transactionData?.data || [];

  // Filtered categories helper
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);

  // --- Handlers ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        source: StatementSource.MANUAL,
      });
      setFormOpen(false);
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (data: any) => {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({
        id: editTarget.id,
        input: {
            // Only update fields present in form
            ...data
        },
      });
      setFormOpen(false);
      setEditTarget(null);
    } catch (error) {
      console.error('Failed to update transaction', error);
    }
  };

  // Inline update from list
  const handleInlineUpdate = async (id: string, input: any) => {
      try {
          await updateMutation.mutateAsync({ id, input });
      } catch (error) {
          console.error('Failed to inline update', error);
      }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  // --- Batch Logic ---

  const handleSelectOne = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const currentType = getSelectedType();
    
    // Enforce single type selection
    if (currentType && currentType !== tx.type && selectedIds.size > 0) {
        return; 
    }

    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const getSelectedType = (): 'income' | 'expense' | null => {
    if (selectedIds.size === 0) return null;
    const firstId = Array.from(selectedIds)[0];
    const tx = transactions.find(t => t.id === firstId);
    return tx?.type as 'income' | 'expense' || null;
  };

  const handleSelectAllOfType = (type: 'income' | 'expense', ids: string[]) => {
    const currentType = getSelectedType();
    if (currentType && currentType !== type) return;

    const allSelected = ids.every(id => selectedIds.has(id));
    const next = new Set(selectedIds);
    
    if (allSelected) {
       ids.forEach(id => next.delete(id));
    } else {
       ids.forEach(id => next.add(id));
    }
    setSelectedIds(next);
  };

  const handleBatchDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
      setBatchDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to batch delete', error);
    }
  };

  const handleBatchCategoryChange = async (categoryId: string) => {
    if (!categoryId) return;
    try {
      for (const id of selectedIds) {
        await updateMutation.mutateAsync({
          id,
          input: { categoryId },
        });
      }
      setSelectedIds(new Set());
      setBatchCategory('');
    } catch (error) {
      console.error('Failed to batch update category', error);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const selectedType = getSelectedType();

  return (
    <div className="animate-fade-in pb-24 relative">
      
      {/* Sticky Header Container */}
      <div className="sticky top-16 z-30 -mx-4 px-4 md:px-8 py-4 mb-6 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
        
        {/* Top Row: Title or Batch Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {selectedIds.size > 0 ? (
                // Batch Actions State
                <div className="flex flex-1 items-center gap-4 animate-in slide-in-from-left-2 fade-in duration-200">
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {selectedIds.size} selected
                        </span>
                        <div className="h-4 w-px bg-gray-300" />
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {selectedType === 'income' ? 'Income' : 'Expenses'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto md:ml-0">
                        <select 
                            value={batchCategory}
                            onChange={(e) => handleBatchCategoryChange(e.target.value)}
                            className="text-sm py-1.5 pl-3 pr-8 rounded-lg border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-w-[150px]"
                        >
                            <option value="">Set Category...</option>
                            {selectedType === 'income' 
                                ? incomeCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)
                                : expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)
                            }
                        </select>

                        <button 
                            onClick={() => setBatchDeleteConfirm(true)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Selected"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="h-6 w-px bg-gray-300 mx-2" />

                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // Standard Title State
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                     Transactions 💸
                   </h1>
                </div>
            )}
        </div>

        {/* Second Row: Controls (Toggles & Filters) - Always Visible */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            
            {/* Type Toggle Group */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl w-full md:w-auto flex-shrink-0">
                <button
                onClick={() => { setFilterType(''); setPage(1); setSelectedIds(new Set()); }}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                    filterType === '' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                All
                </button>
                <button
                onClick={() => { setFilterType(TransactionType.EXPENSE); setPage(1); setSelectedIds(new Set()); }}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                    filterType === TransactionType.EXPENSE 
                    ? 'bg-white text-rose-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Expense
                </button>
                <button
                onClick={() => { setFilterType(TransactionType.INCOME); setPage(1); setSelectedIds(new Set()); }}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                    filterType === TransactionType.INCOME 
                    ? 'bg-white text-teal-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Income
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* Search */}
                <div className="relative flex-grow md:flex-grow-0 md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all"
                    />
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 outline-none text-xs font-medium w-32"
                    />
                    <span className="text-gray-300">-</span>
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 outline-none text-xs font-medium w-32"
                    />
                </div>

                {/* Category Dropdown */}
                <div className="relative w-full md:w-40">
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 outline-none text-sm appearance-none font-medium truncate pr-6"
                    >
                        <option value="">All Categories</option>
                        {filterType === TransactionType.INCOME
                        ? incomeCategories.map((c) => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))
                        : filterType === TransactionType.EXPENSE
                            ? expenseCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))
                            : (
                            <>
                                <optgroup label="Income">
                                    {incomeCategories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Expense">
                                    {expenseCategories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </optgroup>
                            </>
                            )
                        }
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-indigo-500 animate-progress origin-left" />
        </div>
      )}
      
      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-3xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">Failed to load transactions</span>
        </div>
      )}

      {/* Transaction list */}
      {!isLoading && !isError && (
        <>
          {transactions.length > 0 ? (
            <TransactionsListCards 
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                onUpdateTransaction={handleInlineUpdate}
                onDeleteTransaction={handleDelete}
                selectedIndices={selectedIds}
                onSelectOne={handleSelectOne}
                onSelectAllOfType={handleSelectAllOfType}
                selectedType={selectedType}
            />
          ) : (
            <EmptyState
              emoji="🔍"
              title="No transactions found"
              description="Try adjusting your filters or add a new transaction"
              actionLabel="Add Transaction"
              onAction={() => setFormOpen(true)}
            />
          )}
        </>
      )}

      {/* Transaction form */}
      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        accounts={accounts}
        categories={categories}
        initialData={
          editTarget
            ? {
                accountId: editTarget.accountId,
                categoryId: editTarget.categoryId || '',
                type: editTarget.type,
                amount: editTarget.amount,
                description: editTarget.description || '',
                transactionDate: editTarget.transactionDate.split('T')[0],
              }
            : undefined
        }
        loading={createMutation.isPending || updateMutation.isPending}
        isEdit={!!editTarget}
      />

      {/* Delete confirmation (batch) */}
      <ConfirmDialog
        open={batchDeleteConfirm}
        title="Delete Selected Transactions? 🗑️"
        message={`Delete ${selectedIds.size} transactions? This can't be undone.`}
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete All'}
        onConfirm={handleBatchDelete}
        onCancel={() => setBatchDeleteConfirm(false)}
      />
    </div>
  );
}
