import { create } from 'zustand';

export type ThemeId = 'dark-brutal' | 'light-soft';

export interface ThemeDefinition {
    id: ThemeId;
    nameEn: string;
    nameTh: string;
    descEn: string;
    descTh: string;
    /** Swatch colors for the preview chip [background, primary, accent] */
    swatches: [string, string, string];
}

export const THEMES: ThemeDefinition[] = [
    {
        id: 'dark-brutal',
        nameEn: 'Dark Brutal',
        nameTh: 'มืดดิบ',
        descEn: 'Neo-brutalism dark. High contrast, sharp shadows.',
        descTh: 'นีโอ-บรูทัลลิซึม มืด คอนทราสต์สูง',
        swatches: ['#0D0D0D', '#00FFAB', '#FF6B6B'],
    },
    {
        id: 'light-soft',
        nameEn: 'Soft Light',
        nameTh: 'สว่างนุ่ม',
        descEn: 'Warm paper tones. Easy on the eyes.',
        descTh: 'โทนกระดาษอบอุ่น ถนอมสายตา',
        swatches: ['#FAFAF8', '#2563EB', '#EF4444'],
    },
];

interface ThemeState {
    theme: ThemeId;
    _hydrated: boolean;
    setTheme: (theme: ThemeId) => void;
    hydrate: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    // Default to light-soft — matches HTML default so no flash
    theme: 'light-soft',
    _hydrated: false,

    hydrate: () => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem('aomkeng_theme') as ThemeId | null;
        const isFirst = stored === null;
        if (stored && (stored === 'dark-brutal' || stored === 'light-soft')) {
            document.documentElement.dataset.theme = stored;
            set({ theme: stored, _hydrated: true });
        } else {
            // First visit — set default, mark as first-visit so onboarding shows
            document.documentElement.dataset.theme = 'light-soft';
            set({ theme: 'light-soft', _hydrated: isFirst ? false : true });
        }
    },

    setTheme: (theme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('aomkeng_theme', theme);
            document.documentElement.dataset.theme = theme;
        }
        set({ theme, _hydrated: true });
    },
}));
