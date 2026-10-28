import { IconCheck, IconX } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useUpcomingEvents } from '../../hooks/useEvents';
import { queryKeys } from '../../queries/keys';
import { eventService } from '../../services/eventService';
import type { EventSummary } from '../../types/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDayMonth, formatTime, isSameDay } from '../../utils/datetime';
import styles from './UpcomingPanel.module.css';

interface UpcomingPanelProps {
    onEventClick: (event: EventSummary) => void;
}

function formatWhen(startAt: Date): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (isSameDay(startAt, now)) {
        return `Сегодня, ${formatTime(startAt)}`;
    }
    if (isSameDay(startAt, tomorrow)) {
        return `Завтра, ${formatTime(startAt)}`;
    }
    return `${formatDayMonth(startAt)}, ${formatTime(startAt)}`;
}

export default function UpcomingPanel({ onEventClick }: UpcomingPanelProps) {
    const queryClient = useQueryClient();
    const { data: upcoming, isPending } = useUpcomingEvents(10);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [errorId, setErrorId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRsvp = async (event: EventSummary, status: 'accepted' | 'declined') => {
        setBusyId(event.id);
        setErrorId(null);
        try {
            await eventService.setRsvp(event.id, status);
            await queryClient.invalidateQueries({ queryKey: queryKeys.events.root() });
        } catch (caught) {
            setErrorId(event.id);
            setErrorMessage(getApiErrorMessage(caught));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <aside className={styles.panel}>
            <h2 className={styles.title}>Ближайшие</h2>

            {isPending && <p className={styles.loading}>Загружаем...</p>}

            {!isPending && (upcoming?.length ?? 0) === 0 && (
                <div className={styles.empty}>
                    <p className={styles.emptyTitle}>Ничего не запланировано</p>
                    <p className={styles.emptyText}>
                        Будущие записи, где вы организатор или участник, появятся здесь.
                    </p>
                </div>
            )}

            {errorId !== null && <p className={styles.error}>{errorMessage}</p>}

            {upcoming && upcoming.length > 0 && (
                <ul className={styles.list}>
                    {upcoming.map((event) => {
                        const startAt = new Date(event.startAt);
                        const showRsvp =
                            event.type === 'meeting' &&
                            !event.isOrganizer &&
                            event.myRsvpStatus === 'pending';
                        return (
                            <li key={event.id} className={styles.item}>
                                <div
                                    className={styles.body}
                                    onClick={() => onEventClick(event)}
                                    role="presentation"
                                >
                                    <span
                                        className={`${styles.when} ${
                                            event.type === 'meeting' ? styles.whenMeeting : ''
                                        }`}
                                    >
                                        {formatWhen(startAt)}
                                    </span>
                                    <span className={styles.itemTitle}>{event.title}</span>
                                    <span
                                        className={`${styles.role} ${
                                            event.isOrganizer ? styles.roleOrganizer : ''
                                        }`}
                                    >
                                        {event.isOrganizer ? 'Организатор' : 'Участник'}
                                    </span>
                                </div>
                                {showRsvp && (
                                    <div className={styles.rsvpRow}>
                                        <button
                                            type="button"
                                            className={styles.acceptButton}
                                            disabled={busyId === event.id}
                                            onClick={() => handleRsvp(event, 'accepted')}
                                            title="Принять"
                                        >
                                            <IconCheck size={14} stroke={1.8} />
                                            Приду
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.declineButton}
                                            disabled={busyId === event.id}
                                            onClick={() => handleRsvp(event, 'declined')}
                                            title="Отклонить"
                                        >
                                            <IconX size={14} stroke={1.8} />
                                            Не смогу
                                        </button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </aside>
    );
}
