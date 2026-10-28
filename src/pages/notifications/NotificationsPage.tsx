import { IconBellOff } from '@tabler/icons-react';

import styles from './NotificationsPage.module.css';

export default function NotificationsPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Уведомления</h1>
            <div className={styles.empty}>
                <IconBellOff size={32} stroke={1.6} />
                <p className={styles.emptyTitle}>Уведомлений пока нет</p>
                <p className={styles.emptyText}>
                    Здесь появятся приглашения, пинги и изменения встреч.
                </p>
            </div>
        </div>
    );
}
