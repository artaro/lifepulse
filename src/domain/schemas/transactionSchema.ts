import { z } from 'zod';
import { TransactionType } from '@/domain/enums';

export const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  amount: z
    .number({ error: 'Amount must be a valid number' })
    .positive('Amount must be greater than 0'),
  description: z.string().optional(),
  transactionDate: z.string().min(1, 'Date is required'),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
