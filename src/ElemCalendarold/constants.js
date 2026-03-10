const RusMonths = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря'
];

const DATE_FORMAT_LOCAL = 'DD.MM.YYYY';
const DATE_FORMAT_ISO = 'YYYY-MM-DD';

export const PresetOrientation = {
    VERTICAL: 'column',
    HORIZONTAL: 'row'
};

export const PresetPosition = {
    LEFT: 'row',
    TOP: 'column',
    RIGHT: 'row-reverse',
    BOTTOM: 'column-reverse'
};

export { RusMonths, DATE_FORMAT_LOCAL, DATE_FORMAT_ISO };

export const KeyCodes = Object.freeze({
    ENTER: 13
});

export const DateMeasurements = ['date', 'month', 'year'];

export const RussianMonths = [
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
    'Декабрь'
];

export const RussianMonthsShort = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек'];

export const IntervalVars = Object.freeze({
    DATE_INTERVAL_START: 'dateIntervalStart',
    MONTH_INTERVAL_START: 'monthIntervalStart',
    YEAR_INTERVAL_START: 'yearIntervalStart',
    DATE_INTERVAL_END: 'dateIntervalEnd',
    MONTH_INTERVAL_END: 'monthIntervalEnd',
    YEAR_INTERVAL_END: 'yearIntervalEnd'
});

export const ResetAlign = {
    START: 'start',
    CENTER: 'center',
    END: 'end'
};

export const CalendarTypes = {
    DAY_TYPE: 'days',
    WEEK_TYPE: 'week',
    MONTH_TYPE: 'month',
    QUARTERS_TYPE: 'quarters',
    YEAR_TYPE: 'years'
};
