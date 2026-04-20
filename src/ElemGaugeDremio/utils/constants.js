const NumberFormat = {
    PERCENT: 'percent',
    DELTA: 'delta',
    SEGMENT: 'segment',
    LIMIT: 'limit',
    SEGMENT_DATA: 'segment-data'
};

const NumberFormatOptions = [
    { value: NumberFormat.PERCENT, label: 'Процент' },
    { value: NumberFormat.DELTA, label: 'Дельта' },
    { value: NumberFormat.LIMIT, label: 'Лимит' },
    { value: NumberFormat.SEGMENT, label: 'Сегменты' }
];

const PercentFormatOptions = [
    { value: '0', label: 12 },
    { value: '1', label: 12.3 },
    { value: '2', label: 12.34 }
];

const PercentPosition = [
    { value: 'right', label: 'Справа' },
    { value: 'left', label: 'Слева' },
    { value: 'top', label: 'Сверху' },
    { value: 'bottom', label: 'Снизу' },
    { value: 'center', label: 'Центр' }
];

const LevelFactory = ({ value, limit, nameLimit = 'Лимит', nameValue = 'Значение' }) => ({
    value,
    limit,
    nameLimit,
    nameValue,
    indent: 50,
    metricNameValue: '',
    metricNameLimit: '',
    rounded: false,
    dashed: false,
    dasharray: 0,
    dashoffset: 0,
    limitColor: '#EEEEEE',
    valueColor: '#03a9f4',
    limitWidth: 8,
    valueWidth: 8,
    showDesc: false,
    descColor: '#000000',
    descFontSize: '1',
    descFontSizeUnit: 'em',
    descFontFamily: 'inherit',
    format: 'percent',
    showLimit: true,
    limitPosX: 0,
    limitPosY: 0,
    showValueSign: false,
    showLimitSign: false,
    valuePosX: null,
    valuePosY: null,
    limitSignColor: '#000000',
    limitSignFont: 'inherit',
    limitSignFontSize: '1',
    limitSignFontUnit: 'em',
    valueSignColor: '#000000',
    valueSignFont: 'inherit',
    valueSignFontSize: '1',
    valueSignFontUnit: 'em',
    dropShadow: ''
});

export { NumberFormatOptions, PercentFormatOptions, PercentPosition, NumberFormat, LevelFactory };
