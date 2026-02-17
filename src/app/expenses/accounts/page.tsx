'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Landmark, 
  CreditCard 
} from 'lucide-react';
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '@/presentation/hooks';
import { Account, CreateAccountInput, UpdateAccountInput } from '@/domain/entities';
import { AccountType } from '@/domain/enums/accountType';
import { formatCurrency } from '@/lib/formatters';
import { useUIStore } from '@/presentation/stores';
import AccountForm from '@/presentation/components/expenses/AccountForm';

export default function AccountsPage() {
  const { data: accounts = [], isLoading, error } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const showSnackbar = useUIStore((s) => s.showSnackbar);

  const [formOpen, setFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleCreate = async (data: CreateAccountInput | UpdateAccountInput) => {
    try {
      await createAccount.mutateAsync(data as CreateAccountInput);
      setFormOpen(false);
      showSnackbar('Account created! 🏦', 'success');
    } catch {
      showSnackbar('Failed to create account', 'error');
    }
  };

  const handleEdit = async (data: CreateAccountInput | UpdateAccountInput) => {
    if (!editAccount) return;
    try {
      await updateAccount.mutateAsync({ id: editAccount.id, input: data as UpdateAccountInput });
      setEditAccount(null);
      showSnackbar('Account updated! ✅', 'success');
    } catch {
      showSnackbar('Failed to update account', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount.mutateAsync(id);
      setActiveMenuId(null);
      showSnackbar('Account deleted', 'success');
    } catch {
      showSnackbar('Failed to delete account', 'error');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.type === AccountType.CREDIT_CARD) return sum - Number(acc.balance);
    return sum + Number(acc.balance);
  }, 0);

  const bankAccounts = accounts.filter((a) => a.type === AccountType.BANK);
  const creditCards = accounts.filter((a) => a.type === AccountType.CREDIT_CARD);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
        document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Accounts 🏦
          </h1>
          <p className="text-gray-500">
            Manage your bank accounts and credit cards
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} /> <span className="hidden sm:inline">Add Account</span>
        </button>
      </div>

      {/* Net Worth Card */}
      <div className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
          <p className="text-indigo-100 font-medium text-sm mb-1">Net Balance</p>
          <h2 className="text-4xl font-extrabold mb-2">
            {isLoading ? '...' : formatCurrency(totalBalance)}
          </h2>
          <p className="text-indigo-100 text-sm opacity-80">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl">
          {error instanceof Error ? error.message : 'Failed to load accounts'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Bank Accounts */}
      {bankAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">🏦 Bank Accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bankAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                activeMenuId={activeMenuId}
                onToggleMenu={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === account.id ? null : account.id); }}
                onEdit={() => setEditAccount(account)}
                onDelete={() => handleDelete(account.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Credit Cards */}
      {creditCards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">💳 Credit Cards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {creditCards.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                activeMenuId={activeMenuId}
                onToggleMenu={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === account.id ? null : account.id); }}
                onEdit={() => setEditAccount(account)}
                onDelete={() => handleDelete(account.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && accounts.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500 mb-6 font-medium">Add your bank accounts and credit cards to start tracking</p>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
          >
            <Plus size={20} /> Add Your First Account
          </button>
        </div>
      )}

      {/* Create Form */}
      <AccountForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={createAccount.isPending}
      />

      {/* Edit Form */}
      <AccountForm
        open={!!editAccount}
        onClose={() => setEditAccount(null)}
        onSubmit={handleEdit}
        initialData={editAccount}
        loading={updateAccount.isPending}
      />
    </div>
  );
}

/* ---- Account Card Component ---- */
interface AccountCardProps {
  account: Account;
  activeMenuId: string | null;
  onToggleMenu: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function AccountCard({ account, activeMenuId, onToggleMenu, onEdit, onDelete }: AccountCardProps) {
  const isBank = account.type === AccountType.BANK;
  const showMenu = activeMenuId === account.id;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                isBank 
                ? 'bg-gradient-to-br from-[#00CEC9] to-[#55EFC4] shadow-teal-100' 
                : 'bg-gradient-to-br from-[#FD79A8] to-[#FDCB6E] shadow-pink-100'
            }`}
          >
            {isBank ? <Landmark size={22} /> : <CreditCard size={22} />}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{account.name}</h4>
            {account.bankName && <p className="text-xs text-gray-500 font-medium">{account.bankName}</p>}
          </div>
        </div>
        
        <div className="relative">
            <button 
                onClick={onToggleMenu}
                className="p-1 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <MoreVertical size={20} />
            </button>
            
            {showMenu && (
                <div className="absolute right-0 top-8 z-20 w-32 bg-white rounded-xl shadow-xl border border-gray-100 p-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg text-left"
                    >
                        <Edit2 size={14} /> Edit
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
           <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
               {isBank ? 'Balance' : 'Outstanding'}
           </p>
           <p className={`text-xl font-extrabold ${isBank ? 'text-gray-900' : 'text-red-500'}`}>
               {formatCurrency(Number(account.balance))}
           </p>
        </div>
        
        <div className="flex items-center gap-2">
           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
               isBank 
               ? 'bg-teal-50 text-teal-600 border border-teal-100' 
               : 'bg-red-50 text-red-600 border border-red-100'
           }`}>
               {isBank ? 'Bank' : 'Credit'}
           </span>
           {account.accountNumberLast4 && (
               <span className="text-xs text-gray-400 font-medium">•••• {account.accountNumberLast4}</span>
           )}
        </div>
      </div>
    </div>
  );
}
