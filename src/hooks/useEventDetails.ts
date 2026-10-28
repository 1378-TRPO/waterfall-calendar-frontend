import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queries/keys';
import { eventService } from '../services/eventService';

export function useEventDetails(id: number | null) {
    return useQuery({
        queryKey: queryKeys.events.detail(id ?? 0),
        queryFn: () => eventService.get(id!),
        enabled: id !== null,
    });
}
