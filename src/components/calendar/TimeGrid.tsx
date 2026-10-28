import { useEffect, useState } from 'react';

import type { EventSummary } from '../../types/api';
import { formatTime, isSameDay, minutesOfDay, WEEKDAYS_SHORT } from '../../utils/datetime';
import styles from './TimeGrid.module.css';

interface TimeGridProps {
    /** Дни в порядке отображения: 7 для недели, 1 для дня. */
    days: Date[];
    events: EventSummary[];
    today: Date;
    onSlotClick: (day: Date, hour: number) => void;
    onEventClick: (event: EventSummary) => void;
}

const PX_PER_HOUR = 48;
const PX_PER_MINUTE = PX_PER_HOUR / 60;
const DAY_MINUTES = 24 * 60;
const MIN_EVENT_MINUTES = 20;
const HOURS = Array.from({ length: 24 }, (_, index) => index);

interface PositionedEvent {
    event: EventSummary;
    top: number;
    height: number;
    lane: number;
    lanes: number;
}

/** Раскладка пересекающихся записей по дорожкам, чтобы они не наезжали друг на друга. */
function layoutDay(events: EventSummary[]): PositionedEvent[] {
    const sorted = [...events].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
    const laneEnds: number[] = [];
    const raw: Array<Omit<PositionedEvent, 'lanes'>> = [];

    for (const event of sorted) {
        const startAt = new Date(event.startAt);
        const endAt = new Date(event.endAt);
        const start = Math.min(Math.max(minutesOfDay(startAt), 0), DAY_MINUTES);
        let end = minutesOfDay(endAt);
        if (end <= start) {
            end = DAY_MINUTES; // конец в следующие сутки
        }
        const clampedEnd = Math.min(end, DAY_MINUTES);
        const visibleEnd = Math.max(clampedEnd, start + MIN_EVENT_MINUTES);

        let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(0);
        }
        laneEnds[lane] = clampedEnd;

        raw.push({
            event,
            top: start * PX_PER_MINUTE,
            height: (visibleEnd - start) * PX_PER_MINUTE,
            lane,
        });
    }

    const lanes = laneEnds.length || 1;
    return raw.map((item) => ({ ...item, lanes }));
}

function useNowTick(): Date {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);
    return now;
}

export default function TimeGrid({
    days,
    events,
    today,
    onSlotClick,
    onEventClick,
}: TimeGridProps) {
    const now = useNowTick();

    const handleColumnClick = (day: Date, event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const hour = Math.min(
            23,
            Math.max(0, Math.floor((event.clientY - rect.top) / PX_PER_HOUR)),
        );
        onSlotClick(day, hour);
    };

    return (
        <div
            className={styles.wrapper}
            style={{ '--day-cols': days.length } as React.CSSProperties}
        >
            <div className={styles.header}>
                <div className={styles.headerGutter} />
                {days.map((day) => (
                    <div
                        key={day.getTime()}
                        className={`${styles.headerCell} ${isSameDay(day, today) ? styles.headerCellToday : ''}`}
                    >
                        <span className={styles.headerWeekday}>
                            {WEEKDAYS_SHORT[(day.getDay() + 6) % 7]}
                        </span>
                        <span className={styles.headerDay}>{day.getDate()}</span>
                    </div>
                ))}
            </div>
            <div className={styles.scroll}>
                <div className={styles.body}>
                    <div className={styles.timeGutter}>
                        {HOURS.map((hour) => (
                            <div key={hour} className={styles.hourLabel}>
                                {String(hour).padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>
                    <div className={styles.columns}>
                        {days.map((day) => {
                            const dayEvents = events.filter((event) =>
                                isSameDay(new Date(event.startAt), day),
                            );
                            const positioned = layoutDay(dayEvents);
                            const showNowLine = isSameDay(day, now);
                            const nowTop = minutesOfDay(now) * PX_PER_MINUTE;
                            return (
                                <div
                                    key={day.getTime()}
                                    className={styles.column}
                                    onClick={(clickEvent) => handleColumnClick(day, clickEvent)}
                                    role="presentation"
                                >
                                    {HOURS.map((hour) => (
                                        <div key={hour} className={styles.hourLine} />
                                    ))}
                                    {positioned.map(({ event, top, height, lane, lanes }) => {
                                        const editable = event.isOrganizer && !event.isCancelled;
                                        return (
                                            <div
                                                key={event.id}
                                                className={`${styles.event} ${
                                                    event.type === 'meeting'
                                                        ? styles.eventMeeting
                                                        : ''
                                                } ${event.isCancelled ? styles.eventCancelled : ''} ${
                                                    editable ? styles.eventClickable : ''
                                                }`}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: `calc(${(lane * 100) / lanes}% + 2px)`,
                                                    width: `calc(${100 / lanes}% - 4px)`,
                                                }}
                                                title={`${formatTime(new Date(event.startAt))} ${event.title}`}
                                                onClick={(clickEvent) => {
                                                    clickEvent.stopPropagation();
                                                    if (editable) {
                                                        onEventClick(event);
                                                    }
                                                }}
                                                role="presentation"
                                            >
                                                <span className={styles.eventTime}>
                                                    {formatTime(new Date(event.startAt))}
                                                </span>
                                                <span className={styles.eventTitle}>
                                                    {event.title}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {showNowLine && (
                                        <div
                                            className={styles.nowLine}
                                            style={{ top: `${nowTop}px` }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
