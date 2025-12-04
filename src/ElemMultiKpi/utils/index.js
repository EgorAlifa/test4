/* eslint-disable id-length */
import { NumberFormat, NumberFormatPattern } from '@goodt-common/utils';
import dayjs from 'dayjs';
import isNumber from 'lodash/isNumber';

export const ParamTypes = {
    METRIC_DIMENSION: {
        name: 'метрика/измерение',
        handler: (value, row) => row[value] || null
    },
    INPUT: { name: 'ввод', handler: (value, row) => value }
};

export const ParamSeparateTypes = {
    METRIC: {
        name: 'метрика',
        handler: (value, row) => row[value] || null
    },
    DIMENSION: {
        name: 'измерение',
        handler: (value, row) => row[value] || null
    },
    INPUT: { name: 'ввод', handler: (value, row) => value }
};

export const ParamFormats = {
    NUM: {
        name: 'число',
        handler: (value, { prec = -1, tsep = '', fsep = '.', pref = '', postf = '', mult = 1 }) => {
            if (!isNumber(value)) {
                return value;
            }
            const n = Number(value) * mult;
            const s = prec >= 0 ? n.toFixed(parseInt(prec, 10)) : n.toString();
            let [a] = s.split('.');
            a = a.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${tsep}`);
            return pref + a.join(fsep) + postf;
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
    DATE: {
        name: 'дата',
        handler: (value, { format = 'DD/MM/YYYY' }) => {
            const d = dayjs(value);
            return d.isValid() ? d.format(format) : value;
        },
        options: {
            format: {
                name: 'формат',
                type: String
            }
        }
    }
};

export const ParamStyleTypes = {
    ALL: {
        name: 'всегда',
        handler: (paramValue, styleValue) => true
    },
    EQ: {
        name: '=',
        handler: (paramValue, styleValue) =>
            isNumber(paramValue) && isNumber(styleValue)
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

export const PARAM_STYLE_FACTORY = ({ typeCondition = null, type = null, value = '', style = [] } = {}) => ({
    typeCondition,
    type,
    value,
    style
});

export const indicatorConditionRuleFactory = ({
    dataType = null,
    condition = '',
    value = null,
    icon = '',
    color = '#000'
} = {}) => ({
    dataType,
    condition,
    value,
    icon,
    color
});

/**
 * @param {number|string} value
 * @param {string} unit
 * @return string
 */
export const resolveValueWithUnits = (value, unit) => (Number.isNaN(Number(value)) ? value : `${value}${unit}`);

const LegacyNumberFormat = {
    ['0']: new NumberFormat({
        pattern: new NumberFormatPattern({ digits: 0, modifiers: [NumberFormatPattern.Modifier.FIXED] }),
        type: NumberFormat.Type.DECIMAL
    }).toString(),
    ['1']: new NumberFormat({
        pattern: new NumberFormatPattern({ digits: 1, modifiers: [NumberFormatPattern.Modifier.FIXED] }),
        type: NumberFormat.Type.DECIMAL
    }).toString(),
    ['2']: new NumberFormat({
        pattern: new NumberFormatPattern({ digits: 2, modifiers: [NumberFormatPattern.Modifier.FIXED] }),
        type: NumberFormat.Type.DECIMAL
    }).toString(),
    ['0%']: new NumberFormat({
        pattern: new NumberFormatPattern({ digits: 0, modifiers: [NumberFormatPattern.Modifier.PERCENT] }),
        type: NumberFormat.Type.DECIMAL
    }).toString(),
    ['1%']: new NumberFormat({
        pattern: new NumberFormatPattern({ digits: 1, modifiers: [NumberFormatPattern.Modifier.PERCENT] }),
        type: NumberFormat.Type.DECIMAL
    }).toString(),
    ['2%']: new NumberFormat({
        pattern: new NumberFormatPattern({ digits: 2, modifiers: [NumberFormatPattern.Modifier.PERCENT] }),
        type: NumberFormat.Type.DECIMAL
    }).toString()
};

export const LegacyNumberFormatNoFormat = 'n';

/**
 * @param {string} format
 * @param {string} formatFallback
 * @return {string}
 */
export const convertLegacyFormat = (format, formatFallback) =>
    (format === LegacyNumberFormatNoFormat ? LegacyNumberFormat['0'] : LegacyNumberFormat[String(format)]) ??
    formatFallback;
