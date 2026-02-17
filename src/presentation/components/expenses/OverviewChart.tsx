'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Transaction } from '@/domain/entities';
import { TransactionType } from '@/domain/enums';
import { EXPENSE_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';

interface OverviewChartProps {
  transactions: Transaction[];
  title?: string;
}

export default function OverviewChart({ transactions, title = 'Financial Overview' }: OverviewChartProps) {
  const data = useMemo(() => {
    const today = new Date();
    const dataMap = new Map<string, { label: string; income: number; expense: number; date: Date }>();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      dataMap.set(key, {
        label: d.toLocaleString('default', { month: 'short' }),
        income: 0,
        expense: 0,
        date: d,
      });
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.transactionDate);
      const key = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (dataMap.has(key)) {
        const entry = dataMap.get(key)!;
        if (t.type === TransactionType.INCOME) entry.income += t.amount;
        else entry.expense += t.amount;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions]);

  const averages = useMemo(() => {
    if (data.length === 0) return { income: 0, expense: 0 };
    const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
    return {
      income: totalIncome / data.length,
      expense: totalExpense / data.length,
    };
  }, [data]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {title}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Avg. Exp: <span className="text-gray-700">{(averages.expense / 1000).toFixed(1)}k / mo</span>
            </p>
          </div>
      </div>

      <div className="flex-grow min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fontFamily: 'inherit', fill: '#9CA3AF' }}
                axisLine={{ stroke: '#F3F4F6' }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: 'inherit', fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => formatCurrency(Number(value))}
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'inherit',
                  padding: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '0.875rem', paddingTop: '20px' }} 
                iconType="circle"
              />
              <Bar
                dataKey="income"
                name="💰 Income"
                fill={EXPENSE_COLORS.income}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <Bar
                dataKey="expense"
                name="💸 Expense"
                fill={EXPENSE_COLORS.expense}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
