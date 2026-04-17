import { pickBy, isEqual } from 'lodash';

export const getStringToFloat = (str) => parseFloat(`${str}`.replace(/\s/gi, '').replace(',', '.'));
export const calcArraySum = (...arrays) => arrays.flat().reduce((acc, val) => Number(acc) + Number(val), 0);
export const calcArrayAvg = (...arrays) => {
    const values = arrays.flat();
    return values.reduce((acc, val) => Number(acc) + Number(val), 0) / values.length;
};
export const findArrayMax = (...arrays) => arrays.flat().reduce((a, b) => Math.max(a, b), -Infinity);
export const findArrayMin = (...arrays) => arrays.flat().reduce((a, b) => Math.min(a, b), Infinity);
export const groupConcatUniq = (values, separator = ', ') =>
    values
        .reduce((acc, val) => {
            if (!acc.includes(val)) {
                acc.push(val);
            }
            return acc;
        }, [])
        .join(separator);
export const uniqArray = (...values) =>
    values.flat().reduce((acc, val) => {
        if (!acc.includes(val)) {
            acc.push(val);
        }
        return acc;
    }, []);

export function createMemoization(func) {
    const cache = new Map();
    const oldArgs = [];
    return function getMemoVal(...args) {
        const oldArgsIndex = oldArgs.findIndex((oldArgsData) =>
            oldArgsData.every((oldArg, index) => isEqual(oldArg, args?.[index]))
        );
        if (oldArgsIndex !== -1) {
            return cache.get(oldArgsIndex);
        }
        oldArgs.push(args);
        cache.set(oldArgs.length - 1, func(...args));
        return cache.get(oldArgs.length - 1);
    };
}
export const filterPaths = (filter, paths) => {
    const filterLoverCase = filter.toLowerCase();
    return paths.filter((path) => path.some((name) => name.toLowerCase().includes(filterLoverCase)));
};

export const clearObjectVoidValues = (obj) => pickBy(obj, (val) => val != null && val !== '');

// eslint-disable-next-line no-magic-numbers
export const isOdd = (number) => Number(number) % 2 === 0;

export const getHeapNodeValuesByPath = ({ heap, path }) => {
    let heapLevel = heap;
    path.forEach((key) => {
        heapLevel = heapLevel[key];
    });
    return heapLevel?.values ?? {};
};

export const findIntesection = (arrA, arrB) => Array.from(new Set(arrA).intersection(new Set(arrB)));

export const createRangeBuilder =
    ([startX, startY]) =>
    ([x, y]) => {
        const rangeValues = [];
        for (let rowIndex = Math.min(startY, y); rowIndex <= Math.max(startY, y); rowIndex++) {
            rangeValues.push([rowIndex, []]);
            for (let index = Math.min(startX, x); index <= Math.max(startX, x); index++) {
                const [_, indexes] = rangeValues[rangeValues.length - 1];
                indexes.push(index);
            }
        }
        return rangeValues;
    };

export const buildArgsAliases = (names) => names.reduce((acc, name, i) => ({ ...acc, [name]: `_${i}` }), {});
export const buildExpression = (exp, replaces) =>
    Object.entries(replaces)
        .sort(([first], [second]) => second.length - first.length)
        .reduce((acc, [name, val]) => acc.replace(new RegExp(name, 'g'), val), exp);
export const calculate = (exp, args = {}) => {
    const argsKeys = Object.keys(args);
    const whiteList = new RegExp([...argsKeys, `[-+*/\\.\\s\\d\\n,\\(\\)]`].join('|'), 'g');
    if (exp.replace(whiteList, '').length > 0) {
        return null;
    }
    try {
        // eslint-disable-next-line no-new-func
        return new Function(...argsKeys, `return ${exp}`)(...Object.values(args));
    } catch (e) {
        return null;
    }
};

export const updateEntriesValue = (entries, key, val) => {
    const obj = Object.fromEntries(entries);
    obj[key] = val;
    return Object.entries(obj);
};

export const createCell = ({
    type = constants.CellsTypes.CELL,
    level = 0,
    rowIndex = -1,
    hasBeenCollapsed = false,
    path = [],
    value = null,
    isLoader = false
} = {}) => ({
    type,
    level,
    rowIndex,
    hasBeenCollapsed,
    path,
    value,
    isLoader
});

/**
 *
 * @param {[string, string]} filename
 * @param {{ withDate?: boolean }} [options]
 * @return {string}
 */
export const buildExportFilename = ([name, ext = 'xlsx'], { withDate = false } = {}) => {
    const nameParts = [name];
    if (withDate) {
        const currentDatePart = new Date().toLocaleDateString('ru-RU');
        nameParts.push(currentDatePart);
    }
    return [nameParts.join('-'), ext].join('.');
};
