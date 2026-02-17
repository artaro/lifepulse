'use client';

import React from 'react';
import { Account } from '@/domain/entities';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, CreditCard, Landmark } from 'lucide-react';
import { AccountType } from '@/domain/enums';

interface AccountBalanceListProps {
  accounts: Account[];
}

export default function AccountBalanceList({ accounts }: AccountBalanceListProps) {
  const getIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.BANK:
        return <Landmark size={18} />;
      case AccountType.CREDIT_CARD:
        return <CreditCard size={18} />;
      default:
        return <Wallet size={18} />;
    }
  };

  const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.type === AccountType.CREDIT_CARD ? -acc.balance : acc.balance), 0);


  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Accounts 💳
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
           Total: {formatCurrency(totalBalance)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[300px] scrollbar-thin scrollbar-thumb-gray-200">
        {sortedAccounts.length > 0 ? (
          sortedAccounts.map((account) => (
            <div 
              key={account.id} 
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
                    account.type === AccountType.CREDIT_CARD 
                    ? 'bg-gradient-to-br from-rose-400 to-rose-600' 
                    : 'bg-gradient-to-br from-indigo-400 to-indigo-600'
                }`}>
                  {getIcon(account.type)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{account.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{account.bankName || 'General'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${account.type === AccountType.CREDIT_CARD ? 'text-rose-600' : 'text-gray-900'}`}>
                  {formatCurrency(account.balance)}
                </p>
                {/* Optional: Show percentage of total or just hide */}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
             <Wallet className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-xs">No accounts added</p>
          </div>
        )}
      </div>
    </div>
  );
}
