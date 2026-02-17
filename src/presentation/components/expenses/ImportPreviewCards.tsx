'use client';

import React, { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { ParsedLLMTransaction } from '@/presentation/hooks/useStatementImport';
import { Category } from '@/domain/entities';
import { formatCurrency, formatDate } from '@/lib/formatters';

const ROWS_PER_PAGE = 20;

interface ImportPreviewCardsProps {
  transactions: ParsedLLMTransaction[];
  onTransactionsChange: (transactions: ParsedLLMTransaction[]) => void;
  categories: Category[];
  selectedIndices: Set<number>;
  onSelectOne: (index: number) => void;
  onSelectAllOfType: (type: 'income' | 'expense', indices: number[]) => void;
  selectedType: 'income' | 'expense' | null;
}

export default function ImportPreviewCards({
  transactions,
  onTransactionsChange,
  categories,
  selectedIndices,
  onSelectOne,
  onSelectAllOfType,
  selectedType,
}: ImportPreviewCardsProps) {
  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single'; index: number } | null>(null);
  

  const expenseTransactions = useMemo(
    () => transactions.map((tx, idx) => ({ tx, idx })).filter(({ tx }) => tx.type === 'expense'),
    [transactions]
  );
  const incomeTransactions = useMemo(
    () => transactions.map((tx, idx) => ({ tx, idx })).filter(({ tx }) => tx.type === 'income'),
    [transactions]
  );

  const expenseTotal = expenseTransactions.reduce((sum, { tx }) => sum + tx.amount, 0);
  const incomeTotal = incomeTransactions.reduce((sum, { tx }) => sum + tx.amount, 0);

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);

  const expensePageCount = Math.ceil(expenseTransactions.length / ROWS_PER_PAGE);
  const incomePageCount = Math.ceil(incomeTransactions.length / ROWS_PER_PAGE);

  const pagedExpenses = expenseTransactions.slice((expensePage - 1) * ROWS_PER_PAGE, expensePage * ROWS_PER_PAGE);
  const pagedIncomes = incomeTransactions.slice((incomePage - 1) * ROWS_PER_PAGE, incomePage * ROWS_PER_PAGE);

  const updateTransaction = (index: number, field: keyof ParsedLLMTransaction, value: string | number) => {
    const next = [...transactions];
    next[index] = { ...next[index], [field]: value };
    onTransactionsChange(next);
  };

  const handleDeleteSingleRequest = (index: number) => setDeleteConfirm({ type: 'single', index });

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const next = transactions.filter((_, i) => i !== deleteConfirm.index);
    onTransactionsChange(next);
    setDeleteConfirm(null);
  };

  const getDeleteMessage = () => {
    if (!deleteConfirm) return '';
    const tx = transactions[deleteConfirm.index];
    return `Delete "${tx?.description || 'this transaction'}" (${formatCurrency(tx?.amount || 0)})?`;
  };

  const renderRow = (tx: ParsedLLMTransaction, globalIndex: number, typedCategories: Category[]) => {
    const isSelected = selectedIndices.has(globalIndex);
    const cat = categories.find(c => c.id === tx.category);
    
    // Blur Logic:
    // If selectedType is set and this transaction is NOT of that type -> Blur.
    const isOtherType = selectedType && selectedType !== tx.type;
    
    const blurClass = isOtherType 
      ? 'blur-[2px] opacity-40 pointer-events-none grayscale'
      : '';

    return (
      <div
        key={globalIndex}
        className={`
          group grid grid-cols-[auto_auto_1fr_auto] md:flex md:items-center gap-x-3 gap-y-1.5 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent
          ${isSelected ? 'bg-indigo-50/60 border-indigo-100' : 'bg-white hover:bg-gray-50 hover:border-gray-200'}
          ${blurClass}
        `}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectOne(globalIndex)}
          disabled={!!isOtherType}
          className="row-span-2 md:row-span-1 w-4 h-4 rounded border-gray-300 text-primary cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Category Select */}
        <div className="row-span-2 md:row-span-1 flex-shrink-0 relative group/cat">
             <div 
               className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors"
               style={{ backgroundColor: cat ? `${cat.color}15` : 'rgba(108, 92, 231, 0.08)' }}
             >
                {cat?.icon || '📦'}
             </div>
             <select
                value={tx.category || ''}
                onChange={(e) => updateTransaction(globalIndex, 'category', e.target.value)}
                disabled={!!isOtherType}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                title="Select Category"
             >
                <option value="">Uncategorized</option>
                {typedCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
            </select>
        </div>

        {/* Description - Row 1 Col 3 (Mobile) */}
        <input
          value={tx.description}
          onChange={(e) => updateTransaction(globalIndex, 'description', e.target.value)}
          placeholder="Description"
          disabled={!!isOtherType}
          className="col-start-3 md:col-auto w-full md:flex-1 min-w-0 bg-transparent border-b border-dashed border-gray-300 hover:border-indigo-300 focus:border-indigo-500 focus:outline-none py-1 text-sm font-medium text-gray-900 placeholder-gray-400 truncate transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Amount - Row 1 Col 4 (Mobile) */}
        <div 
          className={`col-start-4 md:col-auto justify-self-end md:justify-self-auto text-sm font-bold whitespace-nowrap text-right min-w-[80px] md:min-w-[90px] ${
            tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {tx.type === 'expense' ? '-' : '+'}
          {formatCurrency(tx.amount)}
        </div>

        {/* Date & Time - Row 2 Col 3 (Mobile) */}
        <div className="col-start-3 md:col-auto flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0 justify-start md:justify-center w-full md:w-24 flex-shrink-0 text-left md:text-right">
             <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
               {formatDate(tx.date)}
             </span>
             {tx.time && (
               <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap md:mt-0.5">
                 {tx.time}
               </span>
             )}
        </div>

        {/* Delete Button - Row 2 Col 4 (Mobile) */}
        <button
          onClick={() => handleDeleteSingleRequest(globalIndex)}
          disabled={!!isOtherType}
          className="col-start-4 md:col-auto justify-self-end md:justify-self-auto p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Delete Transaction"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  const renderSectionSelectRow = (allItems: { idx: number }[], pagedItems: { idx: number }[], pageCount: number, label: string, type: 'income' | 'expense') => {
    const allIndices = allItems.map(i => i.idx);
    const allSelected = allIndices.length > 0 && allIndices.every(i => selectedIndices.has(i));
    const pageIndices = pagedItems.map(i => i.idx);
    const allPageSelected = pageIndices.length > 0 && pageIndices.every(i => selectedIndices.has(i));

    const isOtherType = selectedType && selectedType !== type;

    return (
      <div className={`flex items-center gap-4 mb-2 px-4 transition-opacity duration-200 ${isOtherType ? 'opacity-30 pointer-events-none' : ''}`}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={allSelected} 
            onChange={() => onSelectAllOfType(type, allIndices)}
            disabled={!!isOtherType}
            className="w-4 h-4 rounded border-gray-300 text-primary disabled:cursor-not-allowed" 
          />
          <span className="text-xs font-medium text-gray-500">Select all {label} ({allItems.length})</span>
        </label>
        {pageCount > 1 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={allPageSelected} 
              onChange={() => onSelectAllOfType(type, pageIndices)}
              disabled={!!isOtherType}
              className="w-4 h-4 rounded border-gray-300 text-primary disabled:cursor-not-allowed" 
            />
            <span className="text-xs font-medium text-gray-500">This page</span>
          </label>
        )}
      </div>
    );
  };


  return (
    <div 
      className={`pb-24 ${selectedIndices.size > 0 ? 'mb-16' : ''}`}
    >

      {/* Income */}
      {incomeTransactions.length > 0 && (
        <div className={`mb-6 transition-all duration-300 ${selectedType === 'expense' ? 'grayscale opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <h3 className="font-bold text-gray-900 text-sm">Income ({incomeTransactions.length})</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-xs font-bold">
              +{formatCurrency(incomeTotal)}
            </span>
          </div>
          {renderSectionSelectRow(incomeTransactions, pagedIncomes, incomePageCount, 'income', 'income')}
          <div className="space-y-1">
            {pagedIncomes.map(({ tx, idx }) => renderRow(tx, idx, incomeCategories))}
          </div>
          <Pagination page={incomePage} count={incomePageCount} onChange={setIncomePage} />
        </div>
      )}

      {/* Expenses */}
      {expenseTransactions.length > 0 && (
        <div className={`mb-6 transition-all duration-300 ${selectedType === 'income' ? 'grayscale opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <h3 className="font-bold text-gray-900 text-sm">Expenses ({expenseTransactions.length})</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
              -{formatCurrency(expenseTotal)}
            </span>
          </div>
          {renderSectionSelectRow(expenseTransactions, pagedExpenses, expensePageCount, 'expenses', 'expense')}
          <div className="space-y-1">
            {pagedExpenses.map(({ tx, idx }) => renderRow(tx, idx, expenseCategories))}
          </div>
          <Pagination page={expensePage} count={expensePageCount} onChange={setExpensePage} />
        </div>
      )}

      {/* Delete Confirmation Modal (Local/Single) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6 text-sm">{getDeleteMessage()}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-lg shadow-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pagination Helper
function Pagination({ page, count, onChange }: { page: number, count: number, onChange: (p: number) => void }) {
  if (count <= 1) return null;
  return (
    <div className="flex justify-center gap-2 mt-4">
      <button 
        disabled={page === 1} 
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-xs font-medium py-1 px-2 text-gray-600">
        {page} / {count}
      </span>
      <button 
        disabled={page === count} 
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
