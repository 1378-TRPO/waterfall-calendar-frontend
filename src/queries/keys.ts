export const queryKeys = {
    auth: {
        me: () => ['auth', 'me'] as const,
    },
    users: {
        all: () => ['users'] as const,
    },
    events: {
        range: (from: string, to: string) => ['events', 'range', from, to] as const,
        upcoming: (limit: number) => ['events', 'upcoming', limit] as const,
        detail: (id: string) => ['events', 'detail', id] as const,
    },
    notifications: {
        list: () => ['notifications'] as const,
        unreadCount: () => ['notifications', 'unread-count'] as const,
    },
};
