import { IconCalendarPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import CalendarToolbar from '../../components/calendar/CalendarToolbar';
import MonthGrid from '../../components/calendar/MonthGrid';
import TimeGrid from '../../components/calendar/TimeGrid';
import UpcomingPanel from '../../components/calendar/UpcomingPanel';
import type { ViewMode } from '../../components/calendar/view-mode';
import EventDetailsModal from '../../components/events/EventDetailsModal';
import EventEditorModal from '../../components/events/EventEditorModal';
import { useEventsRange } from '../../hooks/useEvents';
import type { EventSummary } from '../../types/api';
import {
    addDays,
    addMonths,
    buildMonthGrid,
    endOfDay,
    endOfMonth,
    endOfWeek,
    formatFullDate,
    formatMonthYear,
    formatWeekRange,
    getWeekDays,
    isSameDay,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from '../../utils/datetime';
import styles from './CalendarPage.module.css';

function getViewRange(view: ViewMode, cursor: Date): { from: Date; to: Date } {
    if (view === 'month') {
        return {
            from: startOfDay(startOfWeek(startOfMonth(cursor))),
            to: endOfDay(endOfWeek(endOfMonth(cursor))),
        };
    }
    if (view === 'week') {
        return { from: startOfDay(startOfWeek(cursor)), to: endOfDay(endOfWeek(cursor)) };
    }
    return { from: startOfDay(cursor), to: endOfDay(cursor) };
}

function getPeriodLabel(view: ViewMode, cursor: Date): string {
    if (view === 'month') {
        return formatMonthYear(cursor);
    }
    if (view === 'week') {
        return formatWeekRange(startOfWeek(cursor), endOfWeek(cursor));
    }
    return formatFullDate(cursor);
}

interface EditorState {
    mode: 'create' | 'edit';
    eventId?: number;
    initialDate?: Date | null;
}

export default function CalendarPage() {
    const [view, setView] = useState<ViewMode>('month');
    const [cursor, setCursor] = useState(() => new Date());
    const [editor, setEditor] = useState<EditorState | null>(null);
    const [detailsId, setDetailsId] = useState<number | null>(null);

    const range = useMemo(() => getViewRange(view, cursor), [view, cursor]);
    const { data: events, isPending, isError } = useEventsRange(range.from, range.to);

    const today = new Date();

    const periodLabel = getPeriodLabel(view, cursor);

    const handlePrev = () => {
        if (view === 'month') {
            setCursor((prev) => addMonths(prev, -1));
        } else if (view === 'week') {
            setCursor((prev) => addDays(prev, -7));
        } else {
            setCursor((prev) => addDays(prev, -1));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCursor((prev) => addMonths(prev, 1));
        } else if (view === 'week') {
            setCursor((prev) => addDays(prev, 7));
        } else {
            setCursor((prev) => addDays(prev, 1));
        }
    };

    const eventsByDay = useMemo(() => {
        const map = new Map<number, EventSummary[]>();
        for (const event of events ?? []) {
            const key = startOfDay(new Date(event.startAt)).getTime();
            const list = map.get(key) ?? [];
            list.push(event);
            map.set(key, list);
        }
        return map;
    }, [events]);

    const gridDays = useMemo(() => buildMonthGrid(cursor), [cursor]);

    const openCreate = (initialDate?: Date | null) => setEditor({ mode: 'create', initialDate });
    const openDetails = (event: EventSummary) => setDetailsId(event.id);

    // Клик по пустому дню в месяце: запись на 10:00 этого дня.
    const handleDayClick = (day: Date) => {
        const at = startOfDay(day);
        at.setHours(10);
        openCreate(at);
    };

    return (
        <div className={styles.page}>
            <div className={styles.topRow}>
                <CalendarToolbar
                    view={view}
                    onViewChange={setView}
                    periodLabel={periodLabel}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onToday={() => setCursor(new Date())}
                />
                <button
                    type="button"
                    className={styles.createButton}
                    onClick={() => openCreate(null)}
                >
                    <IconCalendarPlus size={18} stroke={1.8} />
                    Создать
                </button>
            </div>

            {isError && (
                <div className={styles.error}>
                    Не удалось загрузить записи. Попробуйте обновить страницу.
                </div>
            )}

            <div className={styles.layout}>
                <UpcomingPanel onEventClick={openDetails} />

                <div className={styles.calendarArea}>
                    {view === 'month' ? (
                        <MonthGrid
                            gridDays={gridDays}
                            cursorMonth={cursor.getMonth()}
                            eventsByDay={eventsByDay}
                            today={today}
                            onDayClick={handleDayClick}
                            onEventClick={openDetails}
                        />
                    ) : (
                        <TimeGrid
                            days={view === 'week' ? getWeekDays(cursor) : [cursor]}
                            events={events ?? []}
                            today={today}
                            onSlotClick={(day, hour) => {
                                const at = startOfDay(day);
                                at.setHours(hour);
                                openCreate(at);
                            }}
                            onEventClick={openDetails}
                        />
                    )}

                    {isPending && <div className={styles.loading}>Загружаем записи...</div>}
                    {!isPending && !isError && (events?.length ?? 0) === 0 && (
                        <div className={styles.empty}>
                            {view === 'day' && isSameDay(cursor, today)
                                ? 'На сегодня записей нет'
                                : 'На этот период записей нет'}
                        </div>
                    )}
                </div>
            </div>

            {editor && (
                <EventEditorModal
                    mode={editor.mode}
                    eventId={editor.eventId}
                    initialDate={editor.initialDate}
                    onClose={() => setEditor(null)}
                    onSaved={() => setEditor(null)}
                />
            )}

            {detailsId !== null && (
                <EventDetailsModal
                    eventId={detailsId}
                    onClose={() => setDetailsId(null)}
                    onEdit={(eventId) => {
                        setDetailsId(null);
                        setEditor({ mode: 'edit', eventId, initialDate: null });
                    }}
                />
            )}
        </div>
    );
}
