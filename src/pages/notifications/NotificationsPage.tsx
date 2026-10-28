import {
    IconBell,
    IconBellOff,
    IconCheck,
    IconPencil,
    IconSpeakerphone,
    IconUserPlus,
    IconX,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EventDetailsModal from '../../components/events/EventDetailsModal';
import { useNotifications, useUnreadCount } from '../../hooks/useNotifications';
import { queryKeys } from '../../queries/keys';
import { notificationService } from '../../services/notificationService';
import type { Notification, NotificationType } from '../../types/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatShortDateTime } from '../../utils/datetime';
import styles from './NotificationsPage.module.css';

const TYPE_ICONS: Record<NotificationType, typeof IconBell> = {
    invited: IconUserPlus,
    pinged: IconSpeakerphone,
    changed: IconPencil,
    cancelled: IconX,
};

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { data: notifications, isPending, isError, error } = useNotifications();
    const { refetch: refetchUnreadCount } = useUnreadCount();
    const [openEventId, setOpenEventId] = useState<number | null>(null);
    const [markingId, setMarkingId] = useState<number | null>(null);

    const refreshCounters = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
        void refetchUnreadCount();
    };

    const handleMarkRead = async (notification: Notification) => {
        if (notification.isRead) {
            return;
        }
        setMarkingId(notification.id);
        try {
            // Повторная отметка на бэкенде безопасна, сетевые ошибки молча игнорируем.
            await notificationService.markRead(notification.id);
            refreshCounters();
        } catch {
            // уже прочитано или не найдено
        } finally {
            setMarkingId(null);
        }
    };

    const handleOpen = (notification: Notification) => {
        void handleMarkRead(notification);
        if (notification.eventId) {
            setOpenEventId(notification.eventId);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Уведомления</h1>

            {isError && <div className={styles.serverError}>{getApiErrorMessage(error)}</div>}

            {isPending && <p className={styles.loading}>Загружаем уведомления...</p>}

            {!isPending && (notifications?.length ?? 0) === 0 && (
                <div className={styles.empty}>
                    <IconBellOff size={32} stroke={1.6} />
                    <p className={styles.emptyTitle}>Уведомлений пока нет</p>
                    <p className={styles.emptyText}>
                        Здесь появятся приглашения, пинги и изменения встреч.
                    </p>
                </div>
            )}

            {!isPending && (notifications?.length ?? 0) > 0 && (
                <ul className={styles.list}>
                    {notifications!.map((notification) => {
                        const Icon = TYPE_ICONS[notification.type];
                        return (
                            <li
                                key={notification.id}
                                className={`${styles.item} ${notification.isRead ? styles.itemRead : styles.itemUnread}`}
                            >
                                <span className={`${styles.iconWrap} ${styles[notification.type]}`}>
                                    <Icon size={18} stroke={1.8} />
                                </span>
                                <div
                                    className={styles.body}
                                    onClick={() => handleOpen(notification)}
                                    role="presentation"
                                >
                                    <p className={styles.message}>{notification.message}</p>
                                    <span className={styles.time}>
                                        {formatShortDateTime(new Date(notification.createdAt))}
                                    </span>
                                </div>
                                {!notification.isRead && (
                                    <button
                                        type="button"
                                        className={styles.readButton}
                                        onClick={() => handleMarkRead(notification)}
                                        disabled={markingId === notification.id}
                                        title="Отметить прочитанным"
                                    >
                                        <IconCheck size={16} stroke={1.8} />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {openEventId !== null && (
                <EventDetailsModal
                    eventId={openEventId}
                    onClose={() => {
                        setOpenEventId(null);
                        refreshCounters();
                    }}
                    onEdit={() => {
                        setOpenEventId(null);
                        navigate('/');
                    }}
                />
            )}
        </div>
    );
}
