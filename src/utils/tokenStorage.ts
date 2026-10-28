const TOKEN_KEY = 'wc-access-token';

export const tokenStorage = {
    getAccessToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    setAccessToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },
    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
    },
    isAuthenticated(): boolean {
        return Boolean(localStorage.getItem(TOKEN_KEY));
    },
};
