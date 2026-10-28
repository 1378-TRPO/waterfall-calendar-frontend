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

/** Ошибки валидации (400, ValidationProblemDetails): словарь поле -> текст. */
export function getApiValidationErrors(error: unknown): Record<string, string> | null {
    if (isAxiosError(error) && error.response?.status === 400) {
        const errors = (error.response.data as { errors?: Record<string, string[]> }).errors;
        if (errors) {
            return Object.fromEntries(
                Object.entries(errors).map(([field, messages]) => [field, messages.join(' ')]),
            );
        }
    }
    return null;
}
