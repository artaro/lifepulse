"use client";

import React from "react";
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
import { useTranslation } from "@/shared/lib/i18n";

interface MonthlyDataItem {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyBarChartProps {
  data: MonthlyDataItem[];
  title?: string;
}

export default function MonthlyBarChart({
  data,
  title = "Monthly Overview",
}: MonthlyBarChartProps) {
  const { t } = useTranslation();
  if (data.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] flex flex-col items-center justify-center py-12 text-center h-full">
        <div className="text-4xl mb-3 opacity-50">📈</div>
        <p className="text-[var(--color-text-muted)] font-bold">
          {t("empty.noExpenses") || "No monthly data yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] p-6 h-full">
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-brand)] uppercase tracking-wider mb-6">
        {title}
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fontFamily: "inherit", fill: "#9CA3AF" }}
              axisLine={{ stroke: "#2E2E2E" }}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fontFamily: "inherit", fill: "#9CA3AF" }}
              axisLine={{ stroke: "#2E2E2E" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) =>
                `฿${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              }
              cursor={{ fill: "var(--color-surface-2)" }}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "2px solid var(--color-border)",
                boxShadow: "4px 4px 0px 0px var(--color-primary)",
                fontFamily: "inherit",
                color: "var(--color-text-primary)",
                padding: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "0.875rem", paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name="💰 Income"
              fill="var(--color-income)"
              radius={[0, 0, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="expense"
              name="💸 Expense"
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
