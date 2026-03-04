"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/i18n";
import { Languages, Info, Sparkles, Palette } from "lucide-react";
import { useLanguageStore } from "@/shared/stores/useLanguageStore";
import { useThemeStore, THEMES } from "@/shared/stores/useThemeStore";

export default function SettingsPage() {
  const { t, language } = useTranslation();
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1 font-[var(--font-brand)] uppercase tracking-wider">
          {t("settings.title")}
        </h1>
        <p className="text-[var(--color-text-secondary)] font-bold">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* General Section */}
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
            {t("settings.general")}
          </h3>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-2)] transition-colors border-b-2 border-[var(--color-border)] last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-primary)]">
              <Languages size={18} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide">
              {t("settings.language")}
            </span>
          </div>
          <div className="flex bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] p-1">
            <button
              onClick={() => setLanguage("th")}
              className={`px-3 py-1.5 text-sm font-bold transition-all border-2 ${
                language === "th"
                  ? "bg-[var(--color-primary)] text-[var(--color-surface)] border-[var(--color-border)] shadow-[2px_2px_0px_0px_var(--color-border)]"
                  : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)]"
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 text-sm font-bold transition-all border-2 ${
                language === "en"
                  ? "bg-[var(--color-primary)] text-[var(--color-surface)] border-[var(--color-border)] shadow-[2px_2px_0px_0px_var(--color-border)]"
                  : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)]"
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
        </div>
      </div>

      {/* Theme Section */}
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
            {t("settings.themeSection")}
          </h3>
        </div>

        <div className="p-5 flex flex-col gap-4 border-b-2 border-[var(--color-border)] last:border-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-primary)]">
              <Palette size={18} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide">
              {t("settings.theme")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((tDef) => {
              const isActive = theme === tDef.id;
              return (
                <button
                  key={tDef.id}
                  onClick={() => setTheme(tDef.id)}
                  className="text-left flex items-start gap-3 p-3 transition-all duration-150 relative"
                  style={{
                    background: isActive
                      ? "var(--color-surface-2)"
                      : "var(--color-surface)",
                    border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
                    boxShadow: isActive
                      ? "4px 4px 0px 0px var(--color-primary)"
                      : "none",
                  }}
                >
                  {/* Swatches */}
                  <div className="flex gap-1 shrink-0 mt-1">
                    {tDef.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-8"
                        style={{
                          backgroundColor: color,
                          border: "1px solid rgba(0,0,0,0.2)",
                        }}
                      />
                    ))}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p
                      className="text-sm font-bold uppercase tracking-wide mb-0.5"
                      style={{
                        fontFamily: "var(--font-brand)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {language === "th" ? tDef.nameTh : tDef.nameEn}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {t(
                        `theme.${tDef.id === "dark-brutal" ? "darkDesc" : "lightDesc"}`,
                      )}
                    </p>
                  </div>

                  {/* Checkmark */}
                  {isActive && (
                    <div
                      className="absolute top-3 right-3 w-3 h-3"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)] overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
            {t("settings.about")}
          </h3>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--color-border)] last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-secondary)]">
              <Info size={18} className="text-[var(--color-secondary)]" />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide">
              {t("settings.version")}
            </span>
          </div>
          <span className="text-sm font-bold text-[var(--color-text-muted)] border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5">
            0.1.0
          </span>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--color-border)] last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-primary)]">
              <Sparkles size={18} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide">
              Pro
            </span>
          </div>
          <span className="text-xs text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)] px-2.5 py-1 tracking-widest uppercase shadow-[2px_2px_0px_0px_var(--color-primary)]">
            {t("nav.proComingSoon")}
          </span>
        </div>
      </div>
    </div>
  );
}
