
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '@/domain/entities';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useCategories } from '@/presentation/hooks';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
}: TransactionRowProps) {
  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.id === transaction.categoryId);

  return (
    <div
      className={`group flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-200 ${
        selected
          ? 'border-indigo-500 shadow-md shadow-indigo-100 bg-indigo-50/30'
          : 'border-gray-100 hover:border-indigo-100 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        {selectable && onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(transaction.id)}
            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
          />
        )}
        
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: category ? `${category.color}15` : '#F3F4F6' }}
        >
          {category?.icon || '📦'}
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5">
            {transaction.description}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>{category?.name || 'Uncategorized'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{formatDate(transaction.transactionDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <span
          className={`font-bold text-sm md:text-base ${
            transaction.type === 'expense' ? 'text-red-500' : 'text-teal-500'
          }`}
        >
          {transaction.type === 'expense' ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </span>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
