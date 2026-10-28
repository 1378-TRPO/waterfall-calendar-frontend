import { IconLink } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useMemo, useState } from 'react';

import { useEventDetails } from '../../hooks/useEventDetails';
import { useMe } from '../../hooks/useMe';
import { useUsers } from '../../hooks/useUsers';
import { queryKeys } from '../../queries/keys';
import { eventService } from '../../services/eventService';
import type { EventDetails, EventType } from '../../types/api';
import { getApiErrorMessage, getApiValidationErrors } from '../../utils/apiError';
import { fromLocalInputValue, toLocalInputValue } from '../../utils/datetime';
import Modal from '../Modal/Modal';
import styles from './EventEditorModal.module.css';

interface EventEditorModalProps {
    mode: 'create' | 'edit';
    eventId?: number;
    initialDate?: Date | null;
    onClose: () => void;
    onSaved: () => void;
}

interface FormState {
    type: EventType;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    meetingUrl: string;
    participantIds: number[];
}

function defaultForm(initialDate: Date | null): FormState {
    const start = initialDate
        ? new Date(initialDate)
        : (() => {
              const next = new Date();
              next.setMinutes(0, 0, 0);
              next.setHours(next.getHours() + 1);
              return next;
          })();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
        type: 'meeting',
        title: '',
        description: '',
        startAt: toLocalInputValue(start),
        endAt: toLocalInputValue(end),
        meetingUrl: '',
        participantIds: [],
    };
}

function formFromDetails(details: EventDetails): FormState {
    return {
        type: details.type,
        title: details.title,
        description: details.description ?? '',
        startAt: toLocalInputValue(new Date(details.startAt)),
        endAt: toLocalInputValue(new Date(details.endAt)),
        meetingUrl: details.meetingUrl ?? '',
        participantIds: details.participants.map((participant) => participant.userId),
    };
}

function generateDemoUrl(): string {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const random = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `https://meet.local/${random}`;
}

const TYPE_LABELS: Record<EventType, string> = {
    event: 'Событие',
    meeting: 'Встреча',
};

interface EventEditorFormProps {
    isEdit: boolean;
    eventId?: number;
    initialValues: FormState;
    onClose: () => void;
    onSaved: () => void;
}

function EventEditorForm({
    isEdit,
    eventId,
    initialValues,
    onClose,
    onSaved,
}: EventEditorFormProps) {
    const queryClient = useQueryClient();
    const { data: me } = useMe();
    const { data: users, isPending: usersLoading } = useUsers();

    const [form, setForm] = useState<FormState>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState('');
    const [saving, setSaving] = useState(false);

    const candidates = useMemo(
        () => (users ?? []).filter((user) => user.id !== me?.id),
        [users, me?.id],
    );

    const patch = (changes: Partial<FormState>) => setForm((prev) => ({ ...prev, ...changes }));

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!form.title.trim()) {
            errors.title = 'Название не должно быть пустым';
        }
        const start = fromLocalInputValue(form.startAt);
        const end = fromLocalInputValue(form.endAt);
        if (!form.startAt || Number.isNaN(start.getTime())) {
            errors.startAt = 'Укажите время начала';
        } else if (!form.endAt || Number.isNaN(end.getTime())) {
            errors.endAt = 'Укажите время конца';
        } else if (end.getTime() <= start.getTime()) {
            errors.endAt = 'Конец должен быть позже начала';
        }
        if (form.type === 'meeting') {
            const url = form.meetingUrl.trim();
            if (url && !/^https?:\/\//i.test(url)) {
                errors.meetingUrl = 'Ссылка должна начинаться с http:// или https://';
            }
            if (form.participantIds.length === 0) {
                errors.participantIds = 'Укажите хотя бы одного участника';
            }
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setServerError('');
        if (!validate()) {
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                startAt: fromLocalInputValue(form.startAt).toISOString(),
                endAt: fromLocalInputValue(form.endAt).toISOString(),
                meetingUrl:
                    form.type === 'meeting' && form.meetingUrl.trim()
                        ? form.meetingUrl.trim()
                        : null,
                participantIds: form.type === 'meeting' ? form.participantIds : [],
            };
            if (isEdit && eventId) {
                await eventService.update(eventId, payload);
            } else {
                await eventService.create({ ...payload, type: form.type });
            }
            await queryClient.invalidateQueries({ queryKey: queryKeys.events.root() });
            onSaved();
        } catch (error) {
            const validationErrors = getApiValidationErrors(error);
            if (validationErrors) {
                setFieldErrors(validationErrors);
            } else {
                setServerError(getApiErrorMessage(error));
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.typeRow}>
                {isEdit ? (
                    <span className={styles.typeBadge}>{TYPE_LABELS[form.type]}</span>
                ) : (
                    <div className={styles.typeSwitch}>
                        {(Object.keys(TYPE_LABELS) as EventType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`${styles.typeButton} ${
                                    form.type === type ? styles.typeButtonActive : ''
                                }`}
                                onClick={() => patch({ type })}
                            >
                                {TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="event-title">
                    Название
                </label>
                <input
                    id="event-title"
                    type="text"
                    className={`${styles.input} ${fieldErrors.title ? styles.inputError : ''}`}
                    value={form.title}
                    onChange={(event) => patch({ title: event.target.value })}
                    placeholder="О чем встреча"
                    maxLength={200}
                />
                {fieldErrors.title && <p className={styles.error}>{fieldErrors.title}</p>}
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="event-description">
                    Описание
                </label>
                <textarea
                    id="event-description"
                    className={styles.textarea}
                    value={form.description}
                    onChange={(event) => patch({ description: event.target.value })}
                    placeholder="Необязательно"
                    rows={3}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="event-start">
                        Начало
                    </label>
                    <input
                        id="event-start"
                        type="datetime-local"
                        className={`${styles.input} ${fieldErrors.startAt ? styles.inputError : ''}`}
                        value={form.startAt}
                        onChange={(event) => patch({ startAt: event.target.value })}
                    />
                    {fieldErrors.startAt && <p className={styles.error}>{fieldErrors.startAt}</p>}
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="event-end">
                        Конец
                    </label>
                    <input
                        id="event-end"
                        type="datetime-local"
                        className={`${styles.input} ${fieldErrors.endAt ? styles.inputError : ''}`}
                        value={form.endAt}
                        onChange={(event) => patch({ endAt: event.target.value })}
                    />
                    {fieldErrors.endAt && <p className={styles.error}>{fieldErrors.endAt}</p>}
                </div>
            </div>

            {form.type === 'meeting' && (
                <>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="event-url">
                            Ссылка на созвон
                        </label>
                        <div className={styles.urlRow}>
                            <input
                                id="event-url"
                                type="url"
                                className={`${styles.input} ${fieldErrors.meetingUrl ? styles.inputError : ''}`}
                                value={form.meetingUrl}
                                onChange={(event) => patch({ meetingUrl: event.target.value })}
                                placeholder="https://..."
                                maxLength={500}
                            />
                            <button
                                type="button"
                                className={styles.demoButton}
                                onClick={() => patch({ meetingUrl: generateDemoUrl() })}
                                title="Сгенерировать демо-ссылку"
                            >
                                <IconLink size={16} stroke={1.8} />
                                Демо-ссылка
                            </button>
                        </div>
                        {fieldErrors.meetingUrl && (
                            <p className={styles.error}>{fieldErrors.meetingUrl}</p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Участники</span>
                        {usersLoading ? (
                            <p className={styles.loading}>Загружаем пользователей...</p>
                        ) : (
                            <div
                                className={`${styles.participants} ${
                                    fieldErrors.participantIds ? styles.participantsError : ''
                                }`}
                            >
                                {candidates.length === 0 && (
                                    <p className={styles.noUsers}>Других пользователей пока нет</p>
                                )}
                                {candidates.map((user) => {
                                    const checked = form.participantIds.includes(user.id);
                                    return (
                                        <label
                                            key={user.id}
                                            className={`${styles.participant} ${
                                                checked ? styles.participantChecked : ''
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    patch({
                                                        participantIds: checked
                                                            ? form.participantIds.filter(
                                                                  (id) => id !== user.id,
                                                              )
                                                            : [...form.participantIds, user.id],
                                                    })
                                                }
                                            />
                                            <span className={styles.participantName}>
                                                {user.displayName}
                                            </span>
                                            <span className={styles.participantEmail}>
                                                {user.email}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        {fieldErrors.participantIds && (
                            <p className={styles.error}>{fieldErrors.participantIds}</p>
                        )}
                    </div>
                </>
            )}

            {serverError && <div className={styles.serverError}>{serverError}</div>}

            <div className={styles.footer}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={saving}
                >
                    Отмена
                </button>
                <button type="submit" className={styles.submitButton} disabled={saving}>
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}

export default function EventEditorModal({
    mode,
    eventId,
    initialDate,
    onClose,
    onSaved,
}: EventEditorModalProps) {
    const isEdit = mode === 'edit';
    // Форма монтируется только когда данные готовы: состояние инициализируется
    // из props, без setState в эффектах.
    const { data: details, isPending: detailsLoading } = useEventDetails(
        isEdit && eventId ? eventId : null,
    );

    const initialValues = useMemo(() => {
        if (isEdit && details) {
            return formFromDetails(details);
        }
        return defaultForm(initialDate ?? null);
    }, [isEdit, details, initialDate]);

    const formKey = isEdit ? `edit-${eventId}` : 'create';

    return (
        <Modal title={isEdit ? 'Редактирование записи' : 'Новая запись'} onClose={onClose} wide>
            {isEdit && detailsLoading ? (
                <p className={styles.loading}>Загружаем запись...</p>
            ) : (
                <EventEditorForm
                    key={formKey}
                    isEdit={isEdit}
                    eventId={eventId}
                    initialValues={initialValues}
                    onClose={onClose}
                    onSaved={onSaved}
                />
            )}
        </Modal>
    );
}
