import { supabase } from '@/data/datasources/supabase';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/domain/entities';
import { DEFAULT_CATEGORIES } from '@/data/defaults/defaultCategories';

function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

export const categoryRepository = {
  async getAll(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('use_count', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    const userCategories = (data || []).map((row) => toCamelCase<Category>(row as Record<string, unknown>));

    // Merge hardcoded system defaults (always first)
    const systemCategories: Category[] = DEFAULT_CATEGORIES.map(def => ({
      ...def,
      userId: '',
      isDefault: true,
      isPinned: false,
      useCount: 0,
      createdAt: '',
    }));

    // Final order: system → pinned → frequent → alphabetical
    return [...systemCategories, ...userCategories];
  },

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data ? toCamelCase<Category>(data as Record<string, unknown>) : null;
  },

  async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...toSnakeCase(input as unknown as Record<string, unknown>),
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamelCase<Category>(data as Record<string, unknown>);
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(toSnakeCase(input as unknown as Record<string, unknown>))
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamelCase<Category>(data as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async togglePin(id: string, isPinned: boolean): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ is_pinned: isPinned })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async incrementUseCount(id: string): Promise<void> {
    // Use rpc or raw update
    const { error } = await supabase.rpc('increment_category_use_count', { category_id: id });

    // Fallback: if RPC doesn't exist, do manual increment
    if (error) {
      const { data } = await supabase
        .from('categories')
        .select('use_count')
        .eq('id', id)
        .single();

      if (data) {
        await supabase
          .from('categories')
          .update({ use_count: ((data as Record<string, unknown>).use_count as number || 0) + 1 })
          .eq('id', id);
      }
    }
  },
};
