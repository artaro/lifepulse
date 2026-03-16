"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  DollarSign,
  ChevronDown,
  Zap,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { TransactionType, AccountType } from "@/features/expenses/types";
import {
  Account,
  Category,
  CreateTransactionInput,
} from "@/features/expenses/types";
import { useTranslation } from "@/shared/lib/i18n";
import { format } from "date-fns";
import { toLocalDateString, formatTime, toLocalISOString } from "@/shared/lib/formatters";

// ─── Smart Parser ─────────────────────────────────────────────────────────────

const INCOME_KEYWORDS = [
  'salary', 'เงินเดือน', 'receive', 'รับ', 'income', 'รายรับ',
  'bonus', 'โบนัส', 'refund', 'คืนเงิน', 'got', 'earn', 'dividend',
  'เงินปันผล', 'freelance', 'ค่าจ้าง', 'ขาย', 'sell', 'sold',
];

function parseSmartInput(
  raw: string,
  categories: Category[],
): {
  amount: string;
  description: string;
  categoryId: string;
  type: TransactionType;
} {
  const input = raw.trim();

  // 1. Extract amount — grab the first standalone number (supports commas & decimals)
  const amountMatch = input.match(
    /(?<![a-zA-Zก-๙])(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?![a-zA-Zก-๙%])/,
  );
  const amount = amountMatch
    ? parseFloat(amountMatch[0].replace(/,/g, ""))
    : null;

  // 2. Strip the matched amount to form the description
  const withoutAmount = amountMatch
    ? (input.slice(0, amountMatch.index) + input.slice((amountMatch.index ?? 0) + amountMatch[0].length))
        .replace(/\s+/g, " ")
        .trim()
    : input;

  // 3. Determine income vs expense from keywords
  const lower = input.toLowerCase();
  const isIncome = INCOME_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  const type = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;

  // 4. Match category — try user's category names against the input
  let categoryId = "";
  const pool = categories.filter((c) => c.type === type);
  for (const cat of pool) {
    if (lower.includes(cat.name.toLowerCase())) {
      categoryId = cat.id;
      break;
    }
  }

  return {
    amount: amount !== null ? String(amount) : "",
    description: withoutAmount,
    categoryId,
    type,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput) => void | Promise<void>;
  accounts: Account[];
  categories: Category[];
  initialData?: Partial<CreateTransactionInput>;
  loading?: boolean;
  isEdit?: boolean;
}

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  accounts,
  categories,
  initialData,
  loading = false,
  isEdit = false,
}: TransactionFormProps) {
  const { t } = useTranslation();
  const [smartMode, setSmartMode] = useState(false);
  const [smartInput, setSmartInput] = useState("");
  const [showSmartInfo, setShowSmartInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: TransactionType.EXPENSE,
    accountId: "",
    categoryId: "",
    destinationAccountId: "",
    transactionDate: "",
    transactionTime: "00:00",
  });

  // Close info popover when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowSmartInfo(false);
      }
    };
    if (showSmartInfo) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSmartInfo]);

  useEffect(() => {
    if (open) {
      setSmartInput("");
      if (initialData) {
        setFormData({
          description: initialData.description || "",
          amount: initialData.amount?.toString() || "",
          type: initialData.type || TransactionType.EXPENSE,
          accountId: initialData.accountId || "",
          categoryId: initialData.categoryId || "",
          destinationAccountId: initialData.destinationAccountId || "",
          transactionDate: initialData.transactionDate
            ? toLocalDateString(initialData.transactionDate)
            : format(new Date(), "yyyy-MM-dd"),
          transactionTime: initialData.transactionDate
            ? formatTime(initialData.transactionDate)
            : "00:00",
        });
      } else {
        setFormData({
          description: "",
          amount: "",
          type: TransactionType.EXPENSE,
          accountId: accounts.length > 0 ? accounts[0].id : "",
          categoryId: "",
          destinationAccountId: "",
          transactionDate: format(new Date(), "yyyy-MM-dd"),
          transactionTime: "00:00",
        });
      }
    }
  }, [open, initialData, accounts]);

  if (!open) return null;

  // Smart input change — parse on every keystroke
  const handleSmartInputChange = (value: string) => {
    setSmartInput(value);
    if (!value.trim()) return;
    const parsed = parseSmartInput(value, categories);
    setFormData((prev) => ({
      ...prev,
      amount: parsed.amount || prev.amount,
      description: parsed.description || prev.description,
      categoryId: parsed.categoryId || prev.categoryId,
      type: parsed.type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { transactionTime: _time, ...rest } = formData;
    const transactionDate = toLocalISOString(formData.transactionDate, _time);
    onSubmit({
      ...rest,
      amount: Number(rest.amount),
      transactionDate,
      destinationAccountId:
        rest.type === TransactionType.TRANSFER
          ? rest.destinationAccountId
          : null,
      categoryId:
        rest.type === TransactionType.TRANSFER ? null : rest.categoryId,
    });
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  // Smart parse preview (what was detected)
  const smartPreview = smartInput.trim()
    ? parseSmartInput(smartInput, categories)
    : null;
  const smartCategory = smartPreview?.categoryId
    ? categories.find((c) => c.id === smartPreview.categoryId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[6px_6px_0px_0px_var(--color-primary)] w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider">
            {isEdit ? t("txForm.editTransaction") : t("txForm.newTransaction")}
          </h2>
          <div className="flex items-center gap-2">
            {/* Smart / Normal toggle */}
            {!isEdit && (
              <div className="flex border-2 border-[var(--color-border)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSmartMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    !smartMode
                      ? "bg-[var(--color-primary)] text-[var(--color-surface)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                  }`}
                  title={t("txForm.normalModeDesc")}
                >
                  <SlidersHorizontal size={13} />
                  {t("txForm.normalMode")}
                </button>
                <button
                  type="button"
                  onClick={() => setSmartMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-l-2 border-[var(--color-border)] ${
                    smartMode
                      ? "bg-[var(--color-primary)] text-[var(--color-surface)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                  }`}
                  title={t("txForm.smartModeDesc")}
                >
                  <Zap size={13} />
                  {t("txForm.smartMode")}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-30"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <fieldset disabled={loading} className={`space-y-5 ${loading ? "opacity-60" : ""}`}>

            {/* ── Smart Mode Input ── */}
            {smartMode && !isEdit && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">
                    {t("txForm.smartInput")}
                  </label>
                  {/* Info icon */}
                  <div className="relative" ref={infoRef}>
                    <button
                      type="button"
                      onClick={() => setShowSmartInfo((v) => !v)}
                      className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                      title={t("txForm.smartInfoToggle")}
                    >
                      <Info size={15} />
                    </button>
                    {showSmartInfo && (
                      <div className="absolute right-0 top-7 z-30 w-64 bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] p-4 text-xs font-bold text-[var(--color-text-secondary)] space-y-2 animate-fade-in">
                        <p className="text-[var(--color-primary)] uppercase tracking-wider">
                          ⚡ {t("txForm.smartMode")}
                        </p>
                        <p>{t("txForm.smartInfo1")}</p>
                        <p>{t("txForm.smartInfo2")}</p>
                        <p>{t("txForm.smartInfo3")}</p>
                        <p className="text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2">{t("txForm.smartInfo4")}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                    <Zap size={16} />
                  </div>
                  <input
                    type="text"
                    value={smartInput}
                    onChange={(e) => handleSmartInputChange(e.target.value)}
                    placeholder={t("txForm.smartPlaceholder")}
                    className="brutal-input w-full pl-10 pr-4 py-3 text-sm border-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    autoFocus
                  />
                </div>

                {/* Parsed preview chips */}
                {smartPreview && smartInput.trim() && (
                  <div className="flex flex-wrap gap-2 px-1 animate-fade-in">
                    {smartPreview.amount && (
                      <span className="px-2 py-1 text-[10px] font-bold border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] uppercase tracking-wider">
                        💰 {smartPreview.amount}
                      </span>
                    )}
                    {smartPreview.type && (
                      <span className={`px-2 py-1 text-[10px] font-bold border-2 uppercase tracking-wider ${
                        smartPreview.type === TransactionType.INCOME
                          ? "border-[var(--color-income)] bg-[var(--color-income)]/10 text-[var(--color-income)]"
                          : "border-[var(--color-expense)] bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                      }`}>
                        {smartPreview.type === TransactionType.INCOME
                          ? t("transactions.income")
                          : t("transactions.expense")}
                      </span>
                    )}
                    {smartCategory && (
                      <span className="px-2 py-1 text-[10px] font-bold border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] uppercase tracking-wider">
                        {smartCategory.icon} {smartCategory.name}
                      </span>
                    )}
                    {smartPreview.description && (
                      <span className="px-2 py-1 text-[10px] font-bold border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] uppercase tracking-wider">
                        📝 {smartPreview.description}
                      </span>
                    )}
                  </div>
                )}

                <div className="border-t-2 border-dashed border-[var(--color-border)] pt-4">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 ml-1">
                    {t("txForm.adjustBelow")}
                  </p>
                </div>
              </div>
            )}

            {/* Type Toggle */}
            <div className="flex border-2 border-[var(--color-border)]">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: TransactionType.EXPENSE,
                    categoryId: "",
                    destinationAccountId: "",
                  })
                }
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                  formData.type === TransactionType.EXPENSE
                    ? "bg-[var(--color-expense)] text-[var(--color-text-inverse)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {t("transactions.expense")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: TransactionType.INCOME,
                    categoryId: "",
                    destinationAccountId: "",
                  })
                }
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-all border-l-2 border-[var(--color-border)] ${
                  formData.type === TransactionType.INCOME
                    ? "bg-[var(--color-income)] text-[var(--color-text-inverse)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {t("transactions.income")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: TransactionType.TRANSFER,
                    categoryId: "",
                    destinationAccountId: "",
                  })
                }
                className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-all border-l-2 border-[var(--color-border)] ${
                  formData.type === TransactionType.TRANSFER
                    ? "bg-[var(--color-transfer)] text-[var(--color-text-inverse)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {t("transactions.transfer")}
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                {t("txForm.amount")}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="brutal-input w-full pl-10 pr-4 py-3 text-lg"
                  required
                  autoFocus={!isEdit && !smartMode}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                {t("txForm.description")}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  <FileText size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t("txForm.descriptionPlaceholder")}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="brutal-input w-full pl-10 pr-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category (hidden for Transfers) */}
              {formData.type !== TransactionType.TRANSFER && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                    {t("txForm.category")}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="brutal-input w-full pl-3 pr-8 py-2.5 appearance-none font-medium text-sm truncate cursor-pointer bg-[var(--color-surface)]"
                      required
                    >
                      <option value="" disabled>
                        {t("txForm.selectCategory")}
                      </option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                  {t("txForm.date")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <CalendarIcon size={16} />
                  </div>
                  <input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionDate: e.target.value,
                      })
                    }
                    className="brutal-input w-full pl-9 pr-3 py-2.5 font-medium text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                {t("txForm.time")}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  <Clock size={16} />
                </div>
                <input
                  type="time"
                  value={formData.transactionTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionTime: e.target.value || "00:00",
                    })
                  }
                  className="brutal-input w-full pl-9 pr-3 py-2.5 font-medium text-sm"
                />
              </div>
            </div>

            {/* Account Selections */}
            <div
              className={`grid gap-4 ${formData.type === TransactionType.TRANSFER ? "grid-cols-2" : "grid-cols-1"}`}
            >
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                  {formData.type === TransactionType.TRANSFER
                    ? t("txForm.fromAccount")
                    : t("txForm.account")}
                </label>
                <div className="relative">
                  <select
                    value={formData.accountId}
                    onChange={(e) =>
                      setFormData({ ...formData, accountId: e.target.value })
                    }
                    className="brutal-input w-full pl-3 pr-8 py-3 appearance-none font-medium text-sm bg-[var(--color-surface)] cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      {t("txForm.selectAccount")}
                    </option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.type === "bank" ? "🏦" : "💳"} {a.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              {formData.type === TransactionType.TRANSFER && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 ml-1">
                    {t("txForm.toAccount")}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.destinationAccountId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destinationAccountId: e.target.value,
                        })
                      }
                      className="brutal-input w-full pl-3 pr-8 py-3 appearance-none font-medium text-sm bg-[var(--color-surface)] cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        {t("txForm.selectAccount")}
                      </option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.type === "bank" ? "🏦" : "💳"} {a.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              )}
            </div>

            {formData.type === TransactionType.TRANSFER &&
              formData.accountId === formData.destinationAccountId &&
              formData.accountId !== "" && (
                <p className="text-sm font-medium text-[var(--color-expense)] mt-1 ml-1">
                  {t("txForm.sameAccountError")}
                </p>
              )}

            {formData.type === TransactionType.TRANSFER &&
              formData.destinationAccountId &&
              formData.accountId !== formData.destinationAccountId &&
              accounts.find((a) => a.id === formData.destinationAccountId)?.type === AccountType.CREDIT_CARD && (
                <p className="text-xs font-bold text-[var(--color-transfer)] mt-1 ml-1 flex items-center gap-1">
                  💳 {t("txForm.creditCardPayment")}
                </p>
              )}

          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-[var(--color-border)] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] transition-colors uppercase tracking-wider"
              disabled={loading}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.amount ||
                !formData.accountId ||
                (formData.type !== TransactionType.TRANSFER &&
                  !formData.categoryId) ||
                (formData.type === TransactionType.TRANSFER &&
                  (!formData.destinationAccountId ||
                    formData.accountId === formData.destinationAccountId))
              }
              className="brutal-btn px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("common.saving") : t("txForm.saveTransaction")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
