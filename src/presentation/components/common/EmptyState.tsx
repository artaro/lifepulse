'use client';

import React from 'react';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  emoji = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-200">
      <div className="text-4xl mb-4 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
        {emoji}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#6C5CE7' }} // Inline fallback for primary color
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
