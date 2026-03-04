"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { TransactionForm } from "@/features/expenses/components";
import TransactionsListCards from "@/features/expenses/components/TransactionsListCards";
import { EmptyState, ContentList } from "@/shared/components";
import { TransactionType, StatementSource } from "@/features/expenses/types";
import { Transaction } from "@/features/expenses/types";
import {
  useTransactions,
  useAccounts,
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/features/expenses";
import { useTranslation } from "@/shared/lib/i18n";

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TransactionType>(
    TransactionType.EXPENSE,
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [page, setPage] = useState(1);

  // Data fetching
  const {
    data: transactionData,
    isLoading,
    isError,
  } = useTransactions({
    search: searchQuery || undefined,
    type: filterType,
    categoryId: filterCategory || undefined,
    accountId: filterAccount || undefined,
    month: filterMonth ? parseInt(filterMonth) : undefined,
    year: filterYear ? parseInt(filterYear) : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const transactions = transactionData?.data || [];
  const meta = transactionData?.meta;

  // Filtered categories helper
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories],
  );
  const filteredCategories =
    filterType === TransactionType.INCOME
      ? incomeCategories
      : filterType === TransactionType.EXPENSE
        ? expenseCategories
        : [];

  const totalItem = meta?.total_item || 0;
  const totalPage = meta?.total_page || 1;

  // --- Handlers ---

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
      console.error("Failed to create transaction", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (data: any) => {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({
        id: editTarget.id,
        input: { ...data },
      });
      setFormOpen(false);
      setEditTarget(null);
    } catch (error) {
      console.error("Failed to update transaction", error);
    }
  };

  const handleEditInteraction = (tx: Transaction) => {
    setEditTarget(tx);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  // --- Handlers ---

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const resetPage = () => setPage(1);

  // Current year to populate year dropdown up to a few years back
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // Clear all filters
  const hasActiveFilters =
    searchQuery !== "" ||
    filterCategory !== "" ||
    filterAccount !== "" ||
    filterMonth !== "" ||
    filterYear !== "";
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterType(TransactionType.EXPENSE);
    setFilterCategory("");
    setFilterAccount("");
    setFilterMonth("");
    setFilterYear("");
    setPage(1);
  };

  return (
    <div className="animate-fade-in relative">
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
        <ContentList
          page={page}
          totalPage={totalPage}
          totalItem={totalItem}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isLoading={isLoading}
          isError={isError}
          errorMessage={t("transactions.failedToLoad")}
          showingLabel={
            totalItem > 0
              ? t("transactions.showing", {
                  from: totalItem > 0 ? (page - 1) * PAGE_SIZE + 1 : 0,
                  to: Math.min(page * PAGE_SIZE, totalItem),
                  total: totalItem,
                })
              : undefined
          }
          filterSection={
            <div className="sticky top-16 z-30 px-4 md:px-6 py-2.5 bg-[var(--color-surface)]/95 backdrop-blur-xl border-b-2 border-[var(--color-border)] transition-all duration-300">
              {/* Row 1: Search → Type tabs → Month → Year */}
              <div className="flex justify-center items-center gap-2 mb-2 w-full">
                {/* Search Bar (primary — flex-1) */}
                <div className="relative flex-1 min-w-[120px]">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <input
                    type="text"
                    placeholder={t("common.search")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="brutal-input w-full pl-8 pr-3 py-1.5 text-sm"
                  />
                </div>

                {/* Type tabs */}
                <div className="flex border-2 border-[var(--color-border)] flex-shrink-0">
                  <button
                    onClick={() => {
                      setFilterType(TransactionType.EXPENSE);
                      resetPage();
                    }}
                    className={`px-3 py-1 text-xs font-bold transition-all ${
                      filterType === TransactionType.EXPENSE
                        ? "bg-[var(--color-expense)] text-white"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                    }`}
                  >
                    {t("transactions.expense")}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType(TransactionType.INCOME);
                      resetPage();
                    }}
                    className={`px-3 py-1 text-xs font-bold transition-all border-l-2 border-[var(--color-border)] ${
                      filterType === TransactionType.INCOME
                        ? "bg-[var(--color-income)] text-[var(--color-text-inverse)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                    }`}
                  >
                    {t("transactions.income")}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType(TransactionType.TRANSFER);
                      resetPage();
                    }}
                    className={`px-3 py-1 text-xs font-bold transition-all border-l-2 border-[var(--color-border)] ${
                      filterType === TransactionType.TRANSFER
                        ? "bg-[var(--color-transfer)] text-black"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                    }`}
                  >
                    {t("transactions.transfer")}
                  </button>
                </div>

                {/* Month / Year (desktop) */}
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setPage(1);
                  }}
                  className="hidden md:block brutal-input px-2 py-1.5 text-sm font-medium cursor-pointer"
                >
                  <option value="">{t("common.allMonths")}</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString("default", {
                        month: "short",
                      })}
                    </option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setPage(1);
                  }}
                  className="hidden md:block brutal-input px-2 py-1.5 text-sm font-medium cursor-pointer w-20"
                >
                  <option value="">{t("common.allYears")}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Expanded Filters */}
              <div className="flex justify-center flex-wrap items-center gap-2 pt-2 border-t-2 border-[var(--color-border)] animate-fade-in">
                {/* Mobile-only Month/Year */}
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setPage(1);
                  }}
                  className="md:hidden brutal-input px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                >
                  <option value="">
                    {t("common.allMonths") || "All Months"}
                  </option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString("default", {
                        month: "short",
                      })}
                    </option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setPage(1);
                  }}
                  className="md:hidden brutal-input px-2.5 py-1.5 text-xs font-medium cursor-pointer w-20"
                >
                  <option value="">
                    {t("common.allYears") || "All Years"}
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  value={filterAccount}
                  onChange={(e) => {
                    setFilterAccount(e.target.value);
                    setPage(1);
                  }}
                  className="brutal-input px-2.5 py-1.5 text-xs font-medium min-w-[100px] cursor-pointer"
                >
                  <option value="">{t("transactions.allAccounts")}</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                {filterType !== TransactionType.TRANSFER && (
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setPage(1);
                    }}
                    className="brutal-input px-2.5 py-1.5 text-xs font-medium min-w-[110px] cursor-pointer"
                  >
                    <option value="">{t("transactions.allCategories")}</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)] transition-colors flex-shrink-0 uppercase tracking-wider"
                  >
                    <X size={12} />
                    {t("transactions.clearFilters")}
                  </button>
                )}
              </div>
            </div>
          }
        >
          {!isLoading && !isError && transactions.length > 0 ? (
            <TransactionsListCards
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              onEditTransaction={handleEditInteraction}
              onDeleteTransaction={handleDelete}
              selectedType={null}
            />
          ) : !isLoading && !isError ? (
            <EmptyState
              emoji="🔍"
              title={t("empty.noSearchResults")}
              description={t("empty.noSearchResultsDesc")}
              actionLabel={t("empty.addTransaction")}
              onAction={() => setFormOpen(true)}
            />
          ) : null}
        </ContentList>

        {/* Transaction form */}
        <TransactionForm
          open={formOpen}
          onClose={handleFormClose}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          accounts={accounts}
          categories={categories}
          initialData={
            editTarget
              ? {
                  accountId: editTarget.accountId,
                  categoryId: editTarget.categoryId || "",
                  type: editTarget.type,
                  amount: editTarget.amount,
                  description: editTarget.description || "",
                  transactionDate: editTarget.transactionDate.split("T")[0],
                }
              : undefined
          }
          loading={createMutation.isPending || updateMutation.isPending}
          isEdit={!!editTarget}
        />
      </div>
    </div>
  );
}
