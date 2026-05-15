<template>
    <div ref="mapContainer" class="leaflet-map-container"></div>
</template>

<script>
import { loadLeaflet } from '../utils/leafletLoader';
import { registerLMask } from '../utils/L.Mask';
import { getTileLayerConfig } from '../utils/mapHelpers';
import '../utils/particles'; // EXACT particles.js from map2

// EXACT constants from map2
const PARTICLE_BASE_SIZE = 3;
const HALO_SIZE_MULTIPLIER = 2.5;
const PARTICLE_IMAGE_SRC = "data:image/png;base64,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";

export default {
    name: 'LeafletMap',

    props: {
        center: {
            type: Array,
            default: () => [48.8566, 2.3522] // eslint-disable-line no-magic-numbers
        },
        zoom: {
            type: Number,
            default: 6 // eslint-disable-line no-magic-numbers
        },
        minZoom: {
            type: Number,
            default: 3 // eslint-disable-line no-magic-numbers
        },
        maxZoom: {
            type: Number,
            default: 18 // eslint-disable-line no-magic-numbers
        },
        tileProvider: {
            type: String,
            default: 'osm'
        },
        // Yandex Maps API key (required when tileProvider === 'yandex')
        yandexApiKey: {
            type: String,
            default: ''
        },
        // NEW: Active particles for animation
        activeParticles: {
            type: Array,
            default: () => [],
            required: false
        },
        // NEW: Current theme
        currentTheme: {
            type: String,
            default: 'dark'
        },
        // NEW: Particle size multiplier
        particleSizeMultiplier: {
            type: Number,
            default: 1.0
        },
        // Lasso props (EXACT from map2)
        isLassoFilterApplied: {
            type: Boolean,
            default: false
        },
        activeLassoPath: {
            type: Array,
            default: null
        }
    },

    data() {
        return {
            map: null,
            tileLayer: null,
            canvasLayer: null,
            particleImage: null,
            lassoInstance: null,
            lassoAreaDisplayPolygon: null, // Polygon to display lasso selection (EXACT from map2)
            selectionMarkers: new Map() // Store invisible markers for lasso selection (EXACT from map2)
        };
    },

    watch: {
        center: {
            handler(newCenter) {
                if (this.map && newCenter) {
                    this.map.setView(newCenter, this.map.getZoom());
                }
            },
            deep: true
        },

        zoom(newZoom) {
            if (this.map && newZoom) {
                this.map.setZoom(newZoom);
            }
        },

        tileProvider(newProvider) {
            this.updateTileLayer(newProvider);
        },

        yandexApiKey() {
            // Re-apply tile layer when API key changes (for Yandex provider)
            this.updateTileLayer(this.tileProvider);
        },

        // Watch currentTheme to redraw canvas when theme changes
        currentTheme() {
            // Redraw canvas particles when theme changes (compositing mode changes)
            if (this.canvasLayer != null && this.map != null && this.map.hasLayer(this.canvasLayer)) {
                // eslint-disable-next-line no-underscore-dangle
                if (typeof this.canvasLayer._reset === 'function') {
                    // eslint-disable-next-line no-underscore-dangle
                    this.canvasLayer._reset();
                }
            }
            
            // Update lasso polygon color if active
            this.updateLassoPolygon();
            
            // Update zoom controls theme
            this.updateZoomControlsTheme();
            
            // Force tile layer update to ensure theme change is reflected
            this.$nextTick(() => {
                if (this.tileProvider) {
                    this.updateTileLayer(this.tileProvider);
                }
            });
        },

        // EXACT from map2 - watch activeParticles and call _reset
        activeParticles: {
            handler(newParticles, oldParticles) {
                if (this.canvasLayer != null && this.map != null && this.map.hasLayer(this.canvasLayer)) {
                    // eslint-disable-next-line no-underscore-dangle
                    if (typeof this.canvasLayer._reset === 'function') {
                        // eslint-disable-next-line no-underscore-dangle
                        this.canvasLayer._reset();
                    }
                }
                
                // Sync invisible selection markers for lasso (EXACT from map2)
                this.syncSelectionMarkers();
            },
            deep: true,
            immediate: false
        },

        // Watch lasso filter state to update polygon display (EXACT from map2)
        isLassoFilterApplied: {
            handler() {
                this.updateLassoPolygon();
            }
        },

        activeLassoPath: {
            handler() {
                this.updateLassoPolygon();
            },
            deep: true
        }
    },

    async mounted() {
        await loadLeaflet();
        registerLMask(window.L);
        // Initialize map, particle image, and canvas layer (EXACT map2 order)
        this.initializeMap();
        this.initializeParticleImage();
        this.initializeCanvasLayer();
        // Initialize Lasso AFTER everything else (EXACT map2 order)
        this.$nextTick(() => {
            this.initializeLasso();
        });
        
        // EXPLICIT WATCH for activeParticles prop (backup in case watcher doesn't fire)
        this.$watch('activeParticles', (newVal, oldVal) => {
            // Force canvas redraw if particles changed
            if (newVal && newVal.length > 0 && this.canvasLayer && this.map && this.map.hasLayer(this.canvasLayer)) {
                // eslint-disable-next-line no-underscore-dangle
                if (typeof this.canvasLayer._reset === 'function') {
                    // eslint-disable-next-line no-underscore-dangle
                    this.canvasLayer._reset();
                }
            }
        }, { deep: true });
    },

    beforeDestroy() {
        this.cleanup();
    },

    methods: {
        /**
         * Initialize Leaflet map
         * Called from mounted() lifecycle hook
         */
        // eslint-disable-next-line no-unused-vars
        initializeMap() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is called from mounted() lifecycle hook
                this.initializeMap();
            }
            if (this.map != null) {
                return;
            }

            // Create map instance
            this.map = window.L.map(this.$refs.mapContainer, {
                center: this.center,
                zoom: this.zoom,
                minZoom: this.minZoom,
                maxZoom: this.maxZoom,
                zoomControl: false,
                attributionControl: false
            });

            // Create dedicated pane for particles with pointer-events: none (EXACT from map2)
            // This ensures canvas doesn't block lasso interactions
            this.map.createPane('particlesPane');
            // eslint-disable-next-line no-magic-numbers
            this.map.getPane('particlesPane').style.zIndex = 650;
            this.map.getPane('particlesPane').style.pointerEvents = 'none';

            // Create dedicated pane for heatmap with pointer-events: none (EXACT from map2)
            // This ensures heatmap canvas doesn't block lasso interactions
            this.map.createPane('heatmapPane');
            // eslint-disable-next-line no-magic-numbers
            this.map.getPane('heatmapPane').style.zIndex = 650;
            this.map.getPane('heatmapPane').style.pointerEvents = 'none';
            

            // Add custom positioned zoom control (bottom-right, matching map2)
            window.L.control.zoom({ position: 'bottomright' }).addTo(this.map);
            
            // Apply theme to zoom controls
            this.$nextTick(() => {
                this.updateZoomControlsTheme();
            });

            // Add tile layer
            this.updateTileLayer(this.tileProvider);

            // Emit map ready event
            this.$emit('map-ready', this.map);
        },

        /**
         * Initialize particle image (EXACT from map2)
         * Called from mounted() lifecycle hook
         */
        // eslint-disable-next-line no-unused-vars
        initializeParticleImage() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is called from mounted() lifecycle hook
                this.initializeParticleImage();
            }
            this.particleImage = new Image();
            this.particleImage.src = PARTICLE_IMAGE_SRC;
            
            this.particleImage.onload = () => {
                if (this.canvasLayer && this.map && this.map.hasLayer(this.canvasLayer)) {
                    // eslint-disable-next-line no-underscore-dangle
                    if (typeof this.canvasLayer._reset === 'function') {
                        // eslint-disable-next-line no-underscore-dangle
                        this.canvasLayer._reset();
                    }
                }
            };
        },

        /**
         * Initialize canvas layer (EXACT from map2)
         * Called from mounted() lifecycle hook
         */
        // eslint-disable-next-line no-unused-vars
        initializeCanvasLayer() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is called from mounted() lifecycle hook
                this.initializeCanvasLayer();
            }
            if (this.map == null || this.canvasLayer != null) {
                return;
            }

            // Create canvas layer using particlesPane (EXACT from map2)
            // The pane already has pointer-events: none, so canvas won't block lasso
            this.canvasLayer = window.L.canvasLayer({
                pane: 'particlesPane'
            });
            
            // Assign draw function (EXACT from map2)
            this.canvasLayer.draw = this.drawParticles.bind(this);
            
            // Add to map
            this.canvasLayer.addTo(this.map);
        },

        /**
         * Draw particles (EXACT from map2)
         */
        drawParticles(ctx, info) {
            if (this.map == null || this.canvasLayer == null || !this.map.hasLayer(this.canvasLayer)) {
                return;
            }
            
            ctx.clearRect(0, 0, info.size.x, info.size.y);
            ctx.globalCompositeOperation = this.currentTheme === 'dark' ? 'lighter' : 'source-over';

            // OPTIMIZATION: Calculate isAnyParticleSelected once before the loop.
            const isAnyParticleSelected = this.activeParticles.some(particleItem => particleItem.isSelected);

            // ZOOM-BASED SCALING: Calculate zoom scale factor
            // At zoom 3 (min): scale = 1.0 (base size)
            // At zoom 10: scale ~= 2.0 (double size)
            // At zoom 18 (max): scale ~= 4.0 (4x size)
            const minZoom = 3; // eslint-disable-line no-magic-numbers
            const zoomRange = 15; // eslint-disable-line no-magic-numbers
            const maxScale = 4; // eslint-disable-line no-magic-numbers
            const currentZoom = info.zoom || minZoom;
            const zoomProgress = Math.max(0, Math.min(1, (currentZoom - minZoom) / zoomRange));
            const baseZoomScale = 1 + (zoomProgress * (maxScale - 1)); // 1.0 to 4.0
            const zoomScale = baseZoomScale * (this.particleSizeMultiplier || 1.0); // Apply user size preference

            this.activeParticles.forEach(particle => {
                if (particle.latitude == null || particle.longitude == null || this.map == null) {
                    return;
                }

                const layerPoint = this.map.latLngToLayerPoint([particle.latitude, particle.longitude]);
                const x = layerPoint.x - info.offset.x;
                const y = layerPoint.y - info.offset.y;

                const effectiveSize = PARTICLE_BASE_SIZE * zoomScale;
                const effectiveHaloSize = effectiveSize * HALO_SIZE_MULTIPLIER;
                
                let currentOpacityFactor = 1.0;
                if (isAnyParticleSelected && particle.isSelected !== true) {
                    currentOpacityFactor = 0.2; // eslint-disable-line no-magic-numbers
                }

                if (particle.flash > 0 && particle.opacity > 0) {
                    const effectiveOpacity = particle.opacity * currentOpacityFactor;
                    if (effectiveOpacity <= 1) { // eslint-disable-line no-magic-numbers
                        return;
                    }

                    if (this.currentTheme === 'light') {
                        // Light theme - gradient rendering with zoom-aware glow
                        if (particle.color == null) {
                            return;
                        }
                        const redValue = parseInt(particle.color.slice(1, 3), 16); // eslint-disable-line no-magic-numbers
                        const greenValue = parseInt(particle.color.slice(3, 5), 16); // eslint-disable-line no-magic-numbers
                        const blueValue = parseInt(particle.color.slice(5, 7), 16); // eslint-disable-line no-magic-numbers
                        const baseOpacity = effectiveOpacity / 100; // eslint-disable-line no-magic-numbers
                        const flashIntensity = particle.flash / 100; // eslint-disable-line no-magic-numbers

                        const haloOpacity = baseOpacity * flashIntensity * 0.5; // eslint-disable-line no-magic-numbers
                        if (haloOpacity > 0.01) { // eslint-disable-line no-magic-numbers
                            ctx.globalAlpha = haloOpacity;
                            const gradient = ctx.createRadialGradient(x, y, effectiveSize * 0.25, x, y, effectiveHaloSize / 2); // eslint-disable-line no-magic-numbers
                            gradient.addColorStop(0, `rgba(${redValue},${greenValue},${blueValue}, 0.7)`); // eslint-disable-line no-magic-numbers
                            gradient.addColorStop(1, `rgba(${redValue},${greenValue},${blueValue}, 0)`); // eslint-disable-line no-magic-numbers
                            ctx.fillStyle = gradient;
                            ctx.shadowColor = `rgba(${redValue},${greenValue},${blueValue}, 0.7)`; // eslint-disable-line no-magic-numbers
                            // eslint-disable-next-line no-magic-numbers
                            ctx.shadowBlur = 15 * zoomScale; // Zoom-aware glow
                            ctx.beginPath();
                            ctx.arc(x, y, effectiveHaloSize / 2, 0, Math.PI * 2); // eslint-disable-line no-magic-numbers
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }

                        const coreOpacity = baseOpacity * (flashIntensity ** 1.5); // eslint-disable-line no-magic-numbers
                        if (coreOpacity > 0.01) { // eslint-disable-line no-magic-numbers
                            ctx.globalAlpha = coreOpacity;
                            ctx.fillStyle = `rgba(${redValue},${greenValue},${blueValue}, 0.9)`; // eslint-disable-line no-magic-numbers
                            ctx.beginPath();
                            ctx.arc(x, y, effectiveSize / 2, 0, Math.PI * 2); // eslint-disable-line no-magic-numbers
                            ctx.fill();
                        }

                    } else { // Dark theme - use GRADIENT as fallback (images load async)
                        // Try image-based first
                        let imageToDraw = null;
                        if (particle.tintedImageObject != null && particle.tintedImageObject.complete && particle.tintedImageObject.naturalHeight !== 0) {
                            imageToDraw = particle.tintedImageObject;
                        } else if (this.particleImage != null && this.particleImage.complete && this.particleImage.naturalHeight !== 0) {
                            imageToDraw = this.particleImage;
                        }
                        
                        if (imageToDraw != null) {
                            // Image-based rendering (EXACT from map2)
                            const finalFlashCore = (effectiveOpacity / 100) * ((particle.flash / 100) ** 2); // eslint-disable-line no-magic-numbers
                            const finalFlashHalo = (effectiveOpacity / 100) * (particle.flash / 100) / 2; // eslint-disable-line no-magic-numbers

                            if (finalFlashCore > 0.001) { // eslint-disable-line no-magic-numbers
                                ctx.globalAlpha = finalFlashCore;
                                try {
                                    ctx.drawImage(imageToDraw, x - effectiveSize / 2, y - effectiveSize / 2, effectiveSize, effectiveSize); // eslint-disable-line no-magic-numbers
                                } catch (e) {
                                    // Fallback to gradient on error
                                    imageToDraw = null;
                                }
                            }
                            if (finalFlashHalo > 0.001 && imageToDraw) { // eslint-disable-line no-magic-numbers
                                ctx.globalAlpha = finalFlashHalo;
                                try {
                                    ctx.drawImage(imageToDraw, x - effectiveHaloSize / 2, y - effectiveHaloSize / 2, effectiveHaloSize, effectiveHaloSize); // eslint-disable-line no-magic-numbers
                                } catch (e) {
                                    // Ignore
                                }
                            }
                        }
                        
                        // FALLBACK: Use gradient if image not ready (same as light theme)
                        if (imageToDraw == null) {
                            if (particle.color == null) {
                                return;
                            }
                            const redValueDark = parseInt(particle.color.slice(1, 3), 16); // eslint-disable-line no-magic-numbers
                            const greenValueDark = parseInt(particle.color.slice(3, 5), 16); // eslint-disable-line no-magic-numbers
                            const blueValueDark = parseInt(particle.color.slice(5, 7), 16); // eslint-disable-line no-magic-numbers
                            const baseOpacityDark = effectiveOpacity / 100; // eslint-disable-line no-magic-numbers
                            const flashIntensityDark = particle.flash / 100; // eslint-disable-line no-magic-numbers

                            const haloOpacityDark = baseOpacityDark * flashIntensityDark * 0.5; // eslint-disable-line no-magic-numbers
                            if (haloOpacityDark > 0.01) { // eslint-disable-line no-magic-numbers
                                ctx.globalAlpha = haloOpacityDark;
                                const gradient = ctx.createRadialGradient(x, y, effectiveSize * 0.25, x, y, effectiveHaloSize / 2); // eslint-disable-line no-magic-numbers
                                gradient.addColorStop(0, `rgba(${redValueDark},${greenValueDark},${blueValueDark}, 0.7)`); // eslint-disable-line no-magic-numbers
                                gradient.addColorStop(1, `rgba(${redValueDark},${greenValueDark},${blueValueDark}, 0)`); // eslint-disable-line no-magic-numbers
                                ctx.fillStyle = gradient;
                                ctx.shadowColor = `rgba(${redValueDark},${greenValueDark},${blueValueDark}, 0.7)`; // eslint-disable-line no-magic-numbers
                                ctx.shadowBlur = 15; // eslint-disable-line no-magic-numbers
                                ctx.beginPath();
                                ctx.arc(x, y, effectiveHaloSize / 2, 0, Math.PI * 2); // eslint-disable-line no-magic-numbers
                                ctx.fill();
                                ctx.shadowBlur = 0;
                            }

                            const coreOpacityDark = baseOpacityDark * (flashIntensityDark ** 1.5); // eslint-disable-line no-magic-numbers
                            if (coreOpacityDark > 0.01) { // eslint-disable-line no-magic-numbers
                                ctx.globalAlpha = coreOpacityDark;
                                ctx.fillStyle = `rgba(${redValueDark},${greenValueDark},${blueValueDark}, 0.9)`; // eslint-disable-line no-magic-numbers
                                ctx.beginPath();
                                ctx.arc(x, y, effectiveSize / 2, 0, Math.PI * 2); // eslint-disable-line no-magic-numbers
                                ctx.fill();
                            }
                        }
                    }
                }
            });
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        },


        /**
         * Update tile layer
         */
        updateTileLayer(provider) {
            if (this.map == null) {
                return;
            }

            // Remove existing tile layer
            if (this.tileLayer) {
                this.map.removeLayer(this.tileLayer);
            }

            // Get tile config — pass yandexApiKey for Yandex provider
            const config = getTileLayerConfig(provider, this.yandexApiKey);

            // Add new tile layer
            this.tileLayer = window.L.tileLayer(config.url, {
                attribution: config.attribution,
                maxZoom: config.maxZoom || this.maxZoom,
                minZoom: this.minZoom,
                subdomains: config.subdomains || 'abc'
            });

            this.tileLayer.addTo(this.map);
        },

        /**
         * Get map instance
         * Unused but kept for potential future use
         */
        // eslint-disable-next-line no-unused-vars
        getMap() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.getMap();
            }
            return this.map;
        },

        /**
         * Fit bounds
         * Unused but kept for potential future use
         */
        // eslint-disable-next-line no-unused-vars
        fitBounds(bounds, options = {}) {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.fitBounds(bounds, options);
            }
            if (this.map != null && bounds != null) {
                this.map.fitBounds(bounds, options);
            }
        },

        /**
         * Add layer to map
         * Unused but kept for potential future use
         */
        // eslint-disable-next-line no-unused-vars
        addLayer(layer) {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.addLayer(layer);
            }
            if (this.map != null && layer != null) {
                layer.addTo(this.map);
            }
        },

        /**
         * Remove layer from map
         * Unused but kept for potential future use
         */
        // eslint-disable-next-line no-unused-vars
        removeLayer(layer) {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.removeLayer(layer);
            }
            if (this.map != null && layer != null) {
                this.map.removeLayer(layer);
            }
        },

        /**
         * Clear all layers except tile layer
         * Unused but kept for potential future use
         */
        // eslint-disable-next-line no-unused-vars
        clearLayers() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is intentionally unused but kept for future functionality
                this.clearLayers();
            }
            if (this.map == null) {
                return;
            }

            this.map.eachLayer((layer) => {
                if (layer !== this.tileLayer && layer !== this.canvasLayer) {
                    this.map.removeLayer(layer);
                }
            });
        },

        /**
         * Initialize Leaflet Lasso plugin (EXACT from map2)
         */
        initializeLasso() {
            
            if (this.map == null || window.L.Lasso == null) {
                return;
            }

            try {
                // Initialize Lasso instance (EXACT from map2)
                this.lassoInstance = new window.L.Lasso(this.map, {
                    polygon: {
                        color: '#007bff',
                        // eslint-disable-next-line no-magic-numbers
                        weight: 2,
                        // eslint-disable-next-line no-magic-numbers
                        fillOpacity: 0.1
                    },
                    touch: true
                });
                
                
                
                // Add debug listeners for lasso drawing process
                this.map.on('lasso.enable', () => {
                });
                
                this.map.on('lasso.disable', () => {
                });

                // Lasso event listeners (EXACT from map2)
                this.map.on('lasso.finished', (event) => {
                    
                    // Re-enable dragging and touch zoom (CRITICAL - from map2)
                    if (this.map) {
                        this.map.dragging.enable();
                        if (this.map.touchZoom) {
                            this.map.touchZoom.enable();
                        }
                    }
                    
                    // Extract bounds from selected layers (EXACT from map2)
                    let bounds = null;
                    if (event.layers && event.layers.length > 0) {
                        bounds = window.L.featureGroup(event.layers).getBounds();
                    }


                    // Emit the path (event.latLngs) along with layers and bounds
                    this.$emit('lasso-selection-finished', {
                        layers: event.layers,
                        bounds,
                        path: event.latLngs
                    });

                    // Disable lasso after finishing (CRITICAL - from map2)
                    if (this.lassoInstance && this.lassoInstance.enabled()) {
                        this.lassoInstance.disable();
                    }
                });
                
                
                // CRITICAL DEBUG: Monkey-patch finish() to see if it's being called
                if (this.lassoInstance && this.lassoInstance.finish) {
                    const originalFinish = this.lassoInstance.finish.bind(this.lassoInstance);
                    this.lassoInstance.finish = function handleFinish(event) {
                        
                        if (this.polygon == null) {
                            // Polygon not initialized
                        }
                        
                        return originalFinish(event);
                    };
                }
                
                // Debug: Check all panes and their z-indexes
                const panes = this.map.getPanes();
                Object.keys(panes).forEach(paneName => {
                    const pane = panes[paneName];
                });

                this.map.on('lasso.cleared', () => {
                    if (this.map) {
                        this.map.dragging.enable();
                        if (this.map.touchZoom) {
                            this.map.touchZoom.enable();
                        }
                    }
                    this.$emit('lasso-selection-cleared');
                });
            } catch (error) {
                // Silent fail - lasso initialization error
            }
        },

        /**
         * Toggle lasso selection tool (EXACT from map2)
         */
        // eslint-disable-next-line vue/no-unused-properties
        toggleLasso() {
            
            if (this.lassoInstance == null || this.map == null) {
                return;
            }

            const isCurrentlyEnabled = this.lassoInstance.enabled();

            if (isCurrentlyEnabled) {
                this.lassoInstance.disable();
                this.map.dragging.enable();
                if (this.map.touchZoom) {
                    this.map.touchZoom.enable();
                }
                this.$emit('lasso-activity-changed', false);
            } else {
                this.map.dragging.disable();
                if (this.map.touchZoom) {
                    this.map.touchZoom.disable();
                }
                this.lassoInstance.enable();
                this.$emit('lasso-activity-changed', true);
                
                // CRITICAL DEBUG: leaflet-lasso listens to document mouseup, not map mouseup!
                
                // Test if document mouseup is captured
                const testDocumentMouseUp = (e) => {
                    
                    document.removeEventListener('mouseup', testDocumentMouseUp);
                };
                
                document.addEventListener('mouseup', testDocumentMouseUp);
                
                // Also check if polygon is created
                const checkPolygonCreation = () => {
                    setTimeout(() => {
                        let foundLassoPolygon = false;
                        this.map.eachLayer((layer) => {
                            if (layer.polyline && layer.polygon) {
                                foundLassoPolygon = true;
                            }
                        });
                    }, 100); // eslint-disable-line no-magic-numbers
                };
                
                this.map.once('mousedown', checkPolygonCreation);
            }
        },

        /**
         * Reset lasso selection (EXACT from map2)
         */
        // eslint-disable-next-line vue/no-unused-properties
        resetLasso() {
            if (this.lassoInstance == null || this.map == null) {
                return;
            }

            if (this.lassoInstance.enabled()) {
                this.lassoInstance.disable();
            }
            this.map.dragging.enable();
            if (this.map.touchZoom) {
                this.map.touchZoom.enable();
            }
            this.$emit('lasso-selection-cleared');
            this.$emit('lasso-activity-changed', false);
        },

        /**
         * Get map instance (for external access)
         */
        // eslint-disable-next-line vue/no-unused-properties
        getMapInstance() {
            return this.map;
        },

        /**
         * Add invisible selection marker for lasso (EXACT from map2)
         */
        addSelectionMarker({ id, lat, lng }) {
            if (this.map == null || id == null) {
                return;
            }
            
            if (this.selectionMarkers.has(id)) {
                // Update existing marker position
                this.selectionMarkers.get(id).setLatLng([lat, lng]);
            } else {
                // Create marker for lasso selection (map2 pattern)
                // MUST be interactive for lasso to select it!
                const marker = window.L.circleMarker([lat, lng], {
                    radius: 1,
                    // eslint-disable-next-line no-magic-numbers
                    opacity: 0.001,
                    // eslint-disable-next-line no-magic-numbers
                    fillOpacity: 0.001,
                    pane: 'markerPane',
                    interactive: true, // CRITICAL: Must be interactive for lasso selection!
                    customData: { particleId: id }
                }).addTo(this.map);
                
                this.selectionMarkers.set(id, marker);
                
                // Debug: Log every 10000th marker
                // eslint-disable-next-line no-magic-numbers
                if (this.selectionMarkers.size % 10000 === 0) {
                    // Debug marker count
                }
            }
        },

        /**
         * Remove selection marker (EXACT from map2)
         */
        removeSelectionMarker(id) {
            if (this.map == null || id == null || !this.selectionMarkers.has(id)) {
                return;
            }
            
            this.map.removeLayer(this.selectionMarkers.get(id));
            this.selectionMarkers.delete(id);
        },

        /**
         * Clear all selection markers (EXACT from map2)
         */
        clearAllSelectionMarkers() {
            if (this.map == null) {
                return;
            }
            
            const count = this.selectionMarkers.size;
            
            this.selectionMarkers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.selectionMarkers.clear();
            
        },

        /**
         * Sync selection markers with active particles (EXACT from map2)
         */
        syncSelectionMarkers() {
            if (this.map == null) {
                return;
            }

            // Get current particle IDs
            const currentParticleIds = new Set(
                this.activeParticles.map(particle => particle.id).filter(id => id != null)
            );

            // Remove markers for particles that no longer exist
            const removedMarkerIds = [];
            this.selectionMarkers.forEach((marker, id) => {
                if (!currentParticleIds.has(id)) {
                    removedMarkerIds.push(id);
                }
            });
            removedMarkerIds.forEach(id => this.removeSelectionMarker(id));

            // Add/update markers for current particles
            this.activeParticles.forEach(particle => {
                if (particle.id != null && particle.latitude != null && particle.longitude != null) {
                    this.addSelectionMarker({
                        id: particle.id,
                        lat: particle.latitude,
                        lng: particle.longitude
                    });
                }
            });
        },

        /**
         * Update lasso polygon display (EXACT from map2)
         */
        updateLassoPolygon() {
            
            if (this.map == null) {
                return;
            }

            // Remove existing polygon if it's there
            if (this.lassoAreaDisplayPolygon) {
                this.map.removeLayer(this.lassoAreaDisplayPolygon);
                this.lassoAreaDisplayPolygon = null;
            }

            // Draw new polygon if lasso is applied
            if (this.isLassoFilterApplied && this.activeLassoPath && this.activeLassoPath.length > 0) {
                
                const isDark = this.currentTheme === 'dark' || this.currentTheme === 'blue';
                const color = isDark ? '#00A9FF' : '#007bff';
                
                this.lassoAreaDisplayPolygon = window.L.polygon(this.activeLassoPath, {
                    fill: false,
                    color,
                    // eslint-disable-next-line no-magic-numbers
                    weight: 2,
                    dashArray: '5, 5',
                    // eslint-disable-next-line no-magic-numbers
                    opacity: 0.7,
                    interactive: false
                }).addTo(this.map);
                
            } else {
                // No lasso polygon to display
            }
        },

        /**
         * Clear particles from canvas (EXACT map2 pattern - remove layer)
         */
        // eslint-disable-next-line vue/no-unused-properties
        clearParticles() {
            // Clear selection markers
            this.clearAllSelectionMarkers();
            
            // Remove canvas layer from map (map2 style)
            if (this.canvasLayer && this.map && this.map.hasLayer(this.canvasLayer)) {
                this.map.removeLayer(this.canvasLayer);
            }
        },
        
        /**
         * Restore canvas layer (for switching back to animation)
         */
        // eslint-disable-next-line vue/no-unused-properties
        restoreCanvasLayer() {
            if (this.canvasLayer && this.map && !this.map.hasLayer(this.canvasLayer)) {
                this.canvasLayer.addTo(this.map);
                // eslint-disable-next-line no-underscore-dangle
                if (typeof this.canvasLayer._reset === 'function') {
                    // eslint-disable-next-line no-underscore-dangle
                    this.canvasLayer._reset();
                }
            }
        },
        
        /**
         * Update zoom controls theme styling
         * Applies theme-specific classes/styles to Leaflet zoom control buttons
         */
        updateZoomControlsTheme() {
            if (this.map == null) {
                return;
            }
            
            // Find zoom control buttons in the map container
            const mapContainer = this.map.getContainer();
            if (mapContainer == null) {
                return;
            }
            
            // Find all zoom control buttons
            const zoomButtons = mapContainer.querySelectorAll('.leaflet-control-zoom a');
            
            if (zoomButtons.length === 0) {
                return;
            }
            
            const theme = this.currentTheme || 'light';
            
            // Theme-specific styles
            const themeStyles = {
                dark: {
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.75) 100%)',
                    borderColor: 'rgba(75, 85, 99, 0.4)',
                    borderTopColor: 'rgba(148, 163, 184, 0.2)',
                    color: 'rgb(226, 232, 240)',
                    hoverBackground: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(31, 41, 55, 0.8) 100%)'
                },
                light: {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%)',
                    borderColor: 'rgba(229, 231, 235, 0.6)',
                    borderTopColor: 'rgba(255, 255, 255, 0.8)',
                    color: 'rgb(51, 65, 85)',
                    hoverBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)'
                },
                blue: {
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(37, 99, 235, 0.75) 100%)',
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                    borderTopColor: 'rgba(147, 197, 253, 0.6)',
                    color: 'rgb(219, 234, 254)',
                    hoverBackground: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(59, 130, 246, 0.85) 100%)'
                }
            };
            
            const styles = themeStyles[theme] || themeStyles.light;
            
            // Apply styles to each button using setProperty for !important
            zoomButtons.forEach(button => {
                button.style.setProperty('background', styles.background, 'important');
                button.style.setProperty('border-color', styles.borderColor, 'important');
                button.style.setProperty('border-top-color', styles.borderTopColor, 'important');
                button.style.setProperty('color', styles.color, 'important');
                
                // Store original styles for hover
                const { background: originalBackground, hoverBackground } = styles;
                
                // Remove existing hover listeners and add new one
                const originalOnMouseEnter = button.onmouseenter;
                const originalOnMouseLeave = button.onmouseleave;
                
                button.onmouseenter = function handleMouseEnter() {
                    this.style.setProperty('background', hoverBackground, 'important');
                    this.style.setProperty('transform', 'translateY(-1px)', 'important');
                    if (originalOnMouseEnter != null) {
                        originalOnMouseEnter.call(this);
                    }
                };
                
                button.onmouseleave = function handleMouseLeave() {
                    this.style.setProperty('background', originalBackground, 'important');
                    this.style.setProperty('transform', '', 'important');
                    if (originalOnMouseLeave != null) {
                        originalOnMouseLeave.call(this);
                    }
                };
            });
        },
        
        cleanup() {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                // This method is called from beforeDestroy() lifecycle hook
                this.cleanup();
            }
            
            // Clean up selection markers (EXACT from map2)
            this.clearAllSelectionMarkers();
            
            if (this.canvasLayer != null && this.map != null) {
                this.map.removeLayer(this.canvasLayer);
                this.canvasLayer = null;
            }
            
            if (this.lassoAreaDisplayPolygon && this.map) {
                this.map.removeLayer(this.lassoAreaDisplayPolygon);
                this.lassoAreaDisplayPolygon = null;
            }
            
            if (this.lassoInstance) {
                this.lassoInstance = null;
            }
            
            if (this.map) {
                this.map.remove();
                this.map = null;
                this.tileLayer = null;
            }
            
            this.particleImage = null;
        }
    }
};
</script>

<style scoped>
.leaflet-map-container {
    width: 100%;
    height: 100%;
    position: relative;
}

/* Ensure zoom controls are properly positioned */
:global(.leaflet-map-container .leaflet-control-zoom) {
    margin-right: 0;
    margin-bottom: 0;
}

/* Remove default Leaflet zoom control separator line */
:global(.leaflet-map-container .leaflet-control-zoom a) {
    margin-bottom: 4px;
}

:global(.leaflet-map-container .leaflet-control-zoom a:last-child) {
    margin-bottom: 0;
}
</style>
