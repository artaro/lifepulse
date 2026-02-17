'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCategories } from './useCategories';
import { useCreateTransactionsBulk } from './useTransactions';
import { CreateTransactionInput } from '@/domain/entities';
import { TransactionType, StatementSource } from '@/domain/enums';
import { generateMockTransactions } from '@/data/mock/mockStatementTransactions';

const LAST_IMPORT_KEY = 'lifepulse_last_import';

export interface ParsedLLMTransaction {
  date: string;
  time?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string; // For manual category assignment in UI
}

type ImportStatus =
  | 'idle'
  | 'reading'
  | 'needs_password'
  | 'parsing'
  | 'ready'
  | 'importing'
  | 'done'
  | 'error';

interface UseStatementImportReturn {
  status: ImportStatus;
  file: File | null;
  transactions: ParsedLLMTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<ParsedLLMTransaction[]>>;
  error: string | null;
  pdfPassword: string;
  setPdfPassword: (pw: string) => void;
  handleFileSelect: (file: File) => void;
  parseWithLLM: () => Promise<void>;
  importTransactions: (accountId: string) => Promise<void>;
  loadDemoData: () => void;
  loadLastImport: () => void;
  hasLastImport: boolean;
  reset: () => void;
  fileType: 'document' | 'image';
  setFileType: (type: 'document' | 'image') => void;
}



export function useStatementImport(): UseStatementImportReturn {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'document' | 'image'>('document');
  const [transactions, setTransactions] = useState<ParsedLLMTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [hasLastImport, setHasLastImport] = useState(false);

  const { data: categories = [] } = useCategories();
  const bulkCreate = useCreateTransactionsBulk();

  // Check if there is a saved import in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_IMPORT_KEY);
      setHasLastImport(!!saved);
    } catch { /* ignore */ }
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setFileType(selectedFile.type.startsWith('image/') ? 'image' : 'document');
    setTransactions([]);
    setError(null);
    setPdfPassword('');
    setStatus('idle');
  }, []);

  const parseWithLLM = useCallback(async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    // Reset error only if it's not a password retry
    if (status !== 'needs_password') {
      setError(null);
    }

    try {
      // Step 1: Prepare data
      setStatus('parsing'); // Use parsing status immediately to show loader
      
      const formData = new FormData();
      formData.append('file', file);
      if (pdfPassword) {
        formData.append('password', pdfPassword);
      }

      // Send available categories for prediction
      const categoryList = categories.map(c => ({ 
        id: c.id, 
        name: c.name, 
        type: c.type 
      }));
      formData.append('categories', JSON.stringify(categoryList));
      
      // Step 2: Send to LLM API
      const response = await fetch('/api/parse-statement', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        
        // Handle password required
        if (response.status === 401 && err.code === 'PASSWORD_REQUIRED') {
          setStatus('needs_password');
          setError(pdfPassword ? 'Incorrect password' : 'PDF is password protected');
          return;
        }

        throw new Error(err.error || 'Failed to parse statement');
      }

      const data = await response.json();

      if (!data.transactions || data.transactions.length === 0) {
        setError('No transactions found in the file');
        setStatus('error');
        return;
      }

      setTransactions(data.transactions);
      setStatus('ready');
      setError(null);

      // Persist to localStorage for recovery
      try {
        localStorage.setItem(LAST_IMPORT_KEY, JSON.stringify(data.transactions));
        setHasLastImport(true);
      } catch { /* quota exceeded, ignore */ }
    } catch (err) {
      console.error('Parse error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setStatus('error');
    }
  }, [file, pdfPassword, status]);

  const loadDemoData = useCallback(() => {
    const mockData = generateMockTransactions(10);
    setTransactions(mockData);
    setStatus('ready');
    setError(null);
    setFile(null);
  }, []);

  const loadLastImport = useCallback(() => {
    try {
      const saved = localStorage.getItem(LAST_IMPORT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ParsedLLMTransaction[];
        setTransactions(parsed);
        setStatus('ready');
        setError(null);
        setFile(null);
      }
    } catch {
      setError('Failed to load saved import');
    }
  }, []);

  const importTransactions = useCallback(
    async (accountId: string) => {
      if (transactions.length === 0) {
        setError('No transactions to import');
        return;
      }

      setStatus('importing');
      setError(null);

      try {
        const inputs: CreateTransactionInput[] = transactions.map((tx, i) => {
          // Combine date and time if available
          let transactionDate = tx.date;
          if (tx.time) {
            // Ensure time is in HH:mm format, append :00 for seconds
            transactionDate = `${tx.date}T${tx.time}:00`;
          }

          return {
            accountId,
            categoryId: tx.category, // Use assigned category if present
            type:
              tx.type === 'income'
                ? TransactionType.INCOME
                : TransactionType.EXPENSE,
            amount: tx.amount,
            description: tx.description,
            transactionDate,
            source: StatementSource.LLM_IMPORT,
            referenceId: `llm-${tx.date}-${tx.amount}-${i}-${Date.now()}`,
          };
        });

        await bulkCreate.mutateAsync(inputs);
        setStatus('done');

        // Clear saved import after successful import
        try { localStorage.removeItem(LAST_IMPORT_KEY); setHasLastImport(false); } catch { /* ignore */ }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to import transactions'
        );
        setStatus('error');
      }
    },
    [transactions, bulkCreate]
  );

  const reset = useCallback(() => {
    setFile(null);
    setTransactions([]);
    setStatus('idle');
    setError(null);
    setPdfPassword('');
  }, []);

  return {
    status,
    file,
    transactions,
    setTransactions, // Exposed for UI editing
    error,
    pdfPassword,
    setPdfPassword,
    handleFileSelect,
    parseWithLLM,
    importTransactions,
    loadDemoData,
    loadLastImport,
    hasLastImport,
    reset,
    fileType,
    setFileType,
  };
}
