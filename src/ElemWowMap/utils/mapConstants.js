/**
 * @file mapConstants.js
 * @description Defines various constants used throughout the map application.
 */

// Choropleth Map Colors
export const ChoroplethColors = [
    '#3182CE', // Blue 600 - Start with a clear blue
    '#4299E1', // Blue 500
    '#63B3ED', // Blue 400
    '#90CDF4', // Blue 300
    '#BEE3F8', // Blue 200
    '#F6AD55', // Orange 300
    '#ED8936', // Orange 400
    '#DD6B20', // Orange 500
    '#C05621'  // Orange 600 - End with a deep orange
];

export const ChoroplethNoDataColor = '#A0AEC0'; // Gray 500

// Tile layers for different themes
export const TileLayers = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

export const TileAttributions = {
    dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    standard: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    light: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

export default {
    CHOROPLETH_COLORS: ChoroplethColors,
    CHOROPLETH_NO_DATA_COLOR: ChoroplethNoDataColor,
    TILE_LAYERS: TileLayers,
    TILE_ATTRIBUTIONS: TileAttributions
};

