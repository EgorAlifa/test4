<template>
    <div class="heatmap-layer-hidden"></div>
</template>

<script>
import { yandexLatCorrection } from '../utils/mapHelpers';

export default {
    name: 'HeatmapLayer',

    props: {
        map: {
            type: Object,
            default: null
        },
        data: {
            type: Array,
            default: () => []
        },
        radius: {
            type: Number,
            default: 25 // eslint-disable-line no-magic-numbers
        },
        blur: {
            type: Number,
            default: 15 // eslint-disable-line no-magic-numbers
        },
        minOpacity: {
            type: Number,
            default: 0.2 // eslint-disable-line no-magic-numbers
        },
        maxIntensity: {
            type: Number,
            default: null
        },
        // Whether the current tile provider is Yandex (requires lat correction)
        isYandexTiles: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            heatLayer: null,
            isUpdating: false,
            updateTimeout: null
        };
    },
    
    emits: ['rendering-start', 'rendering-end', 'markers-needed'],

    watch: {
        map: {
            handler(newMap) {
                if (newMap != null) {
                    this.initializeHeatmap();
                }
            },
            immediate: true
        },

        data: {
            handler(newData) {
                this.updateHeatmap();
            },
            deep: true
        },

        radius() {
            // Don't recreate - just update data which will trigger redraw
            this.updateHeatmap();
        },

        blur() {
            // Don't recreate - just update data which will trigger redraw
            this.updateHeatmap();
        },

        minOpacity() {
            // Don't recreate - just update data which will trigger redraw
            this.updateHeatmap();
        },

        maxIntensity() {
            // Don't recreate - just update data which will trigger redraw
            this.updateHeatmap();
        }
    },

    beforeDestroy() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.cleanup();
    },

    methods: {
        /**
         * Initialize heatmap layer
         */
        initializeHeatmap() {
            if (this.map == null || this.heatLayer != null) {
                return;
            }

            // Create heatmap layer
            this.heatLayer = window.L.heatLayer([], {
                radius: this.radius,
                blur: this.blur,
                minOpacity: this.minOpacity,
                max: this.maxIntensity || 1.0
            });

            // Add to map
            this.heatLayer.addTo(this.map);

            // Update with data
            this.updateHeatmap();
        },

        /**
         * Update heatmap data (debounced for smooth slider updates)
         */
        updateHeatmap() {
            // Clear any pending update
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }
            
            // Debounce rapid updates (e.g., slider dragging)
            this.updateTimeout = setTimeout(() => {
                this.performHeatmapUpdate();
            }, 100); // 100ms debounce
        },
        
        /**
         * Actually perform the heatmap update
         */
        performHeatmapUpdate() {
            
            if (this.data == null || this.map == null || this.isUpdating) {
                return;
            }
            
            // Check if map is ready and has valid size
            try {
                if (!this.map.getSize || typeof this.map.getSize !== 'function') {
                    return;
                }
                const size = this.map.getSize();
                if (!size || size.x === 0 || size.y === 0) {
                    return;
                }
            } catch (err) {
                // Map not ready, skip update
                return;
            }
            
            // Set updating flag to prevent concurrent updates
            this.isUpdating = true;
            
            // Emit rendering start event
            this.$emit('rendering-start');

            try {
                // Recreate layer with current options (leaflet.heat requires recreation for option changes)
                this.cleanup();
                
                // Create new layer with current options
                // Use heatmapPane with pointer-events: none to allow lasso selection (map2 style)
                this.heatLayer = window.L.heatLayer([], {
                    radius: this.radius,
                    blur: this.blur,
                    minOpacity: this.minOpacity,
                    max: this.maxIntensity || 1.0,
                    pane: 'heatmapPane' // CRITICAL: Use heatmapPane for lasso to work
                });
                
                
                // Add to map
                if (this.map && this.map.hasLayer) {
                    this.heatLayer.addTo(this.map);
                    
                    // Debug: Check if layer is in correct pane
                    if (this.heatLayer.getPane) {
                    }
                    
                    // Debug: Check container element style
                    if (this.heatLayer._container) {
                        
                        // CRITICAL FIX: Ensure heatmap canvas has pointer-events: none
                        // The leaflet.heat library may not respect pane settings
                        if (!this.heatLayer._container.style.pointerEvents || this.heatLayer._container.style.pointerEvents !== 'none') {
                            this.heatLayer._container.style.pointerEvents = 'none';
                        }
                    }
                }

                // Convert data to heatmap format: [lat, lng, intensity]
                const heatmapDataPoints = this.data.map(point => {
                    const intensity = point.value_event || 1;
                    const lat = this.isYandexTiles ? yandexLatCorrection(point.latitude) : point.latitude;
                    return [lat, point.longitude, intensity];
                });


                // NOTE: map2 doesn't create markers for heatmap - it uses path-based lasso

                // Update heatmap with error handling
                if (this.heatLayer && this.heatLayer.setLatLngs) {
                    this.heatLayer.setLatLngs(heatmapDataPoints);
                } else {
                }
                
                // Emit rendering end event after a delay to ensure rendering completes
                setTimeout(() => {
                    this.$emit('rendering-end');
                }, 300); // eslint-disable-line no-magic-numbers
            } catch (err) {
                // Silently handle errors during update
                this.$emit('rendering-end');
            } finally {
                // Clear updating flag
                this.isUpdating = false;
            }
        },

        /**
         * Cleanup
         */
        cleanup() {
            if (this.heatLayer) {
                try {
                    if (this.map) {
                        this.map.removeLayer(this.heatLayer);
                    }
                } catch (err) {
                    // Silently ignore errors during cleanup
                }
                this.heatLayer = null;
            }
        }
    }
};
</script>

