import type { User } from '../types/api';
import { userApi } from './api';

export const userService = {
    async getAll(): Promise<User[]> {
        const { data } = await userApi.get<User[]>('');
        return data;
    },
};
