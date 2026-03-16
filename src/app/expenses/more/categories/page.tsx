'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Lock,
  Pin,
  X,
  Pipette,
} from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/features/expenses/constants';
import { ConfirmDialog } from '@/shared/components';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useTogglePinCategory,
} from '@/features/expenses';
import { Category } from '@/features/expenses/types';
import { TransactionType } from '@/features/expenses/types';
import { useTranslation } from '@/shared/lib/i18n';
import EmojiPicker from '@/features/expenses/components/EmojiPicker';

const COLOR_PRESETS = [
  '#FF7675', '#74B9FF', '#FD79A8', '#6C5CE7', '#FDCB6E', '#55EFC4',
  '#00B894', '#0984E3', '#E17055', '#A29BFE', '#E84393', '#636E72',
  '#00FFAB', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#F0E68C', '#98FB98', '#87CEEB',
];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { data: categories = [], isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const togglePinMutation = useTogglePinCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#00FFAB',
    type: TransactionType.EXPENSE,
  });

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  const openAddForm = (type: TransactionType) => {
    setFormData({ name: '', icon: '📦', color: '#00FFAB', type: type });
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEditForm = (cat: Category) => {
    setFormData({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type });
    setEditTarget(cat);
    setFormOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, input: formData });
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
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1 font-[var(--font-brand)] uppercase tracking-wider">
          {t('categories.title')}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {t('categories.subtitle')}
        </p>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="w-full h-1 bg-[var(--color-surface-2)] overflow-hidden">
          <div className="h-full bg-[var(--color-primary)] animate-progress origin-left" />
        </div>
      )}
      {isError && (
        <div className="bg-[var(--color-accent)]/10 border-2 border-[var(--color-accent)] text-[var(--color-accent)] p-4">
          {t('categories.failedToLoad')}
        </div>
      )}

      {/* Expense Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-[var(--color-expense)]" />
            {t('transactions.expense')}
          </h2>
          <button
            onClick={() => openAddForm(TransactionType.EXPENSE)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> {t('common.add')}
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
            <div className="col-span-full py-4 text-center text-[var(--color-text-muted)] italic">
              {t('empty.noExpenseCategories')}
            </div>
          )}
        </div>
      </div>

      <hr className="border-dashed border-[var(--color-border)]" />

      {/* Income Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 bg-[var(--color-income)]" />
            {t('transactions.income')}
          </h2>
          <button
            onClick={() => openAddForm(TransactionType.INCOME)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> {t('common.add')}
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
            <div className="col-span-full py-4 text-center text-[var(--color-text-muted)] italic">
              {t('empty.noIncomeCategories')}
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
            <div className="relative bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[6px_6px_0px_0px_var(--color-primary)] w-full max-w-sm animate-fade-in flex flex-col">
                <div className="flex items-center justify-between p-5 border-b-2 border-[var(--color-border)]">
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-wider font-[var(--font-brand)]">
                        {editTarget ? t('categories.editCategory') : t('categories.newCategory')}
                    </h2>
                    <button 
                        onClick={() => setFormOpen(false)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Type Selection */}
                    <div className="flex border-2 border-[var(--color-border)]">
                         <button
                            type="button"
                            onClick={() => setFormData({...formData, type: TransactionType.EXPENSE})}
                            className={`flex-1 py-1.5 text-sm font-bold uppercase tracking-wider transition-all ${
                                formData.type === TransactionType.EXPENSE 
                                ? 'bg-[var(--color-expense)] text-white' 
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                            }`}
                        >
                            {t('transactions.expense')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, type: TransactionType.INCOME})}
                            className={`flex-1 py-1.5 text-sm font-bold uppercase tracking-wider transition-all border-l-2 border-[var(--color-border)] ${
                                formData.type === TransactionType.INCOME 
                                ? 'bg-[var(--color-income)] text-[var(--color-text-inverse)]' 
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                            }`}
                        >
                            {t('transactions.income')}
                        </button>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1.5 ml-1">{t('categories.categoryName')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="brutal-input w-full px-4 py-2.5"
                            placeholder={t('categories.categoryNamePlaceholder')}
                            required
                        />
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1.5 ml-1">{t('categories.icon')}</label>
                        <div className="relative" ref={emojiPickerRef}>
                            {/* Trigger button — shows current emoji */}
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker((v) => !v)}
                                className={`w-14 h-14 flex items-center justify-center text-3xl border-2 transition-all ${
                                    showEmojiPicker
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[2px_2px_0px_0px_var(--color-primary)]'
                                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-2)]'
                                }`}
                                title={t('categories.icon')}
                            >
                                {formData.icon}
                            </button>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-bold mt-1 ml-1 uppercase tracking-wider">
                                {showEmojiPicker ? t('categories.clickToClose') : t('categories.clickToChange')}
                            </p>

                            {/* Emoji picker popover */}
                            {showEmojiPicker && (
                                <div className="absolute left-0 top-[calc(100%+8px)] z-50">
                                    <EmojiPicker
                                        value={formData.icon}
                                        onChange={(emoji) => {
                                            setFormData({ ...formData, icon: emoji });
                                            setShowEmojiPicker(false);
                                        }}
                                        onClose={() => setShowEmojiPicker(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-1.5 ml-1">{t('categories.color')}</label>

                        {/* Preview swatch + current hex */}
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 border-2 border-[var(--color-border)] flex-shrink-0"
                                style={{ backgroundColor: formData.color }}
                            />
                            <span className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider font-mono">
                                {formData.color.toUpperCase()}
                            </span>
                        </div>

                        {/* Preset swatches */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-7 h-7 transition-all border-2 flex-shrink-0 ${
                                        formData.color.toLowerCase() === color.toLowerCase()
                                        ? 'border-[var(--color-text-primary)] scale-110 shadow-[1px_1px_0px_0px_var(--color-border)]'
                                        : 'border-transparent hover:scale-110 hover:border-[var(--color-border)]'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>

                        {/* Custom color input */}
                        <label className="flex items-center gap-2 cursor-pointer group w-fit">
                            <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface)] transition-colors group-hover:bg-[var(--color-surface-2)]">
                                <Pipette size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                                <span className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] uppercase tracking-wider">
                                    {t('categories.customColor')}
                                </span>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-0 h-0 opacity-0 absolute"
                                />
                            </div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setFormOpen(false)}
                            className="px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] transition-colors uppercase tracking-wider"
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.name.trim() || loading}
                            className="brutal-btn px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.saving') : editTarget ? t('categories.saveChanges') : t('categories.createCategory')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('categories.deleteCategory')}
        message={t('categories.deleteCategoryMsg', { name: deleteTarget?.name || '' })}
        confirmLabel={deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
        cancelLabel={t('common.cancel')}
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
        className={`group relative bg-[var(--color-surface)] border-2 transition-all duration-200 overflow-hidden
            ${category.isPinned ? 'border-[var(--color-primary)] shadow-[3px_3px_0px_0px_var(--color-primary)]' : 'border-[var(--color-border)] brutal-hover'}
            ${isDefault ? 'opacity-90' : ''}
        `}
    >
      <div className="p-4 text-center pb-3">
          {/* Badge */}
          <div className="absolute top-2 right-2 z-10">
             {isDefault ? (
                 <Lock size={12} className="text-[var(--color-text-muted)]" />
             ) : category.isPinned ? (
                 <Pin size={12} className="text-[var(--color-primary)] fill-[var(--color-primary)] transform rotate-45" />
             ) : null}
          </div>

          {!isDefault && (
              <div className="absolute top-2 right-2 left-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPin(category); }}
                    className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                  >
                      <Pin size={12} className={category.isPinned ? "fill-[var(--color-primary)]" : ""} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                    className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:text-[var(--color-secondary)] hover:border-[var(--color-secondary)]"
                  >
                      <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(category); }}
                    className="p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]"
                  >
                      <Trash2 size={12} />
                  </button>
              </div>
          )}

          {/* Icon */}
          <div 
             className="w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl transition-transform group-hover:scale-110 border-2 border-[var(--color-border)]"
             style={{ backgroundColor: `${category.color}20` }}
          >
              {category.icon}
          </div>
          
          {/* Name */}
          <p className="text-xs font-bold text-[var(--color-text-secondary)] truncate px-1">
              {category.name}
          </p>
      </div>

      {/* Color Bar */}
      <div className="h-1 w-full" style={{ backgroundColor: category.color }} />
    </div>
  );
}
