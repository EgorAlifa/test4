import Leaflet from 'leaflet';
import { formatNumber } from '@goodt-widgets-insight/utils';
import { convertCssVarToComputedValue } from '@goodt-common/utils';

import { MapUtils } from './MapUtils';
import { LayerType } from '../constants';
import { extractGradientInfo, resolveColorFromGradient } from './gradientColorUtils';

const buildLabelStyle = (style) =>
    `color:${style.color}; font-size: ${style.fontSize}; font-family: ${style.fontFamily}; font-weight: ${style.fontWeight}`;

const buildLabelSpan = ({ text, style }) =>
    text !== '' ? `<span style="${buildLabelStyle(style)}">${text}</span>` : '';

const createLabelHintContent = ({ data, settings }) =>
    settings.reduce((acc, { metric, format, style, prefix, postfix, prefixStyle, postfixStyle }) => {
        if (data[metric] == null) {
            return acc;
        }

        const prefixSpan = buildLabelSpan({ text: prefix, style: prefixStyle });
        const postfixSpan = buildLabelSpan({ text: postfix, style: postfixStyle });
        return `${acc} <div class="mar-bot-2" style="${buildLabelStyle(style)}">${prefixSpan} ${MapUtils.formatMetric(
            MapUtils.isIntegerNumber(Number(data[metric])) ? Number(data[metric]) : data[metric],
            format
        )} ${postfixSpan}</div>`;
    }, '');

export const buildLayerLabels = ({ labels, data, layer }) => {
    const { isVisible, settings, shouldShowWhenHover } = labels;
    if (!isVisible || data == null) {
        return;
    }

    const content = createLabelHintContent({ data, settings });
    layer.bindTooltip(content, {
        permanent: !shouldShowWhenHover,
        className: 'layer-label',
        direction: 'center'
    });
};

export const filterGeoJSONLayers = (layers) =>
    layers.filter(
        ({
            settings: {
                type,
                geoJson: { zoomFrom, zoomTo }
            }
        }) => type !== LayerType.WMS && zoomFrom != null && zoomTo != null
    );

const getStyleForTitle = ({ fontFamily, textAlign, marginBottom, fontSize, color }) =>
    `font-family:${fontFamily};text-align:${textAlign};margin-bottom:${marginBottom};color:${color};font-size:${fontSize}`;

const getStyleForValues = ({ fontFamily, textAlign, fontSize, color, padding }) =>
    `font-family:${fontFamily};text-align:${textAlign};padding-bottom:${padding};color:${color};font-size:${fontSize}`;

export const buildLayerLegend = ({ layer, dataset, gradient }) => {
    const {
        legend: { shouldShowLegend }
    } = layer.geoJson;
    if (layer.type === LayerType.WMS || !shouldShowLegend || dataset == null) {
        return null;
    }

    const gradientInfo = extractGradientInfo(gradient);
    const { dataGradients = [] } = gradientInfo;
    let { gradientMax, gradientMin } = gradientInfo;

    const { metricFilter = null, colorMetric = null } = layer.geoJson;
    if (metricFilter != null) {
        const regions = dataset.map(({ [colorMetric]: value }) => Number(value));

        gradientMax = Math.max.apply(null, regions);
        gradientMin = Math.min.apply(null, regions);
    }

    const {
        gradient: { useGradientColor },
        legend: { format, styleTitle, title, styleValues },
        colorRules
    } = layer.geoJson;

    const legend = Leaflet.control({ position: 'bottomright' });
    legend.onAdd = () => {
        const div = Leaflet.DomUtil.create('div', 'info legend');
        const styleForTitle = getStyleForTitle(styleTitle);
        const labels = [`<div class="h4" style="${styleForTitle}">${title}</div>`];
        const styleForValue = getStyleForValues(styleValues);

        if (useGradientColor === true && dataGradients.length > 0) {
            div.innerHTML += labels.push(`<div class="d-flex flex-h-space-between flex-v-center">
                    <span class="small" style="${styleForValue}">${formatNumber(gradientMin, format)}</span>
                    <span class="small" style="${styleForValue}">${formatNumber(gradientMax, format)}</span>
                </div>`);

            dataGradients.forEach((color) => {
                div.innerHTML += labels.push(
                    `<i class="info-color" style="background:#${color};margin-right:0;width:${styleValues.size};height:${styleValues.size}"></i>`
                );
            });
        }

        if (useGradientColor === false) {
            colorRules.forEach(({ fillColor: color, to, from }) => {
                div.innerHTML += labels.push(
                    `<div class="info-item" style="${styleForValue}">
                                <i class="info-color" style="background:${color};width:${styleValues.size};height:${
                        styleValues.size
                    }"></i>${formatNumber(from, format)} - ${formatNumber(to, format)}</div>`
                );
            });
        }

        div.innerHTML = labels.join('');
        return div;
    };

    return legend;
};

export const computeStyleLayer = ({ feature, layer, dataset, gradient, computedStyle }) => {
    const { properties } = feature;
    if (layer.type === LayerType.WMS) {
        return {};
    }

    const {
        gradient: { useGradientColor },
        shouldUseCustomColors,
        borderColor: color,
        fillColor,
        borderWidth: weight,
        metricJSON,
        colorMetric,
        metricFilter,
        colorRules
    } = layer.geoJson;
    const defaultOptions = {
        color: convertCssVarToComputedValue(color, computedStyle),
        fillColor:  convertCssVarToComputedValue(fillColor, computedStyle),
        opacity: 1,
        fillOpacity: 1,
        weight
    };

    if (dataset == null || !shouldUseCustomColors || colorMetric == null || metricFilter == null) {
        return defaultOptions;
    }

    const foundElem = dataset.find((item) => String(item[metricFilter]) === String(properties[metricJSON]));
    if (foundElem == null) {
        return defaultOptions;
    }

    if (useGradientColor) {
        const gradientColor = resolveColorFromGradient({
            gradient,
            item: foundElem,
            key: colorMetric
        });

        return {
            ...defaultOptions,
            fillColor: convertCssVarToComputedValue(gradientColor, computedStyle)
        };
    }

    if (!(colorMetric in foundElem)) {
        return defaultOptions;
    }
    const metricValue = Number(foundElem[colorMetric]);
    const foundRangeItem = colorRules.find(({ from, to }) => metricValue >= from && metricValue < to);
    if (foundRangeItem == null) {
        return defaultOptions;
    }

    return {
        ...defaultOptions,
        color: convertCssVarToComputedValue(foundRangeItem.color, computedStyle),
        fillColor: convertCssVarToComputedValue(foundRangeItem.fillColor, computedStyle)
    };
};

export const getMinZoomFromByLayers = (layers) =>
    Math.min(
        ...layers
            .filter(
                ({
                    settings: {
                        geoJson: { zoomFrom }
                    }
                }) => zoomFrom != null && zoomFrom !== ''
            )
            .map(
                ({
                    settings: {
                        geoJson: { zoomFrom }
                    }
                }) => zoomFrom
            )
    );

export const findGeoJSONLayer = ({ layers, secondLayerId, drillDownMetricJSON, geoJSONValue }) =>
    layers.find(
        ({
            layerId: id,
            properties: {
                geo: { features }
            }
        }) => {
            const [feature] = features;
            if (id !== Number(`1${secondLayerId}`) || feature == null) {
                return false;
            }

            const { [drillDownMetricJSON]: drillDownJSONValue } = feature.properties;
            return String(drillDownJSONValue) === String(geoJSONValue);
        }
    );
