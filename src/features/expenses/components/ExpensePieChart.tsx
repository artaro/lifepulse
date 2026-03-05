"use client";

import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Transaction } from "@/features/expenses/types";
import { TransactionType } from "@/features/expenses/types";
import { formatCurrency, toLocalDateString } from "@/shared/lib/formatters";
import { useTranslation } from "@/shared/lib/i18n";

interface ExpensePieChartProps {
  transactions: Transaction[];
  currentMonthStr?: string; // Format: "YYYY-MM"
  dividerDays?: number;
  embedded?: boolean;
}

export default function ExpensePieChart({
  transactions,
  currentMonthStr,
  dividerDays,
  embedded = false,
}: ExpensePieChartProps) {
  const { t, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredData = useMemo(() => {
    let focusMonthStr = currentMonthStr;
    if (!focusMonthStr) {
      const now = new Date();
      focusMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }

    const filtered = transactions.filter(
      (t) =>
        t.type === TransactionType.EXPENSE &&
        toLocalDateString(t.transactionDate).startsWith(focusMonthStr!),
    );

    const categoryMap = new Map<string, number>();
    const colorMap = new Map<string, string>();
    const iconMap = new Map<string, string>();

    filtered.forEach((t) => {
      const name = t.category?.name || "Uncategorized";
      const color = t.category?.color || "#B2BEC3";
      const icon = t.category?.icon || "❓";

      categoryMap.set(name, (categoryMap.get(name) || 0) + t.amount);
      colorMap.set(name, color);
      iconMap.set(name, icon);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: colorMap.get(name) || "#B2BEC3",
        icon: iconMap.get(name) || "❓",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonthStr]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegendText = (value: string, entry: any) => {
    const { payload } = entry;
    // Simple legend again
    return (
      <span className="text-[var(--color-text-secondary)] font-bold tracking-wider text-sm ml-1">
        {payload.icon} {value}
      </span>
    );
  };

  const days = dividerDays || new Date().getDate() || 1;

  const containerClass = embedded
    ? "flex flex-col pt-2"
    : "bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] p-6 flex flex-col";

  const displayedData = isExpanded ? filteredData : filteredData.slice(0, 3);

  return (
    <div className={containerClass}>
      {!embedded && (
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider mb-4">
          {t("chart.spendingByCategory")}
        </h3>
      )}

      {filteredData.length > 0 ? (
        <>
          <div className="h-[200px] w-full mb-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={filteredData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {filteredData.slice(0, 6).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "2px solid var(--color-border)",
                    boxShadow: "4px 4px 0px 0px var(--color-primary)",
                    fontFamily: "inherit",
                    color: "var(--color-text-primary)",
                  }}
                  itemStyle={{
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={renderLegendText}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Averages Box */}
          <div className="mt-2 pt-4 border-t-2 border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("chart.avgExpense")}
              </p>
              {filteredData.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[10px] font-bold text-[var(--color-primary)] uppercase hover:bg-[var(--color-primary)]/10 px-2 py-1 transition-colors border border-transparent hover:border-[var(--color-primary)]"
                >
                  {isExpanded
                    ? language === "th"
                      ? "ย่อลง"
                      : "See less"
                    : language === "th"
                      ? "ดูทั้งหมด"
                      : "See all"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {displayedData.map((item) => (
                <div
                  key={item.name}
                  className="bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <div
                      className="w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 border border-[var(--color-border)]"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: "inherit",
                      }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--color-text-primary)] truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                    ~{formatCurrency(item.value / days)}/d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="text-4xl mb-3 opacity-50">📉</div>
          <p className="text-[var(--color-text-muted)] font-bold">
            {t("empty.noExpenses")}
          </p>
        </div>
      )}
    </div>
  );
}
