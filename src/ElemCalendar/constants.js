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
    }
});

export const EVENT_COLORS = [
    '#4f6aff', '#7c3aed', '#0ea5e9', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'
];

export const HOUR_HEIGHT = 60; // px per hour in week/day view
export const AGENDA_DAYS_AHEAD = 60;
