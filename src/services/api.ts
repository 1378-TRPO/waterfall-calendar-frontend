import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { queryClient } from '../queries/queryClient';
import { tokenStorage } from '../utils/tokenStorage';

function forceLogout() {
    tokenStorage.clear();
    queryClient.clear();
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

/**
 * Единственный axios-инстанс на приложение: JWT-инъекция и разлогин по 401
 * живут здесь, сервисы различаются только полным префиксом маршрута
 * в `baseURL` конкретного запроса.
 */
const api: AxiosInstance = axios.create({
    timeout: 30 * 1000,
});

api.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            forceLogout();
        }
        return Promise.reject(error);
    },
);

/** Тонкая обертка: фиксирует префикс сервиса, не плодя новые инстансы. */
function scoped(baseURL: string) {
    const withBase = (config?: AxiosRequestConfig): AxiosRequestConfig => ({
        ...config,
        baseURL,
    });

    return {
        get: <T>(url: string, config?: AxiosRequestConfig) => api.get<T>(url, withBase(config)),
        post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
            api.post<T>(url, data, withBase(config)),
        put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
            api.put<T>(url, data, withBase(config)),
        delete: <T>(url: string, config?: AxiosRequestConfig) =>
            api.delete<T>(url, withBase(config)),
    };
}

export const authApi = scoped('/api/auth');
export const userApi = scoped('/api/users');
export const eventApi = scoped('/api/events');
export const notificationApi = scoped('/api/notifications');

export { api };
