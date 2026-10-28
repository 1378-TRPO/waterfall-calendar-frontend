import Modal from '../Modal/Modal';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    busy?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Подтвердить',
    danger,
    busy,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Modal title={title} onClose={onClose}>
            <p className={styles.message}>{message}</p>
            <div className={styles.footer}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={busy}
                >
                    Отмена
                </button>
                <button
                    type="button"
                    className={`${styles.confirmButton} ${danger ? styles.danger : ''}`}
                    onClick={onConfirm}
                    disabled={busy}
                >
                    {busy ? 'Выполняем...' : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
