/* eslint-disable no-restricted-syntax */
/* eslint-disable id-length, no-magic-numbers, no-nested-ternary */
import { cloneDeep, merge as _merge, memoize as _memoize, isEmpty as _isEmpty } from 'lodash';
import Color from 'color';
import dayjs from 'dayjs';
import { formatNumber } from '@goodt-widgets-insight/utils';

import {
    AxisTemplate,
    AdditionalAxisLabelFactory,
    DataZoomOptions,
    Axises,
    ADDITIONAL_AXIS_LABEL_RICH_NAME,
    ADDITIONAL_AXIS_LABEL_RICH_CONDITION_NAME
} from './constants';

const fixNum = (num, frDigits) => (num != null ? num.toFixed(frDigits) : num);

let sectionValues = [];

const calcSections = (splitNumber) => {
    let sections = Number(splitNumber);
    if (sections < 1) {
        return 5;
    }
    if ([1, 2, 3].includes(sections)) {
        return ++sections;
    }
    return sections;
};

const calcMaxValue = ({ segment, splitNumber }) => {
    const sections = calcSections(splitNumber);
    const precision = (segment.toFixed(20).match(/\.(0+)/)?.[1] ?? []).length + 1;
    const delta = 10 ** precision;
    const step = Math.max((1 / delta) * 2, Math.trunc((segment / sections) * delta) / delta);
    return step * Math.ceil(segment / step);
};

const calcPercentage = (num, localeSep, frDigits) => {
    if (localeSep === 'default') {
        return `${fixNum(num * 100, frDigits)}%`;
    }
    return Intl.NumberFormat(localeSep, {
        style: 'percent',
        minimumFractionDigits: frDigits
    }).format(num);
};

const formatNum = (num, localeSep, frDigits) => {
    if (localeSep === 'default') {
        return num;
    }
    return Intl.NumberFormat(localeSep, {
        minimumFractionDigits: frDigits
    }).format(num);
};
const separators = ['default', 'ru-RU', 'de-DE', 'en-EN'];

const availableFormats = {
    0: ({ value, sep }) => formatNum(fixNum(value, 0), sep, 0),
    1: ({ value, sep }) => formatNum(fixNum(value, 1), sep, 1),
    2: ({ value, sep }) => formatNum(fixNum(value, 2), sep, 2),
    3: ({ value, sep }) => formatNum(fixNum(value, 3), sep, 3),
    '0%': ({ value, sep }) => calcPercentage(value, sep, 0),
    '1%': ({ value, sep }) => calcPercentage(value, sep, 1),
    '2%': ({ value, sep }) => calcPercentage(value, sep, 2),
    '3%': ({ value, sep }) => calcPercentage(value, sep, 3)
};

export const condStyleTypes = {
    ALL: {
        name: 'всегда',
        handler: (paramValue, styleValue) => true
    },
    GT: {
        name: '>',
        handler: (paramValue, styleValue) => Number(paramValue) > Number(styleValue)
    },
    LT: {
        name: '<',
        handler: (paramValue, styleValue) => Number(paramValue) < Number(styleValue)
    },
    EQ: {
        name: '=',
        handler: (paramValue, styleValue) => Number(paramValue) === Number(styleValue)
    }
};

export const calcRoundValue = (value) => {
    const newVal = Number(value);
    const checkedVal = Math.abs(newVal);

    if (checkedVal === 0) {
        return newVal;
    }
    if (checkedVal < 0.01) {
        return newVal.toFixed(3);
    }
    if (checkedVal < 0.1) {
        return newVal.toFixed(2);
    }
    if (checkedVal < 1) {
        return newVal.toFixed(1);
    }
    return Math.round(newVal);
};

const resolvePfixValue = (metricValue, item) => {
    if (metricValue == null || item == null) {
        return null;
    }

    const { value = '', valueConditions = [] } = item;

    if (valueConditions.length === 0) {
        return value;
    }

    return valueConditions.reduce((acc, { comparedValue, type, displayedValue }) => {
        const isConditionMet = condStyleTypes[type]?.handler(metricValue, comparedValue) ?? false;
        return isConditionMet ? displayedValue : acc;
    }, value);
};

const styleDataItemLabel = (item, label) => {
    const { addlLabelValue } = item;

    if (addlLabelValue == null) {
        return item;
    }

    const { additional = null, prefix = null, postfix = null } = label.rich;

    const resolveColor = (color, colorConditions) => {
        if (colorConditions.length === 0) {
            return color;
        }

        return colorConditions.reduce((acc, { comparedValue, type, color: conditionColor }) => {
            const isConditionMet = condStyleTypes[type]?.handler(addlLabelValue, comparedValue) ?? false;
            return isConditionMet ? conditionColor : acc;
        }, color);
    };

    const { backgroundColor, padding, color, colorConditions, gap, fontSize, borderRadius = [0, 0, 0, 0] } = additional;
    const labelColor = resolveColor(color, colorConditions);
    const prefixColor = resolveColor(prefix?.color ?? color, colorConditions);
    const postfixColor = resolveColor(postfix?.color ?? color, colorConditions);
    const [padTop, padRight, padBot, padLeft] = [...padding];
    const lineHeight = gap + fontSize + padTop + padBot;
    const rich = {
        ...(additional != null && {
            additional: { ...cloneDeep(additional), color: labelColor, lineHeight, borderRadius }
        }),
        ...(prefix != null && { prefix: { ...cloneDeep(prefix), backgroundColor, color: prefixColor, lineHeight } }),
        ...(postfix != null && { postfix: { ...cloneDeep(postfix), backgroundColor, color: postfixColor, lineHeight } })
    };

    if (_isEmpty(resolvePfixValue(addlLabelValue, prefix)) === false) {
        rich.prefix.padding = [padTop, 0, padBot, padLeft];
        rich.additional.padding[3] = prefix.offset;
        rich.prefix.borderRadius = [borderRadius[0], 0, 0, borderRadius[3]];
        rich.additional.borderRadius = [0, rich.additional.borderRadius[1], rich.additional.borderRadius[2], 0];
    }

    if (_isEmpty(resolvePfixValue(addlLabelValue, postfix)) === false) {
        rich.postfix.padding = [padTop, padRight, padBot, 0];
        rich.additional.padding[1] = postfix.offset;
        rich.postfix.borderRadius = [0, borderRadius[1], borderRadius[2], 0];
        rich.additional.borderRadius = [rich.additional.borderRadius[0], 0, 0, rich.additional.borderRadius[3]];
    }

    return {
        ...item,
        label: { rich }
    };
};

export const utils = {
    condStyleTypes,
    labelFormatter({ data: { value, addlLabelValue } }) {
        const { metricFormat, metricSeparator, metricPrefix, metricPostfix, label } = this;
        const { isZeroValueShown } = label;
        if (value === 0 && !isZeroValueShown) {
            return '';
        }
        const { isAbsoluteValue, isAutoRound } = this;

        if (isAutoRound) {
            return `${calcRoundValue(isAbsoluteValue ? Math.abs(value) : value)}`;
        }

        const sep = separators[metricSeparator];
        const opts = { value: isAbsoluteValue ? Math.abs(value) : value, sep };
        const formattedValue = availableFormats[metricFormat](opts);
        const mainLabelTemplate = `${metricPrefix} ${formattedValue} ${metricPostfix}`;

        if (label.isAddlLabelShown === false || addlLabelValue == null) {
            return mainLabelTemplate;
        }

        const { additional = null, prefix = null, postfix = null } = label.rich;
        const formattedAddlValue = formatNumber(addlLabelValue, additional?.format ?? '');
        const prefixValue = resolvePfixValue(addlLabelValue, prefix);
        const postfixValue = resolvePfixValue(addlLabelValue, postfix);
        const prefixTemplate = _isEmpty(prefixValue) ? '' : `{prefix|${prefixValue}}`;
        const postfixTemplate = _isEmpty(postfixValue) ? '' : `{postfix|${postfixValue}}`;
        const addlLabelTemplate = `${prefixTemplate}{additional|${formattedAddlValue}}${postfixTemplate}`;
        const additionalMainLAbelTemplate = `{base|${mainLabelTemplate}}`;

        return additional.position === 'top'
            ? [addlLabelTemplate, additionalMainLAbelTemplate].join('\n')
            : [additionalMainLAbelTemplate, addlLabelTemplate].join('\n');
    },

    tooltipSeriesFormatter({ seriesName, name, value }) {
        const { metricFormat, metricSeparator, metricPrefix, metricPostfix, isAbsoluteValue, isAutoRound } = this;
        const sep = separators[metricSeparator];
        const tooltipFormat = `${seriesName}</br>${name}: `;
        const newVal = isAbsoluteValue ? Math.abs(value) : value;
        const formattedValue = isAutoRound
            ? calcRoundValue(newVal)
            : availableFormats[metricFormat]({ value: newVal, sep });

        return `${tooltipFormat} ${metricPrefix} ${formattedValue} ${metricPostfix}`;
    },

    tooltipFormatter(metricsStyle, data) {
        const {
            format: sharedFormat,
            separator: sharedSeparator,
            prefix: sharedPrefix = '',
            postfix: sharedPostfix = '',
            showCategory,
            showNullishValues,
            reverseMetrics,
            isAbsoluteValue: sharedIsAbsoluteValue,
            isNestedFromMetric,
            excludes
        } = this;
        const [{ name }] = data;

        let format = sharedFormat;
        let separator = sharedSeparator;
        let prefix = sharedPrefix;
        let postfix = sharedPostfix;
        let isAbsoluteValue = sharedIsAbsoluteValue;

        let values = data.reduce((arr, { seriesName, value }) => {
            if (isNestedFromMetric) {
                const currentMetric = metricsStyle.find((metric) => metric.name === seriesName);

                if (currentMetric != null) {
                    const {
                        metricFormat,
                        metricSeparator,
                        metricPrefix,
                        metricPostfix,
                        isAbsoluteValue: metricIsAbsoluteValue
                    } = currentMetric;

                    format = metricFormat;
                    separator = metricSeparator;
                    prefix = metricPrefix;
                    postfix = metricPostfix;
                    isAbsoluteValue = metricIsAbsoluteValue;
                }
            }

            const shouldBeExcluded =
                excludes.includes(seriesName) || value == null || (!showNullishValues && value === 0);
            if (!shouldBeExcluded) {
                const opts = { value: isAbsoluteValue ? Math.abs(value) : value, sep: separators[separator] };
                const tooltipFormat = `${seriesName}: `;
                const formattedValue = availableFormats[format](opts);
                arr.push(`${tooltipFormat}${prefix}${formattedValue}${postfix}<br/>`);
            }
            return arr;
        }, []);
        values = reverseMetrics ? values.reverse().join('') : values.join('');
        return showCategory ? `${name}<br/>${values}` : values;
    },

    calcAxisMin({ min }) {
        const {
            format,
            isFullPercentageScale,
            calcMinMax,
            manualMinMax,
            dynamicMinValue,
            minValue,
            isRoundedDynamicMinValue,
            isNotAboveZeroDynamicMinValue,
            splitNumber,
            interval
        } = this;

        if (format === 'percent') {
            return isFullPercentageScale ? 0 : minValue / 100;
        }
        if (calcMinMax === false) {
            return null;
        }
        if (isRoundedDynamicMinValue) {
            const result = manualMinMax ? minValue : Math.floor(min - (Math.abs(min) / 100) * dynamicMinValue);
            if (interval === null) {
                return result;
            }
            return result > 0
                ? result - (result % Number(interval))
                : result - (Number(interval) + (result % Number(interval)));
        }
        const val = min - (min / 100) * dynamicMinValue;

        if (isNotAboveZeroDynamicMinValue && val > 0) {
            return 0;
        }

        const result = manualMinMax ? minValue : val;

        if (interval !== null) {
            return val > 0 ? val - (val % Number(interval)) : val - (Number(interval) + (val % Number(interval)));
        }

        if (manualMinMax) {
            return result;
        }

        return result > 0 ? result : -calcMaxValue({ segment: Math.abs(min), splitNumber });
    },

    calcAxisMax({ max }) {
        const {
            format,
            isFullPercentageScale,
            calcMinMax,
            manualMinMax,
            enableMax,
            dynamicMaxValue,
            maxValue,
            dynamicMaxValuePrecision,
            splitNumber,
            isRoundedDynamicMaxValue
        } = this;
        if (format === 'percent') {
            if (isFullPercentageScale) {
                return 1;
            }
            return enableMax ? maxValue / 100 : null;
        }
        if (calcMinMax === false) {
            return null;
        }
        if (manualMinMax === true) {
            return enableMax ? maxValue : null;
        }
        if (isRoundedDynamicMaxValue) {
            const dynamicValue = max + (Math.abs(max) / 100) * dynamicMaxValue;
            return dynamicMaxValuePrecision > 0
                ? Number(dynamicValue.toFixed(dynamicMaxValuePrecision))
                : Math.ceil(dynamicValue);
        }
        if (max < 0) {
            return 0;
        }

        const calcMax = max + (max / 100) * dynamicMaxValue;
        return calcMax > 2 && calcMax < 100
            ? Math.ceil(calcMax + calcMax / calcSections(splitNumber))
            : calcMaxValue({ segment: max, splitNumber });
    },

    valueAxisLabelFormatter(value, index) {
        if (index === 0) {
            sectionValues = [];
        }
        const { format, extendedFormat, isNumberFormatActive, separator } = this.axisLabel;
        const sep = separators[separator];
        const opts = { value, sep };
        let formattedValue = isNumberFormatActive
            ? formatNumber(value, extendedFormat)
            : availableFormats[format](opts);
        if (Number(formattedValue.replace(',', '.')) > 0 && formattedValue === sectionValues[index - 1]) {
            formattedValue = ' ';
        }
        sectionValues.push(formattedValue);
        return formattedValue;
    },

    axisLabelTextFormatter({ formattedValue, breakLongValues, longValuesLength }) {
        if (breakLongValues === true) {
            return formattedValue.replace(/\s+/g, '\n').replaceAll('/', '/\n');
        }
        if (longValuesLength !== 0) {
            return formattedValue
                .split(/\s+/g)
                .reduce(
                    (acc, word) =>
                        acc[acc.length - 1] === undefined ||
                        acc[acc.length - 1].length >= longValuesLength ||
                        acc[acc.length - 1].length + word.length + 1 > longValuesLength
                            ? [...acc, word]
                            : [...acc.slice(0, acc.length - 1), `${acc[acc.length - 1]} ${word}`],
                    []
                )
                .join('\n');
        }

        return formattedValue;
    },

    findAdditionalLabelConditionIndex: (conditions, value) =>
        conditions.findIndex(
            ({ type, comparedValue }) => type !== '' && utils.condStyleTypes[type].handler(value, comparedValue)
        ),

    buildAdditionalLabel({ label, value, position, conditions, enablePlusValues, format }) {
        const rowCount = label.split('\n').length - 1;
        const formatValue = formatNumber(value, format);
        const conditionIndex = utils.findAdditionalLabelConditionIndex(conditions, value);
        const formatLabel = `{${
            conditionIndex > -1
                ? `${ADDITIONAL_AXIS_LABEL_RICH_CONDITION_NAME}_${conditionIndex}_${rowCount}`
                : `${ADDITIONAL_AXIS_LABEL_RICH_NAME}${rowCount}`
        }|${enablePlusValues && value > 0 ? `+${formatValue}` : formatValue}}`;
        return [
            ...(['top', 'left'].includes(position) ? [formatLabel] : []),
            label,
            ...(['right', 'bottom'].includes(position) ? [formatLabel] : [])
        ].join(['top', 'bottom'].includes(position) ? '\n' : '');
    },

    categoryAxisLabelFormatter(dimFormat, additionalMetrics, value) {
        const {
            additionalAxisLabel,
            axisLabel: { breakLongValues, type, longValuesLength }
        } = this;

        const formattedValue = dimFormat === 'string' ? value : dayjs(value).format(dimFormat);
        const axisLabelFormats = {
            text: () => utils.axisLabelTextFormatter({ breakLongValues, longValuesLength, formattedValue }),
            image: () => `{${utils.memoTransliterate(formattedValue).replace(/\s/g, '_')}|}`,
            'text&label': () =>
                utils.buildAdditionalLabel({
                    ...additionalAxisLabel,
                    label: utils.axisLabelTextFormatter({ breakLongValues, longValuesLength, formattedValue }),
                    value: additionalMetrics[value]
                }),
            'text&image': () => `${axisLabelFormats.image(formattedValue)}\n${axisLabelFormats.text(formattedValue)}`
        };
        return axisLabelFormats[type]();
    },

    sortArray(arr, sortOrder, dimFormat) {
        dimFormat === 'string' ? utils.sortLikeStrings(arr, sortOrder) : utils.sortLikeDates(arr, sortOrder);
    },

    sortLikeStrings(arr, sortOrder) {
        arr.sort((prev, next) => {
            if (sortOrder === 'ascending') {
                return prev.name.localeCompare(next.name);
            }
            if (sortOrder === 'descending') {
                return next.name.localeCompare(prev.name);
            }
            return 0;
        });
    },

    sortLikeDates(arr, sortOrder) {
        arr.sort((prev, next) => {
            const prevDate = dayjs(prev.name);
            const nextDate = dayjs(next.name);
            if (sortOrder === 'ascending') {
                return prevDate.isAfter(nextDate) ? 1 : prevDate.isBefore(nextDate) ? -1 : 0;
            }
            if (sortOrder === 'descending') {
                return prevDate.isBefore(nextDate) ? 1 : prevDate.isAfter(nextDate) ? -1 : 0;
            }
            return 0;
        });
    },

    findCategoryAxis(seriesOptions, axis) {
        const { xAxisIndex: idX, yAxisIndex: idY } = seriesOptions;
        const xIndex = axis.xAxis.findIndex(({ id, type }) => id === idX && type === 'category');
        const yIndex = axis.yAxis.findIndex(({ id, type }) => id === idY && type === 'category');
        let categoryAxis = '';
        if (xIndex >= 0 && axis?.xAxis?.length > 0) {
            categoryAxis = 'xAxis';
        } else if (yIndex >= 0 && axis?.yAxis?.length > 0) {
            categoryAxis = 'yAxis';
        }
        return categoryAxis;
    },

    addAgrData(seriesData, name, value, axisData, addlLabelValue, seriesOptions, isShownNullLabels) {
        const { nullValues, voidValues } = seriesOptions;
        const nullValue = isShownNullLabels ? '-' : null;

        const foundItemIdx = seriesData.findIndex((item) => item.name === name);

        if (foundItemIdx >= 0) {
            const { value: itemValue, addlLabelValue: labelValue } = seriesData[foundItemIdx];
            seriesData[foundItemIdx] = {
                ...seriesData[foundItemIdx],
                value:
                    itemValue === nullValue && ((value === null && voidValues) || (value === 0 && nullValues))
                        ? nullValue
                        : itemValue + Number(value),
                ...(labelValue != null &&
                    addlLabelValue != null && { addlLabelValue: labelValue + Number(addlLabelValue) })
            };
            return;
        }

        axisData.push({
            name,
            value: name,
            textStyle: {
                fontSize: 12,
                fontWeight: 'normal'
            }
        });
        const adaptValue = (value === null && voidValues) || (value === 0 && nullValues) ? nullValue : Number(value);
        seriesData.push({
            name,
            value: Number.isNaN(adaptValue) ? 0 : value,
            itemStyle: {
                color: null
            },
            ...(addlLabelValue != null && { addlLabelValue: Number(addlLabelValue) })
        });
    },

    resolveStyleDataItems(seriesOptions, data) {
        const { customType, styleConditions, shouldSyncShadowColor, label } = seriesOptions;

        const styleDataItem = (item, { type, value, dimValues, color, useGradient, gradientColor }) => {
            const styleInfo = condStyleTypes[type];
            const isDimValuesCondition = dimValues && dimValues.includes(item.name);
            const isValueCondition = styleInfo && styleInfo.handler(item.value, value);

            if (isDimValuesCondition || isValueCondition) {
                const itemColor = useGradient ? gradientColor : color;
                return _merge(item, {
                    itemStyle: {
                        color: itemColor,
                        shadowColor: shouldSyncShadowColor ? itemColor : null
                    }
                });
            }

            return item;
        };

        return data.map((item) => {
            if (item == null) {
                return item;
            }

            let itemStyled = cloneDeep(item);

            if (customType === 'bar' && styleConditions.enable) {
                itemStyled = styleConditions.conditions.reduce(styleDataItem, itemStyled);
            }

            return styleDataItemLabel(itemStyled, label);
        });
    },

    getTop(arr, { number, dir }) {
        // eslint-disable-next-line no-restricted-syntax
        const top = [];
        for (let j = 0; j < number; j++) {
            top.push({ value: arr[j].value, index: j });
        }
        if (dir === 'top') {
            top.sort((a, b) => a.value - b.value);
            for (let i = number; i < arr.length; i++) {
                if (arr[i].value > top[0].value) {
                    top[0] = { value: arr[i].value, index: i };
                    top.sort((a, b) => a.value - b.value);
                }
            }
        } else {
            top.sort((a, b) => b.value - a.value);
            for (let i = number; i < arr.length; i++) {
                if (arr[i].value < top[0].value) {
                    top[0] = { value: arr[i].value, index: i };
                    top.sort((a, b) => b.value - a.value);
                }
            }
        }
        return top;
    },

    getTopMetric(arr, { number: num, dir }) {
        const number = num > arr.length ? arr.length : num;
        return utils.getTop(arr, { number, dir });
    },

    createColor(color, colorStep, idx) {
        const originColor = Color(color).hsl();
        const darkestColor = { ...originColor.object(), l: 20 };
        const newColor = { ...darkestColor, l: darkestColor.l + colorStep * idx };
        return Color(newColor).hsl().string();
    },

    buildColorSet(seriesColor, colorStep, dimensions) {
        return dimensions.reduce(
            (acc, name, idx) => [
                ...acc,
                {
                    name,
                    color: utils.createColor(seriesColor, colorStep, idx)
                }
            ],
            []
        );
    },

    findDimValUsage(seriesOptions, axis, dimValObj) {
        const categoryAxis = utils.findCategoryAxis(seriesOptions, axis);
        const axisIdx = categoryAxis === 'xAxis' ? seriesOptions.xAxisIndex : seriesOptions.yAxisIndex;

        axis[categoryAxis][axisIdx].data.forEach(({ name: axisItemName }) => {
            let seriesDataItem = seriesOptions.data.find(({ name }) => name === axisItemName);
            if (!Object.keys(dimValObj).includes(axisItemName)) {
                dimValObj[axisItemName] = { isUseless: true, categoryAxis, axisIdx };
            }
            dimValObj[axisItemName].isUseless = dimValObj[axisItemName].isUseless
                ? (seriesDataItem ??= {})?.value === null
                : false;
        });

        return dimValObj;
    },

    removeUselessDimVals(series, axis) {
        const dimValObj = series.reduce((obj, seriesOptions) => utils.findDimValUsage(seriesOptions, axis, obj), {});

        Object.entries(dimValObj).forEach(([key, { isUseless, categoryAxis, axisIdx }]) => {
            if (isUseless) {
                const uselessAxsValIdx = axis[categoryAxis][axisIdx].data.findIndex(({ name }) => name === key);
                if (uselessAxsValIdx >= 0) {
                    axis[categoryAxis][axisIdx].data.splice(uselessAxsValIdx, 1);
                }
                series.forEach((seriesOptions) => {
                    const uselessSrsValIdx = seriesOptions.data.findIndex(({ name }) => name === key);
                    if (uselessSrsValIdx >= 0) {
                        seriesOptions.data.splice(uselessSrsValIdx, 1);
                    }
                });
            }
        });
    },
    sortDimValues(a = '', b = '') {
        try {
            return a.localeCompare(b);
        } catch (e) {
            this.error = `В используемом датасете в измерении "${this.name}" обнаружено не консистентное значение`;
            throw new Error(e);
        }
    },

    smoothStackedSeries(series, axis) {
        const lastSeriesItem = series[series.length - 1];

        if (lastSeriesItem == null) {
            return series;
        }
        if (lastSeriesItem.customType.includes('line')) {
            return series;
        }

        const categoryAxis = utils.findCategoryAxis(lastSeriesItem, axis);
        const emptyBarBdrRds = [0, 0, 0, 0];
        const roundedBdr = 500;
        let fillBarBdrRds = emptyBarBdrRds;

        if (categoryAxis === 'xAxis') {
            fillBarBdrRds = [roundedBdr, roundedBdr, 0, 0];
        } else if (categoryAxis === 'yAxis') {
            fillBarBdrRds = [0, roundedBdr, roundedBdr, 0];
        }

        return series.map((seriesItem, idx, arr) => {
            const modifiedSeriesItem = cloneDeep(seriesItem);
            const { smooth: isSmoothed, isRoundedBarBorder, roundedBarBorder } = seriesItem;
            const { leftTop = 0, rightTop = 0, rightBottom = 0, leftBottom = 0 } = roundedBarBorder ?? {};

            if (isRoundedBarBorder) {
                return {
                    ...modifiedSeriesItem,
                    itemStyle: {
                        ...modifiedSeriesItem.itemStyle,
                        barBorderRadius: [leftTop, rightTop, rightBottom, leftBottom]
                    }
                };
            }

            if (isSmoothed && idx === arr.length - 1) {
                return {
                    ...modifiedSeriesItem,
                    itemStyle: {
                        ...modifiedSeriesItem.itemStyle,
                        barBorderRadius: fillBarBdrRds
                    }
                };
            }

            return {
                ...modifiedSeriesItem,
                itemStyle: {
                    ...modifiedSeriesItem.itemStyle,
                    barBorderRadius: emptyBarBdrRds
                }
            };
        }, []);
    },

    getDimValues(dataRows = [], dimName = '') {
        if (dimName === '' || dimName == null) {
            return [];
        }
        return [
            ...dataRows.reduce((set, row) => {
                const [, dimValue] = Object.entries(row ?? {}).find(([key]) => key === dimName);
                return dimValue === null ? set : set.add(dimValue);
            }, new Set())
        ];
    },

    buildAxisAdditionalLabelRich({ dimensionMetrics, labelSettings, outerLabelFontSize }) {
        const maxWordsCount = Object.keys(dimensionMetrics).reduce((count, dimensionName) => {
            const dimensionNameWordCount = dimensionName.split(' ').length;
            return dimensionNameWordCount > count ? dimensionNameWordCount : count;
        }, 0);
        const axisLabelRich = {};

        for (let i = 0; i < maxWordsCount; i++) {
            const { position, textOffset, conditions } = labelSettings;
            axisLabelRich[`${ADDITIONAL_AXIS_LABEL_RICH_NAME}${i}`] = {
                ...AdditionalAxisLabelFactory(labelSettings),
                ...(position === 'right'
                    ? {
                          // eslint-disable-next-line no-restricted-syntax
                          padding: [0, -textOffset, -outerLabelFontSize * i, 0]
                      }
                    : {}),
                ...(position === 'left'
                    ? {
                          // eslint-disable-next-line no-restricted-syntax
                          padding: [-outerLabelFontSize * i, 0, 0, -textOffset]
                      }
                    : {}),
                ...(position === 'top'
                    ? {
                          // eslint-disable-next-line no-restricted-syntax
                          padding: [0, 0, -textOffset, 0]
                      }
                    : {}),
                ...(position === 'bottom'
                    ? {
                          // eslint-disable-next-line no-restricted-syntax
                          padding: [-textOffset, 0, 0, 0]
                      }
                    : {})
            };

            conditions.forEach(({ color: conditionColor }, index) => {
                axisLabelRich[`${ADDITIONAL_AXIS_LABEL_RICH_CONDITION_NAME}_${index}_${i}`] = {
                    ...axisLabelRich[`${ADDITIONAL_AXIS_LABEL_RICH_NAME}${i}`],
                    color: conditionColor
                };
            });
        }

        return axisLabelRich;
    },

    getAxis({ axisOptions, tooltip, axisPointer, dimFormat, dimName, rows }) {
        return axisOptions.reduce(
            (axis, item) => {
                if (item.type === 'category') {
                    const dimensionMetrics = utils.getDremioDimensionMetrics({
                        rows,
                        dimension: dimName,
                        metrics: [item.additionalAxisLabel.metric]
                    });
                    const additionalAxisLabelMetrics = Object.keys(dimensionMetrics).reduce(
                        (acc, dimension) => ({
                            ...acc,
                            [dimension]: dimensionMetrics[dimension][item.additionalAxisLabel.metric].reduce(
                                (sum, value) => (value != null ? Number(sum) + Number(value) : sum),
                                0
                            )
                        }),
                        []
                    );
                    const axisLabelRich = utils.buildAxisAdditionalLabelRich({
                        outerLabelFontSize: item.valueFontSize,
                        dimensionMetrics: additionalAxisLabelMetrics,
                        labelSettings: item.additionalAxisLabel
                    });

                    item.name = (item.showAxisName ? (item.name === '' ? dimName : item.name) : '').replaceAll(
                        '\\n',
                        '\n'
                    );
                    item.silent = false;
                    item.triggerEvent = true;
                    item.axisLabel.fontSize = 12;
                    item.boundaryGap = item.hasGap;
                    item.min = null;
                    item.max = null;
                    item.axisPointer.show = tooltip.trigger === 'axis' || (axisPointer && axisPointer.show);
                    item.data = [];
                    item.axisLabel.formatter = utils.categoryAxisLabelFormatter.bind(
                        item,
                        dimFormat,
                        additionalAxisLabelMetrics
                    );
                    item.axisLabel.rich = {
                        ...axisLabelRich
                    };
                } else {
                    item.name = (item.showAxisName ? item.name : '').replaceAll('\\n', '\n');
                    item.silent = true;
                    item.triggerEvent = false;
                    item.axisLabel.fontSize = item.valueFontSize;
                    item.axisLabel.rich = {};
                    item.axisPointer.show = false;
                    item.boundaryGap = item.hasGap ? [0, '20%'] : [0, 0];
                    item.min = utils.calcAxisMin.bind(item);
                    item.max = utils.calcAxisMax.bind(item);
                    item.data = null;
                    item.axisLabel.formatter = utils.valueAxisLabelFormatter.bind(item);
                    item.interval = item.interval === 0 ? null : item.interval;
                }
                axis[item.typeAxis === 'x' ? 'xAxis' : 'yAxis'].push(item);
                return axis;
            },
            { xAxis: [], yAxis: [] }
        );
    },

    calcSeriesMinMax(series) {
        const values = series.flatMap(({ data }) => data).map(({ value }) => value);
        return {
            max: Math.max(...values),
            min: Math.min(...values)
        };
    },

    getCumulativeTotalData(data) {
        return data.reduce((arr, item, idx) => {
            if (idx === 0) {
                return [item];
            }
            const newItem = { ...item };
            newItem.value += arr[idx - 1].value;
            return [...arr, newItem];
        }, []);
    },

    getCumulativeDifference(data) {
        const cumTotalData = utils.getCumulativeTotalData(data);
        return cumTotalData.reduce((arr, item, idx) => {
            if (idx === 0) {
                return [{ ...item, value: null }];
            }
            const newItem = { ...item };
            newItem.value -= cumTotalData[idx - 1].value;
            return [...arr, newItem];
        }, []);
    },

    postprocessSeriesData(series, axis, sortOrder, dimFormat) {
        series.forEach((seriesOptions) => {
            if (seriesOptions.isTopSeries === true) {
                return;
            }
            const categoryAxis = utils.findCategoryAxis(seriesOptions, axis);
            const idx = categoryAxis === 'xAxis' ? seriesOptions.xAxisIndex : seriesOptions.yAxisIndex;
            const curCategoryAxis = axis[categoryAxis][idx];
            curCategoryAxis.data.forEach((axisItem) => {
                if (!seriesOptions.data.some(({ name }) => name === axisItem.name)) {
                    seriesOptions.data.push({ name: axisItem.name, value: null });
                }
            });
            if (sortOrder === 'none') {
                seriesOptions.data.forEach((options) => {
                    options.sortIdx = curCategoryAxis.data.findIndex((axisItem) => axisItem.name === options.name);
                });
                seriesOptions.data.sort((a, b) => a.sortIdx - b.sortIdx);
                return;
            }
            utils.sortArray(curCategoryAxis.data, sortOrder, dimFormat);
            utils.sortArray(seriesOptions.data, sortOrder, dimFormat);
        });
    },

    buildCustomTooltipData(
        dremioResults,
        dimensionOptions,
        { dimensionName, value: incomingTooltipValue },
        { seriesName, metricName }
    ) {
        const {
            main: { name: mainDimName = '' },
            minor: { name: minorDimName = '' }
        } = dimensionOptions;
        const tooltipData =
            minorDimName !== ''
                ? dremioResults.reduce((acc, { rows }) => {
                      const foundRow = rows.find(
                          ({ [mainDimName]: mainDimValue, [minorDimName]: minorDimValue }) =>
                              mainDimValue === dimensionName && minorDimValue === seriesName
                      );
                      return { ...acc, ...foundRow };
                  }, {})
                : dremioResults.reduce((acc, { rows }) => {
                      const foundRow = rows.find(({ [mainDimName]: mainDimValue }) => mainDimValue === dimensionName);
                      return { ...acc, ...foundRow };
                  }, {});

        return { ...tooltipData, [metricName]: incomingTooltipValue };
    },

    takeMetricKey(seriesOptions, queryHelper, dimName) {
        const { metricName, multiMetricMode } = seriesOptions;

        if (multiMetricMode.enable) {
            const { states } = queryHelper.find(({ dimensionList }) => Object.keys(dimensionList).includes(dimName));
            const state = states.find(({ name }) => name === dimName);

            return multiMetricMode.metricNames[state.index] ?? metricName;
        }

        return metricName;
    },

    uid() {
        // eslint-disable-next-line no-bitwise,goodt-rules/deprecate-member-expression
        return `f${(~~(Math.random() * 1e8)).toString(16)}`;
    },

    transliterate(text) {
        // eslint-disable-next-line no-param-reassign
        text = text
            .replace(/\u0401/g, 'YO')
            .replace(/\u0419/g, 'I')
            .replace(/\u0426/g, 'TS')
            .replace(/\u0423/g, 'U')
            .replace(/\u041A/g, 'K')
            .replace(/\u0415/g, 'E')
            .replace(/\u041D/g, 'N')
            .replace(/\u0413/g, 'G')
            .replace(/\u0428/g, 'SH')
            .replace(/\u0429/g, 'SCH')
            .replace(/\u0417/g, 'Z')
            .replace(/\u0425/g, 'H')
            .replace(/\u042A/g, '')
            .replace(/\u0451/g, 'yo')
            .replace(/\u0439/g, 'i')
            .replace(/\u0446/g, 'ts')
            .replace(/\u0443/g, 'u')
            .replace(/\u043A/g, 'k')
            .replace(/\u0435/g, 'e')
            .replace(/\u043D/g, 'n')
            .replace(/\u0433/g, 'g')
            .replace(/\u0448/g, 'sh')
            .replace(/\u0449/g, 'sch')
            .replace(/\u0437/g, 'z')
            .replace(/\u0445/g, 'h')
            .replace(/\u044A/g, '')
            .replace(/\u0424/g, 'F')
            .replace(/\u042B/g, 'I')
            .replace(/\u0412/g, 'V')
            .replace(/\u0410/g, 'a')
            .replace(/\u041F/g, 'P')
            .replace(/\u0420/g, 'R')
            .replace(/\u041E/g, 'O')
            .replace(/\u041B/g, 'L')
            .replace(/\u0414/g, 'D')
            .replace(/\u0416/g, 'ZH')
            .replace(/\u042D/g, 'E')
            .replace(/\u0444/g, 'f')
            .replace(/\u044B/g, 'i')
            .replace(/\u0432/g, 'v')
            .replace(/\u0430/g, 'a')
            .replace(/\u043F/g, 'p')
            .replace(/\u0440/g, 'r')
            .replace(/\u043E/g, 'o')
            .replace(/\u043B/g, 'l')
            .replace(/\u0434/g, 'd')
            .replace(/\u0436/g, 'zh')
            .replace(/\u044D/g, 'e')
            .replace(/\u042F/g, 'Ya')
            .replace(/\u0427/g, 'CH')
            .replace(/\u0421/g, 'S')
            .replace(/\u041C/g, 'M')
            .replace(/\u0418/g, 'I')
            .replace(/\u0422/g, 'T')
            .replace(/\u042C/g, '')
            .replace(/\u0411/g, 'B')
            .replace(/\u042E/g, 'YU')
            .replace(/\u044F/g, 'ya')
            .replace(/\u0447/g, 'ch')
            .replace(/\u0441/g, 's')
            .replace(/\u043C/g, 'm')
            .replace(/\u0438/g, 'i')
            .replace(/\u0442/g, 't')
            .replace(/\u044C/g, '')
            .replace(/\u0431/g, 'b')
            .replace(/\u044E/g, 'yu');

        return text;
    },

    /**
     * @param { Object } dremioResult
     * @param { string } dimension
     * @param { Object } metrics
     * @return { Object }
     */
    getDremioDimensionMetrics: ({ rows, dimension, metrics }) =>
        rows.reduce(
            (acc, row) => ({
                ...acc,
                [row[dimension]]: metrics.reduce(
                    (accMetrics, metric) => ({
                        ...accMetrics,
                        [metric]:
                            acc[row[dimension]] === undefined
                                ? [row[metric]]
                                : [...acc[row[dimension]][metric], row[metric]]
                    }),
                    {}
                )
            }),
            {}
        )
};

utils.memoTransliterate = _memoize(utils.transliterate);

export const condStyleFactory = () => ({
    type: null,
    value: '',
    dimValues: [],
    color: '',
    useGradient: false,
    gradientColor: '',
    gradient: {
        firstColor: '#50f547',
        secondColor: '#ddff45',
        firstOffset: '0',
        secondOffset: '1',
        pos: '0 0 0 1'
    }
});

export const propsFixer = (props) => {
    const privateProps = cloneDeep(props);
    if (!Array.isArray(props.axis)) {
        privateProps.axis = Axises;
    }
    privateProps.axis = privateProps.axis.map((item) => _merge(AxisTemplate(), item));
    privateProps.metricsStyle = privateProps.metricsStyle.map((metric) =>
        _merge(
            {
                styleConditions: { enable: false, conditions: [] },
                multiMetricMode: { enable: false, metricNames: [] },
                label: { rotate: 0, offset: [0, 0], align: 'center' },
                excessLackLabel: { rotate: 0, offset: [0, 0], align: 'center' }
            },
            metric
        )
    );
    privateProps.tooltip = { ...{ excludes: [] }, ...privateProps.tooltip };
    privateProps.dataZoom = { ...DataZoomOptions, ...privateProps.dataZoom };
    return privateProps;
};

// export const Events = Object.freeze({
//     LOAD_PREV_DIM: 'load-prev-dim',
//     LOAD_NEXT_DIM: 'load-next-dim',
//     SCALE_VALUE: 'scale-value'
// });

export const setDefaultTooltipStyle = (element) => {
    element.tooltip.borderColor ??= 'transparent';
    element.tooltip.backgroundColor ??= 'rgba(50,50,50,0.7)';
    element.tooltip.textStyle ??= { color: '#fff' };
};
