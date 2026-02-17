'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar, AppHeader } from '@/presentation/components/layout';
import TransactionFAB from '@/presentation/components/expenses/TransactionFAB';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import GlobalModals from '@/presentation/components/layout/GlobalModals';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main 
        className="flex-1 transition-all duration-300 ease-in-out w-full md:w-[calc(100%-280px)] md:ml-[280px]"
      >
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="h-16" /> {/* Spacer for fixed header */}
        
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      <TransactionFAB />
      <GlobalModals />
    </div>
  );
}
