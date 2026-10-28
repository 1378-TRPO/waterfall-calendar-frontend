import { IconBell, IconCalendar, IconMoon, IconSun, IconSunMoon } from '@tabler/icons-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useTheme } from '../theme/theme-context';
import styles from './MainLayout.module.css';

function ThemeToggle() {
    const { mode, setMode } = useTheme();
    const next: Record<string, 'light' | 'dark' | 'system'> = {
        light: 'dark',
        dark: 'system',
        system: 'light',
    };
    const label =
        mode === 'light' ? 'Светлая тема' : mode === 'dark' ? 'Темная тема' : 'Системная тема';

    return (
        <button
            type="button"
            className={styles.themeToggle}
            onClick={() => setMode(next[mode])}
            title={label}
            aria-label={label}
        >
            {mode === 'light' && <IconSun size={18} stroke={1.8} />}
            {mode === 'dark' && <IconMoon size={18} stroke={1.8} />}
            {mode === 'system' && <IconSunMoon size={18} stroke={1.8} />}
        </button>
    );
}

export default function MainLayout() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <NavLink to="/" className={styles.brand}>
                        <span className={styles.logoIcon}>
                            <IconCalendar size={20} stroke={1.8} />
                        </span>
                        <span className={styles.brandText}>Календарик</span>
                    </NavLink>
                    <nav className={styles.nav}>
                        <NavLink to="/" end className={styles.navLink}>
                            Календарь
                        </NavLink>
                        <NavLink to="/notifications" className={styles.navLink}>
                            <IconBell size={16} stroke={1.8} />
                            Уведомления
                        </NavLink>
                    </nav>
                    <div className={styles.spacer} />
                    <ThemeToggle />
                </div>
            </header>
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
