// Utility functions for map operations
import LeafletLib from 'leaflet';

export function debounce(callback, delay) {
    let timeoutId;
    return function debouncedFunction(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
}

export function calculateVisibleDistricts(mapInstance, visibleBounds, districtIndexData) {
    if (mapInstance == null || visibleBounds == null || districtIndexData == null || districtIndexData.length === 0) {
        return new Set();
    }

    const visibleDistricts = new Set();

    const boundsArrayLength = 2; // eslint-disable-line no-magic-numbers
    districtIndexData.forEach(districtInfo => {
        if (districtInfo.bounds != null && districtInfo.bounds.length === boundsArrayLength) {
            // Convert bounds from JSON array to L.LatLngBounds
            const districtLatLngBounds = LeafletLib.latLngBounds(districtInfo.bounds[0], districtInfo.bounds[1]);
            if (visibleBounds.intersects(districtLatLngBounds)) {
                visibleDistricts.add(districtInfo.key);
            }
        }
    });

    return visibleDistricts;
}

const DEFAULT_CHUNK_SIZE = 50; // eslint-disable-line no-magic-numbers

export function processRenderingInChunks(features, chunkSize = DEFAULT_CHUNK_SIZE, processingCallback) {
    return new Promise((resolve) => {
        if (features == null || features.length === 0) {
            resolve([]);
            return;
        }

        if (features.length <= chunkSize) {
            // Small datasets - process immediately
            resolve(processingCallback(features));
            return;
        }

        // Large datasets - process in chunks
        let currentIndex = 0;
        const allResults = [];

        const processChunk = () => {
            const endIndex = Math.min(currentIndex + chunkSize, features.length);
            const chunk = features.slice(currentIndex, endIndex);

            const chunkResult = processingCallback(chunk);
            allResults.push(...chunkResult);

            currentIndex = endIndex;

            if (currentIndex < features.length) {
                // Process next chunk on next frame
                requestAnimationFrame(processChunk);
            } else {
                // Finished processing all chunks
                resolve(allResults);
            }
        };

        processChunk();
    });
}

const DEFAULT_PADDING = 30; // eslint-disable-line no-magic-numbers
const DEFAULT_MAX_ZOOM = 8; // eslint-disable-line no-magic-numbers
const ALL_DISTRICTS_PADDING = 20; // eslint-disable-line no-magic-numbers
const ALL_DISTRICTS_MAX_ZOOM = 6; // eslint-disable-line no-magic-numbers

export function getOptimalZoomSettings(selectedDistrict, isAllDistricts = false) {
    const zoomSettings = {
        paddings: [DEFAULT_PADDING, DEFAULT_PADDING],
        maxZoom: DEFAULT_MAX_ZOOM,
        duration: 1.0
    };

    if (isAllDistricts || selectedDistrict === 'all') {
        zoomSettings.paddings = [ALL_DISTRICTS_PADDING, ALL_DISTRICTS_PADDING];
        zoomSettings.maxZoom = ALL_DISTRICTS_MAX_ZOOM;
    }

    return zoomSettings;
}

const boundsArrayLength = 2; // eslint-disable-line no-magic-numbers

export function createSafeLatLngBounds(boundsData) {
    try {
        if (Array.isArray(boundsData) && boundsData.length === boundsArrayLength) {
            const bounds = LeafletLib.latLngBounds(boundsData[0], boundsData[1]);
            return bounds.isValid() ? bounds : null;
        }
        return null;
    } catch (e) {
        return null;
    }
}

export function validateFeatureProperties(feature) {
    if (feature == null || feature.properties == null) {
        return false;
    }

    const props = feature.properties;
    return props.admin_level != null && (props.osm_id != null || props.name != null);
}

const RANDOM_ID_LENGTH = 7; // eslint-disable-line no-magic-numbers
const RANDOM_BASE = 36; // eslint-disable-line no-magic-numbers

export function generateFeatureId(feature, adminLevel) {
    if (feature == null || feature.properties == null) {
        return Math.random().toString(RANDOM_BASE).substring(RANDOM_ID_LENGTH);
    }

    const props = feature.properties;
    const levelStr = String(adminLevel);

    if (props.osm_id != null) {
        return `feature_${levelStr}_${props.osm_id}`;
    }
    if (props.name != null) {
        return `feature_${levelStr}_${props.name.replace(/\s+/g, '_')}`;
    }
    return `feature_${levelStr}_${Math.random().toString(RANDOM_BASE).substring(RANDOM_ID_LENGTH)}`;
}

const DEFAULT_DURATION = 1.2; // eslint-disable-line no-magic-numbers
const DEFAULT_EASE_LINEARITY = 0.1; // eslint-disable-line no-magic-numbers
const DEFAULT_FLY_PADDING = 30; // eslint-disable-line no-magic-numbers
const DEFAULT_FLY_MAX_ZOOM = 14; // eslint-disable-line no-magic-numbers

export function smoothFlyToBounds(mapInstance, bounds, options = {}) {
    if (mapInstance == null || bounds == null || !bounds.isValid()) {
        return false;
    }

    const defaultFlyOptions = {
        duration: DEFAULT_DURATION,
        easeLinearity: DEFAULT_EASE_LINEARITY,
        paddings: [DEFAULT_FLY_PADDING, DEFAULT_FLY_PADDING],
        maxZoom: DEFAULT_FLY_MAX_ZOOM
    };

    const finalOptions = { ...defaultFlyOptions, ...options };

    try {
        mapInstance.flyToBounds(bounds, finalOptions);
        return true;
    } catch (e) {
        return false;
    }
}

