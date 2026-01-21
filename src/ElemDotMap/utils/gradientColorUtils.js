import { cloneDeep, filter, inRange, maxBy, minBy, toNumber } from 'lodash';
import { convertRgbaToHex, convertCssVarToComputedValue } from '@goodt-common/utils';

import { FIX_MIN_RANGE, MAX_COLOR_GRADIENT_DEFAULT, MIN_COLOR_GRADIENT_DEFAULT } from '../constants';

const hex = (color) => {
    const str = '0123456789abcdef';
    // eslint-disable-next-line
    let ii = parseInt(color);
    if (ii === 0 || Number.isNaN(Number(color))) {
        return '00';
    }
    ii = Math.round(Math.min(Math.max(0, ii), 255));
    return str.charAt((ii - (ii % 16)) / 16) + str.charAt(ii % 16);
};

const convertToHex = ([red, green, blue]) => hex(red) + hex(green) + hex(blue);

const trim = (str) => (str.charAt(0) === '#' ? str.substring(1, 7) : str);

const convertToRGB = (hexVal) => {
    const colors = [];
    colors[0] = parseInt(trim(hexVal).substring(0, 2), 16);
    colors[1] = parseInt(trim(hexVal).substring(2, 4), 16);
    colors[2] = parseInt(trim(hexVal).substring(4, 6), 16);
    return colors;
};

const generateGradient = (colorStart, colorEnd, colorCount) => {
    const start = convertToRGB(colorStart);
    const end = convertToRGB(colorEnd);
    const len = colorCount;
    let alpha = 0.0;
    const listOfColors = [];
    for (let i = 0; i < len; i++) {
        const colors = [];
        alpha += 1.0 / len;
        colors[0] = start[0] * alpha + (1 - alpha) * end[0];
        colors[1] = start[1] * alpha + (1 - alpha) * end[1];
        colors[2] = start[2] * alpha + (1 - alpha) * end[2];
        listOfColors.push(convertToHex(colors));
    }
    return listOfColors;
};

const createGradientPalette = ({ gradient, metric, dataset, computedStyle }) => {
    const gradObj = {
        gradientLineCss: '',
        dataGradients: [],
        gradientDataInRanges: [],
        gradientMax: '',
        gradientMin: ''
    };

    if (dataset == null || dataset.length === 0) {
        return gradObj;
    }

    const { gradientColorMax, gradientColorMin, gradientSmoothing } = gradient;
    const data = cloneDeep(dataset).sort((a, b) => a[metric] - b[metric]);
    if (data.length === 0 || metric === 0 || metric === null) {
        return gradObj;
    }

    const gradientMinValue = parseFloat(minBy(data, (dataItem) => toNumber(dataItem[metric]))[metric]);
    const gradientMaxValue = parseFloat(maxBy(data, (dataItem) => toNumber(dataItem[metric]))[metric]);

    const gradientMinColor = convertCssVarToComputedValue(
        convertRgbaToHex(gradientColorMin) || convertRgbaToHex(MIN_COLOR_GRADIENT_DEFAULT),
        computedStyle
    );
    const gradientMaxColor = convertCssVarToComputedValue(
        convertRgbaToHex(gradientColorMax) || convertRgbaToHex(MAX_COLOR_GRADIENT_DEFAULT),
        computedStyle
    );
    const dataInRange = filter(data, (dataItem) =>
        inRange(dataItem[metric], gradientMinValue, gradientMaxValue + FIX_MIN_RANGE)
    );
    const gradSmooth = gradientSmoothing || 1;
    const gradientDataColors = generateGradient(gradientMinColor, gradientMaxColor, gradSmooth);
    const gradientLineCss = gradientDataColors.reduce(
        (acc, item, index, array) => (acc + index !== array.length - 1 ? `#${item},` : `#${item}`),
        ''
    );

    gradObj.gradientLineCss = `linear-gradient(90deg,${gradientLineCss})`;
    gradObj.dataGradients = gradientDataColors;
    gradObj.gradientDataInRanges = dataInRange;
    gradObj.gradientMax = gradientMaxValue;
    gradObj.gradientMin = gradientMinValue;
    return gradObj;
};

export const buildGradientForLayer = ({ layer, layerName, colorMetric, gradient, dataset, computedStyle }) => ({
    layer,
    layerName,
    gradient: createGradientPalette({ gradient, metric: colorMetric, dataset, computedStyle })
});

const hexToRGBA = (color, alpha) => {
    const read = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);

    if (alpha != null) {
        return `rgb(${read}, ${green}, ${blue}, ${alpha})`;
    }

    return `rgb(${read}, ${green}, ${blue})`;
};

export const resolveColorFromGradient = ({ gradient, item = null, key, count = null }) => {
    const { gradient: gradientLayer = null } = gradient;
    if (gradientLayer == null) {
        return null;
    }

    const { dataGradients, gradientDataInRanges } = gradientLayer;
    // eslint-disable-next-line eqeqeq
    const itemIndex = gradientDataInRanges.findIndex((x) => x[key] == (item != null ? item[key] : count));

    let resultColor = null;
    if (itemIndex !== -1 && dataGradients.length > 0) {
        const colorIndex = Math.floor(itemIndex / (gradientDataInRanges.length / dataGradients.length));
        resultColor = hexToRGBA(`#${dataGradients[colorIndex]}`, 1.0);
    }

    return resultColor;
};

export const extractGradientInfo = ({ layer, gradient: { dataGradients, gradientMax, gradientMin } }) => ({
    layer,
    dataGradients,
    gradientMax,
    gradientMin
});
