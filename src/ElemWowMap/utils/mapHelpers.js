/**
 * @file mapHelpers.js
 * @description Map utility functions for ElemWowMap
 */

// Constants
const HALF_DIVISOR = 2;
const EARTH_RADIUS_KM = 6371;
const DEGREES_IN_SEMICIRCLE = 180;
const DEGREES_TO_RADIANS_MULTIPLIER = Math.PI / DEGREES_IN_SEMICIRCLE;
const RADIANS_TO_DEGREES_DIVISOR = DEGREES_IN_SEMICIRCLE;
const DECIMAL_PRECISION_DEFAULT = 4;
const COLOR_STEP_DEFAULT = 5;
const RGB_MAX_VALUE = 255;
const ZOOM_MIN_LEVEL = 3;
const ZOOM_MAX_LEVEL = 18;
const ZOOM_ADJUSTMENT = 1;
const DEGREES_FULL_CIRCLE = 360;
const DEFAULT_ZOOM = 10;

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * DEGREES_TO_RADIANS_MULTIPLIER;
}

/**
 * Interpolate color from color array
 * @param {Array} colors - Array of RGB colors
 * @param {number} ratio - Ratio (0-1)
 * @returns {string} RGB color string
 */
function interpolateColor(colors, ratio) {
    const index = ratio * (colors.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;

    if (lower === upper) {
        const [red, green, blue] = colors[lower];
        return `rgb(${red}, ${green}, ${blue})`;
    }

    const [red1, green1, blue1] = colors[lower];
    const [red2, green2, blue2] = colors[upper];

    const red = Math.round(red1 + (red2 - red1) * fraction);
    const green = Math.round(green1 + (green2 - green1) * fraction);
    const blue = Math.round(blue1 + (blue2 - blue1) * fraction);

    return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Coordinate correction for Yandex tile layers.
 * Yandex serves tiles in ellipsoidal Mercator (EPSG:3395) while Leaflet uses
 * spherical Mercator (EPSG:3857). At Russian latitudes (~55–60°N) the
 * difference is 20–30 km northward, so data points appear shifted.
 * Fix: transform WGS84 latitude to the equivalent spherical-Mercator latitude.
 * @param {number} lat - WGS84 latitude
 * @returns {number} Corrected latitude for Yandex tiles
 */
export function yandexLatCorrection(lat) {
    const WGS84_E = 0.08181919084262149;
    const phi = (lat * Math.PI) / 180;
    const e = WGS84_E;
    const confFactor = Math.pow(
        (1 - e * Math.sin(phi)) / (1 + e * Math.sin(phi)),
        e / 2
    );
    const phiPrime = 2 * Math.atan(Math.tan(Math.PI / 4 + phi / 2) * confFactor) - Math.PI / 2;
    return (phiPrime * 180) / Math.PI;
}

/**
 * Get map tile layer URL and attribution
 * @param {string} provider - Tile provider name
 * @param {string} [yandexApiKey=''] - Yandex API key (required for 'yandex' provider)
 * @returns {Object} Object with url, attribution, subdomains, and maxZoom
 */
export function getTileLayerConfig(provider, yandexApiKey = '') {
    const configs = {
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        },
        // legacy alias
        cartodb: {
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        },
        'osm-light': {
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        },
        // legacy alias
        cartodbDark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        },
        'osm-dark': {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        },
        rosreestr: {
            // Proxied via Express to bypass Russian govt CA cert.
            url: '/api/tile-proxy/rosreestr/{z}/{x}/{y}',
            attribution: '&copy; <a href="https://pkk.rosreestr.ru">Росреестр</a>',
            maxZoom: 18
        }
    };

    // Yandex requires API key — fall back to osm-light if not provided
    if (provider === 'yandex') {
        if (!yandexApiKey) {
            return configs['osm-light'];
        }
        return {
            url: `https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU&apikey=${encodeURIComponent(yandexApiKey)}`,
            attribution: '&copy; <a href="https://yandex.ru/maps">Яндекс.Карты</a>',
            maxZoom: 18,
            subdomains: ''
        };
    }

    return configs[provider] || configs.osm;
}

/**
 * Calculate bounds for a set of coordinates
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @returns {Array|null} Bounds [[south, west], [north, east]]
 */
export function calculateBounds(coordinates) {
    if (coordinates == null || coordinates.length === 0) {
        return null;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    coordinates.forEach(([lat, lng]) => {
        if (lat < minLat) {
            minLat = lat;
        }
        if (lat > maxLat) {
            maxLat = lat;
        }
        if (lng < minLng) {
            minLng = lng;
        }
        if (lng > maxLng) {
            maxLng = lng;
        }
    });

    return [[minLat, minLng], [maxLat, maxLng]];
}

/**
 * Get center point from bounds
 * @param {Array} bounds - Bounds [[south, west], [north, east]]
 * @returns {Array} Center [lat, lng]
 */
export function getBoundsCenter(bounds) {
    if (bounds == null || bounds.length !== HALF_DIVISOR) {
        return [0, 0];
    }

    const [[minLat, minLng], [maxLat, maxLng]] = bounds;
    return [(minLat + maxLat) / HALF_DIVISOR, (minLng + maxLng) / HALF_DIVISOR];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Array} coord1 - [lat, lng]
 * @param {Array} coord2 - [lat, lng]
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const aaa = 
        Math.sin(dLat / HALF_DIVISOR) * Math.sin(dLat / HALF_DIVISOR) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / HALF_DIVISOR) * Math.sin(dLon / HALF_DIVISOR);

    const ccc = HALF_DIVISOR * Math.atan2(Math.sqrt(aaa), Math.sqrt(1 - aaa));
    const distance = EARTH_RADIUS_KM * ccc;

    return distance;
}

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} precision - Decimal precision
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(lat, lng, precision = DECIMAL_PRECISION_DEFAULT) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lng).toFixed(precision)}°${lngDir}`;
}

/**
 * Generate heatmap gradient colors
 * @param {number} steps - Number of gradient steps
 * @returns {Object} Gradient object for heatmap
 */
export function generateHeatmapGradient(steps = COLOR_STEP_DEFAULT) {
    const gradient = {};
    
    // Default gradient: blue -> cyan -> green -> yellow -> red
    const colors = [
        [0, 0, RGB_MAX_VALUE],     // blue
        [0, RGB_MAX_VALUE, RGB_MAX_VALUE],   // cyan
        [0, RGB_MAX_VALUE, 0],     // green
        [RGB_MAX_VALUE, RGB_MAX_VALUE, 0],   // yellow
        [RGB_MAX_VALUE, 0, 0]      // red
    ];

    for (let iii = 0; iii <= steps; iii++) {
        const ratio = iii / steps;
        gradient[ratio] = interpolateColor(colors, ratio);
    }

    return gradient;
}

/**
 * Calculate optimal zoom level for bounds
 * @param {Array} bounds - Bounds [[south, west], [north, east]]
 * @param {Object} mapSize - Map container size {width, height}
 * @returns {number} Optimal zoom level
 */
export function calculateOptimalZoom(bounds, mapSize) {
    if (bounds == null || mapSize == null) {
        return DEFAULT_ZOOM;
    }

    const [[minLat, minLng], [maxLat, maxLng]] = bounds;
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;

    // Simple estimation based on bounds and map size
    const latZoom = Math.log2(DEGREES_FULL_CIRCLE / latDiff);
    const lngZoom = Math.log2(DEGREES_FULL_CIRCLE / lngDiff);

    const zoom = Math.min(latZoom, lngZoom) - ZOOM_ADJUSTMENT;

    // Clamp between min and max zoom
    return Math.max(ZOOM_MIN_LEVEL, Math.min(ZOOM_MAX_LEVEL, Math.floor(zoom)));
}

