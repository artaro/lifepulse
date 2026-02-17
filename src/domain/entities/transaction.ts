import { TransactionType } from '../enums/transactionType';
import { StatementSource } from '../enums/statementSource';
import { Category } from './category';
import { Account } from './account';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
  source: StatementSource;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined relations (optional, populated when fetched with joins)
  category?: Category;
  account?: Account;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate: string;
  source?: StatementSource;
  referenceId?: string;
}

export interface UpdateTransactionInput {
  accountId?: string;
  categoryId?: string | null;
  type?: TransactionType;
  amount?: number;
  description?: string;
  transactionDate?: string;
}

export interface TransactionFilter {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}
