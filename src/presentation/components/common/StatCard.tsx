'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-white shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
          style={{ background: gradient }}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          {trend.positive ? (
            <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              ↗ {trend.value}
            </div>
          ) : (
            <div className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
              ↘ {trend.value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
