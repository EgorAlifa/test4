<template>
    <div class="dots-layer-hidden"></div>
</template>

<script>
import LeafletLib from 'leaflet';
// eslint-disable-next-line import/no-unresolved, import/no-restricted-paths
// eslint-disable-next-line
import 'leaflet.glify';
import { getCategoryColor } from '../utils/dataTransform';
import { yandexLatCorrection } from '../utils/mapHelpers';

export default {
    name: 'DotsLayer',

    props: {
        map: {
            type: Object,
            default: null
        },
        data: {
            type: Array,
            default: () => []
        },
        opacity: {
            type: Number,
            default: 0.7 // eslint-disable-line no-magic-numbers
        },
        size: {
            type: Number,
            default: 5 // eslint-disable-line no-magic-numbers
        },
        categoryColorMap: {
            type: Object,
            default: () => ({})
        },
        predefinedColors: {
            type: Array,
            default: () => []
        },
        customColors: {
            type: Object,
            default: () => ({})
        },
        currentTheme: {
            type: String,
            default: 'dark'
        },
        // Color gradient for value-based coloring (overrides category colors when valueField is set)
        colorMin: {
            type: String,
            default: '#bfdbfe'
        },
        colorMax: {
            type: String,
            default: '#1d4ed8'
        },
        // Scale dot size proportionally to the value field
        dotSizeByValue: {
            type: Boolean,
            default: false
        },
        // Whether the current tile provider is Yandex (requires lat correction)
        isYandexTiles: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        // Pre-compute value range for color/size interpolation
        valueRange() {
            const values = this.data
                .map(p => p.value_event)
                .filter(v => v != null && !isNaN(Number(v)))
                .map(Number);
            if (values.length === 0) return { min: 0, max: 1, hasValues: false };
            const min = Math.min(...values);
            const max = Math.max(...values);
            return { min, max, hasValues: max !== min };
        }
    },

    data() {
        return {
            glifyLayer: null
        };
    },

    watch: {
        map: {
            handler(newMap, oldMap) {
                // Remove old layer
                if (oldMap && this.glifyLayer) {
                    this.removeGlifyLayer();
                }
                
                if (newMap != null) {
                    this.initializeDots();
                }
            },
            immediate: true
        },

        data: {
            handler() {
                this.updateDots();
            },
            deep: true
        }

        // NOTE: Size and opacity watchers removed to prevent re-rendering on slider drag
        // Rendering only happens when data changes (i.e., when "Draw" button is clicked)
        // The size/opacity values are used during the next render cycle
    },

    beforeDestroy() {
        this.cleanup();
    },

    methods: {
        /**
         * Initialize dots layer with Leaflet.glify
         */
        initializeDots() {
            if (this.map == null) {
                return;
            }

            // Update with data
            this.updateDots();
        },

        /**
         * Update dots using Leaflet.glify (WebGL canvas-based rendering)
         */
        updateDots() {
            if (this.map == null || this.data == null) {
                return;
            }

            // Remove existing glify layer
            this.removeGlifyLayer();

            // Create new glify layer if we have data
            if (this.data.length > 0) {
                const geoJsonData = this.convertToGeoJSON(this.data);

                // Resolve size function (fixed or value-based)
                const sizeParam = this.dotSizeByValue && this.valueRange.hasValues
                    ? (index, feature) => {
                        const v = feature.properties.valueNum;
                        if (v == null) return this.size;
                        const { min, max } = this.valueRange;
                        const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
                        return this.size + t * this.size * 1.5;
                    }
                    : this.size;

                // Resolve color function (value gradient or category)
                const colorFn = (index, pointGeoJson) => {
                    const v = pointGeoJson.properties.valueNum;
                    if (v != null && this.valueRange.hasValues) {
                        const { min, max } = this.valueRange;
                        const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
                        return this.interpolateHexColor(this.colorMin, this.colorMax, t);
                    }
                    return this.hexToGlifyColorWithGlow(pointGeoJson.properties.color);
                };

                try {
                    this.glifyLayer = LeafletLib.glify.points({
                        map: this.map,
                        data: geoJsonData,
                        size: sizeParam,
                        color: colorFn,
                        opacity: this.opacity, // Use prop opacity value
                        pane: 'overlayPane',
                        click: (e, feature) => {
                            this.handleDotClick(e, feature);
                        },
                        hover: (e, feature) => {
                            this.setMapCursor('pointer');
                        },
                        hoverOff: (e, feature) => {
                            this.setMapCursor('');
                        }
                    });
                    
                    // Add the layer to the map (critical for canvas rendering!)
                    if (this.glifyLayer) {
                        this.glifyLayer.addTo(this.map);
                    }
                } catch (error) {
                    // Silently handle WebGL errors
                }
            }
        },

        /**
         * Convert data to GeoJSON format for Leaflet.glify
         */
        convertToGeoJSON(data) {
            return {
                type: 'FeatureCollection',
                features: data.map(point => {
                    const category = point.category_event || 'Unknown';
                    const color = getCategoryColor(
                        category,
                        this.categoryColorMap,
                        this.predefinedColors,
                        this.customColors
                    );
                    const rawLat = point.latitude;
                    const lat = this.isYandexTiles && rawLat != null
                        ? yandexLatCorrection(rawLat)
                        : rawLat;
                    const valueNum = point.value_event != null && !isNaN(Number(point.value_event))
                        ? Number(point.value_event)
                        : null;

                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [lat, point.longitude]
                        },
                        properties: {
                            color,
                            category,
                            valueNum,
                            description: point.description_event || '',
                            date: point.date_event ? new Date(point.date_event).toLocaleDateString() : '',
                            originalData: point
                        }
                    };
                })
            };
        },

        /**
         * Interpolate between two hex colors by ratio t (0–1).
         * Returns {r, g, b, a} for leaflet.glify.
         */
        interpolateHexColor(hex1, hex2, t) {
            function parse(hex) {
                const h = (hex || '#3b82f6').replace('#', '');
                return [
                    parseInt(h.slice(0, 2), 16) / 255,
                    parseInt(h.slice(2, 4), 16) / 255,
                    parseInt(h.slice(4, 6), 16) / 255
                ];
            }
            const [r1, g1, b1] = parse(hex1);
            const [r2, g2, b2] = parse(hex2);
            /* eslint-disable id-length */
            return {
                r: r1 + (r2 - r1) * t,
                g: g1 + (g2 - g1) * t,
                b: b1 + (b2 - b1) * t,
                a: 0.85
            };
            /* eslint-enable id-length */
        },

        /**
         * Set map cursor style
         */
        setMapCursor(cursorValue) {
            if (this.map == null) {
                return;
            }
            const mapContainer = this.map.getContainer();
            if (mapContainer != null) {
                mapContainer.style.cursor = cursorValue;
            }
        },

        /**
         * Convert HEX color to Leaflet.glify color format with glow effect
         * Uses semi-transparent colors for a glowing appearance (map2 style)
         */
        hexToGlifyColorWithGlow(hex) {
            const defaultAlpha = 0.8;
            const defaultBlue = 1;
            const defaultRed = 0;
            const defaultGreen = 0;
            
            const isValidHex = hex != null && typeof hex === 'string' && hex.startsWith('#');
            if (!isValidHex) {
                // API requires r, g, b, a property names (leaflet.glify format)
                /* eslint-disable id-length */
                return { 
                    r: defaultRed, 
                    g: defaultGreen, 
                    b: defaultBlue, 
                    a: defaultAlpha 
                };
                /* eslint-enable id-length */
            }
            
            try {
                const hexBase = 16;
                const colorMax = 255;
                const brightnessBoost = 1.15;
                const maxColorValue = 1;
                const bytesPerComponent = 256;
                const redBytePosition = 2;
                const greenBytePosition = 1;
                
                const bigint = parseInt(hex.slice(1), hexBase);
                // Extract color components without bitwise operators
                // eslint-disable-next-line no-restricted-properties
                const redValue = Math.floor(bigint / (bytesPerComponent ** redBytePosition)) % bytesPerComponent;
                // eslint-disable-next-line no-restricted-properties
                const greenValue = Math.floor(bigint / (bytesPerComponent ** greenBytePosition)) % bytesPerComponent;
                const blueValue = bigint % bytesPerComponent;
                
                const redComponent = redValue / colorMax;
                const greenComponent = greenValue / colorMax;
                const blueComponent = blueValue / colorMax;
                
                // Slightly boost brightness for better visibility
                const boostedRed = Math.min(maxColorValue, redComponent * brightnessBoost);
                const boostedGreen = Math.min(maxColorValue, greenComponent * brightnessBoost);
                const boostedBlue = Math.min(maxColorValue, blueComponent * brightnessBoost);
                
                // API requires r, g, b, a property names (leaflet.glify format)
                const red = boostedRed;
                const green = boostedGreen;
                const blue = boostedBlue;
                const alpha = defaultAlpha;
                
                /* eslint-disable id-length */
                return { 
                    r: red, 
                    g: green, 
                    b: blue, 
                    a: alpha 
                };
                /* eslint-enable id-length */
            } catch (e) {
                const red = defaultRed;
                const green = defaultGreen;
                const blue = defaultBlue;
                const alpha = defaultAlpha;
                
                /* eslint-disable id-length */
                return { 
                    r: red, 
                    g: green, 
                    b: blue, 
                    a: alpha 
                };
                /* eslint-enable id-length */
            }
        },

        /**
         * Handle dot click to show popup
         */
        handleDotClick(e, feature) {
            if (this.map == null || feature == null || feature.properties == null) {
                return;
            }

            const { properties } = feature;
            const latLng = e.latlng || LeafletLib.latLng(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
            const categoryColor = properties.color || '#3b82f6';

            const popupContent = `
                <div class="dot-popup" data-theme="${this.currentTheme}">
                    <div class="dot-popup-header">
                        <svg class="dot-popup-pin-icon" style="color: ${categoryColor};" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <strong style="color: ${categoryColor};">${properties.category}</strong>
                    </div>
                    ${properties.description ? `<div class="dot-popup-description">${properties.description}</div>` : ''}
                    ${properties.date ? `<div class="dot-popup-date">${properties.date}</div>` : ''}
                </div>
            `;

            const popup = LeafletLib.popup({
                className: `dot-popup-container theme-${this.currentTheme}`
            })
                .setLatLng(latLng)
                .setContent(popupContent);
            
            popup.openOn(this.map);
        },

        /**
         * Remove glify layer
         */
        removeGlifyLayer() {
            if (this.glifyLayer && this.map) {
                try {
                    if (typeof this.glifyLayer.remove === 'function') {
                        this.glifyLayer.remove();
                    }
                    if (this.map.hasLayer(this.glifyLayer)) {
                        this.map.removeLayer(this.glifyLayer);
                    }
                } catch (e) {
                    // Silently handle removal errors
                }
                this.glifyLayer = null;
            }
        },

        /**
         * Cleanup
         */
        cleanup() {
            this.removeGlifyLayer();
        }
    }
};
</script>

<style scoped>
.dots-layer-hidden {
    display: none;
}
</style>
