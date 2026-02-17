'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/infrastructure/query/queryClient';
import GlobalLoader from '@/presentation/components/common/GlobalLoader';
import { useUIStore } from '@/presentation/stores';
import { X } from 'lucide-react';

function Toast() {
  const { snackbar, hideSnackbar } = useUIStore();

  if (!snackbar.open) return null;

  const severityStyles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  const style = severityStyles[snackbar.severity as keyof typeof severityStyles] || severityStyles.info;

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/5 animate-fade-in ${style}`}>
      <span className="text-sm font-medium">{snackbar.message}</span>
      <button onClick={hideSnackbar} className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoader />
      {children}
      <Toast />
    </QueryClientProvider>
  );
}
