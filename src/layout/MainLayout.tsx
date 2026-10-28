import {
    IconBell,
    IconCalendar,
    IconLogout,
    IconMoon,
    IconSun,
    IconSunMoon,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useMe } from '../hooks/useMe';
import { useUnreadCount } from '../hooks/useNotifications';
import { authService } from '../services/authService';
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
            className={styles.iconButton}
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

function UserChip() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: me } = useMe();

    const handleLogout = () => {
        authService.logout();
        queryClient.clear();
        navigate('/login', { replace: true });
    };

    return (
        <div className={styles.userArea}>
            <div className={styles.userChip} title={me?.email}>
                <span className={styles.avatar}>{me?.displayName.charAt(0) ?? '?'}</span>
                <span className={styles.userName}>{me?.displayName ?? '...'}</span>
            </div>
            <button
                type="button"
                className={styles.iconButton}
                onClick={handleLogout}
                title="Выйти"
                aria-label="Выйти"
            >
                <IconLogout size={18} stroke={1.8} />
            </button>
        </div>
    );
}

function NotificationsLink() {
    const { data: unreadCount } = useUnreadCount();
    const badge = unreadCount && unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null;

    return (
        <NavLink to="/notifications" className={styles.navLink}>
            <span className={styles.bellWrap}>
                <IconBell size={16} stroke={1.8} />
                {badge && <span className={styles.badge}>{badge}</span>}
            </span>
            Уведомления
        </NavLink>
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
                        <NotificationsLink />
                    </nav>
                    <div className={styles.spacer} />
                    <ThemeToggle />
                    <UserChip />
                </div>
            </header>
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
