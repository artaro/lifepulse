'use client';

import React, { useState } from 'react';
import { 
  CloudUpload, 
  Map as MapIcon, 
  Eye, 
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { FileUploadZone } from '@/presentation/components/common';
import {
  CsvColumnMapping,
  CsvParseResult,
  parseCsvFile,
} from '@/infrastructure/parsers/csvParser';
import { TransactionType, StatementSource } from '@/domain/enums';
import { formatCurrency } from '@/lib/formatters';
import { useAccounts, useCreateTransactionsBulk } from '@/presentation/hooks';
import { CreateTransactionInput } from '@/domain/entities';

export default function UploadPage() {
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const bulkCreateMutation = useCreateTransactionsBulk();

  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [mapping, setMapping] = useState<CsvColumnMapping>({
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
  });
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    // Read file to get headers
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split('\n')[0];
      const headers = firstLine
        .split(',')
        .map((h) => h.trim().replace(/"/g, ''));

      // Auto-map if headers match common patterns
      const autoMapping: CsvColumnMapping = {
        dateColumn: headers.find((h) => /date/i.test(h)) || headers[0] || '',
        descriptionColumn:
          headers.find((h) => /desc|detail|memo|narration/i.test(h)) ||
          headers[1] ||
          '',
        amountColumn:
          headers.find((h) => /amount|value|sum/i.test(h)) ||
          headers[2] ||
          '',
      };
      setMapping(autoMapping);
      setStep('map');
    };
    reader.readAsText(selectedFile);
  };

  const handleParse = async () => {
    if (!file) return;

    try {
      const text = await file.text();
      const result = parseCsvFile(text, mapping);

      if (result.transactions.length === 0) {
        setError('No valid transactions found. Check your column mapping.');
        return;
      }

      setParseResult(result);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const handleImport = async () => {
    if (!selectedAccount || !parseResult) return;

    try {
      const inputs: CreateTransactionInput[] = parseResult.transactions.map(
        (tx) => ({
          accountId: selectedAccount,
          amount: tx.amount,
          type: tx.type as TransactionType,
          description: tx.description,
          transactionDate: tx.date,
          source: StatementSource.CSV_IMPORT,
        })
      );

      await bulkCreateMutation.mutateAsync(inputs);
      setStep('done');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import transactions'
      );
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setSelectedAccount('');
    setMapping({ dateColumn: '', descriptionColumn: '', amountColumn: '' });
    setStep('upload');
    setError(null);
  };

  const steps = [
      { id: 'upload', label: 'Upload', icon: <CloudUpload size={16} /> },
      { id: 'map', label: 'Map Columns', icon: <MapIcon size={16} /> },
      { id: 'preview', label: 'Preview', icon: <Eye size={16} /> },
      { id: 'done', label: 'Done', icon: <CheckCircle size={16} /> }
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Upload Statement 📄
        </h1>
        <p className="text-gray-500">
          Import transactions from your bank or credit card CSV
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex flex-wrap gap-2">
        {steps.map((s, index) => {
          const stepIndex = steps.findIndex(st => st.id === step);
          const isActive = stepIndex >= index;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="opacity-80">{s.icon}</span>
              {index + 1}. {s.label}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <FileUploadZone
              accept=".csv"
              onFileSelect={handleFileSelect}
              selectedFile={file}
              onClear={() => {
                setFile(null);
                setStep('upload');
              }}
            />
        </div>
      )}

      {/* Step 2: Map columns */}
      {step === 'map' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapIcon size={24} className="text-indigo-500" />
                Map CSV Columns
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
                    <div className="relative">
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            disabled={accountsLoading}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="" disabled>Select an account...</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.type === 'bank' ? '🏦' : '💳'} {acc.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                </div>

                {file && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                            <FileText size={16} />
                            Detected file: <strong className="text-gray-900">{file.name}</strong>
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <MappingSelect 
                                label="Date Column" 
                                value={mapping.dateColumn}
                                onChange={(val) => setMapping({...mapping, dateColumn: val})}
                            />
                            <MappingSelect 
                                label="Description Column" 
                                value={mapping.descriptionColumn}
                                onChange={(val) => setMapping({...mapping, descriptionColumn: val})}
                            />
                            <MappingSelect 
                                label="Amount Column" 
                                value={mapping.amountColumn}
                                onChange={(val) => setMapping({...mapping, amountColumn: val})}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button 
                        onClick={handleReset}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleParse}
                        disabled={!selectedAccount || !mapping.dateColumn}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        Parse & Preview <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && parseResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Eye size={24} className="text-indigo-500" />
                    Preview
                </h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                        {parseResult.totalRows} rows
                    </span>
                    {parseResult.skippedRows > 0 && (
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-100">
                            {parseResult.skippedRows} skipped
                        </span>
                    )}
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 whitespace-nowrap bg-gray-50">Date</th>
                                <th className="px-4 py-3 bg-gray-50">Description</th>
                                <th className="px-4 py-3 bg-gray-50">Type</th>
                                <th className="px-4 py-3 text-right bg-gray-50">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {parseResult.transactions.slice(0, 20).map((tx, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{tx.date}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={tx.description}>{tx.description}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            tx.type === TransactionType.INCOME 
                                            ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                                            : 'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                            {tx.type === TransactionType.INCOME ? '💰 Income' : '💸 Expense'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {parseResult.transactions.length > 20 && (
                     <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-center text-gray-500 font-medium">
                         Showing 20 of {parseResult.transactions.length} transactions...
                     </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                    onClick={() => setStep('map')}
                    disabled={bulkCreateMutation.isPending}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors order-2 sm:order-1"
                >
                    <div className="flex items-center gap-2">
                        <ArrowLeft size={16} /> Back
                    </div>
                </button>
                <button 
                    onClick={handleImport}
                    disabled={bulkCreateMutation.isPending}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                    {bulkCreateMutation.isPending ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Importing...
                        </>
                    ) : (
                        <>
                            Import {parseResult.transactions.length} Transactions <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
                <CheckCircle size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Import Complete! 🎉
            </h2>
            
            <p className="text-gray-500 mb-8 text-lg">
                <strong className="text-gray-900 font-semibold">{parseResult?.transactions.length}</strong> transactions have been imported successfully.
            </p>
            
            <button 
                onClick={handleReset}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 hover:-translate-y-1 transition-all"
            >
                Upload Another Statement
            </button>
        </div>
      )}
    </div>
  );
}

function MappingSelect({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white font-medium text-sm"
                >
                    <option value={value}>{value || 'Auto-detected'}</option>
                    {/* In a real app we'd populate other column headers here if available */}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
        </div>
    );
}
