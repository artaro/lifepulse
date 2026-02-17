'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Transaction } from '@/domain/entities';
import { TransactionType } from '@/domain/enums';
import { formatCurrency } from '@/lib/formatters';

interface ExpensePieChartProps {
  transactions: Transaction[];
  title?: string;
}

export default function ExpensePieChart({ transactions, title = 'Spending by Category' }: ExpensePieChartProps) {
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = transactions.filter(
      (t) =>
        t.type === TransactionType.EXPENSE &&
        new Date(t.transactionDate) >= startOfMonth
    );

    const categoryMap = new Map<string, number>();
    const colorMap = new Map<string, string>();
    const iconMap = new Map<string, string>();

    filtered.forEach((t) => {
      const name = t.category?.name || 'Uncategorized';
      const color = t.category?.color || '#B2BEC3';
      const icon = t.category?.icon || '❓';
      
      categoryMap.set(name, (categoryMap.get(name) || 0) + t.amount);
      colorMap.set(name, color);
      iconMap.set(name, icon);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: colorMap.get(name) || '#B2BEC3',
        icon: iconMap.get(name) || '❓',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegendText = (value: string, entry: any) => {
    const { payload } = entry;
    // Tailwind classes for legend text
    return <span className="text-gray-700 font-medium text-sm ml-1">{payload.icon} {value}</span>;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {title} <span className="text-gray-400 font-normal text-sm">(Monthly)</span>
      </h3>

      {filteredData.length > 0 ? (
        <div className="flex-grow min-h-[300px]">
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
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white',
                    fontFamily: 'inherit'
                }}
                itemStyle={{ color: '#374151', fontWeight: 600 }}
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
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="text-5xl mb-3 opacity-50">📉</div>
          <p className="text-gray-500 font-medium">No expenses this month</p>
        </div>
      )}
    </div>
  );
}
