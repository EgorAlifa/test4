/* eslint-disable id-length */
import dayjs from 'dayjs';

/**
 * @return {DColumnTooltip}
 */
export const TooltipFactory = () => ({
    enable: false,
    position: 'top',
    offsetX: 0,
    offsetY: 5,
    hideDelay: 100,
    style: null,
    appendToBody: true
});

/**
 * @return {DColumnTitleIcon}
 */
export const TitleIconFactory = () => ({
    enable: false,
    name: 'alert-circle',
    position: '-1',
    size: '24px',
    color: 'rgba(85, 85, 85, 1)',
    colorHover: 'rgba(238, 238, 238, 1)',
    tooltip: {
        text: '',
        ...TooltipFactory()
    }
});

/**
 * @return {DColumn}
 */
export const ColumnFactory = () => ({
    title: '',
    sort: null,
    style: null,
    styleCell: null,
    render: null,
    tooltip: TooltipFactory(),
    icon: TitleIconFactory(),
    params: {}
});

/**
 * @return {DColumnParam}
 */
export const ColumnParamFactory = () => ({
    value: null,
    type: 'METRIC_DIMENSION',
    format: null,
    formatOpt: {},
    style: []
});

/**
 * @return {DColumnParamStyle}
 */
export const ColumnParamStyleFactory = () => ({
    type: null,
    value: '',
    valueType: 'MD',
    comparedValue: '',
    comparedValueType: 'MD',
    style: '',
    cssClass: []
});

/**
 * @return {DTopHeader}
 */
export const TopHeaderFactory = () => ({
    title: '',
    style: '',
    // eslint-disable-next-line no-restricted-syntax
    range: [null, null]
});

export const ColumnParamTypeNames = {
    METRIC_DIMENSION: 'METRIC_DIMENSION',
    INPUT: 'INPUT',
    BOOLEAN: 'BOOLEAN'
};

export const ColumnParamTypes = {
    [ColumnParamTypeNames.METRIC_DIMENSION]: {
        name: 'метрика/измерение',
        handler: (value, row) => (row[value] != null ? row[value] : null)
    },
    [ColumnParamTypeNames.INPUT]: { name: 'ввод', handler: (value) => value },
    [ColumnParamTypeNames.BOOLEAN]: { name: 'булево', handler: (value) => value }
};

export const ColumnParamFormatTypes = {
    NUM: 'NUM',
    DATE: 'DATE'
};

export const ColumnParamFormats = {
    [ColumnParamFormatTypes.NUM]: {
        name: 'число',
        handler: (value, { prec = '-1', tsep = '', fsep = '.', pref = '', postf = '', mult = 1 }) => {
            if (!Number.isFinite(Number(value))) {
                return value;
            }
            const num = Number(value) * mult;
            const str = prec >= 0 ? num.toFixed(parseInt(prec, 10)) : `${num}`;
            const numPart = str.split('.');
            numPart[0] = numPart[0]
                .split('')
                .reverse()
                .join('')
                .replace(/(\d{3})/g, `$1${tsep}`)
                .split('')
                .reverse()
                .join('');
            return pref + numPart.join(fsep) + postf;
        },
        options: {
            prec: {
                name: '.000',
                type: Number
            },
            tsep: {
                name: '1 000',
                type: String
            },
            fsep: {
                name: '0.0',
                type: String
            },
            pref: {
                name: '{A} 123',
                type: String
            },
            postf: {
                name: '123 {A}',
                type: String
            },
            mult: {
                name: '*N',
                type: Number
            }
        }
    },
    [ColumnParamFormatTypes.DATE]: {
        name: 'дата',
        handler: (value, { format = 'DD/MM/YYYY' }) => {
            const date = dayjs(value);
            return date.isValid() ? date.format(format) : value;
        },
        options: {
            format: {
                name: 'формат',
                type: String
            }
        }
    }
};

export const ColumnParamStyleTypes = {
    ALL: {
        name: 'всегда',
        handler: () => true
    },
    EQ: {
        name: '=',
        handler: (paramValue, styleValue) =>
            Number.isFinite(Number(paramValue)) && Number.isFinite(Number(styleValue))
                ? Number(paramValue) === Number(styleValue)
                : paramValue === styleValue
    },
    GT: {
        name: '>',
        handler: (paramValue, styleValue) => Number(paramValue) > Number(styleValue)
    },
    LT: {
        name: '<',
        handler: (paramValue, styleValue) => Number(paramValue) < Number(styleValue)
    }
};

export const ColumnParamStyleValueTypes = {
    MD: {
        name: 'метрика/измерение',
        handler: (value, row) => (row[value] != null ? row[value] : null)
    },
    INP: { name: 'ввод', handler: (value) => value }
};

export const GridProps = {
    areas: [['thead'], ['tbody'], ['tfoot']],
    rows: ['auto', '1fr', 'auto']
};

export const TooltipPositionOptions = [
    { value: 'top', label: 'top' },
    { value: 'top-start', label: 'top start' },
    { value: 'top-end', label: 'top end' },
    { value: 'left', label: 'left' },
    { value: 'left-start', label: 'left start' },
    { value: 'left-end', label: 'left end' },
    { value: 'right', label: 'right' },
    { value: 'right-start', label: 'right start' },
    { value: 'right-end', label: 'right end' },
    { value: 'bottom', label: 'bottom' },
    { value: 'bottom-start', label: 'bottom start' },
    { value: 'bottom-end', label: 'bottom end' }
];
