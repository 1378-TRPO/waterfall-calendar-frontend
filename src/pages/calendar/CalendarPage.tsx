import { useMemo, useState } from 'react';

import CalendarToolbar from '../../components/calendar/CalendarToolbar';
import MonthGrid from '../../components/calendar/MonthGrid';
import TimeGrid from '../../components/calendar/TimeGrid';
import type { ViewMode } from '../../components/calendar/view-mode';
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

export default function CalendarPage() {
    const [view, setView] = useState<ViewMode>('month');
    const [cursor, setCursor] = useState(() => new Date());

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

    return (
        <div className={styles.page}>
            <CalendarToolbar
                view={view}
                onViewChange={setView}
                periodLabel={periodLabel}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={() => setCursor(new Date())}
            />

            {isError && (
                <div className={styles.error}>
                    Не удалось загрузить записи. Попробуйте обновить страницу.
                </div>
            )}

            {view === 'month' ? (
                <MonthGrid
                    gridDays={gridDays}
                    cursorMonth={cursor.getMonth()}
                    eventsByDay={eventsByDay}
                    today={today}
                />
            ) : (
                <TimeGrid
                    days={view === 'week' ? getWeekDays(cursor) : [cursor]}
                    events={events ?? []}
                    today={today}
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
    );
}
