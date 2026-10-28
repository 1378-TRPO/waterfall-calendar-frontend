import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

/** Ретраи бессмысленны для 4xx: это ошибки клиента, а не сети. */
function shouldRetry(failureCount: number, error: unknown): boolean {
    if (isAxiosError(error) && error.response && error.response.status < 500) {
        return false;
    }
    return failureCount < 2;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetry,
            staleTime: 30_000,
            refetchOnWindowFocus: true,
        },
    },
});
