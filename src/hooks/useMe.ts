import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queries/keys';
import { authService } from '../services/authService';

export function useMe() {
    return useQuery({
        queryKey: queryKeys.auth.me(),
        queryFn: () => authService.me(),
        staleTime: 5 * 60_000,
    });
}
