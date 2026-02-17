'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-[#EDE8FF] to-[#F0EEFF] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-lg shadow-lg shadow-indigo-200">
            💜
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            LifePulse
          </h1>
        </div>
        <Link 
          href="/expenses" 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          Open App <ArrowRight size={16} />
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-12 sm:py-20 lg:py-32">
        <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 hover:animate-bounce cursor-default transition-all">
          💸
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#FD79A8] drop-shadow-sm">
            Your Money, Your Rules.
          </span>
        </h1>
        
        <p className="max-w-xl mx-auto text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
          Track expenses, import bank statements, and crush your budget goals —
          all in one beautiful app designed for the way you live. ✨
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/expenses"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 w-full">
          {[
            { emoji: '📊', title: 'Expense Tracking', desc: 'See where every baht goes' },
            { emoji: '📄', title: 'Import Statements', desc: 'Upload CSV from your bank' },
            { emoji: '🎯', title: 'Budget Goals', desc: 'Set targets & stay on track' },
            { emoji: '📈', title: 'Smart Charts', desc: 'Beautiful spending breakdowns' },
          ].map((feature) => (
            <div 
              key={feature.title} 
              className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-indigo-50 hover:border-indigo-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 origin-left">{feature.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs font-semibold text-gray-400">
          Built with 💜 by LifePulse Team • 2026
        </p>
      </footer>
    </div>
  );
}
