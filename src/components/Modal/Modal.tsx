import { IconX } from '@tabler/icons-react';
import { type ReactNode, useEffect } from 'react';

import styles from './Modal.module.css';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    wide?: boolean;
}

export default function Modal({ title, onClose, children, wide }: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className={styles.overlay}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            role="presentation"
        >
            <div
                className={`${styles.dialog} ${wide ? styles.dialogWide : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        <IconX size={18} stroke={1.8} />
                    </button>
                </div>
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
}
