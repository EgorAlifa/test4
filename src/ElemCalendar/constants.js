export const VIEWS = Object.freeze({
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
    AGENDA: 'agenda'
});

export const LOCALES = Object.freeze({
    RU: 'ru',
    EN: 'en'
});

export const SELECTION_MODES = Object.freeze({
    NONE: 'none',
    SINGLE: 'single',
    RANGE: 'range'
});

export const WEEK_START = Object.freeze({
    MONDAY: 1,
    SUNDAY: 0
});

// ── Locale data ────────────────────────────────────────────────────
export const LOCALE_DATA = {
    ru: {
        months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        monthsShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
        weekdays: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
        weekdaysShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
        today: 'Сегодня',
        views: { month: 'Месяц', week: 'Неделя', day: 'День', agenda: 'Список' },
        noEvents: 'Нет событий',
        allDay: 'Весь день'
    },
    en: {
        months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort: ['Su','Mo','Tu','We','Th','Fr','Sa'],
        today: 'Today',
        views: { month: 'Month', week: 'Week', day: 'Day', agenda: 'Agenda' },
        noEvents: 'No events',
        allDay: 'All day'
    }
};

// ── Visual presets ─────────────────────────────────────────────────
export const PRESETS = Object.freeze({
    corporate: {
        label: 'Корпоративный',
        props: {
            calBg: '#ffffff',
            calHeaderBg: '#4f6aff',
            calHeaderColor: '#ffffff',
            calAccentColor: '#4f6aff',
            calTodayBg: '#eef0ff',
            calTodayColor: '#4f6aff',
            calWeekendColor: '#ef4444',
            calCellBg: '#ffffff',
            calCellHoverBg: '#f5f7ff',
            calCellBorderColor: '#e8ecf4',
            calEventRadius: '4px',
            calRadius: '12px',
            calShadow: '0 4px 24px rgba(79,106,255,0.10), 0 1px 4px rgba(0,0,0,0.06)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#4f6aff',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(79,106,255,0.10)'
        }
    },
    dark: {
        label: 'Тёмный',
        props: {
            calBg: '#0f172a',
            calHeaderBg: '#1e293b',
            calHeaderColor: '#f1f5f9',
            calAccentColor: '#818cf8',
            calTodayBg: '#1e1b4b',
            calTodayColor: '#818cf8',
            calWeekendColor: '#f87171',
            calCellBg: '#0f172a',
            calCellHoverBg: '#1e293b',
            calCellBorderColor: '#1e293b',
            calEventRadius: '4px',
            calRadius: '12px',
            calShadow: '0 8px 32px rgba(0,0,0,0.4)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#818cf8',
            calSelectedColor: '#0f172a',
            calRangeBg: 'rgba(129,140,248,0.15)'
        }
    },
    pastel: {
        label: 'Пастельный',
        props: {
            calBg: '#fdf4ff',
            calHeaderBg: 'linear-gradient(135deg, #e9d5ff, #fbcfe8)',
            calHeaderColor: '#581c87',
            calAccentColor: '#a855f7',
            calTodayBg: '#fce7f3',
            calTodayColor: '#9d174d',
            calWeekendColor: '#db2777',
            calCellBg: '#ffffff',
            calCellHoverBg: '#fdf4ff',
            calCellBorderColor: '#f3e8ff',
            calEventRadius: '20px',
            calRadius: '16px',
            calShadow: '0 4px 20px rgba(168,85,247,0.12)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#a855f7',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(168,85,247,0.10)'
        }
    },
    minimal: {
        label: 'Минимализм',
        props: {
            calBg: '#ffffff',
            calHeaderBg: '#ffffff',
            calHeaderColor: '#0f172a',
            calAccentColor: '#0f172a',
            calTodayBg: '#0f172a',
            calTodayColor: '#ffffff',
            calWeekendColor: '#94a3b8',
            calCellBg: '#ffffff',
            calCellHoverBg: '#f8fafc',
            calCellBorderColor: '#f1f5f9',
            calEventRadius: '2px',
            calRadius: '0px',
            calShadow: 'none',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#0f172a',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(15,23,42,0.06)'
        }
    },
    aurora: {
        label: 'Аврора',
        props: {
            calBg: '#0d0d1a',
            calHeaderBg: 'linear-gradient(135deg, #1a0533, #0d1a33)',
            calHeaderColor: '#e0e7ff',
            calAccentColor: '#7c3aed',
            calTodayBg: 'rgba(124,58,237,0.25)',
            calTodayColor: '#c4b5fd',
            calWeekendColor: '#f472b6',
            calCellBg: 'rgba(255,255,255,0.02)',
            calCellHoverBg: 'rgba(124,58,237,0.12)',
            calCellBorderColor: 'rgba(255,255,255,0.06)',
            calEventRadius: '6px',
            calRadius: '16px',
            calShadow: '0 0 40px rgba(124,58,237,0.25), 0 8px 32px rgba(0,0,0,0.5)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: 'linear-gradient(135deg, #7c3aed, #db2777)',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(124,58,237,0.15)'
        }
    },
    ocean: {
        label: 'Океан',
        props: {
            calBg: '#f0f9ff',
            calHeaderBg: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
            calHeaderColor: '#ffffff',
            calAccentColor: '#0ea5e9',
            calTodayBg: '#e0f2fe',
            calTodayColor: '#0369a1',
            calWeekendColor: '#0891b2',
            calCellBg: '#ffffff',
            calCellHoverBg: '#f0f9ff',
            calCellBorderColor: '#e0f2fe',
            calEventRadius: '6px',
            calRadius: '14px',
            calShadow: '0 4px 24px rgba(14,165,233,0.12)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#0ea5e9',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(14,165,233,0.10)'
        }
    },
    nature: {
        label: 'Природа',
        props: {
            calBg: '#f0fdf4',
            calHeaderBg: 'linear-gradient(135deg, #15803d, #22c55e)',
            calHeaderColor: '#ffffff',
            calAccentColor: '#16a34a',
            calTodayBg: '#dcfce7',
            calTodayColor: '#15803d',
            calWeekendColor: '#16a34a',
            calCellBg: '#ffffff',
            calCellHoverBg: '#f0fdf4',
            calCellBorderColor: '#d1fae5',
            calEventRadius: '6px',
            calRadius: '14px',
            calShadow: '0 4px 20px rgba(21,128,61,0.14), 0 1px 4px rgba(0,0,0,0.05)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#16a34a',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(22,163,74,0.10)'
        }
    },
    sunset: {
        label: 'Закат',
        props: {
            calBg: '#fffbf5',
            calHeaderBg: 'linear-gradient(135deg, #ea580c, #f59e0b)',
            calHeaderColor: '#ffffff',
            calAccentColor: '#ea580c',
            calTodayBg: '#fff7ed',
            calTodayColor: '#c2410c',
            calWeekendColor: '#dc2626',
            calCellBg: '#ffffff',
            calCellHoverBg: '#fff7ed',
            calCellBorderColor: '#fed7aa',
            calEventRadius: '8px',
            calRadius: '16px',
            calShadow: '0 6px 30px rgba(234,88,12,0.16), 0 2px 8px rgba(245,158,11,0.12)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#ea580c',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(234,88,12,0.10)'
        }
    },
    neon: {
        label: 'Неон',
        props: {
            calBg: '#020617',
            calHeaderBg: '#020617',
            calHeaderColor: '#22d3ee',
            calAccentColor: '#22d3ee',
            calTodayBg: 'rgba(34,211,238,0.12)',
            calTodayColor: '#22d3ee',
            calWeekendColor: '#f472b6',
            calCellBg: '#0f172a',
            calCellHoverBg: 'rgba(34,211,238,0.07)',
            calCellBorderColor: 'rgba(34,211,238,0.12)',
            calEventRadius: '4px',
            calRadius: '12px',
            calShadow: '0 0 0 1px rgba(34,211,238,0.15), 0 0 40px rgba(34,211,238,0.08)',
            calFontFamily: 'JetBrains Mono, monospace',
            calFontSize: '12px',
            calSelectedBg: '#22d3ee',
            calSelectedColor: '#020617',
            calRangeBg: 'rgba(34,211,238,0.10)'
        }
    },
    demo: {
        label: '📅 Демо',
        props: {
            calBg: '#ffffff',
            calHeaderBg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            calHeaderColor: '#ffffff',
            calAccentColor: '#4f46e5',
            calTodayBg: '#ede9fe',
            calTodayColor: '#4f46e5',
            calWeekendColor: '#ef4444',
            calCellBg: '#ffffff',
            calCellHoverBg: '#f5f3ff',
            calCellBorderColor: '#e8e6f4',
            calEventRadius: '5px',
            calRadius: '14px',
            calShadow: '0 4px 32px rgba(79,70,229,0.14), 0 1px 6px rgba(0,0,0,0.07)',
            calFontFamily: 'inherit',
            calFontSize: '13px',
            calSelectedBg: '#4f46e5',
            calSelectedColor: '#ffffff',
            calRangeBg: 'rgba(79,70,229,0.10)'
        }
    }
});

export const EVENT_COLORS = [
    '#4f6aff', '#7c3aed', '#0ea5e9', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'
];

export const HOUR_HEIGHT = 60; // px per hour in week/day view
export const AGENDA_DAYS_AHEAD = 60;

// ── Demo events generator ───────────────────────────────────────────
export function buildDemoEvents(year, month) {
    const pad = (n) => String(n).padStart(2, '0');
    const date = (day) => `${year}-${pad(month)}-${pad(day)}`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const clamp = (d) => Math.min(Math.max(d, 1), daysInMonth);

    const nthWeekday = (nth, dow) => {
        let count = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            if (new Date(year, month - 1, d).getDay() === dow) {
                count++;
                if (count === nth) return d;
            }
        }
        return null;
    };

    const mon1 = nthWeekday(1, 1);
    const mon2 = nthWeekday(2, 1);
    const mon3 = nthWeekday(3, 1);
    const fri1 = nthWeekday(1, 5);
    const fri2 = nthWeekday(2, 5);
    const fri3 = nthWeekday(3, 5);
    const wed1 = nthWeekday(1, 3);
    const wed2 = nthWeekday(2, 3);
    const thu2 = nthWeekday(2, 4);

    const ev = [];

    if (mon1) ev.push({ title: 'Планирование спринта', date: date(mon1), color: '#4f46e5', startTime: '10:00', endTime: '12:00', desc: 'Разбираем задачи на 2 недели' });
    if (fri1) ev.push({ title: 'Ретроспектива', date: date(fri1), color: '#7c3aed', startTime: '15:00', endTime: '16:00', desc: 'Что прошло хорошо, что улучшить' });
    if (wed1) ev.push({ title: 'Демо продукта', date: date(wed1), color: '#0ea5e9', startTime: '14:00', endTime: '15:00', desc: 'Показываем фичи стейкхолдерам' });
    if (thu2) ev.push({ title: 'KPI-дашборд: обзор', date: date(thu2), color: '#f59e0b', startTime: '11:00', endTime: '12:00', desc: 'Ключевые метрики месяца' });
    if (mon2) ev.push({ title: 'Планирование спринта 2', date: date(mon2), color: '#4f46e5', startTime: '10:00', endTime: '12:00', desc: 'Разбираем задачи на второй спринт' });
    if (fri2) ev.push({ title: 'Ревью релиза', date: date(fri2), color: '#10b981', startTime: '16:00', endTime: '17:00', desc: 'Финальная проверка перед деплоем' });
    if (wed2) ev.push({ title: 'Командный обед', date: date(wed2), color: '#ec4899', startTime: '13:00', endTime: '14:00', desc: 'Неформальная встреча команды' });
    if (fri3) ev.push({ title: 'Деплой в прод', date: date(fri3), color: '#ef4444', startTime: '12:00', endTime: '13:00', desc: 'Выкатываем релиз' });
    if (mon3) ev.push({ title: '1-on-1 с тимлидом', date: date(mon3), color: '#14b8a6', startTime: '09:00', endTime: '09:30', desc: 'Индивидуальная встреча' });

    const mid = clamp(15);
    ev.push({ title: 'Дедлайн: сдача MVP', date: date(mid), color: '#ef4444', desc: 'Ключевой дедлайн месяца' });

    const eoDay = clamp(daysInMonth - 1);
    const eoDow = new Date(year, month - 1, eoDay).getDay();
    const reportDay = eoDow === 0 ? clamp(eoDay - 2) : eoDow === 6 ? clamp(eoDay - 1) : eoDay;
    ev.push({ title: 'Ежемесячный отчёт', date: date(reportDay), color: '#f59e0b', startTime: '10:00', endTime: '11:00', desc: 'Итоги месяца для руководства' });

    const hackStart = clamp(mon2 ? mon2 + 1 : 10);
    const hackEnd = clamp(hackStart + 1);
    ev.push({ title: 'Хакатон', date: date(hackStart), endDate: date(hackEnd), color: '#7c3aed', desc: 'Внутренний хакатон команды' });

    return ev.filter(Boolean);
}
