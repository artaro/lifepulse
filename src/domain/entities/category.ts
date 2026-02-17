import { TransactionType } from '@/domain/enums';

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  isPinned: boolean;
  useCount: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
  type?: TransactionType;
  isDefault?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  type?: TransactionType;
  isDefault?: boolean;
}
