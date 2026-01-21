import Leaflet from 'leaflet';
import { convertCssVarToComputedValue } from '@goodt-common/utils';

import { ClusterBackgroundColor, DEFAULT_FILL_OPACITY, DEFAULT_OPACITY, PointTypes } from '../constants';

const spiderfyShapePositions =
    ({ distanceFromCenter, markerDistance }) =>
    (count, centerPt) => {
        const spiderfyDistanceMultiplier = distanceFromCenter;
        let legLength = spiderfyDistanceMultiplier * 11 + 0.1 * markerDistance;
        const separation = spiderfyDistanceMultiplier * (28 - markerDistance);
        const lengthFactor = spiderfyDistanceMultiplier * 5 * Math.PI * 2;
        let angle = 0;
        const res = [];
        let i;

        res.length = count;

        // Higher index, closer position to cluster center.
        for (i = count; i >= 0; i--) {
            // Skip the first position, so that we are already farther from center, and we avoid
            // being under the default cluster icon (especially important for Circle Markers).
            if (i < count) {
                res[i] = new Leaflet.Point(
                    centerPt.x + legLength * Math.cos(angle),
                    centerPt.y + legLength * Math.sin(angle)
                );
            }

            angle += separation / legLength + i * 0.0005 + 0.01 * markerDistance;
            legLength += lengthFactor / angle;
        }
        return res;
    };

const resolveMarkerClusterBackgroundByChildCount = ({ childCount, defaultBackground }) => {
    if (defaultBackground != null && defaultBackground !== '') {
        return defaultBackground;
    }
    if (childCount < 10) {
        return ClusterBackgroundColor.SMALL;
    }

    if (childCount < 100) {
        return ClusterBackgroundColor.MEDIUM;
    }

    return ClusterBackgroundColor.LARGE;
};

const iconCreateFunction = (polygonOptions, computedStyle) => (cluster) => {
    const childCount = cluster.getChildCount();
    if (polygonOptions.useRules === true) {
        const rule = polygonOptions.rules.find(({ from, to }) => childCount >= from && childCount < to);
        const customBackground = convertCssVarToComputedValue(
            rule?.background || polygonOptions.defaultBackground,
            computedStyle
        );
        const customColor = convertCssVarToComputedValue(rule?.color || polygonOptions.defaultColor, computedStyle);

        return new Leaflet.DivIcon({
            html: `<div style="--w-background: ${customBackground}; --w-text-color: ${customColor}"><span>${childCount}</span></div>`,
            className: `marker-custom-cluster leaflet-marker-icon marker-cluster leaflet-zoom-animated leaflet-interactive`,
            iconSize: new Leaflet.Point(40, 40)
        });
    }
    const { defaultBackground, defaultColor } = polygonOptions;

    return new Leaflet.DivIcon({
        html: `<div style="--w-background: ${resolveMarkerClusterBackgroundByChildCount({
            childCount,
            defaultBackground: convertCssVarToComputedValue(defaultBackground, computedStyle)
        })}; --w-text-color: ${
            convertCssVarToComputedValue(defaultColor, computedStyle) || 'inherit'
        }"><span>${childCount}</span></div>`,
        className: 'marker-custom-cluster leaflet-marker-icon marker-cluster leaflet-zoom-animated leaflet-interactive',
        iconSize: new Leaflet.Point(40, 40)
    });
};

/**
 * Группировки маркеров, точек по териториальному либо по цветовому диапазону.
 */
export const buildClusterGroup = ({
    dataset,
    viewByRules,
    clusterFilterMetric,
    polygonOptions,
    type,
    shouldBuildClusters,
    computedStyle
}) => {
    const options = {
        iconCreateFunction: iconCreateFunction(polygonOptions, computedStyle),
        showCoverageOnHover: polygonOptions.spiderfyShape.isEnabled,
        spiderfyOnMaxZoom: polygonOptions.spiderfyOnMaxZoom,
        spiderfyShapePositions: spiderfyShapePositions(polygonOptions),
        polygonOptions: { ...polygonOptions.spiderfyShape, fillOpacity: 1, color: convertCssVarToComputedValue(polygonOptions.spiderfyShape.color, computedStyle), fillColor: convertCssVarToComputedValue(polygonOptions.spiderfyShape.fillColor, computedStyle) },
        disableClusteringAtZoom: polygonOptions.isEnabled ? null : 1
    };

    const defaultCluster = {
        defaultCluster: Leaflet.markerClusterGroup(options)
    };

    // build cluster by rules
    const { isEnabled, rules } = viewByRules;
    if (isEnabled && rules.length > 0) {
        return rules.reduce(
            (acc, { color, marker }) => ({
                ...acc,
                [type === PointTypes.POINT ? convertCssVarToComputedValue(color, computedStyle) : marker]:
                    Leaflet.markerClusterGroup(options)
            }),
            defaultCluster
        );
    }

    if (!shouldBuildClusters) {
        return defaultCluster;
    }

    // build clusters by metric
    return dataset.reduce((acc, point) => {
        const name = point[clusterFilterMetric];
        if (name == null) {
            return acc;
        }

        return {
            ...acc,
            [name]: Leaflet.markerClusterGroup(options)
        };
    }, defaultCluster);
};

export const buildCircle = ({ canvas, radius, color, coordinates, idx }) =>
    Leaflet.circle(coordinates, radius, {
        renderer: canvas,
        opacity: DEFAULT_OPACITY,
        fillColor: color,
        fillOpacity: DEFAULT_FILL_OPACITY,
        color,
        name: `markers-${idx}`,
        type: PointTypes.POINT
    });

export const buildCanvasMarker = ({ coordinates, markerIcon, iconSized }) =>
    Leaflet.marker(coordinates, {
        icon: Leaflet.icon({
            iconUrl: markerIcon,
            iconSize: iconSized
        }),
        type: PointTypes.MARKER,
        url: markerIcon
    });

export const isCorrectCoordinates = (lat, lon) => lon !== 'null' && lat !== 'null' && lon != null && lat != null;

export const updatePointsStyles = ({ type, points, opacity, fillOpacity }) => {
    points.forEach((point) => {
        if (type === PointTypes.MARKER) {
            point.setOpacity(opacity);
            return;
        }

        point.setStyle({ opacity, fillOpacity });
    });
};

export const updatePointStyles = ({ type, point, opacity, fillOpacity }) => {
    if (type === PointTypes.MARKER) {
        point.setOpacity(opacity);
        return;
    }

    point.setStyle({ opacity, fillOpacity });
};

export const setPointsHoverStyles = ({ points, type, selectedPoint, settings }) => {
    const { hoverOpacity, hoverFillOpacity, opacity, fillOpacity } = settings;
    updatePointsStyles({ type, points, opacity, fillOpacity });
    updatePointStyles({ type, point: selectedPoint, opacity: hoverOpacity, fillOpacity: hoverFillOpacity });
};

export const addPointToMap = ({ isDrilldown, point, clusterFilterMetric, markerGroupValue, markersGroups }) => {
    if (isDrilldown && clusterFilterMetric in markersGroups) {
        markersGroups[clusterFilterMetric].addLayer(point);
        return;
    }

    if (markersGroups && markerGroupValue in markersGroups) {
        markersGroups[markerGroupValue].addLayer(point);
        return;
    }

    markersGroups.defaultCluster.addLayer(point);
};
