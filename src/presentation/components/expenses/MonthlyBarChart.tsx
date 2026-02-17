'use client';

import React from 'react';
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
import { EXPENSE_COLORS } from '@/lib/constants';

interface MonthlyDataItem {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyBarChartProps {
  data: MonthlyDataItem[];
  title?: string;
}

export default function MonthlyBarChart({ data, title = 'Monthly Overview' }: MonthlyBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center py-12 text-center h-full">
        <div className="text-4xl mb-3 opacity-50">📈</div>
        <p className="text-gray-500 font-medium">No monthly data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        {title}
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fontFamily: 'inherit', fill: '#9CA3AF' }}
              axisLine={{ stroke: '#F3F4F6' }}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fontFamily: 'inherit', fill: '#9CA3AF' }}
              axisLine={{ stroke: '#F3F4F6' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) =>
                `฿${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              }
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontFamily: 'inherit',
                padding: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.875rem', paddingTop: '20px' }} iconType="circle" />
            <Bar
              dataKey="income"
              name="💰 Income"
              fill={EXPENSE_COLORS.income}
              radius={[8, 8, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="expense"
              name="💸 Expense"
              fill={EXPENSE_COLORS.expense}
              radius={[8, 8, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
