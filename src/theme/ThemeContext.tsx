import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { ThemeContext, type ThemeContextValue, type ThemeMode } from './theme-context';

const STORAGE_KEY = 'wc-theme-mode';

function readStoredMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function prefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(readStoredMode);
    const [systemPrefersDark, setSystemPrefersDark] = useState(prefersDark);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => setSystemPrefersDark(media.matches);
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const effectiveTheme: ThemeContextValue['effectiveTheme'] =
        mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        localStorage.setItem(STORAGE_KEY, mode);
    }, [mode, effectiveTheme]);

    const value = useMemo(() => ({ mode, effectiveTheme, setMode }), [mode, effectiveTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
