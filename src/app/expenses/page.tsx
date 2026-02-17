'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { 
  StatCard, 
  EmptyState, 
  GlobalLoader 
} from '@/presentation/components/common';
import {
  TransactionRow,
  ExpensePieChart,
  OverviewChart,
  CalendarPanel,
  TransactionForm,
} from '@/presentation/components/expenses';
import { formatCurrency } from '@/lib/formatters';
import { StatementSource, TransactionType } from '@/domain/enums';
import {
  useTransactions,
  useTransactionSummary,
  useAccounts,
  useCategories,
  useCreateTransaction,
} from '@/presentation/hooks';

export default function ExpenseDashboardPage() {
  // Fetch summary for all time
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useTransactionSummary();

  // Fetch recent transactions (grabbing more to populate charts)
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useTransactions({ pageSize: 500 }); // Increased for better chart data

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();

  const [formOpen, setFormOpen] = useState(false);

  const transactions = transactionsData?.data || [];
  const isLoading = isSummaryLoading || isTransactionsLoading;
  const isError = isSummaryError || isTransactionsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        source: StatementSource.MANUAL,
      });
      setFormOpen(false);
    } catch (error) {
      console.error('Failed to create transaction', error);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Dashboard 📊
        </h1>
        <p className="text-gray-500">
          Here&apos;s what&apos;s happening with your money
        </p>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress origin-left" />
        </div>
      )}
      
      {isError && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">Failed to load dashboard data</span>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <StatCard
              title="Total Income"
              value={formatCurrency(summary?.totalIncome || 0)}
              icon={<TrendingUp className="text-white w-6 h-6" />}
              gradient="linear-gradient(135deg, #00CEC9 0%, #00B894 100%)"
              trend={{ value: 'All time', positive: true }}
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary?.totalExpense || 0)}
              icon={<TrendingDown className="text-white w-6 h-6" />}
              gradient="linear-gradient(135deg, #FF7675 0%, #D63031 100%)"
              trend={{ value: 'All time', positive: false }}
            />
            <StatCard
              title="Balance"
              value={formatCurrency(summary?.balance || 0)}
              icon={<Wallet className="text-white w-6 h-6" />}
              gradient="linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)"
              trend={{
                value: 'Net Worth',
                positive: (summary?.balance || 0) >= 0,
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Panel - 7/12 on large */}
            <div className="lg:col-span-7">
              <CalendarPanel transactions={transactions} />
            </div>

            {/* Pie Chart - 5/12 on large */}
            <div className="lg:col-span-5">
              <ExpensePieChart transactions={transactions} />
            </div>

            {/* Overview Chart - Full width */}
            <div className="lg:col-span-12">
              <OverviewChart transactions={transactions} />
            </div>
          </div>

          {/* Recent transactions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Transactions 💸
              </h2>
              <Link 
                href="/expenses/transactions" 
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All
              </Link>
            </div>

            {transactions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {transactions.slice(0, 5).map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onEdit={() => {}} // Read-only view in dashboard
                    onDelete={() => {}} // Read-only view in dashboard
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="🤷‍♂️"
                title="No transactions yet"
                description="Start by adding your first transaction or uploading a bank statement!"
                actionLabel="Add Transaction"
                onAction={() => setFormOpen(true)}
              />
            )}
          </div>
        </>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        accounts={accounts}
        categories={categories}
        loading={createMutation.isPending}
      />
    </div>
  );
}
