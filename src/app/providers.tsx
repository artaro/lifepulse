"use client";

import React, { useEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/query";
import GlobalLoader from "@/shared/components/GlobalLoader";
import { useUIStore, useThemeStore } from "@/shared/stores";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const ThemeOnboarding = dynamic(
  () => import("@/shared/components/ThemeOnboarding"),
  { ssr: false },
);

const TOAST_DURATION_MS = 4000;

function Toast() {
  const { snackbar, hideSnackbar } = useUIStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close after TOAST_DURATION_MS
  useEffect(() => {
    if (snackbar.open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(hideSnackbar, TOAST_DURATION_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [snackbar.open, snackbar.message, hideSnackbar]);

  if (!snackbar.open) return null;

  const config = {
    error: {
      bg: "bg-[var(--color-surface)] border-2 border-[var(--color-expense)] text-[var(--color-text-primary)] shadow-[6px_6px_0px_0px_var(--color-expense)]",
      icon: <AlertCircle size={16} className="text-[var(--color-expense)]" />,
      bar: "bg-[var(--color-expense)]",
    },
    success: {
      bg: "bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-text-primary)] shadow-[6px_6px_0px_0px_var(--color-primary)]",
      icon: <CheckCircle size={16} className="text-[var(--color-primary)]" />,
      bar: "bg-[var(--color-primary)]",
    },
    info: {
      bg: "bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] shadow-[6px_6px_0px_0px_var(--color-border)]",
      icon: <Info size={16} className="text-[var(--color-text-primary)]" />,
      bar: "bg-[var(--color-border)]",
    },
    warning: {
      bg: "bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] text-[var(--color-text-primary)] shadow-[6px_6px_0px_0px_var(--color-secondary)]",
      icon: (
        <AlertTriangle size={16} className="text-[var(--color-secondary)]" />
      ),
      bar: "bg-[var(--color-secondary)]",
    },
  };

  const { bg, icon, bar } =
    config[snackbar.severity as keyof typeof config] || config.info;

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[9999]
        flex items-center gap-3 px-4 py-3 font-bold
        min-w-[260px] max-w-[420px]
        animate-in slide-in-from-top-2 fade-in duration-200
        ${bg}
      `}
    >
      <span className="flex-shrink-0 opacity-90">{icon}</span>
      <span className="text-sm font-bold flex-1 tracking-wide">
        {snackbar.message}
      </span>
      <button
        onClick={hideSnackbar}
        className="p-1 hover:bg-[var(--color-surface-2)] transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>

      {/* Auto-close progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${bar}`}
        style={{
          animation: `shrink ${TOAST_DURATION_MS}ms linear forwards`,
        }}
      />
    </div>
  );
}

/** Hydrates the theme from localStorage and syncs the data-theme attribute. */
function ThemeProvider() {
  const hydrate = useThemeStore((s) => s.hydrate);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider />
      <GlobalLoader />
      {children}
      <Toast />
      <ThemeOnboarding />
    </QueryClientProvider>
  );
}
