import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/ru';
import { kebabCase } from 'lodash';
import { DATE_FORMAT_ISO, DATE_FORMAT_LOCAL, RusMonths, RussianMonths } from './constants';

dayjs.extend(customParseFormat);
dayjs.extend(updateLocale).updateLocale('ru', {
    months: RusMonths
});

export const isDateValid = (dDate) => dDate instanceof Date && !Number.isNaN(dDate.getTime());

export const formatDateToIso = (date) =>
    isDateValid(date) ? dayjs(date).format(DATE_FORMAT_ISO) : dayjs(date, DATE_FORMAT_LOCAL).format(DATE_FORMAT_ISO);

export const formatDateToLocal = (date) => dayjs(date).format(DATE_FORMAT_LOCAL);

/**
 * @param {string} condition - тип type of operation
 * @param {number} indexValue
 * @param {number} filterValue
 * @description checks if the condition
 * @return {boolean}
 * */
export const isConditionExecuted = (condition, indexValue, filterValue) => {
    switch (condition) {
        case '>':
            return indexValue > filterValue;
        case '>=':
            return indexValue >= filterValue;
        case '<':
            return indexValue < filterValue;
        case '<=':
            return indexValue <= filterValue;
        case '=':
            return indexValue === filterValue;
        case '!=':
            return indexValue !== filterValue;
        default:
            return true;
    }
};

export { dayjs };

export const buildCssVars = ({ prefix, properties }) =>
    Object.entries(properties).reduce(
        (acc, [key, value]) => ({ ...acc, [`${prefix}_${kebabCase(key)}`]: value ?? '' }),
        {}
    );

export const monthNumber = (month) => {
    const idx = RussianMonths.findIndex((monthName) => monthName === month);
    return idx < 0 ? month : `0${idx + 1}`.slice(-2);
};

export const createIntervals = () => ({
    start: { date: '', month: '', year: '' },
    end: { date: '', month: '', year: '' }
});

export const isValidFormat = (date, format = '') => dayjs(date, format, true).isValid();

export const buildIntervalVarAliasKey = ({ field, range }) => `${field}_interval_${range}`.toUpperCase();

export const createDateFromDPProp = (date) => {
    if (date == null || date === '') {
        return null;
    }
    const parts = date.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
};
