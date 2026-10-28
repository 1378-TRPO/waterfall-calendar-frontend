import type {
    CreateEventPayload,
    EventDetails,
    EventPayload,
    EventSummary,
    RsvpStatus,
} from '../types/api';
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

    async cancel(id: number): Promise<EventDetails> {
        const { data } = await eventApi.post<EventDetails>(`/${id}/cancel`);
        return data;
    },

    async setRsvp(id: number, status: RsvpStatus): Promise<EventDetails> {
        const { data } = await eventApi.put<EventDetails>(`/${id}/rsvp`, { status });
        return data;
    },

    async ping(id: number, userId: number): Promise<void> {
        await eventApi.post(`/${id}/participants/${userId}/ping`);
    },
};
