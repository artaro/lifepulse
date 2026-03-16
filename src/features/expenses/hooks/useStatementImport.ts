'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCreateTransactionsBulk } from '@/features/expenses/hooks/useTransactions';
import { CreateTransactionInput } from '@/features/expenses/types';
import { TransactionType, StatementSource } from '@/features/expenses/types';
import { compressImage } from '@/shared/lib/imageUtils';
import { toLocalISOString } from '@/shared/lib/formatters';

const LAST_IMPORT_KEY = 'aomkeng_last_import';
const MAX_IMAGE_FILES = 5;

export interface ParsedLLMTransaction {
    date: string;
    time?: string;
    description: string;
    amount: number;
    type: 'income' | 'expense' | '';
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
    files: File[];
    transactions: ParsedLLMTransaction[];
    setTransactions: React.Dispatch<React.SetStateAction<ParsedLLMTransaction[]>>;
    error: string | null;
    pdfPassword: string;
    setPdfPassword: (pw: string) => void;
    handleFileSelect: (file: File) => void;
    handleFilesSelect: (files: File[]) => void;
    parseWithLLM: () => Promise<void>;
    importTransactions: (accountId: string) => Promise<void>;
    loadLastImport: () => void;
    hasLastImport: boolean;
    reset: () => void;
    fileType: 'document' | 'image';
    setFileType: (type: 'document' | 'image') => void;
}



export function useStatementImport(): UseStatementImportReturn {
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [fileType, setFileType] = useState<'document' | 'image'>('document');
    const [transactions, setTransactions] = useState<ParsedLLMTransaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [pdfPassword, setPdfPassword] = useState('');
    const [hasLastImport, setHasLastImport] = useState(false);

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
        setFiles([]);
        setFileType(selectedFile.type.startsWith('image/') ? 'image' : 'document');
        setTransactions([]);
        setError(null);
        setPdfPassword('');
        setStatus('idle');
    }, []);

    const handleFilesSelect = useCallback((selectedFiles: File[]) => {
        const imageFiles = selectedFiles
            .filter(f => f.type.startsWith('image/'))
            .slice(0, MAX_IMAGE_FILES);
        if (imageFiles.length === 0) return;

        setFiles(imageFiles);
        setFile(imageFiles[0]); // Keep first file for backward compat
        setFileType('image');
        setTransactions([]);
        setError(null);
        setPdfPassword('');
        setStatus('idle');
    }, []);

    const parseWithLLM = useCallback(async () => {
        const isMultiFile = files.length > 1;
        const targetFile = isMultiFile ? null : file;

        if (!targetFile && !isMultiFile) {
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

            if (isMultiFile) {
                // Multi-file: send each image separately and combine results
                const allTransactions: ParsedLLMTransaction[] = [];

                for (const imageFile of files) {
                    let fileToUpload = imageFile;
                    try {
                        fileToUpload = await compressImage(imageFile);
                    } catch (e) {
                        console.warn('Image compression failed, trying original', e);
                    }

                    const formData = new FormData();
                    formData.append('file', fileToUpload);

                    const response = await fetch('/api/parse-statement', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        console.warn(`Failed to parse ${imageFile.name}:`, err.error);
                        // Continue with other files instead of failing entirely
                        continue;
                    }

                    const data = await response.json();
                    if (data.transactions && data.transactions.length > 0) {
                        allTransactions.push(...data.transactions);
                    }
                }

                if (allTransactions.length === 0) {
                    setError('No transactions found in any of the uploaded files');
                    setStatus('error');
                    return;
                }

                setTransactions(allTransactions);
                setStatus('ready');
                setError(null);

                // Persist to localStorage for recovery
                try {
                    localStorage.setItem(LAST_IMPORT_KEY, JSON.stringify(allTransactions));
                    setHasLastImport(true);
                } catch { /* quota exceeded, ignore */ }
            } else {
                // Single file flow (existing behavior)
                let fileToUpload = targetFile!;
                if (targetFile!.type.startsWith('image/')) {
                    try {
                        fileToUpload = await compressImage(targetFile!);
                    } catch (e) {
                        console.warn('Image compression failed, trying original', e);
                    }
                }

                const formData = new FormData();
                formData.append('file', fileToUpload);
                if (pdfPassword) {
                    formData.append('password', pdfPassword);
                }

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
            }
        } catch (err) {
            console.error('Parse error:', err);
            setError(err instanceof Error ? err.message : 'Failed to parse file');
            setStatus('error');
        }
    }, [file, files, pdfPassword, status]);


    const loadLastImport = useCallback(() => {
        try {
            const saved = localStorage.getItem(LAST_IMPORT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as ParsedLLMTransaction[];
                setTransactions(parsed);
                setStatus('ready');
                setError(null);
                setFile(null);
                setFiles([]);
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

            // Filter out transactions with empty type — they can't be imported
            const importable = transactions.filter(tx => tx.type === 'income' || tx.type === 'expense');
            if (importable.length === 0) {
                setError('No valid transactions to import. Please assign a type to each transaction.');
                return;
            }

            setStatus('importing');
            setError(null);

            try {
                const inputs: CreateTransactionInput[] = importable.map((tx, i) => {
                    // Always combine date and time with local timezone offset
                    const time = tx.time || '00:00';
                    const transactionDate = toLocalISOString(tx.date, time);

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
                        destinationAccountId: null,
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
        setFiles([]);
        setTransactions([]);
        setStatus('idle');
        setError(null);
        setPdfPassword('');
    }, []);

    return {
        status,
        file,
        files,
        transactions,
        setTransactions, // Exposed for UI editing
        error,
        pdfPassword,
        setPdfPassword,
        handleFileSelect,
        handleFilesSelect,
        parseWithLLM,
        importTransactions,
        loadLastImport,
        hasLastImport,
        reset,
        fileType,
        setFileType,
    };
}
