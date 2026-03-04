"use client";

import React from "react";
import Link from "next/link";
import { Tags, Settings, ChevronRight, Upload } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n";

interface PortalCard {
  href: string;
  icon: React.ReactNode;
  emoji: string;
  titleKey: string;
  descKey: string;
}

export default function MorePage() {
  const { t } = useTranslation();

  const cards: PortalCard[] = [
    {
      href: "/expenses/more/categories",
      icon: <Tags className="w-6 h-6 text-white" />,
      emoji: "🏷️",
      titleKey: "more.categoryManagement",
      descKey: "more.categoryManagementDesc",
    },
    {
      href: "/expenses/more/settings",
      icon: <Settings className="w-6 h-6 text-white" />,
      emoji: "⚙️",
      titleKey: "more.settings",
      descKey: "more.settingsDesc",
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1 font-[var(--font-brand)] uppercase tracking-wider">
          {t("more.title")}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {t("more.subtitle")}
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative bg-[var(--color-surface)] border-2 border-[var(--color-border)] p-5 transition-all duration-200 shadow-[3px_3px_0px_0px_var(--color-primary)] brutal-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-[var(--color-primary)] border-2 border-[var(--color-primary)] flex items-center justify-center shrink-0">
                {card.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-0.5 flex items-center gap-1.5">
                  {t(card.titleKey)}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t(card.descKey)}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={20}
                className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all mt-1 shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* App info */}
      <div className="pt-4 text-center">
        <p className="text-xs text-[var(--color-text-muted)] font-medium">
          ออมเก่ง v0.1.0 • {t("app.footer")}
        </p>
      </div>
    </div>
  );
}
