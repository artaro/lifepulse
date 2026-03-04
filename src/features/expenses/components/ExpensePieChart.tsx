"use client";

import React, { useMemo } from "react";
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
import { formatCurrency } from "@/shared/lib/formatters";
import { useTranslation } from "@/shared/lib/i18n";

interface ExpensePieChartProps {
  transactions: Transaction[];
}

export default function ExpensePieChart({
  transactions,
}: ExpensePieChartProps) {
  const { t } = useTranslation();
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = transactions.filter(
      (t) =>
        t.type === TransactionType.EXPENSE &&
        new Date(t.transactionDate) >= startOfMonth,
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
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

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

  const dayOfMonth = new Date().getDate();

  return (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider mb-4">
        {t("chart.spendingByCategory")}
      </h3>

      {filteredData.length > 0 ? (
        <>
          <div className="flex-grow min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {filteredData.map((entry, index) => (
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
          <div className="mt-4 pt-4 border-t-2 border-[var(--color-border)]">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              {t("chart.avgExpense")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filteredData.slice(0, 4).map((item) => (
                <div
                  key={item.name}
                  className="bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    ~{formatCurrency(item.value / dayOfMonth)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="text-5xl mb-3 opacity-50">📉</div>
          <p className="text-[var(--color-text-muted)] font-bold">
            {t("empty.noExpenses")}
          </p>
        </div>
      )}
    </div>
  );
}
