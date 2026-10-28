const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAY_FULL = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
];
const MONTH_GENITIVE = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
];
const MONTH_NOMINATIVE = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];

export const WEEKDAYS_SHORT = WEEKDAY_SHORT;

export function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

export function endOfDay(date: Date): Date {
    const result = startOfDay(date);
    result.setDate(result.getDate() + 1);
    result.setMilliseconds(-1);
    return result;
}

export function addDays(date: Date, amount: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

function daysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function addMonths(date: Date, amount: number): Date {
    const result = new Date(date);
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + amount);
    result.setDate(Math.min(day, daysInMonth(result)));
    return result;
}

export function startOfMonth(date: Date): Date {
    const result = startOfDay(date);
    result.setDate(1);
    return result;
}

export function endOfMonth(date: Date): Date {
    const result = startOfMonth(date);
    result.setMonth(result.getMonth() + 1);
    result.setMilliseconds(-1);
    return result;
}

// JS: getDay() возвращает 0 для воскресенья, неделя у нас с понедельника.
function mondayOffset(date: Date): number {
    return (date.getDay() + 6) % 7;
}

export function startOfWeek(date: Date): Date {
    const result = startOfDay(date);
    result.setDate(result.getDate() - mondayOffset(result));
    return result;
}

export function endOfWeek(date: Date): Date {
    const result = startOfWeek(date);
    result.setDate(result.getDate() + 7);
    result.setMilliseconds(-1);
    return result;
}

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/** 42 дня (6 недель) для сетки месяца, включая хвосты соседних месяцев. */
export function buildMonthGrid(date: Date): Date[] {
    const first = startOfWeek(startOfMonth(date));
    return Array.from({ length: 42 }, (_, index) => addDays(first, index));
}

export function getWeekDays(date: Date): Date[] {
    const first = startOfWeek(date);
    return Array.from({ length: 7 }, (_, index) => addDays(first, index));
}

export function minutesOfDay(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function formatDayMonth(date: Date): string {
    return `${date.getDate()} ${MONTH_GENITIVE[date.getMonth()]}`;
}

export function formatFullDate(date: Date): string {
    return `${date.getDate()} ${MONTH_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthYear(date: Date): string {
    return `${MONTH_NOMINATIVE[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatWeekdayFull(date: Date): string {
    return WEEKDAY_FULL[mondayOffset(date)];
}

export function formatWeekRange(from: Date, to: Date): string {
    if (from.getFullYear() === to.getFullYear()) {
        return `${formatDayMonth(from)} - ${formatDayMonth(to)} ${to.getFullYear()}`;
    }
    return `${formatFullDate(from)} - ${formatFullDate(to)}`;
}
