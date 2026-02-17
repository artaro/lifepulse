'use client';

import React from 'react';
import { Category } from '@/domain/entities';

interface CategoryChipProps {
  category?: Category;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function CategoryChip({
  category,
  selected,
  onClick,
  compact = false,
}: CategoryChipProps) {
  if (!category) return null;

  return (
    <div
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer border
        ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${
          selected
            ? 'bg-opacity-15 border-transparent shadow-sm'
            : 'bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200'
        }
      `}
      style={{
        backgroundColor: selected ? `${category.color}20` : undefined, // 20 = 12% opacity hex
        color: selected ? category.color : undefined,
      }}
    >
      <span className={compact ? 'text-sm' : 'text-base'}>
        {category.icon}
      </span>
      <span className="font-medium">
        {category.name}
      </span>
    </div>
  );
}
