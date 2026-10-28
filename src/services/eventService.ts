import type { CreateEventPayload, EventDetails, EventPayload, EventSummary } from '../types/api';
import { eventApi } from './api';

export const eventService = {
    async getRange(from: string, to: string): Promise<EventSummary[]> {
        const { data } = await eventApi.get<EventSummary[]>('', { params: { from, to } });
        return data;
    },

    async get(id: number): Promise<EventDetails> {
        const { data } = await eventApi.get<EventDetails>(`/${id}`);
        return data;
    },

    async create(payload: CreateEventPayload): Promise<EventDetails> {
        const { data } = await eventApi.post<EventDetails>('', payload);
        return data;
    },

    async update(id: number, payload: EventPayload): Promise<EventDetails> {
        const { data } = await eventApi.put<EventDetails>(`/${id}`, payload);
        return data;
    },
};
