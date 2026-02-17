'use client';

import React, { useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === 0) {
        // Login
        await signIn(email, password);
        router.push('/expenses');
      } else {
        // Sign Up
        if (password !== confirmPassword) {
          setError('Passwords don\'t match!');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await signUp(email, password);
        setSuccess('Account created! Check your email to confirm, then log in 🎉');
        setTab(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-[#EDE8FF] to-[#F0EEFF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] inline-flex items-center justify-center text-3xl shadow-xl shadow-indigo-200 mb-4 animate-bounce-slow">
            💜
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-gray-500 font-medium">
            Your money, your rules ✨
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 p-8 border border-white/50 backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
             <button
                type="button"
                onClick={() => { setTab(0); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                   tab === 0 
                   ? 'bg-white text-gray-900 shadow-sm' 
                   : 'text-gray-500 hover:text-gray-700'
                }`}
             >
               Log In
             </button>
             <button
                type="button"
                onClick={() => { setTab(1); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                   tab === 1 
                   ? 'bg-white text-gray-900 shadow-sm' 
                   : 'text-gray-500 hover:text-gray-700'
                }`}
             >
               Sign Up
             </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm font-medium animate-in slide-in-from-top-2">
              <X size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 text-green-700 text-sm font-medium animate-in slide-in-from-top-2">
              <Check size={18} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 font-medium bg-gray-50/50 focus:bg-white transition-all placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Password</label>
               <div className="relative">
                 <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 font-medium bg-gray-50/50 focus:bg-white transition-all placeholder-gray-400"
                    placeholder="••••••••"
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                 >
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
               </div>
            </div>

            {tab === 1 && (
               <div className="animate-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Confirm Password</label>
                  <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 font-medium bg-gray-50/50 focus:bg-white transition-all placeholder-gray-400"
                      placeholder="••••••••"
                  />
               </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> 
                  Please wait...
                </>
              ) : tab === 0 ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs font-semibold text-gray-400 mt-6">
          Built with 💜 by {APP_NAME} Team
        </p>
      </div>
    </div>
  );
}
