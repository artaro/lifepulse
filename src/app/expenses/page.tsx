"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/shared/components";
import {
  TransactionItem,
  OverviewChart,
  CalendarPanel,
  TransactionForm,
  AccountBalanceList,
} from "@/features/expenses/components";
import { StatementSource } from "@/features/expenses/types";
import { useTranslation } from "@/shared/lib/i18n";
import {
  useTransactions,
  useAccounts,
  useCategories,
  useCreateTransaction,
} from "@/features/expenses";

export default function ExpenseDashboardPage() {
  const { t } = useTranslation();

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useTransactions({ pageSize: 500 });

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();

  const [formOpen, setFormOpen] = useState(false);

  const transactions = transactionsData?.data || [];
  const isLoading = isTransactionsLoading;
  const isError = isTransactionsError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        accountId: data.accountId,
        categoryId: data.categoryId || null,
        type: data.type,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        source: StatementSource.MANUAL,
        destinationAccountId: data.destinationAccountId || null,
      });
      setFormOpen(false);
    } catch (error) {
      console.error("Failed to create transaction", error);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1 font-[var(--font-brand)] uppercase tracking-wider">
          {t("dashboard.title")}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="w-full h-1 bg-[var(--color-surface-2)] overflow-hidden">
          <div className="h-full bg-[var(--color-primary)] animate-progress origin-left" />
        </div>
      )}

      {isError && (
        <div className="bg-[var(--color-accent)]/10 border-2 border-[var(--color-accent)] text-[var(--color-accent)] p-4 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">{t("dashboard.failedToLoad")}</span>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <OverviewChart transactions={transactions} />
            </div>
            <div className="lg:col-span-8">
              <CalendarPanel transactions={transactions} />
            </div>
            <div className="lg:col-span-4 h-full">
              <AccountBalanceList accounts={accounts} />
            </div>
          </div>

          {/* Recent transactions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider">
                {t("dashboard.recentTransactions")}
              </h2>
              <Link
                href="/expenses/transactions"
                className="text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 px-3 py-1.5 transition-colors border-2 border-[var(--color-primary)] uppercase tracking-wider"
              >
                {t("common.viewAll")}
              </Link>
            </div>

            {transactions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {transactions.slice(0, 5).map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    showActions={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="🤷‍♂️"
                title={t("empty.noTransactions")}
                description={t("empty.noTransactionsDesc")}
                actionLabel={t("empty.addTransaction")}
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
