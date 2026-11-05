export const VIEWS = Object.freeze({
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
    AGENDA: 'agenda',
    YEAR: 'year'
});

export const LOCALES = Object.freeze({
    RU: 'ru',
    EN: 'en'
});

export const SELECTION_MODES = Object.freeze({
    NONE: 'none',
    SINGLE: 'single',
    RANGE: 'range',
    MULTI: 'multi'
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
        views: { month: 'Месяц', week: 'Неделя', day: 'День', agenda: 'Список', year: 'Год' },
        noEvents: 'Нет событий',
        allDay: 'Весь день',
        // Родительный падеж — для «5 ноября 2026»
        monthsGenitive: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
        // Формат даты в полях ввода и чипах (не зависит от локали браузера); время всегда 24 ч
        dateMask: 'DD.MM.YYYY',
        dateShortMask: 'DD.MM.YY',
        datePlaceholder: 'ДД.ММ.ГГГГ',
        timePlaceholder: 'ЧЧ:ММ',
        prev: 'Назад',
        next: 'Вперёд',
        reset: 'Сброс',
        compactFrom: 'С',
        compactDate: 'Дата',
        compactTo: 'По',
        compactStartAria: 'Дата начала',
        compactEndAria: 'Дата окончания',
        compactReset: 'Сбросить',
        apply: 'Применить',
        invalidDate: 'Некорректная дата',
        clear: 'Очистить',
        chooseDate: 'Выбор даты',
        pickerHours: 'Часы',
        pickerMinutes: 'Минуты',
        pickerHoursShort: 'ЧЧ',
        pickerMinutesShort: 'мм',
        untitled: '(без названия)',
        more: 'ещё',
        // Подписи встроенных пресетов компактного режима
        presets: {
            today: 'Сегодня',
            yesterday: 'Вчера',
            week: 'Эта неделя',
            last_week: 'Пр. неделя',
            month: 'Этот месяц',
            last_month: 'Пр. месяц',
            quarter: 'Этот квартал',
            last_quarter: 'Прошлый квартал',
            d7: '7 дней',
            d30: '30 дней',
            d90: '90 дней',
            year: 'Этот год'
        },
        // Формы для 1 / 2–4 / 5+ (см. pluralize)
        lastNDays: ['Последний {n} день', 'Последние {n} дня', 'Последние {n} дней']
    },
    en: {
        months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort: ['Su','Mo','Tu','We','Th','Fr','Sa'],
        today: 'Today',
        views: { month: 'Month', week: 'Week', day: 'Day', agenda: 'Agenda', year: 'Year' },
        noEvents: 'No events',
        allDay: 'All day',
        monthsGenitive: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        dateMask: 'MM/DD/YYYY',
        dateShortMask: 'MM/DD/YY',
        datePlaceholder: 'MM/DD/YYYY',
        timePlaceholder: 'HH:MM',
        prev: 'Previous',
        next: 'Next',
        reset: 'Reset',
        compactFrom: 'From',
        compactDate: 'Date',
        compactTo: 'To',
        compactStartAria: 'Start date',
        compactEndAria: 'End date',
        compactReset: 'Reset',
        apply: 'Apply',
        invalidDate: 'Invalid date',
        clear: 'Clear',
        chooseDate: 'Choose date',
        pickerHours: 'Hours',
        pickerMinutes: 'Minutes',
        pickerHoursShort: 'HH',
        pickerMinutesShort: 'mm',
        untitled: '(untitled)',
        more: 'more',
        presets: {
            today: 'Today',
            yesterday: 'Yesterday',
            week: 'This week',
            last_week: 'Last week',
            month: 'This month',
            last_month: 'Last month',
            quarter: 'This quarter',
            last_quarter: 'Last quarter',
            d7: '7 days',
            d30: '30 days',
            d90: '90 days',
            year: 'This year'
        },
        // Формы для 1 / остальных
        lastNDays: ['Last {n} day', 'Last {n} days']
    }
};

// Подписи пресетов, которые панель настроек подставляет автоматически (по-русски).
// Если подпись пресета совпадает с одной из них — это не пользовательский текст,
// и в рантайме показывается подпись из LOCALE_DATA выбранного языка.
export const AUTO_PRESET_LABELS = Object.freeze({
    today: ['Сегодня'],
    yesterday: ['Вчера'],
    week: ['Эта неделя'],
    last_week: ['Пр. неделя', 'Прошлая неделя'],
    month: ['Этот месяц'],
    last_month: ['Пр. месяц', 'Прошлый месяц'],
    quarter: ['Этот квартал'],
    last_quarter: ['Прошлый квартал'],
    d7: ['7 дней'],
    d30: ['30 дней'],
    d90: ['90 дней'],
    year: ['Этот год']
});
// Автоподпись относительного пресета из панели настроек: «Последние N дней»
export const AUTO_RELATIVE_LABEL_RE = /^Последн(?:ий|ие) (\d+) (?:день|дня|дней)$/;
// Автоподпись пресета с фиксированными датами: «01.01.2026 — 31.01.2026», «01.01.2026»
// (одна дата) или, у старых пресетов, ISO «2026-01-01 — 2026-01-31»
export const AUTO_FIXED_LABEL_RE = /^(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4})(?: — (\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4}))?$/;

// Выбор формы слова по числу: forms из 3 элементов — правила русского языка
// (1 день / 2 дня / 5 дней), из 2 — английского (1 day / 2 days). {n} заменяется числом.
export function pluralize(n, forms) {
    if (!Array.isArray(forms)) return String(forms || '').replace('{n}', n);
    const abs = Math.abs(Number(n)) || 0;
    let idx;
    if (forms.length >= 3) {
        const m10 = abs % 10;
        const m100 = abs % 100;
        if (m10 === 1 && m100 !== 11) idx = 0;
        else if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) idx = 1;
        else idx = 2;
    } else {
        idx = abs === 1 ? 0 : forms.length - 1;
    }
    return forms[idx].replace('{n}', n);
}

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

// ── «Я дизайнер»: элементы и их селекторы ─────────────────────────
// Единая таблица для панели «Я дизайнер» (что показать и куда писать) и для виджета
// (во что превратить calDesignerCss). sel — селектор внутри корня виджета; правило
// генерируется как «#<id корня> <sel> { … }», поэтому перебивает scoped-стили виджета.
// important: true — у виджета для этого состояния свои правила с !important
// (выделение должно перекрывать тепловую карту/«Сегодня»), поэтому объявления
// пользователя получают !important автоматически, иначе они бы не применились.
// portal: 'self' — сам всплывающий календарь чипов (живёт в <body>): «#<id корня>-popup<sel>»;
// portal: 'inside' — элемент внутри него: «#<id корня>-popup <sel>».
// group — заголовок раздела в панели «Я дизайнер» (блоки одной группы идут подряд).
// label — строка или функция (props) => строка (подпись зависит от режима).
// when(props) — блок есть на экране в текущей конфигурации; условия совпадают с v-if
// в ElemCalendar.vue (без when — блок есть всегда). Скрытый блок панель не показывает,
// но уже заданный для него CSS виджет применяет.
const ALL_VIEWS = ['month', 'week', 'day', 'agenda', 'year'];
// Время в чипах (как isTimeUiOn в ElemCalendar.vue; в компакте выбор всегда «дата» или «диапазон»)
const compactTimeOn = (p) => Boolean(p.calWithTime) && p.calOutputFormat !== 'date';
const COMPACT_WHEN = Object.freeze({
    calendar: (p) => p.calCompactShowCalendar !== false,
    // «Сегодня» в шапке мини-календаря — только в режиме одного месяца
    todayHead: (p) => p.calCompactShowCalendar !== false && !p.calCompactDualMonth && p.calCompactShowToday !== false,
    todayCell: (p) => p.calCompactShowCalendar !== false && p.calHighlightToday !== false,
    presets: (p) => p.calCompactShowPresets !== false,
    // «Сегодня» отдельной строкой — когда мини-календарь скрыт
    todayRow: (p) => p.calCompactShowCalendar === false && p.calCompactShowToday !== false,
    tooltip: (p) => p.calCompactShowCalendar !== false && Boolean(p.calCompactShowTooltip),
    bottom: (p) => p.calCompactShowBottom !== false,
    // «По» и стрелка — только у диапазона (в режиме «Одиночный» один чип «Дата»)
    // стрелка: диапазон и время выключено (со временем чипы в столбик, стрелка скрыта)
    rangeChips: (p) => p.calCompactShowBottom !== false && p.calSelectionMode !== 'single' && !compactTimeOn(p),
    rangeCal: (p) => p.calCompactShowCalendar !== false && p.calSelectionMode !== 'single',
    // всплывающий календарь чипов — без мини-календаря, при нижней панели
    popup: (p) => p.calCompactShowCalendar === false && p.calCompactShowBottom !== false,
    popupTime: (p) => p.calCompactShowCalendar === false && p.calCompactShowBottom !== false && compactTimeOn(p)
});
// Виды, в которые можно попасть: выбранный (calView), из переключателя видов и переходами
// внутри виджета — из года клик по месяцу → месяц, по дню → день; из недели клик по
// заголовку колонки → день (goToMonth / goToDay / drillDown в ElemCalendar.vue).
const DRILL = Object.freeze({ year: ['month', 'day'], week: ['day'] });
const reachableViews = (p) => {
    const set = new Set([p.calView || 'month']);
    const list = Array.isArray(p.calAvailableViews) && p.calAvailableViews.length ? p.calAvailableViews : ALL_VIEWS;
    if (p.calShowHeader && p.calShowViewSwitcher) list.forEach((v) => set.add(v));
    [...set].forEach((v) => (DRILL[v] || []).forEach((d) => set.add(d)));
    return set;
};
const viewOn = (p, v) => reachableViews(p).has(v);
const fullSel = (p) => p.calSelectionMode || 'single';
const FULL_WHEN = Object.freeze({
    header: (p) => Boolean(p.calShowHeader),
    todayBtn: (p) => Boolean(p.calShowHeader) && Boolean(p.calShowTodayBtn),
    viewSwitch: (p) => Boolean(p.calShowHeader) && Boolean(p.calShowViewSwitcher),
    resetBtn: (p) => Boolean(p.calShowHeader) && p.calShowResetBtn !== false && p.calSelectionMode !== 'none',
    month: (p) => viewOn(p, 'month'),
    weekNum: (p) => viewOn(p, 'month') && Boolean(p.calShowWeekNumbers),
    todayCell: (p) => viewOn(p, 'month') && p.calHighlightToday !== false,
    selected: (p) => viewOn(p, 'month') && !['none', 'multi'].includes(fullSel(p)),
    inRange: (p) => viewOn(p, 'month') && fullSel(p) === 'range',
    multi: (p) => viewOn(p, 'month') && fullSel(p) === 'multi',
    weekDay: (p) => viewOn(p, 'week') || viewOn(p, 'day'),
    agenda: (p) => viewOn(p, 'agenda'),
    year: (p) => viewOn(p, 'year'),
    yearToday: (p) => viewOn(p, 'year') && p.calHighlightToday !== false,
    tooltip: (p) => p.calShowTooltip !== false && (viewOn(p, 'month') || viewOn(p, 'year'))
});

const G = Object.freeze({
    calendar: 'Календарь',
    presets: 'Пресеты',
    inputs: 'Поля ввода и кнопки',
    popup: 'Всплывающий календарь',
    tooltip: 'Подсказка',
    header: 'Шапка',
    month: 'Месяц',
    weekDay: 'Неделя и день',
    agenda: 'Список',
    year: 'Год'
});

export const DESIGNER_BLOCKS = Object.freeze({
    compact: [
        // ── Календарь ──
        { key: 'compactHead', group: G.calendar, when: COMPACT_WHEN.calendar, label: 'Шапка месяца', sel: '.compact__head', hint: 'background: #4f6aff;\ncolor: #fff;\npadding: 8px 12px;' },
        { key: 'compactNav', group: G.calendar, when: COMPACT_WHEN.calendar, label: 'Стрелки месяца', sel: '.compact__nav', hint: 'border-radius: 50%;\ncolor: #4f6aff;' },
        { key: 'compactMonthLabel', group: G.calendar, when: COMPACT_WHEN.calendar, label: 'Название месяца', sel: '.compact__month-label', hint: 'font-size: 14px;\ntext-transform: uppercase;' },
        { key: 'compactTodayHead', group: G.calendar, when: COMPACT_WHEN.todayHead, label: 'Кнопка «Сегодня» в шапке', sel: '.compact__head .compact__today-chip', hint: 'background: #4f6aff;\ncolor: #fff;' },
        { key: 'compactWeekday', group: G.calendar, when: COMPACT_WHEN.calendar, label: 'Подписи дней недели', sel: '.compact__wd', hint: 'color: #4f6aff;\nfont-size: 0.75em;' },
        { key: 'compactDay', group: G.calendar, when: COMPACT_WHEN.calendar, label: 'Ячейка дня', sel: '.compact__day:not(.compact__day--empty)', hint: '/* фон здесь перекрывает «Сегодня» и «Дни в диапазоне»; для них есть свои блоки ниже */\nborder-radius: 0;\nborder: 1px solid #e0e7ff;' },
        { key: 'compactDayNum', group: G.calendar, when: COMPACT_WHEN.calendar, label: 'Число дня', sel: '.compact__day-num', hint: 'font-weight: 700;\ntext-decoration: underline;' },
        { key: 'compactTodayCell', group: G.calendar, when: COMPACT_WHEN.todayCell, label: 'Сегодня (ячейка)', sel: '.compact__day--today', hint: 'box-shadow: inset 0 0 0 2px #4f6aff;' },
        { key: 'compactRangeStart', group: G.calendar, when: COMPACT_WHEN.calendar, label: (p) => (p.calSelectionMode === 'single' ? 'Выбранный день' : 'Начало диапазона'), sel: '.compact__day--range-start', hint: 'background: #16a34a;\ncolor: #fff;', important: true },
        { key: 'compactRangeEnd', group: G.calendar, when: COMPACT_WHEN.rangeCal, label: 'Конец диапазона', sel: '.compact__day--range-end', hint: 'background: #16a34a;\ncolor: #fff;', important: true },
        { key: 'compactInRange', group: G.calendar, when: COMPACT_WHEN.rangeCal, label: 'Дни в диапазоне', sel: '.compact__day--in-range', hint: 'background: var(--cal-range-bg);' },
        // ── Пресеты ──
        { key: 'compactPreset', group: G.presets, when: COMPACT_WHEN.presets, label: 'Пресет дат', sel: '.compact__preset', hint: 'border-radius: 20px;\nborder: 1.5px solid currentColor;' },
        { key: 'compactPresetActive', group: G.presets, when: COMPACT_WHEN.presets, label: 'Активный пресет', sel: '.compact__preset--active', hint: 'background: #4f6aff;\ncolor: #fff;' },
        { key: 'compactTodayRow', group: G.presets, when: COMPACT_WHEN.todayRow, label: 'Кнопка «Сегодня» (без календаря)', sel: '.compact__today-row .compact__today-chip', hint: 'background: #4f6aff;\ncolor: #fff;\nborder-radius: 8px;' },
        // ── Поля ввода и кнопки ──
        { key: 'compactBottom', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Нижняя панель', sel: '.compact__bottom', hint: 'border-top: 1px solid #e2e8f0;\npadding-top: 8px;' },
        { key: 'compactChip', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Поле даты (чип «С / По / Дата»)', sel: '.compact__chip', hint: 'border-radius: 6px;\nbackground: #f8fafc;' },
        { key: 'compactChipActive', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Поле даты в режиме ввода', sel: '.compact__chip--active', hint: 'border-color: #16a34a;\nbox-shadow: 0 0 0 3px rgba(22,163,74,0.15);' },
        { key: 'compactChipLabel', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Подпись поля («С / По / Дата»)', sel: '.compact__chip-label', hint: 'color: #4f6aff;\nfont-size: 11px;' },
        { key: 'compactChipValue', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Значение поля (дата)', sel: '.compact__chip-value', hint: 'font-size: 13px;\ncolor: #0f172a;' },
        { key: 'compactChipInput', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Текст при вводе даты', sel: '.compact__chip-input', hint: 'font-size: 13px;\ncolor: #0f172a;' },
        { key: 'compactChipSep', group: G.inputs, when: COMPACT_WHEN.rangeChips, label: 'Стрелка между полями', sel: '.compact__chip-sep', hint: 'color: #4f6aff;\nfont-size: 16px;' },
        { key: 'compactBtn', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Кнопки (обе)', sel: '.compact__btn', hint: 'border-radius: 6px;\nfont-size: 13px;' },
        { key: 'compactBtnReset', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Кнопка «Сбросить»', sel: '.compact__btn--reset', hint: 'background: #fff;\ncolor: #dc2626;' },
        { key: 'compactBtnApply', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Кнопка «Применить»', sel: '.compact__btn--apply', hint: 'background: #16a34a;\ncolor: #fff;' },
        { key: 'compactBtnApplyDisabled', group: G.inputs, when: COMPACT_WHEN.bottom, label: 'Кнопка «Применить» неактивна', sel: '.compact__btn--apply:disabled', hint: 'background: #cbd5e1;\nopacity: 1;' },
        // ── Всплывающий календарь ──
        { key: 'compactPopup', group: G.popup, when: COMPACT_WHEN.popup, label: 'Всплывающий календарь (окно)', sel: '.compact__popup', hint: 'border-radius: 16px;\nbox-shadow: 0 8px 24px rgba(0,0,0,0.2);', portal: 'self' },
        { key: 'compactPopupTitle', group: G.popup, when: COMPACT_WHEN.popup, label: 'Месяц и год', sel: '.compact__popup-title', hint: 'color: #4f6aff;\nfont-size: 14px;', portal: 'inside' },
        { key: 'compactPopupWeekday', group: G.popup, when: COMPACT_WHEN.popup, label: 'Подписи дней недели', sel: '.compact__popup-wd', hint: 'color: #4f6aff;\nfont-size: 11px;', portal: 'inside' },
        { key: 'compactPopupDay', group: G.popup, when: COMPACT_WHEN.popup, label: 'День', sel: '.compact__popup-day', hint: '/* фон здесь перекрывает отметку сегодняшнего дня и диапазона; «Выбранный день» задаётся отдельно; для них есть свои блоки ниже */\nborder-radius: 50%;', portal: 'inside' },
        { key: 'compactPopupSelected', group: G.popup, when: COMPACT_WHEN.popup, label: 'Выбранный день', sel: '.compact__popup-day--selected', hint: 'background: #16a34a;\ncolor: #fff;', portal: 'inside' },
        { key: 'compactPopupTime', group: G.popup, when: COMPACT_WHEN.popupTime, label: 'Выбранные часы и минуты', sel: '.compact__popup-tm--active', hint: 'background: #16a34a;\ncolor: #fff;', portal: 'inside' },
        { key: 'compactPopupTimeHead', group: G.popup, when: COMPACT_WHEN.popupTime, label: 'Заголовки «ЧЧ / мм»', sel: '.compact__popup-th', hint: 'color: #4f6aff;\nfont-size: 11px;', portal: 'inside' },
        { key: 'compactPopupLink', group: G.popup, when: COMPACT_WHEN.popup, label: 'Кнопки «Очистить / Сегодня»', sel: '.compact__popup-link', hint: 'color: #16a34a;\ntext-transform: uppercase;', portal: 'inside' },
        // ── Подсказка ──
        { key: 'compactTooltip', group: G.tooltip, when: COMPACT_WHEN.tooltip, label: 'Подсказка над днём', sel: '.elem-cal__tooltip', hint: 'border-radius: 6px;\nfont-size: 12px;' }
    ],
    full: [
        // ── Шапка ──
        { key: 'header', group: G.header, when: FULL_WHEN.header, label: 'Шапка', sel: '.elem-cal__header', hint: 'padding: 12px 20px;\nborder-bottom: 2px solid #4f6aff;' },
        { key: 'title', group: G.header, when: FULL_WHEN.header, label: 'Заголовок периода', sel: '.elem-cal__title', hint: 'font-size: 1.3em;\nletter-spacing: 0.05em;' },
        { key: 'navBtn', group: G.header, when: FULL_WHEN.header, label: 'Кнопки навигации', sel: '.elem-cal__nav-btn', hint: 'border-radius: 50%;\nbackground: rgba(255,255,255,0.25);' },
        { key: 'todayBtn', group: G.header, when: FULL_WHEN.todayBtn, label: 'Кнопка «Сегодня»', sel: '.elem-cal__today-btn', hint: 'border-radius: 20px;\nfont-weight: 700;' },
        { key: 'viewBtn', group: G.header, when: FULL_WHEN.viewSwitch, label: 'Переключатель вида', sel: '.elem-cal__view-btn', hint: 'border-radius: 20px;\nfont-weight: 700;' },
        { key: 'viewBtnActive', group: G.header, when: FULL_WHEN.viewSwitch, label: 'Активный вид', sel: '.elem-cal__view-btn--active', hint: 'background: #fff;\ncolor: #4f6aff;' },
        { key: 'resetBtn', group: G.header, when: FULL_WHEN.resetBtn, label: 'Кнопка «Сброс»', sel: '.elem-cal__reset-btn', hint: 'border-radius: 20px;\nbackground: rgba(255,255,255,0.15);' },
        // ── Месяц ──
        { key: 'weekday', group: G.month, when: FULL_WHEN.month, label: 'Подписи дней недели', sel: '.elem-cal__weekday', hint: 'color: #4f6aff;\nfont-size: 0.8em;' },
        { key: 'weekNumber', group: G.month, when: FULL_WHEN.weekNum, label: 'Номера недель', sel: '.elem-cal__wnum', hint: 'color: #94a3b8;\nfont-size: 10px;' },
        { key: 'cell', group: G.month, when: FULL_WHEN.month, label: 'Ячейка дня', sel: '.elem-cal__cell', hint: '/* фон здесь перекрывает «Сегодня» и «День соседнего месяца»; для них есть свои блоки ниже */\nborder-radius: 0;\nborder: 1px solid #e0e7ff;' },
        { key: 'otherMonthCell', group: G.month, when: FULL_WHEN.month, label: 'День соседнего месяца', sel: '.elem-cal__cell--other-month', hint: 'opacity: 0.3;' },
        { key: 'dayNum', group: G.month, when: FULL_WHEN.month, label: 'Число дня', sel: '.elem-cal__day-num', hint: 'border-radius: 4px;\nfont-weight: 700;' },
        { key: 'todayCell', group: G.month, when: FULL_WHEN.todayCell, label: 'Сегодня', sel: '.elem-cal__cell--today', hint: 'outline: 2px solid var(--cal-accent);\noutline-offset: -2px;' },
        { key: 'selectedCell', group: G.month, when: FULL_WHEN.selected, label: 'Выбранный день', sel: '.elem-cal__cell--selected', hint: 'background: #16a34a;', important: true },
        { key: 'inRangeCell', group: G.month, when: FULL_WHEN.inRange, label: 'Дни в диапазоне', sel: '.elem-cal__cell--in-range', hint: 'background: rgba(22,163,74,0.12);', important: true },
        { key: 'multiCell', group: G.month, when: FULL_WHEN.multi, label: 'Отмеченный день (несколько дат)', sel: '.elem-cal__cell--multi-selected', hint: 'background: #16a34a;', important: true },
        { key: 'event', group: G.month, when: FULL_WHEN.month, label: 'Событие', sel: '.elem-cal__event', hint: 'border-radius: 6px;\npadding: 2px 6px;' },
        { key: 'eventLabel', group: G.month, when: FULL_WHEN.month, label: 'Текст события', sel: '.elem-cal__event-label', hint: 'color: #0f172a;\nfont-weight: 600;' },
        { key: 'moreEvents', group: G.month, when: FULL_WHEN.month, label: '«+N» событий', sel: '.elem-cal__more', hint: 'color: #4f6aff;\nfont-weight: 700;' },
        // ── Неделя и день ──
        { key: 'weekColHd', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'Заголовок колонки дня', sel: '.elem-cal__week-col-hd', hint: 'background: #f8fafc;\nborder-bottom: 2px solid #4f6aff;' },
        { key: 'weekDow', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'День недели в заголовке колонки', sel: '.elem-cal__week-dow', hint: 'color: #4f6aff;\ntext-transform: uppercase;' },
        { key: 'weekColNum', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'Число в заголовке колонки', sel: '.elem-cal__week-num', hint: 'font-size: 18px;\nfont-weight: 700;' },
        { key: 'hourLabel', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'Подписи часов', sel: '.elem-cal__hour-label', hint: 'color: #94a3b8;\nfont-size: 10px;' },
        { key: 'weekCol', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'Колонка дня', sel: '.elem-cal__week-col', hint: '/* фон здесь перекрывает подсветку сегодняшней и выбранной колонки; для них есть свои блоки ниже */\nbackground: #fcfcff;' },
        { key: 'nowLine', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'Линия «сейчас»', sel: '.elem-cal__now-line', hint: 'background: #16a34a;\nheight: 2px;' },
        { key: 'weekEvent', group: G.weekDay, when: FULL_WHEN.weekDay, label: 'Событие', sel: '.elem-cal__week-event', hint: 'border-radius: 6px;\nbox-shadow: 0 2px 6px rgba(0,0,0,0.15);' },
        // ── Список ──
        { key: 'agendaDate', group: G.agenda, when: FULL_WHEN.agenda, label: 'Дата группы', sel: '.elem-cal__agenda-date', hint: 'color: #4f6aff;\nfont-weight: 700;' },
        { key: 'agendaDayNum', group: G.agenda, when: FULL_WHEN.agenda, label: 'Число в дате группы', sel: '.elem-cal__agenda-day-num', hint: 'font-size: 22px;\ncolor: #4f6aff;' },
        { key: 'agendaDayName', group: G.agenda, when: FULL_WHEN.agenda, label: 'День недели в дате группы', sel: '.elem-cal__agenda-day-name', hint: 'color: #64748b;\ntext-transform: uppercase;' },
        { key: 'agendaEvent', group: G.agenda, when: FULL_WHEN.agenda, label: 'Событие', sel: '.elem-cal__agenda-event', hint: 'border-radius: 10px;\nbox-shadow: 0 1px 4px rgba(0,0,0,0.08);' },
        { key: 'agendaEventTime', group: G.agenda, when: FULL_WHEN.agenda, label: 'Время события', sel: '.elem-cal__agenda-event-time', hint: 'color: #4f6aff;\nfont-weight: 700;' },
        { key: 'agendaEventTitle', group: G.agenda, when: FULL_WHEN.agenda, label: 'Название события', sel: '.elem-cal__agenda-event-title', hint: 'font-size: 14px;' },
        { key: 'agendaEventDesc', group: G.agenda, when: FULL_WHEN.agenda, label: 'Описание события', sel: '.elem-cal__agenda-event-desc', hint: 'color: #64748b;\nfont-style: italic;' },
        { key: 'agendaEmpty', group: G.agenda, when: FULL_WHEN.agenda, label: '«Нет событий»', sel: '.elem-cal__no-events', hint: 'color: #94a3b8;\nfont-style: italic;' },
        // ── Год ──
        { key: 'yearMonthHd', group: G.year, when: FULL_WHEN.year, label: 'Название месяца', sel: '.elem-cal__year-month-hd', hint: 'color: #4f6aff;\nfont-weight: 700;' },
        { key: 'yearWeekday', group: G.year, when: FULL_WHEN.year, label: 'Подписи дней недели', sel: '.elem-cal__year-wd', hint: 'color: #4f6aff;\nfont-size: 9px;' },
        { key: 'yearDay', group: G.year, when: FULL_WHEN.year, label: 'День', sel: '.elem-cal__year-day:not(.elem-cal__year-day--empty)', hint: '/* фон здесь перекрывает отметку дней с событиями; для них есть свои блоки ниже */\nborder-radius: 50%;' },
        { key: 'yearToday', group: G.year, when: FULL_WHEN.yearToday, label: 'Сегодня', sel: '.elem-cal__year-day--today', hint: 'background: #16a34a;\ncolor: #fff;', important: true },
        // ── Подсказка ──
        { key: 'tooltip', group: G.tooltip, when: FULL_WHEN.tooltip, label: 'Подсказка над днём', sel: '.elem-cal__tooltip', hint: 'border-radius: 6px;\nfont-size: 12px;' }
    ]
});

// Добавляет !important к каждому объявлению, где его ещё нет.
// Точки с запятой внутри скобок и кавычек (url(), строки) не считаются разделителями.
export function withImportant(css) {
    const decls = [];
    let cur = '';
    let depth = 0;
    let quote = '';
    let escaped = false;
    // комментарии убираем заранее: «/* a; b */» не должен делить объявления
    const source = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const ch of source) {
        if (quote) {
            // внутри строки символ после «\» экранирован (content: "a\"; b")
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === quote) quote = '';
            cur += ch;
            continue;
        }
        if (ch === '"' || ch === "'") quote = ch;
        else if (ch === '(') depth++;
        else if (ch === ')') depth = Math.max(0, depth - 1);
        else if (ch === ';' && depth === 0) { decls.push(cur); cur = ''; continue; }
        cur += ch;
    }
    decls.push(cur);
    return decls
        .map((d) => d.trim())
        .filter((d) => d && d.includes(':'))
        .map((d) => (/!\s*important\s*$/i.test(d) ? d : `${d} !important`))
        .join('; ');
}

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

// ── Demo metric generator ───────────────────────────────────────────
export function buildDemoMetric(year, month) {
    const pad = (n) => String(n).padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, month - 1, d).getDay();
        const isWeekend = dow === 0 || dow === 6;
        const trend = Math.round((d / daysInMonth) * 200);
        const weekendDip = isWeekend ? -300 : 0;
        const noise = Math.round(Math.sin(d * 1.7) * 80 + Math.cos(d * 2.3) * 60);
        const val = Math.max(30, 600 + trend + weekendDip + noise);
        result.push({ date: `${year}-${pad(month)}-${pad(d)}`, value: val });
    }
    return result;
}

// ── Data panel sections (switches) ─────────────────────────────────
// Each optional data source in the «Данные» panel is behind a switch. A switched-off section is
// ignored by the widget (its values are kept, so switching it back on restores them).
// Widgets saved before the switches existed have no value (null) — the section is then
// considered enabled if it already holds data, so nothing changes for them.
export const DATA_SECTION_PROPS = Object.freeze({
    eventFields: 'calUseEventFields',
    metricCol: 'calUseMetricCol',
    staticEvents: 'calUseStaticEvents',
    staticMetric: 'calUseStaticMetric'
});

const hasJsonData = (json) => {
    if (!json) return false;
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) return parsed.length > 0;
        return Boolean(parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0);
    } catch (e) {
        return false;
    }
};

export function resolveDataSections(props = {}) {
    const flag = (value, fallback) => (typeof value === 'boolean' ? value : fallback);
    return {
        eventFields: flag(
            props.calUseEventFields,
            Boolean(props.calDataTitleCol || props.calDataStartTimeCol || props.calDataEndTimeCol || props.calDataDescCol)
        ),
        metricCol: flag(props.calUseMetricCol, Boolean(props.calMetricDataCol)),
        staticEvents: flag(props.calUseStaticEvents, hasJsonData(props.calEventsJson)),
        staticMetric: flag(props.calUseStaticMetric, hasJsonData(props.calMetricJson))
    };
}

// Whether any metric source feeds the heatmap, honouring the section switches
export function hasActiveMetricSource(props = {}) {
    const sections = resolveDataSections(props);
    return Boolean(
        props.calMetricVar ||
        (sections.staticMetric && hasJsonData(props.calMetricJson)) ||
        (sections.metricCol && props.calMetricDataCol)
    );
}
