"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Transaction } from "@/features/expenses/types";
import { TransactionType } from "@/features/expenses/types";
import { formatCurrency } from "@/shared/lib/formatters";
import { useTranslation } from "@/shared/lib/i18n";

interface OverviewChartProps {
  transactions: Transaction[];
}

export default function OverviewChart({ transactions }: OverviewChartProps) {
  const { t, language } = useTranslation();
  const data = useMemo(() => {
    const today = new Date();
    const dataMap = new Map<
      string,
      { label: string; income: number; expense: number; date: Date }
    >();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      dataMap.set(key, {
        label: d.toLocaleString(language === "th" ? "th-TH" : "en-US", {
          month: "short",
        }),
        income: 0,
        expense: 0,
        date: d,
      });
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.transactionDate);
      const key = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, "0")}`;

      if (dataMap.has(key)) {
        const entry = dataMap.get(key)!;
        if (t.type === TransactionType.INCOME) entry.income += t.amount;
        else entry.expense += t.amount;
      }
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [transactions, language]);

  return (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider">
            {t("chart.financialOverview")}
          </h3>
        </div>
      </div>

      <div className="flex-grow min-h-[300px] overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2E2E2E"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fontFamily: "inherit", fill: "#9CA3AF" }}
              axisLine={{ stroke: "#2E2E2E" }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fontFamily: "inherit", fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatCurrency(Number(value))}
              cursor={{ fill: "var(--color-surface-2)" }}
              isAnimationActive={false}
              wrapperStyle={{ zIndex: 10, pointerEvents: "none" }}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "2px solid var(--color-border)",
                boxShadow: "4px 4px 0px 0px var(--color-primary)",
                fontFamily: "inherit",
                padding: "12px",
                color: "var(--color-text-primary)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "0.875rem", paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name={`💰 ${t("dashboard.totalIncome")}`}
              fill="var(--color-income)"
              radius={[0, 0, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="expense"
              name={`💸 ${t("dashboard.totalExpenses")}`}
              fill="var(--color-expense)"
              radius={[0, 0, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
