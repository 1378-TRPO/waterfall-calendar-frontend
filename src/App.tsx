import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ToastProvider } from './components/Toast/ToastContext';
import MainLayout from './layout/MainLayout';
import CalendarPage from './pages/calendar/CalendarPage';
import LoginPage from './pages/login/LoginPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import RegisterPage from './pages/register/RegisterPage';
import { authService } from './services/authService';
import { ThemeProvider } from './theme/ThemeContext';
import { tokenStorage } from './utils/tokenStorage';

function LoginRoute() {
    if (tokenStorage.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    const handleLogin = async (email: string, password: string) => {
        await authService.login(email, password);
        window.location.href = '/';
    };

    return <LoginPage onLogin={handleLogin} />;
}

function RegisterRoute() {
    if (tokenStorage.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    const handleRegister = async (displayName: string, email: string, password: string) => {
        // Регистрация сразу выдает токен, отдельный вход не нужен.
        await authService.register(displayName, email, password);
        window.location.href = '/';
    };

    return <RegisterPage onRegister={handleRegister} />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!tokenStorage.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

export default function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginRoute />} />
                        <Route path="/register" element={<RegisterRoute />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<CalendarPage />} />
                            <Route path="notifications" element={<NotificationsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </ThemeProvider>
    );
}
