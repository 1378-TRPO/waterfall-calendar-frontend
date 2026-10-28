import { IconCalendarPlus } from '@tabler/icons-react';

import styles from './CalendarPage.module.css';

export default function CalendarPage() {
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h1 className={styles.title}>Календарь</h1>
                <button type="button" className={styles.createButton} disabled>
                    <IconCalendarPlus size={18} stroke={1.8} />
                    Создать
                </button>
            </div>
            <div className={styles.placeholder}>
                <p className={styles.placeholderTitle}>Сетка календаря появится здесь</p>
                <p className={styles.placeholderText}>
                    Записи подтягиваются с бэкенда на этапе Calendar view.
                </p>
            </div>
        </div>
    );
}
