import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import styles from './CalendarToolbar.module.css';
import type { ViewMode } from './view-mode';

interface CalendarToolbarProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
    periodLabel: string;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
}

const VIEW_LABELS: Record<ViewMode, string> = {
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
};

export default function CalendarToolbar({
    view,
    onViewChange,
    periodLabel,
    onPrev,
    onNext,
    onToday,
}: CalendarToolbarProps) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.navigation}>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={onPrev}
                    aria-label="Предыдущий период"
                >
                    <IconChevronLeft size={18} stroke={1.8} />
                </button>
                <button type="button" className={styles.todayButton} onClick={onToday}>
                    Сегодня
                </button>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={onNext}
                    aria-label="Следующий период"
                >
                    <IconChevronRight size={18} stroke={1.8} />
                </button>
                <h1 className={styles.periodLabel}>{periodLabel}</h1>
            </div>
            <div className={styles.viewSwitch} role="tablist" aria-label="Вид календаря">
                {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        role="tab"
                        aria-selected={view === mode}
                        className={`${styles.viewButton} ${view === mode ? styles.viewButtonActive : ''}`}
                        onClick={() => onViewChange(mode)}
                    >
                        {VIEW_LABELS[mode]}
                    </button>
                ))}
            </div>
        </div>
    );
}
