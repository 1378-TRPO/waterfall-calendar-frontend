import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ToastProvider } from './components/Toast/ToastContext';
import MainLayout from './layout/MainLayout';
import CalendarPage from './pages/calendar/CalendarPage';
import LoginPage from './pages/login/LoginPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import RegisterPage from './pages/register/RegisterPage';
import { ThemeProvider } from './theme/ThemeContext';
import { tokenStorage } from './utils/tokenStorage';

function LoginRoute() {
    if (tokenStorage.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    // Заглушка этапа scaffold: реальный authService подключается на этапе auth.
    const handleLogin = async () => {
        throw new Error('Вход пока не подключен к бэкенду, ожидайте этап auth');
    };

    return <LoginPage onLogin={handleLogin} />;
}

function RegisterRoute() {
    if (tokenStorage.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    const handleRegister = async () => {
        throw new Error('Регистрация пока не подключена к бэкенду, ожидайте этап auth');
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
