import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import styles from './Toast.module.css';
import { ToastContext, type ToastItem, type ToastKind } from './toast-context';

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(0);

    const show = useCallback((kind: ToastKind, message: string) => {
        const id = nextId.current++;
        setToasts((prev) => [...prev, { id, kind, message }]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, AUTO_DISMISS_MS);
    }, []);

    const value = useMemo(() => ({ show }), [show]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className={styles.container} role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`${styles.toast} ${styles[toast.kind]}`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
