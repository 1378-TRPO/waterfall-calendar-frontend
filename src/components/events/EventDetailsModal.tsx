import {
    IconCalendar,
    IconLink,
    IconPencil,
    IconSpeakerphone,
    IconUser,
    IconX,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useEventDetails } from '../../hooks/useEventDetails';
import { queryKeys } from '../../queries/keys';
import { eventService } from '../../services/eventService';
import type { RsvpStatus } from '../../types/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatFullDate, formatTime } from '../../utils/datetime';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import Modal from '../Modal/Modal';
import { useToast } from '../Toast/useToast';
import styles from './EventDetailsModal.module.css';

interface EventDetailsModalProps {
    eventId: number;
    onClose: () => void;
    onEdit: (eventId: number) => void;
}

const RSVP_LABELS: Record<RsvpStatus, string> = {
    pending: 'Ожидает ответа',
    accepted: 'Принято',
    declined: 'Отклонено',
};

const TYPE_LABELS = { event: 'Событие', meeting: 'Встреча' } as const;

export default function EventDetailsModal({ eventId, onClose, onEdit }: EventDetailsModalProps) {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: details, isPending, isError, error } = useEventDetails(eventId);

    const [confirmCancel, setConfirmCancel] = useState(false);
    const [busyAction, setBusyAction] = useState<'cancel' | 'rsvp' | null>(null);
    const [pingingUserId, setPingingUserId] = useState<number | null>(null);

    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.events.root() });
    };

    const handleRsvp = async (status: RsvpStatus) => {
        if (!details) return;
        setBusyAction('rsvp');
        try {
            await eventService.setRsvp(eventId, status);
            toast.show(
                'success',
                status === 'accepted' ? 'Вы приняли встречу' : 'Вы отклонили встречу',
            );
            refresh();
        } catch (caught) {
            toast.show('error', getApiErrorMessage(caught));
        } finally {
            setBusyAction(null);
        }
    };

    const handleCancel = async () => {
        setBusyAction('cancel');
        try {
            await eventService.cancel(eventId);
            toast.show('success', 'Запись отменена');
            setConfirmCancel(false);
            refresh();
        } catch (caught) {
            toast.show('error', getApiErrorMessage(caught));
            setConfirmCancel(false);
        } finally {
            setBusyAction(null);
        }
    };

    const handlePing = async (userId: number) => {
        if (!details) return;
        setPingingUserId(userId);
        try {
            await eventService.ping(eventId, userId);
            toast.show('success', 'Участнику отправлен пинг');
        } catch (caught) {
            toast.show('error', getApiErrorMessage(caught));
        } finally {
            setPingingUserId(null);
        }
    };

    const startAt = details ? new Date(details.startAt) : null;
    const endAt = details ? new Date(details.endAt) : null;
    const sameDay = details ? formatFullDate(startAt!) === formatFullDate(endAt!) : false;

    return (
        <Modal title="Карточка записи" onClose={onClose} wide>
            {isPending && <p className={styles.loading}>Загружаем запись...</p>}
            {isError && <div className={styles.serverError}>{getApiErrorMessage(error)}</div>}
            {details && startAt && endAt && (
                <div className={styles.content}>
                    {details.isCancelled && (
                        <div className={styles.cancelledBanner}>Запись отменена</div>
                    )}

                    <div className={styles.titleRow}>
                        <span
                            className={`${styles.typeBadge} ${
                                details.type === 'meeting' ? styles.typeMeeting : ''
                            }`}
                        >
                            {TYPE_LABELS[details.type]}
                        </span>
                        <h3 className={styles.title}>{details.title}</h3>
                    </div>

                    <div className={styles.metaList}>
                        <div className={styles.metaRow}>
                            <IconCalendar size={16} stroke={1.8} />
                            <span>
                                {sameDay
                                    ? `${formatFullDate(startAt)}, ${formatTime(startAt)} - ${formatTime(endAt)}`
                                    : `${formatFullDate(startAt)} ${formatTime(startAt)} - ${formatFullDate(endAt)} ${formatTime(endAt)}`}
                            </span>
                        </div>
                        <div className={styles.metaRow}>
                            <IconUser size={16} stroke={1.8} />
                            <span>Организатор: {details.organizer.displayName}</span>
                        </div>
                        {details.meetingUrl && (
                            <div className={styles.metaRow}>
                                <IconLink size={16} stroke={1.8} />
                                <a
                                    href={details.meetingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.link}
                                >
                                    {details.meetingUrl}
                                </a>
                            </div>
                        )}
                    </div>

                    {details.description && (
                        <p className={styles.description}>{details.description}</p>
                    )}

                    {details.type === 'meeting' && (
                        <section className={styles.section}>
                            <h4 className={styles.sectionTitle}>Участники</h4>
                            <ul className={styles.participants}>
                                {details.participants.map((participant) => (
                                    <li key={participant.userId} className={styles.participant}>
                                        <span className={styles.avatar}>
                                            {participant.displayName.charAt(0)}
                                        </span>
                                        <span className={styles.participantName}>
                                            {participant.displayName}
                                        </span>
                                        <span className={styles.participantEmail}>
                                            {participant.email}
                                        </span>
                                        <span className={styles.participantRight}>
                                            {participant.rsvpStatus && (
                                                <span
                                                    className={`${styles.rsvpBadge} ${styles[participant.rsvpStatus]}`}
                                                >
                                                    {RSVP_LABELS[participant.rsvpStatus]}
                                                </span>
                                            )}
                                            {details.isOrganizer && !details.isCancelled && (
                                                <button
                                                    type="button"
                                                    className={styles.pingButton}
                                                    onClick={() => handlePing(participant.userId)}
                                                    disabled={pingingUserId === participant.userId}
                                                    title="Пингнуть участника"
                                                >
                                                    <IconSpeakerphone size={16} stroke={1.8} />
                                                    Пинг
                                                </button>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {!details.isOrganizer &&
                        details.type === 'meeting' &&
                        !details.isCancelled &&
                        details.myRsvpStatus && (
                            <section className={styles.section}>
                                <h4 className={styles.sectionTitle}>Мой ответ</h4>
                                <div className={styles.rsvpActions}>
                                    <button
                                        type="button"
                                        className={`${styles.rsvpButton} ${styles.rsvpAccept} ${
                                            details.myRsvpStatus === 'accepted'
                                                ? styles.rsvpActive
                                                : ''
                                        }`}
                                        onClick={() => handleRsvp('accepted')}
                                        disabled={busyAction === 'rsvp'}
                                    >
                                        Принять
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.rsvpButton} ${styles.rsvpDecline} ${
                                            details.myRsvpStatus === 'declined'
                                                ? styles.rsvpActiveDecline
                                                : ''
                                        }`}
                                        onClick={() => handleRsvp('declined')}
                                        disabled={busyAction === 'rsvp'}
                                    >
                                        Отклонить
                                    </button>
                                </div>
                            </section>
                        )}

                    {details.isOrganizer && !details.isCancelled && (
                        <div className={styles.footer}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => onEdit(eventId)}
                            >
                                <IconPencil size={16} stroke={1.8} />
                                Редактировать
                            </button>
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={() => setConfirmCancel(true)}
                            >
                                <IconX size={16} stroke={1.8} />
                                Отменить
                            </button>
                        </div>
                    )}
                </div>
            )}

            {confirmCancel && (
                <ConfirmDialog
                    title="Отменить запись"
                    message="Запись будет отменена и останется в календаре помеченной. Действие необратимо."
                    confirmLabel="Отменить запись"
                    danger
                    busy={busyAction === 'cancel'}
                    onConfirm={handleCancel}
                    onClose={() => setConfirmCancel(false)}
                />
            )}
        </Modal>
    );
}
