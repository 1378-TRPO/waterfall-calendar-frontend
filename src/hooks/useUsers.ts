import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queries/keys';
import { userService } from '../services/userService';

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.users.all(),
        queryFn: () => userService.getAll(),
        staleTime: 5 * 60_000,
    });
}
