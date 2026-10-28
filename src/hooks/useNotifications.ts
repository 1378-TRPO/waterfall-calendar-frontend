import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queries/keys';
import { notificationService } from '../services/notificationService';

/** Колокольчик опрашивает счетчик раз в 30 секунд, по требованиям FR-9. */
export function useUnreadCount() {
    return useQuery({
        queryKey: queryKeys.notifications.unreadCount(),
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: 30_000,
    });
}

export function useNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: () => notificationService.getAll(),
    });
}
