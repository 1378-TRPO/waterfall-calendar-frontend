import type { Notification } from '../types/api';
import { notificationApi } from './api';

interface UnreadCountResponse {
    count: number;
}

export const notificationService = {
    async getAll(): Promise<Notification[]> {
        const { data } = await notificationApi.get<Notification[]>('');
        return data;
    },

    async getUnreadCount(): Promise<number> {
        const { data } = await notificationApi.get<UnreadCountResponse>('/unread-count');
        return data.count;
    },

    async markRead(id: number): Promise<void> {
        await notificationApi.post(`/${id}/read`);
    },
};
