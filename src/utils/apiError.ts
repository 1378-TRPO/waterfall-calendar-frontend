import { isAxiosError } from 'axios';

/** Бэкенд отдает ошибки в формате ProblemDetails, человекочитаемый текст в title. */
export function getApiErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        if (!error.response) {
            return 'Сервер недоступен';
        }
        const data = error.response.data as { title?: string; detail?: string } | undefined;
        return data?.title ?? data?.detail ?? `Ошибка ${error.response.status}`;
    }
    return error instanceof Error ? error.message : 'Неизвестная ошибка';
}
