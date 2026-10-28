import { createContext } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    kind: ToastKind;
    message: string;
}

export interface ToastContextValue {
    show: (kind: ToastKind, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
