import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queries/keys';
import { eventService } from '../services/eventService';

export function useEventsRange(from: Date, to: Date) {
    return useQuery({
        queryKey: queryKeys.events.range(from.toISOString(), to.toISOString()),
        queryFn: () => eventService.getRange(from.toISOString(), to.toISOString()),
        placeholderData: keepPreviousData,
    });
}
