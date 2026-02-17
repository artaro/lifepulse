'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Lock,
  Pin,
  X
} from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/data/defaults/defaultCategories';
import { ConfirmDialog } from '@/presentation/components/common';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useTogglePinCategory,
} from '@/presentation/hooks';
import { Category } from '@/domain/entities';
import { TransactionType } from '@/domain/enums';

const EMOJI_OPTIONS = [
  '🍔', '🚗', '🛍️', '🎮', '💡', '💊', '📚', '💰', '🔄', '📦', 
  '☕', '✈️', '🏠', '💻', '👕', '🎬', '🏋️', '🎵', '🐾', '🎁', '❓'
];

const COLOR_OPTIONS = [
  '#FF7675', // Light Red
  '#74B9FF', // Light Blue
  '#FD79A8', // Pink
  '#6C5CE7', // Purple
  '#FDCB6E', // Mustard
  '#55EFC4', // Mint
  '#00B894', // Green
  '#0984E3', // Blue
  '#E17055', // Orange
  '#A29BFE', // Lavender
  '#E84393', // Dark Pink
  '#636E72', // Grey
];

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const togglePinMutation = useTogglePinCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#6C5CE7',
    type: TransactionType.EXPENSE,
  });

  const openAddForm = (type: TransactionType) => {
    setFormData({ 
      name: '', 
      icon: '📦', 
      color: '#6C5CE7',
      type: type 
    });
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEditForm = (cat: Category) => {
    setFormData({ 
      name: cat.name, 
      icon: cat.icon, 
      color: cat.color,
      type: cat.type 
    });
    setEditTarget(cat);
    setFormOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          id: editTarget.id,
          input: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormOpen(false);
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteMutation.mutateAsync(deleteTarget.id);
        setDeleteTarget(null);
      } catch (error) {
        console.error('Failed to delete category', error);
      }
    }
  };

  const handleTogglePin = async (cat: Category) => {
    try {
      await togglePinMutation.mutateAsync({ id: cat.id, isPinned: !cat.isPinned });
    } catch (error) {
      console.error('Failed to toggle pin', error);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
  const incomeCategories = categories.filter(c => c.type === TransactionType.INCOME);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Categories 🏷️
        </h1>
        <p className="text-gray-500">
          Manage your income and expense categories for better tracking
        </p>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress origin-left" />
        </div>
      )}
      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl">
          Failed to load categories
        </div>
      )}

      {/* Expense Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Expense
          </h2>
          <button
            onClick={() => openAddForm(TransactionType.EXPENSE)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {expenseCategories.map((cat) => (
            <CategoryCard 
              key={cat.id} 
              category={cat} 
              onEdit={openEditForm} 
              onDelete={setDeleteTarget}
              onPin={handleTogglePin}
            />
          ))}
          {expenseCategories.length === 0 && !isLoading && (
            <div className="col-span-full py-4 text-center text-gray-400 italic">
              No expense categories yet.
            </div>
          )}
        </div>
      </div>

      <hr className="border-dashed border-gray-200" />

      {/* Income Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Income
          </h2>
          <button
            onClick={() => openAddForm(TransactionType.INCOME)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {incomeCategories.map((cat) => (
            <CategoryCard 
              key={cat.id} 
              category={cat} 
              onEdit={openEditForm} 
              onDelete={setDeleteTarget}
              onPin={handleTogglePin}
            />
          ))}
          {incomeCategories.length === 0 && !isLoading && (
            <div className="col-span-full py-4 text-center text-gray-400 italic">
              No income categories yet.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit category dialog */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
                onClick={() => setFormOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {editTarget ? 'Edit Category ✏️' : 'New Category 🏷️'}
                    </h2>
                    <button 
                        onClick={() => setFormOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Type Selection */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                         <button
                            type="button"
                            onClick={() => setFormData({...formData, type: TransactionType.EXPENSE})}
                            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                                formData.type === TransactionType.EXPENSE 
                                ? 'bg-white text-red-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, type: TransactionType.INCOME})}
                            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                                formData.type === TransactionType.INCOME 
                                ? 'bg-white text-teal-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 placeholder-gray-400"
                            placeholder="e.g. Groceries"
                            required
                        />
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Icon</label>
                        <div className="flex flex-wrap gap-2">
                             {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: emoji })}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${
                                        formData.icon === emoji 
                                        ? 'border-indigo-500 bg-indigo-50/50' 
                                        : 'border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    {emoji}
                                </button>
                             ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Color</label>
                        <div className="flex flex-wrap gap-2">
                             {COLOR_OPTIONS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-8 h-8 rounded-full transition-all border-2 ${
                                        formData.color === color 
                                        ? 'border-gray-600 scale-110' 
                                        : 'border-transparent hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                             ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setFormOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.name.trim() || loading}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category? 🗑️"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Transactions in this category won't be deleted, just uncategorized.`}
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CategoryCard({ category, onEdit, onDelete, onPin }: { 
  category: Category; 
  onEdit: (c: Category) => void; 
  onDelete: (c: Category) => void; 
  onPin: (c: Category) => void;
}) {
  const isDefault = DEFAULT_CATEGORIES.some(def => def.id === category.id);

  return (
    <div 
        className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden
            ${category.isPinned ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1'}
            ${isDefault ? 'opacity-90' : ''}
        `}
    >
      <div className="p-4 text-center pb-3">
          {/* Badge */}
          <div className="absolute top-2 right-2 z-10">
             {isDefault ? (
                 <Lock size={12} className="text-gray-300" />
             ) : category.isPinned ? (
                 <Pin size={12} className="text-indigo-500 fill-indigo-500 transform rotate-45" />
             ) : null}
          </div>

          {!isDefault && (
              <div className="absolute top-2 right-2 left-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPin(category); }}
                    className="p-1 bg-white shadow-sm rounded-md hover:text-indigo-600 hover:bg-indigo-50"
                    title={category.isPinned ? "Unpin" : "Pin"}
                  >
                      <Pin size={12} className={category.isPinned ? "fill-indigo-600" : ""} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                    className="p-1 bg-white shadow-sm rounded-md hover:text-blue-600 hover:bg-blue-50"
                    title="Edit"
                  >
                      <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(category); }}
                    className="p-1 bg-white shadow-sm rounded-md hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                      <Trash2 size={12} />
                  </button>
              </div>
          )}

          {/* Icon */}
          <div 
             className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
             style={{ backgroundColor: `${category.color}20` }}
          >
              {category.icon}
          </div>
          
          {/* Name */}
          <p className="text-xs font-bold text-gray-700 truncate px-1">
              {category.name}
          </p>
      </div>

      {/* Color Bar */}
      <div className="h-1 w-full" style={{ backgroundColor: category.color }} />
    </div>
  );
}
