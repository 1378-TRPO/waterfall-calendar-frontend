import { IconCalendar, IconMoon, IconSun, IconSunMoon } from '@tabler/icons-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../theme/theme-context';
import styles from './LoginPage.module.css';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
}

function ThemeToggle() {
    const { mode, setMode } = useTheme();
    const next: Record<string, 'light' | 'dark' | 'system'> = {
        light: 'dark',
        dark: 'system',
        system: 'light',
    };

    return (
        <button
            type="button"
            className={styles.themeToggle}
            onClick={() => setMode(next[mode])}
            aria-label="Переключить тему"
        >
            {mode === 'light' && <IconSun size={18} stroke={1.8} />}
            {mode === 'dark' && <IconMoon size={18} stroke={1.8} />}
            {mode === 'system' && <IconSunMoon size={18} stroke={1.8} />}
        </button>
    );
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!email.trim()) {
            errors.email = 'Укажите email';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            errors.email = 'Некорректный email';
        }
        if (!password) {
            errors.password = 'Введите пароль';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setServerError('');
        if (!validate()) {
            return;
        }
        setSubmitting(true);
        try {
            await onLogin(email, password);
        } catch (error) {
            setServerError(error instanceof Error ? error.message : 'Не удалось войти');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <ThemeToggle />
            <div className={styles.card}>
                <div className={styles.brand}>
                    <span className={styles.logoIcon}>
                        <IconCalendar size={24} stroke={1.8} />
                    </span>
                    <div>
                        <h1 className={styles.title}>Календарик</h1>
                        <p className={styles.subtitle}>Вход в рабочий календарь</p>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@company.local"
                            autoComplete="email"
                        />
                        {fieldErrors.email && <p className={styles.error}>{fieldErrors.email}</p>}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="login-password">
                            Пароль
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Пароль"
                            autoComplete="current-password"
                        />
                        {fieldErrors.password && (
                            <p className={styles.error}>{fieldErrors.password}</p>
                        )}
                    </div>

                    {serverError && <div className={styles.serverError}>{serverError}</div>}

                    <button type="submit" className={styles.submit} disabled={submitting}>
                        {submitting ? 'Входим...' : 'Войти'}
                    </button>
                </form>

                <p className={styles.switch}>
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}
