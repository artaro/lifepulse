// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    TRANSFER = 'transfer',
}

export enum AccountType {
    BANK = 'bank',
    CREDIT_CARD = 'credit_card',
}

export enum BudgetPeriod {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum StatementSource {
    MANUAL = 'manual',
    CSV_IMPORT = 'csv_import',
    LLM_IMPORT = 'llm_import',
}

// ─── Account ──────────────────────────────────────────────────────────────────

export interface Account {
    id: string;
    userId: string;
    name: string;
    type: AccountType;
    balance: number;
    bankName: string | null;
    accountNumberLast4: string | null;
    creditLimit?: number | null;
    pendingCharges?: number | null;
    createdAt: string;
}

export interface CreateAccountInput {
    name: string;
    type: AccountType;
    balance?: number;
    bankName?: string;
    accountNumberLast4?: string;
    creditLimit?: number;
}

export interface UpdateAccountInput {
    name?: string;
    type?: AccountType;
    balance?: number;
    bankName?: string;
    accountNumberLast4?: string;
    creditLimit?: number;
}

// ─── Category ─────────────────────────────────────────────────────────────────

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

// ─── Transaction ──────────────────────────────────────────────────────────────

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
    destinationAccountId: string | null;
    createdAt: string;
    updatedAt: string;
    category?: Category;
    account?: Account;
    destinationAccount?: Account;
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
    destinationAccountId?: string;
}

export interface UpdateTransactionInput {
    accountId?: string;
    categoryId?: string | null;
    type?: TransactionType;
    amount?: number;
    description?: string;
    transactionDate?: string;
    destinationAccountId?: string | null;
}

export interface TransactionFilter {
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginationMeta {
    total_item: number;
    total_page: number;
    page: number;
    row_per_page: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
}

// ─── Budget Goal ──────────────────────────────────────────────────────────────

export interface BudgetGoal {
    id: string;
    userId: string;
    categoryId: string | null;
    targetAmount: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    category?: Category;
}

export interface CreateBudgetGoalInput {
    categoryId?: string;
    targetAmount: number;
    period: BudgetPeriod;
    startDate: string;
    endDate?: string;
}

export interface UpdateBudgetGoalInput {
    categoryId?: string | null;
    targetAmount?: number;
    period?: BudgetPeriod;
    startDate?: string;
    endDate?: string;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

import { z } from 'zod';

export const transactionSchema = z.object({
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().optional(),
    destinationAccountId: z.string().optional(),
    type: z.nativeEnum(TransactionType),
    amount: z
        .number({ error: 'Amount must be a valid number' })
        .positive('Amount must be greater than 0'),
    description: z.string().optional(),
    transactionDate: z.string().min(1, 'Date is required'),
}).superRefine((data, ctx) => {
    if (data.type === TransactionType.TRANSFER) {
        if (!data.destinationAccountId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['destinationAccountId'],
                message: 'Destination account is required for transfers',
            });
        }
        if (data.accountId === data.destinationAccountId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['destinationAccountId'],
                message: 'Cannot transfer to the same account',
            });
        }
    } else {
        if (!data.categoryId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['categoryId'],
                message: 'Category is required for income and expense',
            });
        }
    }
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
