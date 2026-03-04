"use client";

import React, { useState } from "react";
import { Account, Category } from "@/features/expenses/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { FileUploadZone, CentralModal } from "@/shared/components";
import ImportPreviewCards from "./ImportPreviewCards";
import {
  AlertCircle,
  FileText,
  Loader2,
  RotateCcw,
  ArrowRight,
  Trash2,
  Send,
} from "lucide-react";
import { useUIStore } from "@/shared/stores";
import { useTranslation } from "@/shared/lib/i18n";
import { ConfirmDialog } from "@/shared/components";
import { useStatementImport } from "../hooks/useStatementImport";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
}

export default function ImportDialog({
  open,
  onClose,
  accounts,
  categories,
}: ImportDialogProps) {
  const { showSnackbar } = useUIStore();
  const { t } = useTranslation();
  const [targetAccountId, setTargetAccountId] = useState<string>("");

  // Selection & Batch State (Lifted from ImportPreviewCards)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [batchCategory, setBatchCategory] = useState<string>("");
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const FILL_IN_LATER_CATEGORY = "a537a81c-22b4-4d01-b24c-e56ad5ba05a6";

  const {
    file,
    status,
    transactions,
    setTransactions,
    pdfPassword: password,
    setPdfPassword: setPassword,
    handleFileSelect,
    reset,
    parseWithLLM: handleParse,
    importTransactions: handleImport,
    hasLastImport,
    loadLastImport,
  } = useStatementImport();

  // Auto-assign fill-in-later category to all uncategorized transactions
  const autoAssignCategory = (txs: typeof transactions) => {
    return txs.map((tx) => ({
      ...tx,
      category: tx.category || FILL_IN_LATER_CATEGORY,
    }));
  };

  const handleClose = () => {
    reset();
    setTargetAccountId("");
    setSelectedIndices(new Set());
    setShowReview(false);
    setShowCloseConfirm(false);
    onClose();
  };

  // Guard backdrop click — confirm if there's parsed data
  const handleBackdropClick = () => {
    if (status === "ready" && transactions.length > 0) {
      setShowCloseConfirm(true);
    } else {
      handleClose();
    }
  };

  // --- Start Over with Confirm ---
  const handleStartOverClick = () => {
    setShowStartOverConfirm(true);
  };

  const handleConfirmStartOver = () => {
    setShowStartOverConfirm(false);
    setShowReview(false);
    reset();
  };

  // --- Batch Handlers ---
  const handleSelectOne = (index: number) => {
    // Enforce single type selection logic
    const currentSelectedType = getSelectedType();
    const newTxType = transactions[index].type;

    if (
      currentSelectedType &&
      currentSelectedType !== newTxType &&
      selectedIndices.size > 0
    ) {
      return;
    }

    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const getSelectedType = (): "income" | "expense" | null => {
    if (selectedIndices.size === 0) return null;
    const firstIdx = Array.from(selectedIndices)[0];
    return transactions[firstIdx]?.type || null;
  };

  const handleSelectAllOfType = (
    type: "income" | "expense",
    indices: number[],
  ) => {
    const currentSelectedType = getSelectedType();
    if (currentSelectedType && currentSelectedType !== type) return;

    // Check if all are currently selected
    const allSelected = indices.every((i) => selectedIndices.has(i));
    const next = new Set(selectedIndices);

    if (allSelected) {
      indices.forEach((i) => next.delete(i));
    } else {
      indices.forEach((i) => next.add(i));
    }
    setSelectedIndices(next);
  };

  const handleBatchCategoryChange = (categoryId: string) => {
    if (!categoryId) return;
    const next = [...transactions];
    selectedIndices.forEach((i) => {
      next[i] = { ...next[i], category: categoryId };
    });
    setTransactions(next);
    setBatchCategory("");
    setSelectedIndices(new Set());
  };

  const handleDeleteBatch = () => {
    if (confirm(t("import.deleteSelected", { count: selectedIndices.size }))) {
      const next = transactions.filter((_, i) => !selectedIndices.has(i));
      setTransactions(next);
      setSelectedIndices(new Set());
    }
  };

  // Show review step
  const handleShowReview = () => {
    if (!targetAccountId) {
      showSnackbar(t("import.selectAccountFirst"), "error");
      return;
    }
    // Auto-assign category before review
    setTransactions(autoAssignCategory(transactions));
    setShowReview(true);
  };

  const onImport = async () => {
    if (!targetAccountId) {
      showSnackbar(t("import.selectAccountFirst"), "error");
      return;
    }
    await handleImport(targetAccountId);
    handleClose();
    showSnackbar(t("import.importSuccess"), "success");
  };

  // Review summary calculations
  const reviewExpenses = transactions.filter((tx) => tx.type === "expense");
  const reviewIncomes = transactions.filter((tx) => tx.type === "income");
  const reviewExpenseTotal = reviewExpenses.reduce((s, tx) => s + tx.amount, 0);
  const reviewIncomeTotal = reviewIncomes.reduce((s, tx) => s + tx.amount, 0);

  if (!open) return null;

  const selectedType = getSelectedType();

  // ── Derive current modal props based on state ──
  const getTitle = () => {
    if (selectedIndices.size > 0) return undefined;
    if (status === "ready" && showReview) return undefined;
    if (status === "ready") return undefined;
    return t("import.title");
  };

  const getTitleNode = () => {
    if (selectedIndices.size > 0) {
      return (
        <div className="flex items-center gap-3">
          <span className="bg-[var(--color-primary)] text-[var(--color-surface)] px-3 py-1 border-2 border-[var(--color-border)] shadow-[2px_2px_0px_0px_var(--color-border)] font-bold uppercase tracking-wider text-xs">
            {selectedIndices.size} {t("common.selected")}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
            {selectedType === "income"
              ? t("transactions.income")
              : t("transactions.expense")}
          </span>
        </div>
      );
    }
    if (status === "ready" && showReview) {
      return (
        <span className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider">
          📋 {t("import.reviewTitle")}
        </span>
      );
    }
    if (status === "ready") {
      return (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              {t("import.targetAccount")}
            </span>
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="text-sm font-bold bg-transparent border-none p-0 pr-6 focus:ring-0 cursor-pointer text-[var(--color-text-primary)]"
            >
              <option value="">{t("import.selectAccount")}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-8 w-px bg-[var(--color-border)] mx-2" />
          <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2.5 py-0.5 border-2 border-[var(--color-primary)] text-xs font-bold uppercase tracking-wider">
            {transactions.length} {t("import.items")}
          </span>
        </div>
      );
    }
    return undefined;
  };

  const getHeaderAction = () => {
    if (selectedIndices.size > 0) {
      return (
        <div className="flex items-center gap-2">
          <select
            value={batchCategory}
            onChange={(e) => handleBatchCategoryChange(e.target.value)}
            className="text-sm py-1.5 pl-3 pr-8 border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] focus:ring-0 focus:border-[var(--color-primary)] min-w-[160px] font-bold"
          >
            <option value="">{t("transactions.setCategory")}</option>
            {categories
              .filter((c) => c.type === selectedType)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
          </select>
          <button
            onClick={handleDeleteBatch}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-expense)] hover:bg-[var(--color-expense)]/20 border-2 border-transparent hover:border-[var(--color-border)] transition-colors"
            title={t("common.delete")}
          >
            <Trash2 size={18} />
          </button>
          <div className="h-6 w-px bg-[var(--color-border)] mx-2" />
          <button
            onClick={() => setSelectedIndices(new Set())}
            className="text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] uppercase tracking-wider"
          >
            {t("common.cancel")}
          </button>
        </div>
      );
    }
    // No custom header action for other states — CentralModal shows X by default
    return undefined;
  };

  const getHeaderClassName = () => {
    if (selectedIndices.size > 0)
      return "bg-[var(--color-surface)] border-b-2 border-[var(--color-border)]";
    if (status === "ready" && showReview)
      return "bg-[var(--color-surface)] border-b-2 border-[var(--color-border)]";
    return "bg-[var(--color-surface)] border-b-2 border-[var(--color-border)]";
  };

  const getFooterNode = () => {
    if (status === "ready" && showReview) {
      return (
        <>
          <button
            onClick={() => setShowReview(false)}
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold hover:bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] uppercase tracking-wider transition-colors"
          >
            ← {t("common.back")}
          </button>
          <button
            onClick={onImport}
            disabled={!targetAccountId}
            className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-surface)] text-sm font-bold border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_var(--color-border)] flex items-center gap-2 uppercase tracking-wider"
          >
            {t("import.submit")} <Send size={16} />
          </button>
        </>
      );
    }
    if (status === "ready" && !showReview && selectedIndices.size === 0) {
      return (
        <>
          <button
            onClick={handleStartOverClick}
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold hover:bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] uppercase tracking-wider transition-colors"
          >
            {t("import.startOver")}
          </button>
          <button
            onClick={handleShowReview}
            disabled={!targetAccountId}
            className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-surface)] text-sm font-bold border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_var(--color-border)] flex items-center gap-2 uppercase tracking-wider"
          >
            {t("import.review")} <ArrowRight size={16} />
          </button>
        </>
      );
    }
    return undefined;
  };

  return (
    <>
      <CentralModal
        open={open}
        onClose={handleBackdropClick}
        size="xl"
        title={getTitle()}
        titleNode={getTitleNode()}
        headerAction={getHeaderAction()}
        headerClassName={getHeaderClassName()}
        footerNode={getFooterNode()}
      >
        {/* ── Idle: File Upload ── */}
        {status === "idle" && (
          <div className="max-w-xl mx-auto space-y-6">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              selectedFile={file}
              onClear={reset}
            />

            {file && (
              <div className="animate-fade-in space-y-4">
                {file.type === "application/pdf" && (
                  <div className="bg-[var(--color-secondary)]/10 border-2 border-[var(--color-secondary)] p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0" />
                    <div className="space-y-2 w-full">
                      <p className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide">
                        {t("import.passwordProtected")}
                      </p>
                      <input
                        type="password"
                        placeholder={t("import.enterPassword")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm focus:ring-0 focus:border-[var(--color-primary)] placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)] font-bold"
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleParse}
                  className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] text-[var(--color-surface)] font-bold border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_var(--color-border)] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <FileText size={18} />
                  {t("import.parseStatement")}
                </button>
              </div>
            )}

            {hasLastImport && !file && (
              <div className="flex justify-center">
                <button
                  onClick={loadLastImport}
                  className="text-sm text-[var(--color-text-primary)] font-bold border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] px-4 py-2 hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 uppercase tracking-wider"
                >
                  <RotateCcw size={14} />
                  {t("import.restoreLastSession")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Reading ── */}
        {status === "reading" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-wider font-[var(--font-brand)]">
                {t("import.analyzingStatement")}
              </h3>
              <p className="text-[var(--color-text-muted)] font-bold">
                {t("import.extractingWithAI")}
              </p>
            </div>
          </div>
        )}

        {/* ── Parsing ── */}
        {status === "parsing" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-wider font-[var(--font-brand)]">
                {t("import.structuringData")}
              </h3>
              <p className="text-[var(--color-text-muted)] font-bold">
                {t("import.almostThere")}
              </p>
            </div>
          </div>
        )}

        {/* ── Ready: Data Management ── */}
        {status === "ready" && !showReview && (
          <ImportPreviewCards
            transactions={transactions}
            onTransactionsChange={setTransactions}
            categories={categories}
            selectedIndices={selectedIndices}
            onSelectOne={handleSelectOne}
            onSelectAllOfType={handleSelectAllOfType}
            selectedType={selectedType}
          />
        )}

        {/* ── Ready: Review ── */}
        {status === "ready" && showReview && (
          <div className="animate-fade-in space-y-6">
            {/* Summary Panel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-surface)] border-2 border-[var(--color-income)] p-3">
                <div className="text-xs font-bold text-[var(--color-income)] uppercase tracking-wider mb-1">
                  {t("transactions.income")}
                </div>
                <div className="text-lg font-bold text-[var(--color-income)]">
                  +{formatCurrency(reviewIncomeTotal)}
                </div>
                <div className="text-xs text-[var(--color-income)] mt-0.5">
                  {reviewIncomes.length} {t("import.items")}
                </div>
              </div>
              <div className="bg-[var(--color-surface)] border-2 border-[var(--color-expense)] p-3">
                <div className="text-xs font-bold text-[var(--color-expense)] uppercase tracking-wider mb-1">
                  {t("transactions.expense")}
                </div>
                <div className="text-lg font-bold text-[var(--color-expense)]">
                  -{formatCurrency(reviewExpenseTotal)}
                </div>
                <div className="text-xs text-[var(--color-expense)] mt-0.5">
                  {reviewExpenses.length} {t("import.items")}
                </div>
              </div>
            </div>

            {/* Per-Category Breakdown */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] p-3">
              <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                {t("import.categoryBreakdown")}
              </div>
              <div className="space-y-1.5">
                {(() => {
                  const catMap = new Map<
                    string,
                    {
                      icon: string;
                      name: string;
                      income: number;
                      expense: number;
                    }
                  >();
                  transactions.forEach((tx) => {
                    const cat = categories.find((c) => c.id === tx.category);
                    const key = tx.category || "_none";
                    const existing = catMap.get(key) || {
                      icon: cat?.icon || "📦",
                      name: cat?.name || "-",
                      income: 0,
                      expense: 0,
                    };
                    if (tx.type === "income") existing.income += tx.amount;
                    else existing.expense += tx.amount;
                    catMap.set(key, existing);
                  });
                  return Array.from(catMap.entries()).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs font-bold"
                    >
                      <span className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
                        <span>{val.icon}</span>
                        <span className="uppercase tracking-wide">
                          {val.name}
                        </span>
                      </span>
                      <div className="flex items-center gap-3">
                        {val.income > 0 && (
                          <span className="text-[var(--color-income)] tracking-widest">
                            +{formatCurrency(val.income)}
                          </span>
                        )}
                        {val.expense > 0 && (
                          <span className="text-[var(--color-expense)] tracking-widest">
                            -{formatCurrency(val.expense)}
                          </span>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Income Table */}
            {reviewIncomes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[var(--color-income)]" />
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm tracking-widest uppercase">
                    {t("transactions.income")} ({reviewIncomes.length})
                  </h3>
                </div>
                <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] overflow-x-auto shadow-[4px_4px_0px_0px_var(--color-primary)]">
                  <table className="w-full text-xs font-bold">
                    <thead>
                      <tr className="bg-[var(--color-surface-2)] border-b-2 border-[var(--color-border)]">
                        <th className="text-left px-2 py-1.5 text-[var(--color-text-secondary)] whitespace-nowrap uppercase tracking-wider">
                          {t("txForm.date")}
                        </th>
                        <th className="text-left px-2 py-1.5 text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {t("txForm.category")}
                        </th>
                        <th className="text-left px-2 py-1.5 text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {t("txForm.description")}
                        </th>
                        <th className="text-right px-2 py-1.5 text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {t("txForm.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewIncomes.map((tx, i) => {
                        const cat = categories.find(
                          (c) => c.id === tx.category,
                        );
                        const d = new Date(
                          tx.date + (tx.time ? `T${tx.time}` : ""),
                        );
                        const dd = String(d.getDate()).padStart(2, "0");
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const yyyy = d.getFullYear();
                        const time = tx.time ? ` ${tx.time.slice(0, 5)}` : "";
                        const dateStr = `${dd}/${mm}/${yyyy}${time}`;
                        return (
                          <tr
                            key={i}
                            className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                          >
                            <td className="px-2 py-1.5 text-[var(--color-text-muted)] whitespace-nowrap">
                              {dateStr}
                            </td>
                            <td className="px-2 py-1.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[var(--color-text-primary)]">
                                {cat?.icon && <span>{cat.icon}</span>}
                                <span className="hidden md:inline uppercase tracking-wider">
                                  {cat?.name || "-"}
                                </span>
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-[var(--color-text-primary)] truncate max-w-[100px] md:max-w-[200px]">
                              {tx.description}
                            </td>
                            <td className="px-2 py-1.5 text-right text-[var(--color-income)] whitespace-nowrap tracking-wider">
                              +{formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[var(--color-primary)]/10 border-t-2 border-[var(--color-primary)]">
                        <td
                          colSpan={3}
                          className="px-2 py-1.5 text-[var(--color-primary)] text-xs uppercase tracking-widest"
                        >
                          {t("import.incomeTotal")}
                        </td>
                        <td className="px-2 py-1.5 text-right text-[var(--color-primary)] tracking-wider">
                          +{formatCurrency(reviewIncomeTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Expense Table */}
            {reviewExpenses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[var(--color-expense)]" />
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm tracking-widest uppercase">
                    {t("transactions.expense")} ({reviewExpenses.length})
                  </h3>
                </div>
                <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] overflow-x-auto shadow-[4px_4px_0px_0px_var(--color-primary)]">
                  <table className="w-full text-xs font-bold">
                    <thead>
                      <tr className="bg-[var(--color-surface-2)] border-b-2 border-[var(--color-border)]">
                        <th className="text-left px-2 py-1.5 text-[var(--color-text-secondary)] whitespace-nowrap uppercase tracking-wider">
                          {t("txForm.date")}
                        </th>
                        <th className="text-left px-2 py-1.5 text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {t("txForm.category")}
                        </th>
                        <th className="text-left px-2 py-1.5 text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {t("txForm.description")}
                        </th>
                        <th className="text-right px-2 py-1.5 text-[var(--color-text-secondary)] uppercase tracking-wider">
                          {t("txForm.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewExpenses.map((tx, i) => {
                        const cat = categories.find(
                          (c) => c.id === tx.category,
                        );
                        const d = new Date(
                          tx.date + (tx.time ? `T${tx.time}` : ""),
                        );
                        const dd = String(d.getDate()).padStart(2, "0");
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const yyyy = d.getFullYear();
                        const time = tx.time ? ` ${tx.time.slice(0, 5)}` : "";
                        const dateStr = `${dd}/${mm}/${yyyy}${time}`;
                        return (
                          <tr
                            key={i}
                            className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                          >
                            <td className="px-2 py-1.5 text-[var(--color-text-muted)] whitespace-nowrap">
                              {dateStr}
                            </td>
                            <td className="px-2 py-1.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[var(--color-text-primary)]">
                                {cat?.icon && <span>{cat.icon}</span>}
                                <span className="hidden md:inline uppercase tracking-wider">
                                  {cat?.name || "-"}
                                </span>
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-[var(--color-text-primary)] truncate max-w-[100px] md:max-w-[200px]">
                              {tx.description}
                            </td>
                            <td className="px-2 py-1.5 text-right text-[var(--color-expense)] whitespace-nowrap tracking-wider">
                              -{formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[var(--color-expense)]/10 border-t-2 border-[var(--color-expense)]">
                        <td
                          colSpan={3}
                          className="px-2 py-1.5 text-[var(--color-expense)] text-xs uppercase tracking-widest"
                        >
                          {t("import.expenseTotal")}
                        </td>
                        <td className="px-2 py-1.5 text-right text-[var(--color-expense)] tracking-wider">
                          -{formatCurrency(reviewExpenseTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-fade-in">
            <div className="w-16 h-16 bg-[var(--color-expense)]/20 text-[var(--color-expense)] border-2 border-[var(--color-expense)] flex items-center justify-center mb-2 mx-auto">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-wider font-[var(--font-brand)]">
                {t("import.errorTitle")}
              </h3>
              <p className="text-[var(--color-text-muted)] font-bold max-w-sm mx-auto">
                {t("import.errorDesc")}
              </p>
            </div>
            <button
              onClick={reset}
              className="px-6 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] font-bold border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_var(--color-border)] uppercase tracking-wider"
            >
              {t("import.tryAgain")}
            </button>
          </div>
        )}
      </CentralModal>

      {/* Start Over Confirm Modal */}
      <ConfirmDialog
        open={showStartOverConfirm}
        title={t("import.confirmStartOver")}
        message={t("import.confirmStartOverMsg")}
        confirmLabel={t("import.startOver")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleConfirmStartOver}
        onCancel={() => setShowStartOverConfirm(false)}
      />

      {/* Close Confirm */}
      <ConfirmDialog
        open={showCloseConfirm}
        title={t("import.confirmClose")}
        message={t("import.confirmCloseMsg")}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleClose}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </>
  );
}
