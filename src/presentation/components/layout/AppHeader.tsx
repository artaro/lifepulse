'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';

interface AppHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  return (
    <header 
      className="fixed top-0 right-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300"
      style={{
        width: '100%',
        paddingLeft: '1rem', // Base padding
        paddingRight: '1rem',
      }}
    >
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto md:ml-[280px]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-gray-600 rounded-lg hover:bg-gray-100 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {title && (
            <h1 className="text-xl font-bold text-gray-900">
              {title}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-9 h-9 text-sm font-semibold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-400 hover:scale-105 transition-transform cursor-pointer shadow-sm shadow-indigo-200"
            >
              {userInitials}
            </button>

            {/* Profile dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    LifePulse Account
                  </p>
                </div>
                
                <div className="p-1">
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
