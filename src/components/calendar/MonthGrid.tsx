import type { EventSummary } from '../../types/api';
import { formatTime, isSameDay,WEEKDAYS_SHORT } from '../../utils/datetime';
import styles from './MonthGrid.module.css';

interface MonthGridProps {
    /** 42 дня (6 недель), включая хвосты соседних месяцев. */
    gridDays: Date[];
    /** Месяц курсора, чтобы приглушать дни соседних месяцев. */
    cursorMonth: number;
    eventsByDay: Map<number, EventSummary[]>;
    today: Date;
    onDayClick: (day: Date) => void;
    onEventClick: (event: EventSummary) => void;
}

const MAX_CHIPS = 3;

export default function MonthGrid({
    gridDays,
    cursorMonth,
    eventsByDay,
    today,
    onDayClick,
    onEventClick,
}: MonthGridProps) {
    return (
        <div className={styles.grid}>
            {WEEKDAYS_SHORT.map((weekday) => (
                <div key={weekday} className={styles.weekday}>
                    {weekday}
                </div>
            ))}
            {gridDays.map((day) => {
                const dayEvents = eventsByDay.get(day.getTime()) ?? [];
                const isOtherMonth = day.getMonth() !== cursorMonth;
                return (
                    <div
                        key={day.getTime()}
                        className={`${styles.cell} ${isOtherMonth ? styles.cellOtherMonth : ''} ${
                            isSameDay(day, today) ? styles.cellToday : ''
                        }`}
                        onClick={() => onDayClick(day)}
                        role="presentation"
                    >
                        <span
                            className={`${styles.dayNumber} ${isSameDay(day, today) ? styles.dayNumberToday : ''}`}
                        >
                            {day.getDate()}
                        </span>
                        <div className={styles.chips}>
                            {dayEvents.slice(0, MAX_CHIPS).map((event) => (
                                <div
                                    key={event.id}
                                    className={`${styles.chip} ${styles.chipClickable} ${
                                        event.type === 'meeting' ? styles.chipMeeting : ''
                                    } ${event.isCancelled ? styles.chipCancelled : ''}`}
                                    title={`${formatTime(new Date(event.startAt))} ${event.title}`}
                                    onClick={(clickEvent) => {
                                        clickEvent.stopPropagation();
                                        onEventClick(event);
                                    }}
                                    role="presentation"
                                >
                                    <span className={styles.chipTime}>
                                        {formatTime(new Date(event.startAt))}
                                    </span>
                                    <span className={styles.chipTitle}>{event.title}</span>
                                </div>
                            ))}
                            {dayEvents.length > MAX_CHIPS && (
                                <span className={styles.more}>
                                    +{dayEvents.length - MAX_CHIPS} ещё
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
