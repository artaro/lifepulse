import { TransactionType } from '@/domain/enums';

export interface DefaultCategory {
  id: string; // Added ID field
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expenses
  { id: '0e7bb841-b7b5-4d89-a23c-bd7a3aa47ffa', name: 'Food & Drinks', icon: '🍔', color: '#FF7675', type: TransactionType.EXPENSE },
  { id: '71aa302f-70ef-4e52-88eb-6e2b796e4300', name: 'Housing', icon: '🏠', color: '#74B9FF', type: TransactionType.EXPENSE },
  { id: '0808bce7-863f-437b-b897-75acabd97dba', name: 'Travel', icon: '✈️', color: '#0984E3', type: TransactionType.EXPENSE },
  { id: '10519af7-3c28-47a1-8108-359f16daf32e', name: 'Pet', icon: '🐾', color: '#FAB1A0', type: TransactionType.EXPENSE },
  { id: '65f09844-9053-44c5-adb8-bf452d9f422f', name: 'Health', icon: '💊', color: '#55EFC4', type: TransactionType.EXPENSE },
  { id: '5ff8d915-17d3-4083-8abf-ace387073d67', name: 'Subscription', icon: '🔄', color: '#A29BFE', type: TransactionType.EXPENSE },
  { id: 'd82aaacc-474a-4db5-9258-1c075618db20', name: 'Entertainment', icon: '🎬', color: '#E84393', type: TransactionType.EXPENSE },
  { id: 'e3edb040-f708-4374-851d-6c2bc02e6537', name: 'Clothing', icon: '👕', color: '#6C5CE7', type: TransactionType.EXPENSE },
  { id: '25e64376-a815-4551-8df4-efc09445803a', name: 'Education', icon: '📚', color: '#FDCB6E', type: TransactionType.EXPENSE },
  { id: '4a41570b-a6cd-403b-b3c4-601c5ac68f79', name: 'Gift', icon: '🎁', color: '#FD79A8', type: TransactionType.EXPENSE },
  { id: '32dabbfd-5c37-4def-85a9-426bff8f69d4', name: 'Fill in later', icon: '❓', color: '#B2BEC3', type: TransactionType.EXPENSE },

  // Income
  { id: '4cf733c2-4e02-461e-ae65-8c32b3af1891', name: 'Salary', icon: '💰', color: '#00B894', type: TransactionType.INCOME },
  { id: '553c31f9-57fa-4f1a-8e49-7cd5fef7086d', name: 'Bonus', icon: '🎉', color: '#FDCB6E', type: TransactionType.INCOME },
  { id: 'e77f6c3d-5516-42ab-88ca-02106390ffe9', name: 'Investment', icon: '📈', color: '#6C5CE7', type: TransactionType.INCOME },
  { id: 'a537a81c-22b4-4d01-b24c-e56ad5ba05a6', name: 'Fill in later', icon: '❓', color: '#B2BEC3', type: TransactionType.INCOME },
];
