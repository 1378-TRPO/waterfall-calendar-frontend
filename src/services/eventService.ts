import type { EventSummary } from '../types/api';
import { eventApi } from './api';

export const eventService = {
    async getRange(from: string, to: string): Promise<EventSummary[]> {
        const { data } = await eventApi.get<EventSummary[]>('', { params: { from, to } });
        return data;
    },
};
