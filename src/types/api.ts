export type EventType = 'event' | 'meeting';

export type RsvpStatus = 'pending' | 'accepted' | 'declined';

export type NotificationType = 'invited' | 'pinged' | 'changed' | 'cancelled';

export interface User {
    id: number;
    email: string;
    displayName: string;
}

export interface AuthResponse {
    token: string;
    expiresAt: string;
    user: User;
}

export interface EventSummary {
    id: number;
    type: EventType;
    title: string;
    startAt: string;
    endAt: string;
    meetingUrl: string | null;
    organizerId: number;
    organizerName: string;
    isCancelled: boolean;
    isOrganizer: boolean;
    myRsvpStatus: RsvpStatus | null;
}

export interface Participant {
    userId: number;
    displayName: string;
    email: string;
    rsvpStatus: RsvpStatus | null;
    respondedAt: string | null;
}

export interface EventDetails {
    id: number;
    type: EventType;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    meetingUrl: string | null;
    organizer: User;
    isCancelled: boolean;
    isOrganizer: boolean;
    myRsvpStatus: RsvpStatus | null;
    participants: Participant[];
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: number;
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: string;
    eventId: number | null;
}

export interface EventPayload {
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    meetingUrl: string | null;
    participantIds: number[];
}

export interface CreateEventPayload extends EventPayload {
    type: EventType;
}
