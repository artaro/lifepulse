'use client';

import React, { useState } from 'react';
import { useStatementImport } from '@/presentation/hooks/useStatementImport';
import { Account, Category } from '@/domain/entities';
import { FileUploadZone } from '@/presentation/components/common';
import ImportPreviewCards from './ImportPreviewCards';
import { X, Upload, Check, AlertCircle, FileText, Loader2, RotateCcw, ArrowRight, Trash2 } from 'lucide-react';
import { useUIStore } from '@/presentation/stores';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
}

export default function ImportDialog({ open, onClose, accounts, categories }: ImportDialogProps) {
  const { showSnackbar } = useUIStore();
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  
  // Selection & Batch State (Lifted from ImportPreviewCards)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [batchCategory, setBatchCategory] = useState<string>('');
  
  const {
    file,
    status,
    transactions,
    setTransactions,
    pdfPassword: password,
    setPdfPassword: setPassword,
    handleFileSelect,
    reset,
    parseWithLLM: handleParse,
    importTransactions: handleImport,
    hasLastImport,
    loadLastImport,
  } = useStatementImport();

  const handleClose = () => {
    reset();
    setTargetAccountId('');
    setSelectedIndices(new Set());
    onClose();
  };

  // --- Batch Handlers ---
  const handleSelectOne = (index: number) => {
    // Enforce single type selection logic
    const currentSelectedType = getSelectedType();
    const newTxType = transactions[index].type;
    
    if (currentSelectedType && currentSelectedType !== newTxType && selectedIndices.size > 0) {
       // Optional: Shake effect or snackbar to indicate you can't mix types?
       // For now, simple constraint: don't allow selecting if type mismatch
       // Or, we could clear previous selection. Let's strictly enforce per user request "blur other type".
       return; 
    }

    const next = new Set(selectedIndices);
    next.has(index) ? next.delete(index) : next.add(index);
    setSelectedIndices(next);
  };

  const getSelectedType = (): 'income' | 'expense' | null => {
    if (selectedIndices.size === 0) return null;
    const firstIdx = Array.from(selectedIndices)[0];
    return transactions[firstIdx]?.type || null;
  };

  const handleSelectAllOfType = (type: 'income' | 'expense', indices: number[]) => {
    const currentSelectedType = getSelectedType();
    if (currentSelectedType && currentSelectedType !== type) return;

    // Check if all are currently selected
    const allSelected = indices.every(i => selectedIndices.has(i));
    const next = new Set(selectedIndices);
    
    if (allSelected) {
       indices.forEach(i => next.delete(i));
    } else {
       indices.forEach(i => next.add(i));
    }
    setSelectedIndices(next);
  };

  const handleBatchCategoryChange = (categoryId: string) => {
    if (!categoryId) return;
    const next = [...transactions];
    selectedIndices.forEach((i) => { next[i] = { ...next[i], category: categoryId }; });
    setTransactions(next);
    setBatchCategory('');
    setSelectedIndices(new Set()); // Optional: clear selection after action? User didn't specify, but usually good ux.
  };

  const handleDeleteBatch = () => {
    if (confirm(`Delete ${selectedIndices.size} selected transactions?`)) {
      const next = transactions.filter((_, i) => !selectedIndices.has(i));
      setTransactions(next);
      setSelectedIndices(new Set());
    }
  };

  const onImport = async () => {
    if (!targetAccountId) {
      showSnackbar('Please select an account', 'error');
      return;
    }
    await handleImport(targetAccountId);
    handleClose();
    showSnackbar('Transactions imported successfully!', 'success');
  };

  if (!open) return null;

  const selectedType = getSelectedType();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header - Dynamic based on selection */}
        <div className={`px-6 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-20 transition-colors ${selectedIndices.size > 0 ? 'bg-indigo-50/90 backdrop-blur-md' : 'bg-gray-50/80 backdrop-blur-md'}`}>
             
             {selectedIndices.size > 0 ? (
               // Batch Action State
               <>
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {selectedIndices.size} selected
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                       {selectedType === 'income' ? 'Income' : 'Expenses'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                     <select 
                        value={batchCategory}
                        onChange={(e) => handleBatchCategoryChange(e.target.value)}
                        className="text-sm py-1.5 pl-3 pr-8 rounded-lg border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-w-[160px]"
                      >
                        <option value="">Set Category...</option>
                        {categories.filter(c => c.type === selectedType).map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>

                      <button 
                        onClick={handleDeleteBatch}
                        className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Selected"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="h-6 w-px bg-gray-300 mx-2" />

                      <button 
                        onClick={() => setSelectedIndices(new Set())}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                  </div>
               </>
             ) : status === 'ready' ? (
                // Normal State
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Account</span>
                      <select
                        value={targetAccountId}
                        onChange={(e) => setTargetAccountId(e.target.value)}
                        className="text-sm font-medium bg-transparent border-none p-0 pr-6 focus:ring-0 cursor-pointer text-gray-900"
                      >
                        <option value="">Select Account...</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="h-8 w-px bg-gray-300 mx-2" />

                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          {transactions.length} items
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={reset}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Start Over
                    </button>
                    <button 
                      onClick={onImport}
                      disabled={!targetAccountId}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                       Import <ArrowRight size={16} />
                    </button>
                  </div>
                </>
             ) : (
                // Initial State Header
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Import Statement</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Upload bank statements to auto-track expenses</p>
                  </div>
                  <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
             )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50/30">
          {status === 'idle' && (
            <div className="max-w-xl mx-auto space-y-6">
              <FileUploadZone 
                onFileSelect={handleFileSelect} 
                selectedFile={file} 
                onClear={reset} 
              />
              
              {file && (
                <div className="animate-fade-in space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                     <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                     <div className="space-y-2">
                        <p className="text-sm text-amber-800 font-medium">Is this PDF password protected?</p>
                        <input 
                          type="password" 
                          placeholder="Enter password if needed" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                     </div>
                  </div>

                  <button
                    onClick={handleParse}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Parse Statement
                  </button>
                </div>
              )}

              {hasLastImport && !file && (
                 <div className="flex justify-center">
                   <button 
                     onClick={loadLastImport}
                     className="text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                   >
                     <RotateCcw size={14} />
                     Restore last session
                   </button>
                 </div>
              )}
            </div>
          )}

          {status === 'reading' && (
             <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
               <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
               <div>
                  <h3 className="text-lg font-bold text-gray-900">analyzing statement...</h3>
                  <p className="text-gray-500">Extracing transactions with AI magic ✨</p>
               </div>
             </div>
          )}

          {status === 'parsing' && (
             <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
               <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Structuring Data...</h3>
                  <p className="text-gray-500">Almost there!</p>
               </div>
             </div>
          )}

          {status === 'ready' && (
             <ImportPreviewCards 
               transactions={transactions}
               onTransactionsChange={setTransactions}
               categories={categories}
               selectedIndices={selectedIndices}
               onSelectOne={handleSelectOne}
               onSelectAllOfType={handleSelectAllOfType}
               selectedType={selectedType}
             />
          )}

          {status === 'error' && (
             <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-fade-in">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-2">
                 <AlertCircle size={32} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Oops! Something went wrong.</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">It seems we couldn't parse that file. Please try again or check if the file is valid.</p>
               </div>
               <button onClick={reset} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
                 Try Again
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
