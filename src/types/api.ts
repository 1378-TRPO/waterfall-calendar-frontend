export interface User {
    id: number;
    email: string;
    displayName: string;
}

export interface AuthResponse {
    token: string;
    expiresAt: string;
    user: User;
}
