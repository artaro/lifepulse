"use client";

import React, { useEffect, useState } from "react";
import { useThemeStore, THEMES, ThemeId } from "@/shared/stores/useThemeStore";

export default function ThemeOnboarding() {
  const { setTheme, _hydrated } = useThemeStore();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<ThemeId | null>(null);

  useEffect(() => {
    // Only show if this is truly the first visit (no theme in localStorage)
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("aomkeng_theme");
    if (!stored) {
      // Small delay so the app paints first
      const t = setTimeout(() => setVisible(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const confirm = (id: ThemeId) => {
    setTheme(id);
    setVisible(false);
  };

  const dismiss = () => {
    setTheme("light-soft");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="w-full max-w-lg"
        style={{
          background: "var(--color-surface)",
          border: "2px solid var(--color-border)",
          boxShadow: "8px 8px 0px 0px var(--color-primary)",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "2px solid var(--color-border)",
            padding: "20px 24px",
            background: "var(--color-surface-2)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--color-primary)" }}
          >
            ยินดีต้อนรับ · Welcome
          </p>
          <h2
            className="text-2xl font-bold uppercase tracking-wide"
            style={{
              fontFamily: "var(--font-brand)",
              color: "var(--color-text-primary)",
            }}
          >
            เลือกธีม
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Choose your vibe. You can change it later in Settings.
          </p>
        </div>

        {/* Theme Cards */}
        <div className="p-5 space-y-3">
          {THEMES.map((t) => {
            const isActive = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className="w-full text-left flex items-center gap-4 p-4 transition-all duration-150"
                style={{
                  background: isActive
                    ? "var(--color-surface-2)"
                    : "transparent",
                  border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
                  boxShadow: isActive
                    ? "4px 4px 0px 0px var(--color-primary)"
                    : "none",
                }}
              >
                {/* Swatches */}
                <div className="flex gap-1 shrink-0">
                  {t.swatches.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-10"
                      style={{
                        backgroundColor: color,
                        border: "1px solid rgba(0,0,0,0.2)",
                      }}
                    />
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{
                        fontFamily: "var(--font-brand)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {t.nameEn}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      · {t.nameTh}
                    </span>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {t.descEn}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div
                    className="w-3 h-3 shrink-0"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="p-5 flex gap-3"
          style={{ borderTop: "2px solid var(--color-border)" }}
        >
          <button
            onClick={() => selected && confirm(selected)}
            disabled={!selected}
            className="flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all"
            style={{
              fontFamily: "var(--font-brand)",
              background: selected
                ? "var(--color-primary)"
                : "var(--color-surface-2)",
              color: selected
                ? "var(--color-text-inverse)"
                : "var(--color-text-muted)",
              border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
              boxShadow: selected ? "4px 4px 0px 0px rgba(0,0,0,0.3)" : "none",
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            ยืนยัน · Confirm
          </button>
          <button
            onClick={dismiss}
            className="px-5 py-3 text-sm font-bold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-brand)",
              color: "var(--color-text-muted)",
              border: "2px solid var(--color-border)",
              background: "transparent",
            }}
          >
            ข้าม
          </button>
        </div>
      </div>
    </div>
  );
}
