'use client';

import React from 'react';
import { useUIStore } from '@/presentation/stores';

export default function GlobalLoader() {
  const { isLoading } = useUIStore();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-transparent overflow-hidden">
      <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full animate-progress origin-left" />
    </div>
  );
}
