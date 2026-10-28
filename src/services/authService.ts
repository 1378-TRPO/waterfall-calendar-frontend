import type { AuthResponse, User } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';
import { tokenStorage } from '../utils/tokenStorage';
import { authApi } from './api';

export const authService = {
    async login(email: string, password: string): Promise<User> {
        try {
            const { data } = await authApi.post<AuthResponse>('/login', { email, password });
            tokenStorage.setAccessToken(data.token);
            return data.user;
        } catch (error) {
            throw new Error(getApiErrorMessage(error), { cause: error });
        }
    },

    async register(displayName: string, email: string, password: string): Promise<User> {
        try {
            const { data } = await authApi.post<AuthResponse>('/register', {
                displayName,
                email,
                password,
            });
            tokenStorage.setAccessToken(data.token);
            return data.user;
        } catch (error) {
            throw new Error(getApiErrorMessage(error), { cause: error });
        }
    },

    async me(): Promise<User> {
        const { data } = await authApi.get<User>('/me');
        return data;
    },

    logout(): void {
        tokenStorage.clear();
    },
};
