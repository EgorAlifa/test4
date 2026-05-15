<template>
    <div class="choropleth-container">
        <w-map-loading-spinner :is-visible="isLoading" />
        <div v-if="!isLoading" class="svg-map-container" ref="mapContainer">
            <svg
                ref="svgMap"
                class="choropleth-svg-map"
                :viewBox="viewBox"
                preserveAspectRatio="xMidYMid meet"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseLeave"
                @wheel="handleWheel"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
                <defs>
                    <!-- Neon glow filters will be added here dynamically -->
                </defs>
                <g ref="svgContentGroup" :transform="transformString"></g>
                <!-- Region labels — rendered above regions, pointer-events disabled -->
                <g ref="labelsGroup" :transform="transformString" style="pointer-events:none"></g>
                <!-- Overlay markers — rendered above labels -->
                <g ref="markersGroup" :transform="transformString"></g>
            </svg>
            <div class="zoom-controls" :class="themeClass">
                <button class="zoom-button" @click="zoomIn" aria-label="Zoom in">+</button>
                <button class="zoom-button" @click="zoomOut" aria-label="Zoom out">−</button>
                <button class="zoom-button" @click="resetView" aria-label="Reset view">⟲</button>
            </div>
            
            <!-- Drill-down Breadcrumbs -->
            <div v-if="enableDrillDown && drillDownPaths.length > 0" class="drill-down-breadcrumbs" :class="themeClass">
                <button 
                    v-for="(crumb, index) in breadcrumbs" 
                    :key="index"
                    class="breadcrumb-item"
                    :class="{ 'breadcrumb-active': index === breadcrumbs.length - 1 }"
                    @click="handleBreadcrumbClick(index)">
                    {{ crumb.name }}
                    <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">›</span>
                </button>
            </div>
            
            <!-- Glassmorphism Tooltip (dots style) -->
            <div 
                v-if="tooltip.visible" 
                class="region-tooltip"
                :class="themeClass"
                :style="tooltipStyle">
                <div class="tooltip-header">
                    <svg 
                        class="tooltip-icon" 
                        :style="{ color: tooltip.textColor }" 
                        viewBox="0 0 24 24" 
                        width="16" 
                        height="16"
                        fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <strong class="tooltip-title" :style="{ color: tooltip.textColor }">{{ tooltip.regionName }}</strong>
                </div>
                <div v-if="tooltip.metrics && tooltip.metrics.length > 0" class="tooltip-metrics">
                    <div v-for="metric in tooltip.metrics" :key="metric.name" class="tooltip-metric-item">
                        <div class="tooltip-description" :style="{ color: tooltip.textColor }">{{ metric.label }}</div>
                        <div class="tooltip-value" :style="{ color: tooltip.textColor }">{{ metric.formattedValue }}</div>
                    </div>
                </div>
                <div v-else class="tooltip-metrics">
                    <div class="tooltip-metric-item">
                <div class="tooltip-description" :style="{ color: tooltip.textColor }">{{ tooltip.metricLabel }}</div>
                <div class="tooltip-value" :style="{ color: tooltip.textColor }">{{ tooltip.formattedValue }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable no-console */
import WMapLoadingSpinner from './MapLoadingSpinner.vue';
import { ColorPalettes } from '../utils/constants';

// NOTE: Pure SVG implementation - no Leaflet dependencies
// SVG files are loaded from assets directory

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.3;
const INITIAL_ZOOM = 1;
const TOUCH_DIVISOR = 2;
const DEFAULT_REGION_OPACITY = 0.7;
const NO_DATA_OPACITY = 0.3;
const MAX_SAMPLE_LOGS = 5;
const MAX_TOOLTIP_DEBUG_LOGS = 3;
const HEX_SHORT_LENGTH = 3;
const HEX_CHAR_DOUBLING = 2;
const HEX_RED_START = 0;
const HEX_RED_END = 2;
const HEX_GREEN_START = 2;
const HEX_GREEN_END = 4;
const HEX_BLUE_START = 4;
const HEX_BLUE_END = 6;
const YIQ_RED_WEIGHT = 299;
const YIQ_GREEN_WEIGHT = 587;
const YIQ_BLUE_WEIGHT = 114;
const YIQ_DIVISOR = 1000;
const YIQ_THRESHOLD = 128;
const HEX_BASE = 16;
const MAX_SLICE_KEYS = 10;
const MAX_DEBUG_PATHS = 20;
const MAX_SAMPLE_PATHS = 5;
const MAX_UNMATCHED_PATHS_LOG = 10;
const COLOR_DARKEN_AMOUNT = 0.3;
const COLOR_LIGHTEN_AMOUNT = 0.15;
const MAX_RGB_VALUE = 255;

const ColorPalettesLocal = ColorPalettes;

// Default color for regions with no data
const NO_DATA_COLOR_LIGHT = '#e5e7eb';
const NO_DATA_COLOR_DARK = '#374151';

export default {
    name: 'ChoroplethMap',

    components: {
        WMapLoadingSpinner
    },

    props: {
        currentTheme: {
            type: String,
            default: 'dark'
        },
        selectedDistrict: {
            type: String,
            default: 'russia'
        },
        selectedAdminLevel: {
            type: String,
            default: '4'
        },
        data: {
            type: Object,
            default: () => ({})
        },
        colorScheme: {
            type: String,
            default: 'Blues'
        },
        regionNameField: {
            type: String,
            default: ''
        },
        regionData: {
            type: Array,
            default: () => []
        },
        svgMapFile: {
            type: String,
            default: 'ru.svg'
        },
        customSvgUrl: {
            type: Object,
            default: null
        },
        svgIdField: {
            type: String,
            default: 'auto'
        },
        useMapNameForHover: {
            type: Boolean,
            default: false
        },
        missingDataColor: {
            type: String,
            default: ''
        },
        borderAppearance: {
            type: String,
            default: 'theme'
        },
        enableCustomBorder: {
            type: Boolean,
            default: false
        },
        customBorderColor: {
            type: String,
            default: '#000000'
        },
        customBorderThickness: {
            type: Number,
            default: 1
        },
        customBorderRounding: {
            type: Number,
            default: 0
        },
        hoverBehavior: {
            type: String,
            default: 'color', // 'color', 'scale', 'both'
            validator: (value) => ['color', 'scale', 'both'].includes(value)
        },
        enableDrillDown: {
            type: Boolean,
            default: false
        },
        drillDownStartLevel: {
            type: Number,
            default: 0 // 0 = show all, 1 = level 1, 2 = level 2, etc.
        },
        aggregationMethod: {
            type: String,
            default: 'sum' // 'sum', 'average', 'min', 'max', 'count'
        },
        levelMetricMapping: {
            type: Object,
            default: () => ({}) // Maps level numbers to metric field names, e.g. { 0: 'districtMetric', 1: 'regionMetric' }
        },
        tooltipMetrics: {
            type: Array,
            default: () => [] // Array of metric names to show in tooltip
        },
        metricSettings: {
            type: Object,
            default: () => ({}) // Metric settings including labels and formatting
        },
        regionDataWithMetrics: {
            type: Array,
            default: () => [] // Full dataset with all metrics for tooltip display
        },
        regionCodeField: {
            type: String,
            default: '' // Field name for region code in dataset
        },
        // Show region name labels inside each region path
        showLabels: {
            type: Boolean,
            default: false
        },
        // Overlay markers: array of {lat, lon, label}
        markers: {
            type: Array,
            default: () => []
        },
        markerSymbol: {
            type: String,
            default: 'circle'
        },
        markerColor: {
            type: String,
            default: '#e53935'
        },
        markerSize: {
            type: Number,
            default: 10
        }
    },

    data() {
        return {
            // Loading state
            isLoading: false,
            
            // SVG content
            originalViewBox: '0 0 1000 600',
            viewBox: '0 0 1000 600',
            
            // Pan and zoom state
            zoom: INITIAL_ZOOM,
            panX: 0,
            panY: 0,
            
            // Interaction state
            isPanning: false,
            startX: 0,
            startY: 0,
            startPanX: 0,
            startPanY: 0,
            
            // Touch state
            lastTouchDistance: 0,
            
            // Tooltip state
            tooltip: {
                visible: false,
                x: 0,
                y: 0,
                regionName: '',
                formattedValue: '',
                metricLabel: 'Значение',
                textColor: '#000000',
                metrics: [] // Array of {name, label, formattedValue}
            },
            
            // SVG element cache for name lookup
            svgElementsCache: new Map(),
            
            // Drill-down state
            drillDownPaths: [], // Array of {level, id, name} objects - level is numeric (1, 2, 3, ...)
            currentDrillLevel: 0, // 0 = show all, 1 = level 1, 2 = level 2, etc.
            levelInfoMap: new Map(), // Map of level group ID to {level, name} - for any nesting depth
            originalSvgElement: null, // Store reference to original SVG for finding groups
            pendingDrillZoomGroupId: null // Store group ID to zoom to after drill-down
        };
    },

    computed: {
        themeClass() {
            return `theme-${this.currentTheme}`;
        },
        
        transformString() {
            return `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`;
        },
        
        tooltipStyle() {
            const offsetX = 15;
            const offsetY = 15;
            const tooltipWidth = 220; // Approximate tooltip width
            const tooltipHeight = 100; // Approximate tooltip height
            
            let left = this.tooltip.x + offsetX;
            let top = this.tooltip.y + offsetY;
            
            // Ensure tooltip stays in viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Check right edge
            if (left + tooltipWidth > viewportWidth) {
                left = this.tooltip.x - tooltipWidth - offsetX;
            }
            
            // Check bottom edge
            if (top + tooltipHeight > viewportHeight) {
                top = this.tooltip.y - tooltipHeight - offsetY;
            }
            
            // Check left edge
            if (left < 0) {
                left = offsetX;
            }
            
            // Check top edge
            if (top < 0) {
                top = offsetY;
            }
            
            return {
                left: `${left}px`,
                top: `${top}px`
            };
        },
        
        breadcrumbs() {
            return this.getBreadcrumbs();
        }
        
    },

    watch: {
        svgMapFile: {
            handler(newVal, oldVal) {
                // Only reload if custom SVG is not set (null, undefined, or empty string)
                const hasCustomSvg = this.customSvgUrl != null && this.customSvgUrl !== '';
                if (newVal !== oldVal && !hasCustomSvg) {
                    this.loadSVGContent();
                }
            }
        },

        customSvgUrl: {
            handler(newVal, oldVal) {
                // Reload when custom SVG changes (including when cleared)
                if (newVal !== oldVal) {
                    this.loadSVGContent();
                }
            }
        },

        selectedDistrict: {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.loadSVGContent();
                }
            }
        },

        selectedAdminLevel: {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.updateRegionStyles();
                }
            }
        },

        currentTheme() {
            this.updateRegionStyles();
        },
        
        borderAppearance() {
            this.updateRegionStyles();
        },
        
        colorScheme() {
            this.$nextTick(() => {
                this.updateRegionStyles();
            });
        },
        
        data: {
            handler() {
                // Update colors when data changes
                this.$nextTick(() => {
                    this.updateRegionStyles();
                });
            },
            deep: true,
            immediate: true
        },
        
        enableDrillDown: {
            handler(newVal) {
                if (newVal === false) {
                    // Reset drill-down when disabled
                    this.drillDownPaths = [];
                    this.currentDrillLevel = this.drillDownStartLevel != null ? this.drillDownStartLevel : 0;
                    this.loadSVGContent();
                }
            }
        },
        
        drillDownStartLevel: {
            handler(newVal) {
                // Reset to start level when changed
                this.drillDownPaths = [];
                this.currentDrillLevel = newVal != null ? newVal : 0;
                this.loadSVGContent();
            },
            immediate: true
        },

        showLabels() {
            this.$nextTick(() => this.updateLabels());
        },

        markers: {
            handler() {
                this.$nextTick(() => this.updateMarkers());
            },
            deep: true
        },
        markerSymbol() { this.$nextTick(() => this.updateMarkers()); },
        markerColor()  { this.$nextTick(() => this.updateMarkers()); },
        markerSize()   { this.$nextTick(() => this.updateMarkers()); }
    },

    mounted() {
        // Initialize drill-down level
        this.currentDrillLevel = this.drillDownStartLevel != null ? this.drillDownStartLevel : 0;
        this.loadSVGContent();
    },

    beforeDestroy() {
        // Cleanup if needed
    },

    methods: {
        // ==========================================
        // SVG LOADING METHODS
        // ==========================================
        async loadSVGContent() {
            this.isLoading = true;

            try {
                let svgUrl;
                
                // Check if custom SVG attachment is provided (must be non-null, non-undefined, and non-empty)
                if (this.customSvgUrl != null && this.customSvgUrl !== '') {
                    // Use custom SVG attachment (file from project files)
                    // customSvgUrl is a string path like 'upload/ru bkp.svg'
                    // The platform handles URL resolution automatically
                    svgUrl = this.customSvgUrl;
                } else {
                    // Import SVG file from assets dynamically based on prop
                    const svgFileName = this.svgMapFile || 'ru.svg';
                    const svgModule = await import(`../assets/${svgFileName}`);
                    svgUrl = svgModule.default || svgModule;
                }
                
                // Fetch SVG content
                const response = await fetch(svgUrl);
                if (response.ok === false) {
                    throw new Error(`Failed to load SVG: ${response.status}`);
                }
                
                const svgText = await response.text();
                
                // Parse SVG
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.querySelector('svg');

                if (svgElement == null) {
                    throw new Error('Invalid SVG file - no svg element found');
                }
                
                // Remove root SVG title element to prevent native browser tooltip
                const rootTitle = svgElement.querySelector('svg > title');
                if (rootTitle != null) {
                    rootTitle.remove();
                }
                
                // Store reference to original SVG element
                this.originalSvgElement = svgElement.cloneNode(true);
                
                // Extract viewBox from original SVG
                const viewBox = svgElement.getAttribute('viewBox');
                if (viewBox != null) {
                    this.originalViewBox = viewBox;
                    this.viewBox = viewBox;
                }
                
                // Populate level info map - recursively collect all groups with their levels and names
                this.levelInfoMap.clear();
                const mainGroup = svgElement.querySelector('g[id="ru"]');
                if (mainGroup != null) {
                    this.collectLevelInfo(mainGroup, mainGroup, 0);
                }
                
                // Set loading to false BEFORE nextTick so the container renders
                this.isLoading = false;
                
                // Append SVG content after Vue has rendered the container
                this.$nextTick(() => {
                    this.appendSVGContent(svgElement);
                    this.setupInteractivity();
                    this.updateRegionStyles();
                    this.updateLabels();
                    this.updateMarkers();
                    
                    // Zoom to selected element if drilling down
                    if (this.pendingDrillZoomGroupId != null) {
                        setTimeout(() => {
                            this.zoomToElement(this.pendingDrillZoomGroupId);
                            this.pendingDrillZoomGroupId = null;
                        }, 150);
                    } else {
                        // Reset view if not drilling down
                        this.resetView();
                    }
                    
                    // Emit visible regions change for legend recalculation after styles are updated
                    if (this.enableDrillDown) {
                        // Use setTimeout to ensure SVG is fully rendered and styles are applied
                        setTimeout(() => {
                            const visibleIds = this.getVisibleRegionIds();
                            const visibleValues = this.getVisibleRegionValues();
                            this.$emit('visible-regions-changed', visibleIds, visibleValues);
                        }, 100);
                    }
                });
                
            } catch (error) {
                this.$emit('error', 'Failed to load SVG map.');
                this.isLoading = false;
            }
        },
        
        appendSVGContent(svgElement) {
            const contentGroup = this.$refs.svgContentGroup;
            if (contentGroup == null) {
                return;
            }
            
            // Clear existing content
            contentGroup.innerHTML = '';
            
            // Filter SVG content based on drill-down level
            const filteredContents = this.filterSVGByDrillLevel(svgElement);
            
            // Clone and append filtered children
            filteredContents.forEach((child) => {
                // Only append element nodes (skip text nodes, comments, etc.)
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const clonedChild = child.cloneNode(true);
                    contentGroup.appendChild(clonedChild);
                }
            });
            
            // Rebuild SVG elements cache from the appended content (after filtering)
            this.$nextTick(() => {
                this.svgElementsCache.clear();
                const allElements = contentGroup.querySelectorAll('path, polygon, polyline, rect, g');
                allElements.forEach((element) => {
                    const regionCode = this.getRegionCodeFromPath(element);
                    if (regionCode != null) {
                        this.svgElementsCache.set(regionCode, element);
                    }
                });
            });
        },
        
        // Helper: Calculate the depth/level of a group element from root
        getGroupLevel(groupElement, rootGroup) {
            let level = 0;
            let current = groupElement;
            while (current != null && current !== rootGroup && current.parentElement != null) {
                if (current.tagName === 'g') {
                    level++;
                }
                current = current.parentElement;
            }
            return level;
        },
        
        // Helper: Check if element is a leaf region (path, polygon, polyline, rect)
        isLeafRegion(element) {
            return element.nodeType === Node.ELEMENT_NODE && 
                ['path', 'polygon', 'polyline', 'rect'].includes(element.tagName.toLowerCase());
        },
        
            // Helper: Flatten groups to show all leaf regions at a specific level
        flattenToLevel(groupElement, targetLevel, currentLevel, parentGroupId) {
            const results = [];
            
            Array.from(groupElement.childNodes).forEach((child) => {
                if (this.isLeafRegion(child)) {
                    // Leaf region - clone it and mark with parent group ID if needed
                    const cloned = child.cloneNode(true);
                    if (parentGroupId != null && targetLevel > 0) {
                        cloned.setAttribute('data-level-group-id', parentGroupId);
                    }
                    results.push(cloned);
                } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'g') {
                    const childLevel = currentLevel + 1;
                    
                    if (targetLevel === 0) {
                        // Show everything - keep recursing
                        const flattened = this.flattenToLevel(child, targetLevel, childLevel, child.id || parentGroupId);
                        results.push(...flattened);
                    } else if (childLevel < targetLevel) {
                        // Haven't reached target level yet - recurse deeper
                        const flattened = this.flattenToLevel(child, targetLevel, childLevel, child.id || parentGroupId);
                        results.push(...flattened);
                    } else if (childLevel === targetLevel) {
                        // This is the target level - collect all leaf regions from this group
                        // We want to flatten this level's children, so we extract all leaves
                        const extractLeaves = (element, groupId) => {
                            const leaves = [];
                            Array.from(element.childNodes).forEach((node) => {
                                if (this.isLeafRegion(node)) {
                                    const cloned = node.cloneNode(true);
                                    if (groupId != null) {
                                        cloned.setAttribute('data-level-group-id', groupId);
                                    }
                                    leaves.push(cloned);
                                } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'g') {
                                    // Recurse to find all nested leaves
                                    leaves.push(...extractLeaves(node, groupId));
                                }
                            });
                            return leaves;
                        };
                        
                        const groupId = child.id || parentGroupId;
                        const leaves = extractLeaves(child, groupId);
                        results.push(...leaves);
                    }
                    // If childLevel > targetLevel, skip (we've gone too deep)
                }
            });
            
            return results;
        },
        
        filterSVGByDrillLevel(svgElement) {
            if (this.enableDrillDown === false) {
                // If drill-down is disabled, return all children
                return Array.from(svgElement.childNodes);
            }
            
            // Find the main group (id="ru")
            const mainGroup = svgElement.querySelector('g[id="ru"]');
            if (mainGroup == null) {
                return Array.from(svgElement.childNodes);
            }
            
            const results = [];
            
            // Clone non-group children (title, defs, etc.) from original SVG
            Array.from(svgElement.childNodes).forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'g') {
                    results.push(child);
                }
            });
            
            // Clone Page-1 group structure
            const pageGroup = svgElement.querySelector('g[id="Page-1"]');
            if (pageGroup != null) {
                const clonedPageGroup = pageGroup.cloneNode(false);
                const clonedMainGroup = mainGroup.cloneNode(false);
                
                // currentDrillLevel: 0 = show all, 1+ = show specific level
                // drillDownStartLevel: 0 = show all, 1+ = flatten to show regions at that level
                
                if (this.currentDrillLevel === 0) {
                    // Show all - but check if we need to flatten based on start level
                    if (this.drillDownStartLevel > 0) {
                        // Flatten to show regions at the start level
                        const flattened = this.flattenToLevel(mainGroup, this.drillDownStartLevel, 0, null);
                        flattened.forEach((item) => {
                            clonedMainGroup.appendChild(item);
                        });
                    } else {
                        // Show everything as-is
                        Array.from(mainGroup.childNodes).forEach((child) => {
                            clonedMainGroup.appendChild(child.cloneNode(true));
                        });
                    }
                } else {
                    // We're drilled into a specific level
                    if (this.drillDownPaths.length > 0) {
                        // Show only the selected group and its children
                        const selectedGroupId = this.drillDownPaths[this.drillDownPaths.length - 1].id;
                        const selectedGroup = mainGroup.querySelector(`g[id="${selectedGroupId}"]`);
                        if (selectedGroup != null) {
                            clonedMainGroup.appendChild(selectedGroup.cloneNode(true));
                        }
                    } else {
                        // No selection - show all groups at current level
                        const flattened = this.flattenToLevel(mainGroup, this.currentDrillLevel, 0, null);
                        flattened.forEach((item) => {
                            clonedMainGroup.appendChild(item);
                        });
                    }
                }
                
                clonedPageGroup.appendChild(clonedMainGroup);
                results.push(clonedPageGroup);
                } else {
                    // No Page-1 group, just add ru group directly
                    const clonedMainGroup = mainGroup.cloneNode(false);
                    
                    if (this.currentDrillLevel === 0) {
                        if (this.drillDownStartLevel > 0) {
                            const flattened = this.flattenToLevel(mainGroup, this.drillDownStartLevel, 0, null);
                            flattened.forEach((item) => {
                                clonedMainGroup.appendChild(item);
                            });
                        } else {
                            Array.from(mainGroup.childNodes).forEach((child) => {
                                clonedMainGroup.appendChild(child.cloneNode(true));
                            });
                        }
                } else {
                    if (this.drillDownPaths.length > 0) {
                        const selectedGroupId = this.drillDownPaths[this.drillDownPaths.length - 1].id;
                        const selectedGroup = mainGroup.querySelector(`g[id="${selectedGroupId}"]`);
                        if (selectedGroup != null) {
                            clonedMainGroup.appendChild(selectedGroup.cloneNode(true));
                        }
                    } else {
                        const flattened = this.flattenToLevel(mainGroup, this.currentDrillLevel, 0, null);
                        flattened.forEach((item) => {
                            clonedMainGroup.appendChild(item);
                        });
                    }
                    }
                    
                    results.push(clonedMainGroup);
                }
                
                return results;
        },

        // ==========================================
        // REGION INTERACTIVITY
        // ==========================================
        setupInteractivity() {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return;
            }
            
            // Query for paths, polygons, polylines, rects, and groups
            const pathElements = svg.querySelectorAll('path, polygon, polyline, rect, g');
            
            if (pathElements.length === 0) {
                return;
            }
            
            pathElements.forEach((element, elementIndex) => {
                // Use the same region code detection logic as updateRegionStyles
                const regionId = this.getRegionCodeFromPath(element) || `region-${elementIndex}`;
                
                // Set pointer events
                element.style.pointerEvents = 'auto';
                
                // Set cursor based on drill-down capability
                if (this.enableDrillDown) {
                    const isGroup = element.tagName === 'g';
                    const isRegion = this.isLeafRegion(element);
                    
                    // Check if region is within a level group (when start level > 0)
                    const isRegionInLevelGroup = isRegion && 
                        this.currentDrillLevel === 0 && 
                        this.drillDownStartLevel > 0 &&
                        element.getAttribute('data-level-group-id') != null;
                    
                    // Make groups and regions clickable when drill-down is enabled
                    element.style.cursor = 'pointer';
                    
                    // For groups, ensure they can receive clicks even when children are present
                    if (isGroup) {
                        // Groups should capture pointer events
                        element.style.pointerEvents = 'auto';
                    } else if (isRegion) {
                        // Regions should also be clickable, but we'll check parent in handler
                        element.style.pointerEvents = 'auto';
                    }
                } else {
                    element.style.cursor = 'pointer';
                }
                
                // NO GLOBAL TRANSITIONS - transitions are added per-element only on hover
                // Setting transition here causes ALL paths to animate together
                
                // Keep stroke width constant during zoom
                if (element.tagName === 'path' || element.tagName === 'polygon' || element.tagName === 'polyline' || element.tagName === 'rect') {
                    element.setAttribute('vector-effect', 'non-scaling-stroke');
                    // Set transform properties for scale hover effect
                    element.style.transformOrigin = 'center';
                    element.style.transformBox = 'fill-box';
                }
                
                // Store original styles
                element.dataset.originalFill = element.style.fill || '#3b82f6';
                element.dataset.originalOpacity = element.style.fillOpacity || '0.7';
                
                // ONLY attach hover effects to leaf elements (path, polygon, polyline, rect)
                // Skip group elements to prevent event bubbling and whole-map effects
                const isLeafElement = element.tagName === 'path' || element.tagName === 'polygon' || 
                                     element.tagName === 'polyline' || element.tagName === 'rect';
                
                if (isLeafElement) {
                    // Hover effects (only for leaf elements)
                    element.addEventListener('mouseenter', (e) => {
                        e.stopPropagation(); // Prevent event bubbling to parent groups
                        const { target, clientX, clientY } = e;
                        const { style: targetStyle } = target;
                        
                        // Store current styles if not already stored
                        if (target.dataset.hoverActive == null) {
                            target.dataset.hoverActive = 'true';
                            target.dataset.hoverOriginalStrokeWidth = targetStyle.strokeWidth || '1px';
                            target.dataset.hoverOriginalFilter = targetStyle.filter || 'none';
                            // Only store transform if it exists and is not 'none'
                            if (targetStyle.transform && targetStyle.transform !== 'none') {
                                target.dataset.hoverOriginalTransform = targetStyle.transform;
                            }
                        }
                        
                        // Add transitions ONLY to this specific element
                        targetStyle.transition = 'fill-opacity 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease, transform 0.2s ease';
                        
                        const isDarkTheme = this.theme === 'dark';
                        const hoverMode = this.hoverBehavior;
                        
                        // Apply hover effects based on hoverBehavior setting
                        if (hoverMode === 'color' || hoverMode === 'both') {
                            // Color/border changes
                            targetStyle.fillOpacity = '0.9';
                            targetStyle.strokeWidth = '2px';
                            
                            // Theme-specific filter effects
                            targetStyle.filter = isDarkTheme 
                                ? 'drop-shadow(0 0 4px #00ffff) drop-shadow(0 0 8px #00ffff)' 
                                : 'brightness(1.1)';
                        }
                        
                        if (hoverMode === 'scale' || hoverMode === 'both') {
                            // Scale/enlarge effect
                            targetStyle.transform = 'scale(1.05)';
                            targetStyle.transformOrigin = 'center';
                            targetStyle.transformBox = 'fill-box';
                            
                            // For scale-only mode, add subtle shadow for depth
                            if (hoverMode === 'scale') {
                                targetStyle.filter = isDarkTheme
                                    ? 'drop-shadow(0 2px 4px rgba(0, 255, 255, 0.3))'
                                    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
                                targetStyle.strokeWidth = '2px';
                            }
                        }
                        
                        // Check if we should show parent level info
                        const { parentGroupId } = target.dataset;
                        if (parentGroupId != null && this.enableDrillDown && this.currentDrillLevel === 0) {
                            // Show parent level tooltip
                            const parentValue = target.dataset.parentValue ? Number(target.dataset.parentValue) : null;
                            this.showParentLevelTooltip(parentGroupId, parentValue, clientX, clientY, target.style.fill);
                        } else {
                            // Show regular tooltip
                            this.showTooltip(regionId, clientX, clientY, target.style.fill);
                        }
                    });
                    
                    element.addEventListener('mousemove', (e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        // Update tooltip position as mouse moves
                        if (this.tooltip.visible) {
                            this.tooltip.x = e.clientX;
                            this.tooltip.y = e.clientY;
                        }
                    });
                    
                    element.addEventListener('mouseleave', (e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        const { target } = e;
                        const { dataset, style: targetStyle } = target;
                        
                        // Restore original styles (ONLY hover-specific properties, NOT fill color!)
                        const originalOpacity = dataset.originalOpacity || '0.7';
                        const originalStrokeWidth = dataset.hoverOriginalStrokeWidth || '1px';
                        const originalFilter = dataset.hoverOriginalFilter || 'none';
                        
                        targetStyle.fillOpacity = originalOpacity;
                        targetStyle.strokeWidth = originalStrokeWidth;
                        targetStyle.filter = originalFilter;
                        
                        // Reset transform only if it was changed (scale mode)
                        if (dataset.hoverOriginalTransform != null) {
                            const originalTransform = dataset.hoverOriginalTransform;
                            if (originalTransform === 'none' || originalTransform === '') {
                                targetStyle.removeProperty('transform');
                            } else {
                                targetStyle.transform = originalTransform;
                            }
                        }
                        
                        // Remove transition after animation completes to avoid side effects
                        setTimeout(() => {
                            targetStyle.removeProperty('transition');
                        }, 200); // Match transition duration
                        
                        // Clear hover flag
                        delete target.dataset.hoverActive;
                        
                        // Hide tooltip
                        this.hideTooltip();
                    });
                } // End of isLeafElement block - hover handlers only on leaf elements
                
                // Click handler (for ALL elements - both leaf and groups)
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (this.enableDrillDown) {
                        // Find the actual clicked element (might be a child)
                        const targetElement = e.target;
                        
                        // If clicking on a region (path/polygon/polyline), find parent group to drill into
                        if (this.isLeafRegion(targetElement)) {
                            // Find parent group
                            let parent = targetElement.parentElement;
                            while (parent != null && parent.tagName !== 'g' && parent !== svg && parent !== svg.parentElement) {
                                parent = parent.parentElement;
                            }
                            
                            // If parent is a group, try to drill into parent instead
                            if (parent != null && parent.tagName === 'g' && parent !== svg) {
                                // Check if parent group has drillable children (other groups or multiple regions)
                                const childGroups = Array.from(parent.childNodes).filter(
                                    child => child.nodeType === Node.ELEMENT_NODE && child.tagName === 'g'
                                );
                                const childRegions = Array.from(parent.childNodes).filter(
                                    child => child.nodeType === Node.ELEMENT_NODE && this.isLeafRegion(child)
                                );
                                
                                // Drill into parent if it has multiple children or contains groups
                                if ((childGroups.length > 0 || childRegions.length > 1) && this.currentDrillLevel === 0) {
                                    // Drill into parent group instead
                                    this.handleDrillDownClick(parent, parent.id || `parent-${Date.now()}`);
                                    return;
                                }
                            }
                        }
                        
                        // Use the element we set up (might be group or region)
                        this.handleDrillDownClick(element, regionId);
                    } else {
                        this.$emit('region-click', regionId);
                    }
                });
            });
        },
        
        showTooltip(regionCode, x, y, color) {
            const regionValue = this.data[regionCode];
            const hasData = regionValue != null;
            
            // Get region name from data or use code
            const regionName = this.getRegionName(regionCode);
            // Calculate text color based on actual tooltip background using YIQ
            // Tooltip uses glassmorphism with these backgrounds:
            const isDark = this.currentTheme === 'dark';
            // Extract the dominant color from the gradient backgrounds
            const tooltipBgColor = isDark 
                ? '#111827'  // rgba(17, 24, 39, 0.85) -> approximate to solid
                : '#ffffff'; // rgba(255, 255, 255, 0.85) -> approximate to solid
            
            const textColor = this.getContrastColor(tooltipBgColor);
            
            // Check if multiple metrics should be shown in tooltip
            const metrics = [];
            if (this.tooltipMetrics && this.tooltipMetrics.length > 0) {
                // Calculate and format each metric for this region
                const regionMetrics = this.getRegionMetricsForTooltip(regionCode);
                
                this.tooltipMetrics.forEach(metricName => {
                    const metricValue = regionMetrics[metricName];
                    const hasMetricData = metricValue != null;
                    const metricConfig = this.metricSettings[metricName] || {};
                    const metricLabel = metricConfig.label || metricName;
                    
                    const formattedValue = hasMetricData 
                        ? this.formatMetricValue(metricValue, metricConfig)
                        : 'Нет данных';
                    
                    metrics.push({
                        name: metricName,
                        label: metricLabel,
                        formattedValue
                    });
                });
            }
            
            // Fallback to old single-value display if no tooltip metrics configured
            const formattedValue = hasData 
                ? this.formatValue(regionValue)
                : 'Нет данных';
            
            this.tooltip = {
                visible: true,
                x,
                y,
                regionName,
                formattedValue,
                metricLabel: hasData ? 'Значение' : '',
                textColor,  // YIQ-calculated text color
                metrics
            };
        },
        
        showParentLevelTooltip(parentGroupId, parentValue, x, y, color) {
            const contentGroup = this.$refs.svgContentGroup;
            if (contentGroup == null) {
                return;
            }
            
            // Find the parent group element
            const parentGroup = contentGroup.querySelector(`g[id="${parentGroupId}"]`);
            if (parentGroup == null) {
                return;
            }
            
            // Get parent group name
            const parentGroupName = this.getGroupName(parentGroup);
            
            const hasData = parentValue != null;
            
            // Calculate text color
            const isDark = this.currentTheme === 'dark';
            const tooltipBgColor = isDark 
                ? '#111827'
                : '#ffffff';
            
            const textColor = this.getContrastColor(tooltipBgColor);
            
            // For parent level tooltips, calculate aggregated metrics for all child regions
            const metrics = [];
            if (this.tooltipMetrics && this.tooltipMetrics.length > 0) {
                // Get all child region codes under this parent group
                const childRegionCodes = this.getChildRegionCodes(parentGroupId);
                // Aggregate metrics for all child regions
                this.tooltipMetrics.forEach(metricName => {
                    const metricConfig = this.metricSettings[metricName] || {};
                    const aggregationMethod = metricConfig.aggregationMethod || this.aggregationMethod || 'sum';
                    const metricLabel = metricConfig.label || metricName;
                    // Collect values from all child regions
                    const allValues = [];
                    childRegionCodes.forEach(regionCode => {
                        if (this.regionDataWithMetrics && this.regionDataWithMetrics.length > 0) {
                            const regionRecords = this.regionDataWithMetrics.filter(record => {
                                return record.regionCode === regionCode;
                            });
                            
                            regionRecords.forEach(record => {
                                if (record.originalRow != null && record.originalRow[metricName] != null) {
                                    const value = Number(record.originalRow[metricName]);
                                    if (!isNaN(value)) {
                                        allValues.push(value);
                                    }
                                }
                            });
                        }
                    });
                    let aggregatedValue = null;
                    if (allValues.length > 0) {
                        switch (aggregationMethod) {
                            case 'sum':
                                aggregatedValue = allValues.reduce((sum, val) => sum + val, 0);
                                break;
                            case 'average':
                                aggregatedValue = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
                                break;
                            case 'min':
                                aggregatedValue = Math.min(...allValues);
                                break;
                            case 'max':
                                aggregatedValue = Math.max(...allValues);
                                break;
                            case 'count':
                                aggregatedValue = allValues.length;
                                break;
                            default:
                                aggregatedValue = allValues.reduce((sum, val) => sum + val, 0);
                        }
                    }
                    
                    const formattedValue = aggregatedValue != null 
                        ? this.formatMetricValue(aggregatedValue, metricConfig)
                        : 'Нет данных';
                    
                    metrics.push({
                        name: metricName,
                        label: metricLabel,
                        formattedValue
                    });
                });
            }
            
            const formattedValue = hasData 
                ? this.formatValue(parentValue)
                : 'Нет данных';
            
            // Use Vue.set for reactivity
            this.$set(this.tooltip, 'visible', true);
            this.$set(this.tooltip, 'x', x);
            this.$set(this.tooltip, 'y', y);
            this.$set(this.tooltip, 'regionName', parentGroupName);
            this.$set(this.tooltip, 'formattedValue', formattedValue);
            this.$set(this.tooltip, 'metricLabel', hasData ? 'Значение' : '');
            this.$set(this.tooltip, 'textColor', textColor);
            this.$set(this.tooltip, 'metrics', metrics);
        },
        
        hideTooltip() {
            this.tooltip.visible = false;
        },
        
        getRegionName(regionCode) {
            // If useMapNameForHover is enabled, ONLY use names from SVG map, never fall back to dataset
            if (this.useMapNameForHover === true) {
                const svgElement = this.svgElementsCache.get(regionCode);
                if (svgElement != null) {
                    // Helper function to extract desc from an element
                    const getDescFromElement = (element) => {
                        // Try desc attribute first
                        const descAttr = element.getAttribute('desc');
                        if (descAttr != null && descAttr.trim() !== '') {
                            return descAttr.trim();
                        }
                        
                        // Try desc element
                        const descElement = element.querySelector('desc');
                        if (descElement != null && descElement.textContent != null && descElement.textContent.trim() !== '') {
                            return descElement.textContent.trim();
                        }
                        
                        return null;
                    };
                    
                    // Helper function to extract title from an element
                    const getTitleFromElement = (element) => {
                        // Try title attribute as fallback (skip generic "Untitled" titles)
                        const titleAttr = element.getAttribute('title');
                        if (titleAttr != null && titleAttr.trim() !== '' && titleAttr.trim().toLowerCase().startsWith('untitled') === false) {
                            return titleAttr.trim();
                        }
                        
                        // Try title element as fallback (skip generic "Untitled" titles)
                        const titleElement = element.querySelector('title');
                        if (titleElement != null && titleElement.textContent != null && titleElement.textContent.trim() !== '') {
                            const titleText = titleElement.textContent.trim();
                            if (titleText.toLowerCase().startsWith('untitled') === false) {
                                return titleText;
                            }
                        }
                        
                        return null;
                    };
                    
                    // First, try to get desc from the cached element itself
                    let desc = getDescFromElement(svgElement);
                    if (desc != null) {
                        return desc;
                    }
                    
                    // If not found and element is not a group, check parent group
                    // (for ru_matrix.svg, desc is in parent <g> element, not in <rect>)
                    if (svgElement.tagName !== 'g' && svgElement.parentElement != null) {
                        const parentGroup = svgElement.parentElement;
                        if (parentGroup.tagName === 'g') {
                            desc = getDescFromElement(parentGroup);
                            if (desc != null) {
                                return desc;
                            }
                        }
                    }
                    
                    // Try title from cached element
                    let title = getTitleFromElement(svgElement);
                    if (title != null) {
                        return title;
                    }
                    
                    // Try title from parent group if element is not a group
                    if (svgElement.tagName !== 'g' && svgElement.parentElement != null) {
                        const parentGroup = svgElement.parentElement;
                        if (parentGroup.tagName === 'g') {
                            title = getTitleFromElement(parentGroup);
                            if (title != null) {
                                return title;
                            }
                        }
                    }
                }
                
                // If useMapNameForHover is enabled but no SVG name found, return region code
                // Do NOT fall back to dataset names
                return regionCode;
            }
            
            // If useMapNameForHover is disabled, use dataset names if available
            if (this.regionNameField != null && this.regionData != null && this.regionData.length > 0) {
                // The data has been transformed and original row is stored in originalRow
                const record = this.regionData.find(row => row.regionCode === regionCode);
                
                if (record != null) {
                    // Try to get name from original row (where user's custom field names exist)
                    if (record.originalRow != null && record.originalRow[this.regionNameField] != null) {
                        return record.originalRow[this.regionNameField];
                    }
                    // Fallback: try on transformed record (in case field name matches)
                    if (record[this.regionNameField] != null) {
                        return record[this.regionNameField];
                    }
                }
            }
            
            // No fallback - return region code as-is if no name found
            return regionCode;
        },
        
        formatValue(value) {
            if (value == null) {
                return 'Нет данных';
            }
            
            // Format number with spaces as thousands separator
            return new Intl.NumberFormat('ru-RU').format(value);
        },
        
        formatMetricValue(value, metricConfig) {
            if (value == null) {
                return 'Нет данных';
            }
            
            // Get format settings
            const numberFormat = metricConfig.numberFormat || '0';
            const separator = metricConfig.separator || '1';
            const prefix = metricConfig.prefix || '';
            const postfix = metricConfig.postfix || '';
            
            // Determine decimal places
            let decimals = 0;
            if (numberFormat === '0.0') {
                decimals = 1;
            } else if (numberFormat === '0.00') {
                decimals = 2;
            } else if (numberFormat === '0.000') {
                decimals = 3;
            }
            
            // Format the number
            let formattedValue;
            if (separator === '1') {
                // Space separator (default)
                formattedValue = new Intl.NumberFormat('ru-RU', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(value);
            } else if (separator === '2') {
                // Comma separator
                formattedValue = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(value);
            } else {
                // No separator
                formattedValue = Number(value).toFixed(decimals);
            }
            
            return `${prefix}${formattedValue}${postfix}`;
        },
        
        getRegionMetricsForTooltip(regionCode) {
            const metrics = {};
            
            if (!this.regionDataWithMetrics || this.regionDataWithMetrics.length === 0) {
                return metrics;
            }
            
            // Filter data for this region - regionCode is already a property in transformed data
            const regionRecords = this.regionDataWithMetrics.filter(record => {
                return record.regionCode === regionCode;
            });
            
            if (regionRecords.length === 0) {
                return metrics;
            }
            
            // Aggregate each tooltip metric
            this.tooltipMetrics.forEach(metricName => {
                const metricConfig = this.metricSettings[metricName] || {};
                const aggregationMethod = metricConfig.aggregationMethod || this.aggregationMethod || 'sum';
                
                // Extract values for this metric from originalRow where the raw data is stored
                const values = regionRecords
                    .filter(record => record.originalRow != null)
                    .map(record => record.originalRow[metricName])
                    .filter(val => val != null && !isNaN(val))
                    .map(val => Number(val));
                
                if (values.length === 0) {
                    metrics[metricName] = null;
                    return;
                }
                
                // Calculate aggregated value
                let aggregatedValue;
                switch (aggregationMethod) {
                    case 'sum':
                        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
                        break;
                    case 'average':
                        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                        break;
                    case 'min':
                        aggregatedValue = Math.min(...values);
                        break;
                    case 'max':
                        aggregatedValue = Math.max(...values);
                        break;
                    case 'count':
                        aggregatedValue = values.length;
                        break;
                    default:
                        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
                }
                
                metrics[metricName] = aggregatedValue;
            });
            
            return metrics;
        },
        
        getChildRegionCodes(parentGroupId) {
            // Get all region codes that belong to this parent group
            const regionCodes = [];
            // Try to find the parent group in the original SVG element
            if (this.originalSvgElement != null) {
                const parentGroup = this.originalSvgElement.querySelector(`g[id="${parentGroupId}"]`);
                
                if (parentGroup != null) {
                    // Recursively find all leaf regions under this group
                    const findLeafRegions = (element) => {
                        Array.from(element.childNodes).forEach(child => {
                            if (this.isLeafRegion(child)) {
                                const regionCode = this.getRegionCodeFromPath(child);
                                if (regionCode != null && !regionCodes.includes(regionCode)) {
                                    regionCodes.push(regionCode);
                                }
                            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'g') {
                                findLeafRegions(child);
                            }
                        });
                    };
                    
                    findLeafRegions(parentGroup);
                }
            }
            
            // Fallback: check for elements with data-level-group-id attribute in rendered content
            if (regionCodes.length === 0) {
                const contentGroup = this.$refs.svgContentGroup;
                if (contentGroup != null) {
                    const childElements = contentGroup.querySelectorAll(`[data-level-group-id="${parentGroupId}"]`);
                    
                    childElements.forEach(element => {
                        const regionCode = this.getRegionCodeFromPath(element);
                        if (regionCode != null && !regionCodes.includes(regionCode)) {
                            regionCodes.push(regionCode);
                        }
                    });
                }
            }
            return regionCodes;
        },
        
        getContrastColor(hexColor) {
            if (hexColor == null) {
                return '#000000'; // Default to black for safety
            }
            
            // Convert hex to RGB
            let hex = hexColor.replace('#', '');
            
            // Handle short hex format (#fff -> #ffffff)
            if (hex.length === HEX_SHORT_LENGTH) {
                hex = hex.split('').map(char => char + char).join('');
            }
            
            const redValue = parseInt(hex.substring(HEX_RED_START, HEX_RED_END), HEX_BASE);
            const greenValue = parseInt(hex.substring(HEX_GREEN_START, HEX_GREEN_END), HEX_BASE);
            const blueValue = parseInt(hex.substring(HEX_BLUE_START, HEX_BLUE_END), HEX_BASE);
            
            // YIQ formula for perceived brightness
            // Weights based on human eye sensitivity: Red=299, Green=587, Blue=114
            const yiq = ((redValue * YIQ_RED_WEIGHT) + (greenValue * YIQ_GREEN_WEIGHT) + (blueValue * YIQ_BLUE_WEIGHT)) / YIQ_DIVISOR;
            
            // Return black or white based on YIQ value
            // Threshold: 128 (middle of 0-255 range)
            // yiq >= 128 = light background → use black text
            // yiq < 128 = dark background → use white text
            return yiq >= YIQ_THRESHOLD ? '#000000' : '#ffffff';
        },
        
        /**
         * Calculate border color based on border appearance mode
         * @param {string} fillColor - The fill color of the region
         * @param {string} mode - Border appearance mode: 'theme', 'colored', 'neon'
         * @returns {Object} - Object with stroke color and additional CSS properties
         */
        getBorderStyle(fillColor, mode) {
            // If custom border is enabled, use custom settings
            if (this.enableCustomBorder === true) {
                return {
                    stroke: this.customBorderColor || '#000000',
                    strokeWidth: `${this.customBorderThickness || 1}px`,
                    filter: 'none'
                };
            }
            
            const isDark = this.currentTheme === 'dark';
            const isBlue = this.currentTheme === 'blue';
            
            // Blue theme: use bright light blue border (matches image)
            // Dark theme: use neon cyan/blue border for neon effect
            // Light theme: use light border
            let defaultThemeStroke;
            if (isBlue) {
                defaultThemeStroke = '#93c5fd'; // Bright light blue border for blue theme (matches image)
            } else if (isDark) {
                defaultThemeStroke = '#00ffff'; // Neon cyan border for dark theme
            } else {
                defaultThemeStroke = '#cbd5e1'; // Light theme border color
            }
            
            if (mode === 'theme') {
                return {
                    stroke: defaultThemeStroke,
                    strokeWidth: '0.5px', // Match image border thickness
                    filter: 'none'
                };
            }
            
            if (mode === 'colored') {
                // Use fill color with tint (darker version for border)
                const tintedColor = this.darkenColor(fillColor, COLOR_DARKEN_AMOUNT);
                return {
                    stroke: tintedColor,
                    strokeWidth: '1px',
                    filter: 'none'
                };
            }
            
            if (mode === 'neon') {
                // Neon glow effect - use neon colors based on theme
                let neonColor;
                if (isBlue) {
                    neonColor = '#93c5fd'; // Bright light blue for blue theme
                } else if (isDark) {
                    // For dark theme, use neon cyan/blue for borders
                    neonColor = '#00ffff'; // Neon cyan
                } else {
                    neonColor = fillColor; // Use fill color for light theme
                }
                const filterId = `neon-glow-${neonColor.replace('#', '')}`;
                this.createNeonBorderFilter(filterId, neonColor);
                return {
                    stroke: neonColor,
                    strokeWidth: '0.5px', // Match image border thickness
                    filter: `url(#${filterId})`,
                    strokeOpacity: '1'
                };
            }
            
            // Fallback to theme
            return {
                stroke: defaultThemeStroke,
                strokeWidth: '0.5px',
                filter: 'none'
            };
        },
        
        /**
         * Create a simple neon glow filter for borders
         * Uses a straightforward approach: blur the stroke and merge with original
         * @param {string} filterId - Unique filter ID
         * @param {string} glowColor - Color for the glow effect
         */
        createNeonBorderFilter(filterId, glowColor) {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return;
            }
            
            // Check if filter already exists
            const existingFilter = svg.querySelector(`#${filterId}`);
            if (existingFilter != null) {
                return; // Filter already exists
            }
            
            const defs = svg.querySelector('defs');
            if (defs == null) {
                return;
            }
            
            // Create simple neon glow filter
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', filterId);
            filter.setAttribute('x', '-100%');
            filter.setAttribute('y', '-100%');
            filter.setAttribute('width', '300%');
            filter.setAttribute('height', '300%');
            filter.setAttribute('color-interpolation-filters', 'sRGB');
            
            // Step 1: Extract stroke from source alpha
            const strokeExtract = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
            strokeExtract.setAttribute('operator', 'erode');
            strokeExtract.setAttribute('radius', '0.5');
            strokeExtract.setAttribute('in', 'SourceAlpha');
            strokeExtract.setAttribute('result', 'eroded');
            
            const strokeOnly = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
            strokeOnly.setAttribute('in', 'SourceAlpha');
            strokeOnly.setAttribute('in2', 'eroded');
            strokeOnly.setAttribute('operator', 'arithmetic');
            strokeOnly.setAttribute('k1', '1');
            strokeOnly.setAttribute('k2', '-1');
            strokeOnly.setAttribute('k3', '0');
            strokeOnly.setAttribute('k4', '0');
            strokeOnly.setAttribute('result', 'strokeMask');
            
            // Step 2: Dilate and blur for glow
            const dilate = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
            dilate.setAttribute('operator', 'dilate');
            // Enhanced glow for dark theme - larger radius for neon effect
            const isDark = this.currentTheme === 'dark';
            dilate.setAttribute('radius', isDark ? '3' : '2');
            dilate.setAttribute('in', 'strokeMask');
            dilate.setAttribute('result', 'dilated');
            
            const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            // Stronger blur for dark theme neon effect
            blur.setAttribute('stdDeviation', isDark ? '4' : '3');
            blur.setAttribute('in', 'dilated');
            blur.setAttribute('result', 'blurred');
            
            // Step 3: Color the glow
            const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
            flood.setAttribute('flood-color', glowColor);
            // Brighter opacity for dark theme neon effect (isDark already declared above)
            flood.setAttribute('flood-opacity', isDark ? '1' : '0.9');
            flood.setAttribute('result', 'glowColor');
            
            const colorize = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
            colorize.setAttribute('in', 'glowColor');
            colorize.setAttribute('in2', 'blurred');
            colorize.setAttribute('operator', 'in');
            colorize.setAttribute('result', 'coloredGlow');
            
            // Step 4: Merge glow behind original
            const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
            const mergeGlow = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            mergeGlow.setAttribute('in', 'coloredGlow');
            const mergeSource = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
            mergeSource.setAttribute('in', 'SourceGraphic');
            
            merge.appendChild(mergeGlow);
            merge.appendChild(mergeSource);
            
            filter.appendChild(strokeExtract);
            filter.appendChild(strokeOnly);
            filter.appendChild(dilate);
            filter.appendChild(blur);
            filter.appendChild(flood);
            filter.appendChild(colorize);
            filter.appendChild(merge);
            
            defs.appendChild(filter);
        },
        
        /**
         * Create a gradient fill for blue theme regions
         * @param {string} baseColor - Base color for the gradient
         * @param {string} regionCode - Region code for unique gradient ID
         * @returns {string} - Gradient ID
         */
        createGradientFill(baseColor, regionCode) {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return baseColor;
            }
            
            const gradientId = `gradient-${regionCode}-${baseColor.replace('#', '')}`;
            
            // Check if gradient already exists
            const existingGradient = svg.querySelector(`#${gradientId}`);
            if (existingGradient != null) {
                return gradientId;
            }
            
            const defs = svg.querySelector('defs');
            if (defs == null) {
                return baseColor;
            }
            
            // Create linear gradient: lighter at top, darker at bottom
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '0%');
            gradient.setAttribute('y2', '100%');
            
            // Lighten the base color for gradient start
            const lightColor = this.lightenColor(baseColor, COLOR_LIGHTEN_AMOUNT);
            // Darken the base color for gradient end
            const darkColor = this.darkenColor(baseColor, COLOR_LIGHTEN_AMOUNT);
            
            const stopStart = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopStart.setAttribute('offset', '0%');
            stopStart.setAttribute('stop-color', lightColor);
            stopStart.setAttribute('stop-opacity', '1');
            
            const stopEnd = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopEnd.setAttribute('offset', '100%');
            stopEnd.setAttribute('stop-color', darkColor);
            stopEnd.setAttribute('stop-opacity', '1');
            
            gradient.appendChild(stopStart);
            gradient.appendChild(stopEnd);
            defs.appendChild(gradient);
            
            return gradientId;
        },
        
        /**
         * Lighten a hex color by a percentage
         * @param {string} hexColor - Hex color string
         * @param {number} amount - Amount to lighten (0-1)
         * @returns {string} - Lightened hex color
         */
        lightenColor(hexColor, amount) {
            if (hexColor == null || hexColor.startsWith('#') === false) {
                return hexColor;
            }
            
            let hexStr = hexColor.replace('#', '');
            
            // Handle short hex format (#fff -> #ffffff)
            if (hexStr.length === HEX_SHORT_LENGTH) {
                hexStr = hexStr.split('').map(char => `${char}${char}`).join('');
            }
            
            const redValue = parseInt(hexStr.substring(HEX_RED_START, HEX_RED_END), HEX_BASE);
            const greenValue = parseInt(hexStr.substring(HEX_GREEN_START, HEX_GREEN_END), HEX_BASE);
            const blueValue = parseInt(hexStr.substring(HEX_BLUE_START, HEX_BLUE_END), HEX_BASE);
            
            // Lighten each component (move toward white)
            const newRed = Math.min(MAX_RGB_VALUE, Math.floor(redValue + (MAX_RGB_VALUE - redValue) * amount));
            const newGreen = Math.min(MAX_RGB_VALUE, Math.floor(greenValue + (MAX_RGB_VALUE - greenValue) * amount));
            const newBlue = Math.min(MAX_RGB_VALUE, Math.floor(blueValue + (MAX_RGB_VALUE - blueValue) * amount));
            
            // Convert back to hex
            const toHex = (value) => {
                const hex = value.toString(HEX_BASE);
                return hex.length === 1 ? `0${hex}` : hex;
            };
            
            return `#${toHex(newRed)}${toHex(newGreen)}${toHex(newBlue)}`;
        },
        
        /**
         * Darken a hex color by a percentage
         * @param {string} hexColor - Hex color string
         * @param {number} amount - Amount to darken (0-1)
         * @returns {string} - Darkened hex color
         */
        darkenColor(hexColor, amount) {
            if (hexColor == null || hexColor.startsWith('#') === false) {
                return hexColor;
            }
            
            let hexStr = hexColor.replace('#', '');
            
            // Handle short hex format (#fff -> #ffffff)
            if (hexStr.length === HEX_SHORT_LENGTH) {
                hexStr = hexStr.split('').map(char => `${char}${char}`).join('');
            }
            
            const redValue = parseInt(hexStr.substring(HEX_RED_START, HEX_RED_END), HEX_BASE);
            const greenValue = parseInt(hexStr.substring(HEX_GREEN_START, HEX_GREEN_END), HEX_BASE);
            const blueValue = parseInt(hexStr.substring(HEX_BLUE_START, HEX_BLUE_END), HEX_BASE);
            
            // Darken each component
            const newRed = Math.max(0, Math.floor(redValue * (1 - amount)));
            const newGreen = Math.max(0, Math.floor(greenValue * (1 - amount)));
            const newBlue = Math.max(0, Math.floor(blueValue * (1 - amount)));
            
            // Convert back to hex
            const toHex = (value) => {
                const hex = value.toString(HEX_BASE);
                return hex.length === 1 ? `0${hex}` : hex;
            };
            
            return `#${toHex(newRed)}${toHex(newGreen)}${toHex(newBlue)}`;
        },
        
        getColorFromPalette(ratio) {
            // Get the selected color palette
            const palette = ColorPalettesLocal[this.colorScheme] || ColorPalettesLocal.Blues;
            
            // Calculate which color to use based on ratio (0-1)
            const index = Math.min(
                Math.floor(ratio * palette.length),
                palette.length - 1
            );
            
            return palette[index];
        },
        
        getRegionCodeFromPath(path) {
            const idField = this.svgIdField || 'auto';
            const MAX_COUNTRY_CODE_LENGTH = 3;
            
            // If specific field is selected, use it directly
            if (idField === 'id') {
                const id = path.getAttribute('id') || path.id;
                return id;
            }
            
            if (idField === 'title') {
                const title = path.getAttribute('title');
                if (title != null) {
                    // Check if title is a generic country code (like "RU") - if so, fall back to id
                    const isGenericCountryCode = /^[A-Z]{2,3}$/.test(title) && title.length <= MAX_COUNTRY_CODE_LENGTH;
                    if (isGenericCountryCode) {
                        // Fall back to id if title is just a country code
                        const id = path.getAttribute('id') || path.id;
                        if (id != null && id !== '') {
                            return id;
                        }
                    }
                    return title;
                }
                // Check title element
                const titleElement = path.querySelector('title');
                if (titleElement != null && titleElement.textContent != null) {
                    const titleText = titleElement.textContent.trim();
                    // Check if title element is a generic country code
                    const isGenericCountryCode = /^[A-Z]{2,3}$/.test(titleText) && titleText.length <= MAX_COUNTRY_CODE_LENGTH;
                    if (isGenericCountryCode) {
                        // Fall back to id if title is just a country code
                        const id = path.getAttribute('id') || path.id;
                        if (id != null && id !== '') {
                            return id;
                        }
                    }
                    return titleText;
                }
            }
            
            if (idField === 'desc') {
                const desc = path.getAttribute('desc');
                if (desc != null) {
                    return desc;
                }
                // Check desc element
                const descElement = path.querySelector('desc');
                if (descElement != null && descElement.textContent != null) {
                    const descText = descElement.textContent.trim();
                    return descText;
                }
            }
            
            // Auto mode: collect all possible region codes and try matching against data
            if (idField === 'auto') {
                // Collect all possible region codes from all fields
                const allPossibleCodes = [];
                
                // 1. id attribute
                const id = path.getAttribute('id') || path.id;
                if (id != null && id !== '') {
                    allPossibleCodes.push({ code: id, source: 'id' });
                }
                
                // 2. title attribute (skip generic country codes)
                const titleAttr = path.getAttribute('title');
                if (titleAttr != null && titleAttr !== '') {
                    const isGenericCountryCode = /^[A-Z]{2,3}$/.test(titleAttr) && titleAttr.length <= MAX_COUNTRY_CODE_LENGTH;
                    if (!isGenericCountryCode) {
                        allPossibleCodes.push({ code: titleAttr, source: 'title-attr' });
                    }
                }
                
                // 3. aria-label attribute
                const ariaLabel = path.getAttribute('aria-label');
                if (ariaLabel != null && ariaLabel !== '') {
                    allPossibleCodes.push({ code: ariaLabel, source: 'aria-label' });
                }
                
                // 4. desc attribute
                const descAttr = path.getAttribute('desc');
                if (descAttr != null && descAttr !== '') {
                    allPossibleCodes.push({ code: descAttr, source: 'desc-attr' });
                }
                
                // 5. data-region attribute
                if (path.dataset != null && path.dataset.region != null) {
                    allPossibleCodes.push({ code: path.dataset.region, source: 'data-region' });
                }
                
                // 6. title element
                const titleElement = path.querySelector('title');
                if (titleElement != null && titleElement.textContent != null) {
                    const titleText = titleElement.textContent.trim();
                    if (titleText !== '') {
                        const isGenericCountryCode = /^[A-Z]{2,3}$/.test(titleText) && titleText.length <= MAX_COUNTRY_CODE_LENGTH;
                        if (!isGenericCountryCode) {
                            allPossibleCodes.push({ code: titleText, source: 'title-element' });
                        }
                    }
                }
                
                // 7. desc element
                const descElement = path.querySelector('desc');
                if (descElement != null && descElement.textContent != null) {
                    const descText = descElement.textContent.trim();
                    if (descText !== '') {
                        allPossibleCodes.push({ code: descText, source: 'desc-element' });
                    }
                }
                
                // 8. Check parent group's id
                let parent = path.parentElement;
                while (parent != null && parent !== this.$refs.svgContentGroup) {
                    const parentId = parent.getAttribute('id') || parent.id;
                    if (parentId != null && parentId !== '') {
                        allPossibleCodes.push({ code: parentId, source: 'parent-id' });
                        break; // Only check first parent
                    }
                    parent = parent.parentElement;
                }
                
                // 9. Check class names
                if (path.className != null && typeof path.className === 'string') {
                    const classNames = path.className.baseVal || path.className;
                    const regionMatch = classNames.match(/RU-[A-Z]{2,3}/);
                    if (regionMatch != null) {
                        allPossibleCodes.push({ code: regionMatch[0], source: 'class' });
                    }
                }
                
                // If we have data, try matching each code against data keys
                if (this.data != null && Object.keys(this.data).length > 0 && allPossibleCodes.length > 0) {
                    const dataKeys = Object.keys(this.data);
                    
                    // Try each code in order of preference
                    for (const { code } of allPossibleCodes) {
                        const normalizedCode = String(code).trim();
                        
                        // Try exact match
                        if (dataKeys.includes(normalizedCode)) {
                            return normalizedCode;
                        }
                        
                        // Try numeric conversion if code is numeric
                        if (/^\d+$/.test(normalizedCode)) {
                            const numCode = Number(normalizedCode);
                            if (dataKeys.includes(String(numCode)) || dataKeys.includes(numCode)) {
                                return normalizedCode;
                            }
                        }
                        
                        // Try matching with leading zeros removed/added
                        if (/^0\d+$/.test(normalizedCode)) {
                            const withoutLeadingZero = normalizedCode.replace(/^0+/, '');
                            if (dataKeys.includes(withoutLeadingZero) || dataKeys.includes(String(Number(withoutLeadingZero)))) {
                                return normalizedCode;
                            }
                        }
                    }
                }
                
                // If no data or no match found, return first code found (prefer id, then title, etc.)
                if (allPossibleCodes.length > 0) {
                    const firstCode = allPossibleCodes[0];
                    return firstCode.code;
                }
            }
            
            return null;
        },
        
        // ─── Region labels ────────────────────────────────────────────────────────

        updateLabels() {
            const lg = this.$refs.labelsGroup;
            if (!lg) return;
            while (lg.firstChild) lg.removeChild(lg.firstChild);
            if (!this.showLabels) return;

            const cg = this.$refs.svgContentGroup;
            if (!cg) return;

            const ns = 'http://www.w3.org/2000/svg';
            for (const el of Array.from(cg.querySelectorAll('path, polygon, polyline, rect'))) {
                const code = this.getRegionCodeFromPath(el);
                if (!code) continue;
                try {
                    const bb = el.getBBox();
                    if (bb.width < 12 || bb.height < 5) continue;
                    const text = document.createElementNS(ns, 'text');
                    text.setAttribute('x', String(bb.x + bb.width / 2));
                    text.setAttribute('y', String(bb.y + bb.height / 2));
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('dominant-baseline', 'middle');
                    text.setAttribute('font-size', '7');
                    text.setAttribute('font-family', "'Inter', system-ui, sans-serif");
                    text.setAttribute('fill', '#1e293b');
                    text.setAttribute('stroke', 'rgba(255,255,255,0.9)');
                    text.setAttribute('stroke-width', '2.5');
                    text.setAttribute('paint-order', 'stroke');
                    text.textContent = code;
                    lg.appendChild(text);
                } catch (e) {
                    // getBBox may fail on invisible elements — skip
                }
            }
        },

        // ─── Geo → SVG projection ─────────────────────────────────────────────────
        // Albers Equal-Area Conic projection fitted to /geo/ru.svg (873×497).
        // Standard parallels 32°N / 54.5°N, central meridian 105°E.

        geoToSvg(lon, lat) {
            const d = Math.PI / 180;
            const phi1 = 32.0 * d, phi2 = 54.5 * d, lam0 = 105.0 * d;
            const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
            const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
            const rho = pr => Math.sqrt(Math.max(0, C - 2 * n * Math.sin(pr))) / n;
            const r = rho(lat * d);
            const theta = n * (lon * d - lam0);
            const xp = r * Math.sin(theta);
            const yp = rho(0) - r * Math.cos(theta);
            return [638.7232 * xp + 495.8526, -640.9956 * yp + 978.5150];
        },

        // ─── Overlay markers ──────────────────────────────────────────────────────

        buildMarkerShape(ns, symbol, cx, cy, r, color) {
            function applyCommon(el) {
                el.setAttribute('fill', color);
                el.setAttribute('stroke', 'rgba(255,255,255,0.9)');
                el.setAttribute('stroke-width', '1.5');
                el.setAttribute('vector-effect', 'non-scaling-stroke');
            }
            switch (symbol) {
                case 'pin': {
                    const path = document.createElementNS(ns, 'path');
                    const pr = r * 1.1;
                    path.setAttribute('d',
                        `M${cx},${cy}` +
                        ` L${cx - pr * 0.62},${cy - pr * 1.5}` +
                        ` A${pr * 0.88},${pr * 0.88} 0 1,1 ${cx + pr * 0.62},${cy - pr * 1.5}` +
                        ' Z');
                    applyCommon(path);
                    return path;
                }
                case 'diamond': {
                    const polygon = document.createElementNS(ns, 'polygon');
                    polygon.setAttribute('points',
                        `${cx},${cy - r * 1.45} ${cx + r},${cy} ${cx},${cy + r * 1.45} ${cx - r},${cy}`);
                    applyCommon(polygon);
                    return polygon;
                }
                case 'triangle': {
                    const polygon = document.createElementNS(ns, 'polygon');
                    polygon.setAttribute('points',
                        `${cx},${cy - r * 1.3} ${cx + r * 1.15},${cy + r * 0.75} ${cx - r * 1.15},${cy + r * 0.75}`);
                    applyCommon(polygon);
                    return polygon;
                }
                case 'arrow': {
                    const path = document.createElementNS(ns, 'path');
                    path.setAttribute('d',
                        `M${cx},${cy - r * 2}` +
                        ` L${cx + r},${cy - r * 0.5}` +
                        ` L${cx + r * 0.45},${cy - r * 0.5}` +
                        ` L${cx + r * 0.45},${cy + r}` +
                        ` L${cx - r * 0.45},${cy + r}` +
                        ` L${cx - r * 0.45},${cy - r * 0.5}` +
                        ` L${cx - r},${cy - r * 0.5}` +
                        ' Z');
                    applyCommon(path);
                    return path;
                }
                default: {
                    const circle = document.createElementNS(ns, 'circle');
                    circle.setAttribute('cx', String(cx));
                    circle.setAttribute('cy', String(cy));
                    circle.setAttribute('r', String(r));
                    applyCommon(circle);
                    return circle;
                }
            }
        },

        updateMarkers() {
            const mg = this.$refs.markersGroup;
            if (!mg) return;
            while (mg.firstChild) mg.removeChild(mg.firstChild);
            if (!this.markers || this.markers.length === 0) return;

            const ns = 'http://www.w3.org/2000/svg';
            const markerR = Math.max(3, (this.markerSize || 10) * 0.55);

            for (const marker of this.markers) {
                if (marker.lat == null || marker.lon == null) continue;
                const [sx, sy] = this.geoToSvg(marker.lon, marker.lat);
                const g = document.createElementNS(ns, 'g');
                g.setAttribute('cursor', 'pointer');
                const shape = this.buildMarkerShape(ns, this.markerSymbol, sx, sy, markerR, this.markerColor);
                g.appendChild(shape);

                g.addEventListener('mouseenter', e => {
                    g.setAttribute('transform', `translate(${sx},${sy}) scale(1.35) translate(${-sx},${-sy})`);
                    if (marker.label) {
                        this.tooltip.visible = true;
                        this.tooltip.regionName = marker.label;
                        this.tooltip.formattedValue = `${Number(marker.lat).toFixed(4)}°N, ${Number(marker.lon).toFixed(4)}°E`;
                        this.tooltip.metricLabel = '';
                        this.tooltip.metrics = [];
                        this.tooltip.x = e.clientX;
                        this.tooltip.y = e.clientY;
                    }
                });
                g.addEventListener('mousemove', e => {
                    this.tooltip.x = e.clientX;
                    this.tooltip.y = e.clientY;
                });
                g.addEventListener('mouseleave', () => {
                    g.removeAttribute('transform');
                    this.tooltip.visible = false;
                });

                mg.appendChild(g);
            }
        },

        updateRegionStyles() {
            const contentGroup = this.$refs.svgContentGroup;
            if (contentGroup == null) {
                return;
            }
            
            // Find ALL paths, polygons, polylines, rects, and groups (SVG uses all these element types)
            const allPaths = contentGroup.querySelectorAll('path, polygon, polyline, rect, g');
            
            // Collect region codes from paths
            const pathRegionCodes = [];
            Array.from(allPaths).forEach((element) => {
                const regionCode = this.getRegionCodeFromPath(element);
                pathRegionCodes.push(regionCode);
            });
            
            if (this.data == null || Object.keys(this.data).length === 0) {
                const isDark = this.currentTheme === 'dark';
                const isBlue = this.currentTheme === 'blue';
                const palette = ColorPalettesLocal[this.colorScheme] || ColorPalettesLocal.Blues;
                const fillColor = palette[0]; // Use lightest color from palette
                const defaultBorderStyle = this.getBorderStyle(fillColor, this.borderAppearance);
                
                allPaths.forEach((path, pathIndex) => {
                    // For blue theme: apply gradient fill
                    if (isBlue) {
                        const gradientId = this.createGradientFill(fillColor, `default-${pathIndex}`);
                        path.style.fill = `url(#${gradientId})`;
                    } else {
                        path.style.fill = fillColor;
                    }
                    path.style.fillOpacity = '0.6';
                    path.style.stroke = defaultBorderStyle.stroke;
                    path.style.strokeWidth = defaultBorderStyle.strokeWidth;
                    path.style.filter = defaultBorderStyle.filter || 'none';
                    if (defaultBorderStyle.strokeOpacity) {
                        path.style.strokeOpacity = defaultBorderStyle.strokeOpacity;
                    }
                    // Keep stroke width constant during zoom
                    if (path.tagName === 'path' || path.tagName === 'polygon' || path.tagName === 'polyline' || path.tagName === 'rect') {
                        path.setAttribute('vector-effect', 'non-scaling-stroke');
                    }
                    
                    // Apply rounding to rect elements if custom border rounding is enabled
                    if (this.enableCustomBorder === true && this.customBorderRounding > 0 && path.tagName === 'rect') {
                        const rounding = this.customBorderRounding;
                        path.setAttribute('rx', String(rounding));
                        path.setAttribute('ry', String(rounding));
                    }
                    
                    path.dataset.originalFill = fillColor;
                    path.dataset.originalOpacity = '0.6';
                });
                return;
            }
            
            // Find root group for level determination
            const rootGroup = contentGroup.querySelector('g[id="ru"]');
            
            // Determine target coloring level dynamically
            // When currentDrillLevel === 0, we color parent level (one level up from visible children)
            // When currentDrillLevel > 0, we color the current level
            let targetColorLevel = null;
            if (this.enableDrillDown && this.currentDrillLevel === 0 && rootGroup != null) {
                // Find the parent level by checking the structure
                // Get first leaf element to determine its parent level
                const firstLeaf = Array.from(allPaths).find(el => this.isLeafRegion(el));
                if (firstLeaf != null) {
                    let parent = firstLeaf.parentElement;
                    while (parent != null && parent !== rootGroup) {
                        if (parent.tagName === 'g' && parent.id != null) {
                            const parentLevel = this.getGroupLevel(parent, rootGroup);
                            targetColorLevel = parentLevel;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                }
            }
            
            // Map to store values by parent group ID
            const parentGroupDataMap = new Map();
            const shouldColorByParent = targetColorLevel != null;
            
            // Helper function to find parent group ID at a specific level
            const findParentGroupId = (element, targetLevel) => {
                if (rootGroup == null || targetLevel == null) {
                    return element.getAttribute('data-level-group-id');
                }
                
                let parentGroup = element.parentElement;
                while (parentGroup != null && parentGroup !== rootGroup) {
                    if (parentGroup.tagName === 'g' && parentGroup.id != null) {
                        const groupLevel = this.getGroupLevel(parentGroup, rootGroup);
                        if (groupLevel === targetLevel) {
                            return parentGroup.id;
                        }
                    }
                    parentGroup = parentGroup.parentElement;
                }
                
                return element.getAttribute('data-level-group-id');
            };
            
            // Helper function to get value from data with various matching strategies
            const getValueFromData = (element, regionCode) => {
                const normalizedCode = String(regionCode).trim();
                let value = this.data[normalizedCode];
                
                if (value == null && /^\d+$/.test(normalizedCode)) {
                    value = this.data[Number(normalizedCode)] || this.data[normalizedCode];
                }
                if (value == null && /^0\d+$/.test(normalizedCode)) {
                    const withoutLeadingZero = normalizedCode.replace(/^0+/, '');
                    value = this.data[withoutLeadingZero] || this.data[Number(withoutLeadingZero)];
                }
                if (value == null && /^\d+$/.test(normalizedCode)) {
                    const titleAttr = element.getAttribute('title');
                    if (titleAttr != null && titleAttr.trim() !== '' && /^RU-[A-Z]+$/.test(titleAttr.trim())) {
                        value = this.data[titleAttr.trim()];
                    }
                }
                if (value == null && /^RU-[A-Z]+$/.test(normalizedCode)) {
                    const idAttr = element.getAttribute('id');
                    if (idAttr != null && idAttr.trim() !== '' && /^\d+$/.test(idAttr.trim())) {
                        value = this.data[idAttr.trim()] || this.data[Number(idAttr.trim())];
                    }
                }
                
                return value;
            };
            
            // Helper function to get direct metric value for a parent group
            const getDirectMetricValue = (parentGroupId, level) => {
                if (this.levelMetricMapping == null || typeof this.levelMetricMapping !== 'object') {
                    return null;
                }
                
                const metricField = this.levelMetricMapping[level];
                if (metricField == null || metricField === '') {
                    return null;
                }
                
                // Try to get value using parent group ID
                const parentData = this.data[parentGroupId];
                if (parentData != null && typeof parentData === 'object') {
                    return parentData[metricField];
                }
                
                return null;
            };
            
            if (shouldColorByParent) {
                // Collect child values by parent group
                allPaths.forEach((element) => {
                    if (!this.isLeafRegion(element)) {
                        return;
                    }
                    
                    const regionCode = this.getRegionCodeFromPath(element);
                    if (regionCode == null) {
                        return;
                    }
                    
                    const childValue = getValueFromData(element, regionCode);
                    const parentGroupId = findParentGroupId(element, targetColorLevel);
                    
                    if (parentGroupId != null && childValue != null) {
                        if (!parentGroupDataMap.has(parentGroupId)) {
                            parentGroupDataMap.set(parentGroupId, []);
                        }
                        parentGroupDataMap.get(parentGroupId).push(childValue);
                    }
                });
                
                // Calculate values for each parent group
                parentGroupDataMap.forEach((childValues, parentGroupId) => {
                    // First check if parent level has direct metric mapping
                    const directValue = getDirectMetricValue(parentGroupId, targetColorLevel);
                    
                    if (directValue != null) {
                        // Use direct metric value
                        parentGroupDataMap.set(parentGroupId, directValue);
                    } else {
                        // Aggregate from direct children
                        let aggregatedValue;
                        switch (this.aggregationMethod) {
                            case 'sum':
                                aggregatedValue = childValues.reduce((sum, val) => sum + val, 0);
                                break;
                            case 'average':
                                aggregatedValue = childValues.reduce((sum, val) => sum + val, 0) / childValues.length;
                                break;
                            case 'min':
                                aggregatedValue = Math.min(...childValues);
                                break;
                            case 'max':
                                aggregatedValue = Math.max(...childValues);
                                break;
                            case 'count':
                                aggregatedValue = childValues.length;
                                break;
                            default:
                                aggregatedValue = childValues.reduce((sum, val) => sum + val, 0);
                        }
                        parentGroupDataMap.set(parentGroupId, aggregatedValue);
                    }
                });
            }
            
            // Get all values to calculate min/max for color scale
            const values = shouldColorByParent 
                ? Array.from(parentGroupDataMap.values())
                : Object.values(this.data);
            
            const minValue = values.length > 0 ? Math.min(...values) : 0;
            const maxValue = values.length > 0 ? Math.max(...values) : 1;
            
            const isDark = this.currentTheme === 'dark';
            const isBlue = this.currentTheme === 'blue';
            
            // Blue theme: use bright light blue border (matches image)
            // Dark theme: use neon cyan border for neon effect
            // Light theme: use light border
            let defaultThemeStroke;
            if (isBlue) {
                defaultThemeStroke = '#93c5fd'; // Bright light blue border for blue theme (matches image)
            } else if (isDark) {
                defaultThemeStroke = '#00ffff'; // Neon cyan border for dark theme
            } else {
                defaultThemeStroke = '#cbd5e1'; // Light theme border color
            }
            
            // Use custom missing data color if provided, otherwise use theme-based default
            let noDataColor;
            if (this.missingDataColor) {
                noDataColor = this.missingDataColor;
            } else if (isBlue) {
                noDataColor = '#1e3a8a'; // Blue theme missing data color
            } else if (isDark) {
                noDataColor = NO_DATA_COLOR_DARK;
            } else {
                noDataColor = NO_DATA_COLOR_LIGHT;
            }
            
            // districtDataMap is already calculated above for min/max calculation
            
            let coloredCount = 0;
            let matchedCount = 0;
            const unmatchedPaths = [];
            
            // Helper function to apply color to an element and store parent info
            const applyColorToElement = (element, fillColor, regionCode, parentGroupId, parentValue, opacity = DEFAULT_REGION_OPACITY) => {
                const borderStyle = this.getBorderStyle(fillColor, this.borderAppearance);
                
                if (isBlue === true) {
                    const gradientId = this.createGradientFill(fillColor, regionCode || 'element');
                    element.style.fill = `url(#${gradientId})`;
                } else {
                    element.style.fill = fillColor;
                }
                element.style.fillOpacity = String(opacity);
                element.style.stroke = borderStyle.stroke;
                element.style.strokeWidth = borderStyle.strokeWidth;
                element.style.filter = borderStyle.filter || 'none';
                if (borderStyle.strokeOpacity) {
                    element.style.strokeOpacity = borderStyle.strokeOpacity;
                }
                // Keep stroke width constant during zoom
                if (element.tagName === 'path' || element.tagName === 'polygon' || element.tagName === 'polyline' || element.tagName === 'rect') {
                    element.setAttribute('vector-effect', 'non-scaling-stroke');
                }
                
                // Apply rounding to rect elements if custom border rounding is enabled
                if (this.enableCustomBorder === true && this.customBorderRounding > 0 && element.tagName === 'rect') {
                    const rounding = this.customBorderRounding;
                    element.setAttribute('rx', String(rounding));
                    element.setAttribute('ry', String(rounding));
                }
                
                element.dataset.originalFill = fillColor;
                element.dataset.originalOpacity = String(opacity);
                
                // Store parent info for hover
                if (parentGroupId != null) {
                    element.dataset.parentGroupId = parentGroupId;
                    if (parentValue != null) {
                        element.dataset.parentValue = String(parentValue);
                    }
                }
            };
            
            allPaths.forEach((element, elementIndex) => {
                const isLeaf = this.isLeafRegion(element);
                
                if (!isLeaf) {
                    return; // Only process leaf regions
                }
                
                const regionCode = this.getRegionCodeFromPath(element);
                
                if (regionCode == null) {
                    unmatchedPaths.push({
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className?.baseVal || element.className,
                        parentId: element.parentElement?.id
                    });
                    applyColorToElement(element, noDataColor, null, null, null, NO_DATA_OPACITY);
                    return;
                }
                
                matchedCount++;
                
                if (shouldColorByParent) {
                    // Color by parent level: apply parent's value to all children
                    const parentGroupId = findParentGroupId(element, targetColorLevel);
                    
                    if (parentGroupId != null && parentGroupDataMap.has(parentGroupId)) {
                        const parentValue = parentGroupDataMap.get(parentGroupId);
                        const ratio = (parentValue - minValue) / (maxValue - minValue || 1);
                        const fillColor = this.getColorFromPalette(ratio);
                        applyColorToElement(element, fillColor, regionCode, parentGroupId, parentValue);
                        coloredCount++;
                    } else {
                        applyColorToElement(element, noDataColor, regionCode, parentGroupId, null, NO_DATA_OPACITY);
                    }
                } else {
                    // Color by current level: use element's own value
                    const normalizedRegionCode = String(regionCode).trim();
                    const value = getValueFromData(element, normalizedRegionCode);
                    
                    if (value != null) {
                        const ratio = (value - minValue) / (maxValue - minValue || 1);
                        const fillColor = this.getColorFromPalette(ratio);
                        applyColorToElement(element, fillColor, regionCode, null, null);
                        coloredCount++;
                    } else {
                        applyColorToElement(element, noDataColor, regionCode, null, null, NO_DATA_OPACITY);
                    }
                }
            });
        },


        // ==========================================
        // PAN AND ZOOM METHODS
        // ==========================================
        handleMouseDown(e) {
            // Don't pan if clicking on a region path, polygon, polyline, or rect
            if (e.target.tagName === 'path' || e.target.tagName === 'polygon' || e.target.tagName === 'polyline' || e.target.tagName === 'rect') {
                return;
            }
            
            this.isPanning = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startPanX = this.panX;
            this.startPanY = this.panY;
            e.preventDefault();
        },
        
        handleMouseMove(e) {
            if (this.isPanning == null || this.isPanning === false) {
                return;
            }
            
            const deltaX = e.clientX - this.startX;
            const deltaY = e.clientY - this.startY;
            
            this.panX = this.startPanX + deltaX;
            this.panY = this.startPanY + deltaY;
        },
        
        handleMouseUp() {
            this.isPanning = false;
        },
        
        handleMouseLeave() {
            if (this.isPanning != null) {
                this.isPanning = false;
            }
        },
        
        handleWheel(e) {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom + delta));
            
            // Zoom toward mouse position
            const rect = this.$refs.svgMap.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomRatio = newZoom / this.zoom;
            
            this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
            this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
            this.zoom = newZoom;
        },
        
        // Touch events for mobile
        handleTouchStart(e) {
            if (e.touches.length === 1) {
                // Single touch - pan
                const touch = e.touches[0];
                this.isPanning = true;
                this.startX = touch.clientX;
                this.startY = touch.clientY;
                this.startPanX = this.panX;
                this.startPanY = this.panY;
            } else if (e.touches.length === TOUCH_DIVISOR) {
                // Two fingers - pinch zoom
                this.isPanning = false;
                const firstTouch = e.touches[0];
                const secondTouch = e.touches[1];
                const deltaX = firstTouch.clientX - secondTouch.clientX;
                const deltaY = firstTouch.clientY - secondTouch.clientY;
                this.lastTouchDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            }
            e.preventDefault();
        },
        
        handleTouchMove(e) {
            if (e.touches.length === 1 && this.isPanning) {
                // Single touch - pan
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.startX;
                const deltaY = touch.clientY - this.startY;
                
                this.panX = this.startPanX + deltaX;
                this.panY = this.startPanY + deltaY;
            } else if (e.touches.length === TOUCH_DIVISOR) {
                // Two fingers - pinch zoom
                const firstTouch = e.touches[0];
                const secondTouch = e.touches[1];
                const deltaX = firstTouch.clientX - secondTouch.clientX;
                const deltaY = firstTouch.clientY - secondTouch.clientY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (this.lastTouchDistance > 0) {
                    const scale = distance / this.lastTouchDistance;
                    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom * scale));
                    
                    const centerX = (firstTouch.clientX + secondTouch.clientX) / TOUCH_DIVISOR;
                    const centerY = (firstTouch.clientY + secondTouch.clientY) / TOUCH_DIVISOR;
                    
                    const rect = this.$refs.svgMap.getBoundingClientRect();
                    const zoomPointX = centerX - rect.left;
                    const zoomPointY = centerY - rect.top;
                    
                    const zoomRatio = newZoom / this.zoom;
                    
                    this.panX = zoomPointX - (zoomPointX - this.panX) * zoomRatio;
                    this.panY = zoomPointY - (zoomPointY - this.panY) * zoomRatio;
                    this.zoom = newZoom;
                }
                
                this.lastTouchDistance = distance;
            }
            e.preventDefault();
        },
        
        handleTouchEnd() {
            this.isPanning = false;
            this.lastTouchDistance = 0;
        },
        
        // Zoom controls
        zoomIn() {
            const newZoom = Math.min(MAX_ZOOM, this.zoom + ZOOM_STEP);
            this.zoom = newZoom;
        },
        
        zoomOut() {
            const newZoom = Math.max(MIN_ZOOM, this.zoom - ZOOM_STEP);
            this.zoom = newZoom;
        },
        
        resetView() {
            this.zoom = INITIAL_ZOOM;
            this.panX = 0;
            this.panY = 0;
        },
        
        /**
         * Get bounding box of an SVG element in viewBox coordinates
         */
        getElementBBox(element) {
            if (element == null) {
                return null;
            }
            
            try {
                // For groups, we need to calculate bounds from all children
                if (element.tagName === 'g') {
                    const children = Array.from(element.querySelectorAll('path, polygon, polyline, rect, g'));
                    if (children.length === 0) {
                        return null;
                    }
                    
                    let minX = Infinity;
                    let minY = Infinity;
                    let maxX = -Infinity;
                    let maxY = -Infinity;
                    
                    children.forEach((child) => {
                        const bbox = this.getElementBBox(child);
                        if (bbox != null) {
                            minX = Math.min(minX, bbox.x);
                            minY = Math.min(minY, bbox.y);
                            maxX = Math.max(maxX, bbox.x + bbox.width);
                            maxY = Math.max(maxY, bbox.y + bbox.height);
                        }
                    });
                    
                    if (minX === Infinity) {
                        return null;
                    }
                    
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY
                    };
                }
                // For path, polygon, polyline - use getBBox()
                const bbox = element.getBBox();
                return {
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height
                };
            } catch (error) {
                return null;
            }
        },
        
        /**
         * Zoom and center viewport on a specific element/group
         */
        zoomToElement(groupId) {
            if (groupId == null) {
                return;
            }
            
            this.$nextTick(() => {
                const svg = this.$refs.svgMap;
                const contentGroup = this.$refs.svgContentGroup;
                
                if (svg == null || contentGroup == null) {
                    return;
                }
                
                // Find the element in the rendered SVG
                const element = contentGroup.querySelector(`g[id="${groupId}"]`) ||
                             contentGroup.querySelector(`path[id="${groupId}"], polygon[id="${groupId}"], polyline[id="${groupId}"]`);
                
                // If element not found, it might be that we drilled into it and only its children are visible
                // In that case, calculate bounds from all visible children
                if (element == null) {
                    // Try to find children that belong to this group (they might have data-level-group-id attribute)
                    const childrenWithGroupId = contentGroup.querySelectorAll(`[data-level-group-id="${groupId}"]`);
                    if (childrenWithGroupId.length > 0) {
                        // Calculate bounding box from all children
                        let minX = Infinity;
                        let minY = Infinity;
                        let maxX = -Infinity;
                        let maxY = -Infinity;
                        
                        childrenWithGroupId.forEach((child) => {
                            const bbox = this.getElementBBox(child);
                            if (bbox != null) {
                                minX = Math.min(minX, bbox.x);
                                minY = Math.min(minY, bbox.y);
                                maxX = Math.max(maxX, bbox.x + bbox.width);
                                maxY = Math.max(maxY, bbox.y + bbox.height);
                            }
                        });
                        
                        if (minX !== Infinity) {
                            const bbox = {
                                x: minX,
                                y: minY,
                                width: maxX - minX,
                                height: maxY - minY
                            };
                            this.applyZoomToBBox(bbox);
                            return;
                        }
                    }
                    
                    // If still not found, try to get bounds of all visible content (fallback)
                    const allVisibleElements = contentGroup.querySelectorAll('path, polygon, polyline, rect, g');
                    if (allVisibleElements.length > 0) {
                        let minX = Infinity;
                        let minY = Infinity;
                        let maxX = -Infinity;
                        let maxY = -Infinity;
                        
                        allVisibleElements.forEach((elementItem) => {
                            const bbox = this.getElementBBox(elementItem);
                            if (bbox != null) {
                                minX = Math.min(minX, bbox.x);
                                minY = Math.min(minY, bbox.y);
                                maxX = Math.max(maxX, bbox.x + bbox.width);
                                maxY = Math.max(maxY, bbox.y + bbox.height);
                            }
                        });
                        
                        if (minX !== Infinity) {
                            const bbox = {
                                x: minX,
                                y: minY,
                                width: maxX - minX,
                                height: maxY - minY
                            };
                            this.applyZoomToBBox(bbox);
                            return;
                        }
                    }
                    
                    return;
                }
                
                // Get bounding box
                const bbox = this.getElementBBox(element);
                if (bbox == null) {
                    return;
                }
                
                this.applyZoomToBBox(bbox);
            });
        },
        
        /**
         * Apply zoom and pan to fit a bounding box in the viewport
         */
        applyZoomToBBox(bbox) {
            // Get viewBox dimensions
            const viewBoxValues = this.viewBox.split(' ').map(Number);
            const viewBoxWidth = viewBoxValues[2] || 1000;
            const viewBoxHeight = viewBoxValues[3] || 600;
            
            // Add padding (10% on each side)
            const padding = 0.1;
            const paddedWidth = bbox.width * (1 + padding * 2);
            const paddedHeight = bbox.height * (1 + padding * 2);
            
            // Calculate zoom to fit the element with padding
            const zoomX = viewBoxWidth / paddedWidth;
            const zoomY = viewBoxHeight / paddedHeight;
            const newZoom = Math.min(zoomX, zoomY, MAX_ZOOM);
            
            // Calculate center of the element
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            
            // Calculate pan to center the element
            // The transform applies: translate(panX, panY) scale(zoom)
            // To center element at (centerX, centerY), we need:
            // panX + centerX * zoom = viewBoxWidth / 2
            // panY + centerY * zoom = viewBoxHeight / 2
            const newPanX = viewBoxWidth / 2 - centerX * newZoom;
            const newPanY = viewBoxHeight / 2 - centerY * newZoom;
            
            // Apply zoom and pan
            this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
            this.panX = newPanX;
            this.panY = newPanY;
        },
        
        // ==========================================
        // PUBLIC API - For colorizing regions
        // ==========================================
        /* eslint-disable vue/no-unused-properties */
        colorizeRegion(regionId, color, opacity = DEFAULT_REGION_OPACITY) {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return;
            }
            
            // Try path, polygon, and polyline elements
            const element = svg.querySelector(`path[id="${regionId}"], polygon[id="${regionId}"], polyline[id="${regionId}"]`);
            if (element != null) {
                element.style.fill = color;
                element.style.fillOpacity = String(opacity);
                element.dataset.originalFill = color;
                element.dataset.originalOpacity = String(opacity);
            }
        },
        
        getRegionIds() {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return [];
            }
            
            // Query paths, polygons, polylines, rects, and groups
            const elements = svg.querySelectorAll('path[id], polygon[id], polyline[id], rect[id], g[id]');
            return Array.from(elements).map(element => element.getAttribute('id'));
        },
        
        /**
         * Get visible region IDs based on current drill-down state
         * Returns array of region IDs that are currently visible on the map
         */
        getVisibleRegionIds() {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return [];
            }
            
            // Get all visible path, polygon, polyline, and rect elements (leaf regions)
            const visibleElements = svg.querySelectorAll('path[id], polygon[id], polyline[id], rect[id]');
            const visibleIds = Array.from(visibleElements)
                .map(element => element.getAttribute('id'))
                .filter(id => id != null && id !== '');
            
            return visibleIds;
        },
        
        /**
         * Get visible region values - returns object mapping region IDs to their displayed values
         * Checks for parent values when coloring by parent level
         */
        getVisibleRegionValues() {
            const svg = this.$refs.svgMap;
            if (svg == null) {
                return {};
            }
            
            const values = {};
            
            // Get all visible path, polygon, polyline, and rect elements (leaf regions)
            const visibleElements = svg.querySelectorAll('path[id], polygon[id], polyline[id], rect[id]');
            
            visibleElements.forEach((element) => {
                const regionId = element.getAttribute('id');
                if (regionId == null || regionId === '') {
                    return;
                }
                
                // Check if this region has a parent value (when coloring by parent level)
                const { parentValue } = element.dataset;
                if (parentValue != null && parentValue !== '') {
                    const numValue = Number(parentValue);
                    if (Number.isNaN(numValue) === false) {
                        values[regionId] = numValue;
                    }
                }
                
                // Otherwise, try to get value from data attribute or use region ID to lookup
                // This will be handled by the parent component
            });
            
            return values;
        },
        
        // ==========================================
        // DRILL-DOWN METHODS
        // ==========================================
        handleDrillDownClick(element, regionId) {
            if (this.enableDrillDown === false) {
                this.$emit('region-click', regionId);
                return;
            }
            
            // Check if element is a group (any group, with or without ID)
            const isGroup = element.tagName === 'g';
            
            // Check if element is a region (path, polygon, polyline)
            const isRegion = this.isLeafRegion(element);
            
            // If clicking on a group, drill down into it
            if (isGroup) {
                // Try to get group info from levelInfoMap first
                let groupInfo = null;
                let groupId = element.id;
                
                // Find the corresponding group in original SVG if we have one
                let originalGroup = null;
                if (this.originalSvgElement != null && groupId != null && groupId !== '') {
                    originalGroup = this.originalSvgElement.querySelector(`g[id="${groupId}"]`);
                }
                
                if (groupId != null && groupId !== '' && this.levelInfoMap.has(groupId)) {
                    groupInfo = this.levelInfoMap.get(groupId);
                } else {
                    // Group not in levelInfoMap - calculate level and name dynamically
                    // Use original SVG if available, otherwise use current SVG
                    const svgToUse = this.originalSvgElement || this.$refs.svgMap;
                    if (svgToUse != null) {
                        const rootGroup = svgToUse.querySelector('g[id="ru"]') || svgToUse.querySelector('g');
                        if (rootGroup != null) {
                            // Use original group if found, otherwise use current element
                            const groupForCalculation = originalGroup || element;
                            const level = this.getGroupLevel(groupForCalculation, rootGroup);
                            const name = this.getGroupName(groupForCalculation);
                            
                            // Try to find group by position/index if no ID
                            if ((groupId == null || groupId === '') && originalGroup == null) {
                                // Find group by position relative to siblings
                                const parent = element.parentElement;
                                if (parent != null) {
                                    const siblings = Array.from(parent.childNodes).filter(
                                        child => child.nodeType === Node.ELEMENT_NODE && child.tagName === 'g'
                                    );
                                    const index = siblings.indexOf(element);
                                    if (index >= 0 && this.originalSvgElement != null) {
                                        const originalParent = this.originalSvgElement.querySelector(
                                            parent.id ? `g[id="${parent.id}"]` : null
                                        ) || this.originalSvgElement.querySelector('g[id="ru"]');
                                        if (originalParent != null) {
                                            const originalSiblings = Array.from(originalParent.childNodes).filter(
                                                child => child.nodeType === Node.ELEMENT_NODE && child.tagName === 'g'
                                            );
                                            if (originalSiblings[index] != null) {
                                                originalGroup = originalSiblings[index];
                                                if (originalGroup.id == null || originalGroup.id === '') {
                                                    // Assign ID to original group for future reference
                                                    originalGroup.id = `group-level-${level}-idx-${index}`;
                                                }
                                                groupId = originalGroup.id;
                                            }
                                        }
                                    }
                                }
                                
                                // If still no ID, generate one
                                if (groupId == null || groupId === '') {
                                    groupId = `group-level-${level}-${Date.now()}`;
                                }
                            } else if (originalGroup != null && (originalGroup.id == null || originalGroup.id === '')) {
                                // Original group exists but has no ID - assign one
                                originalGroup.id = groupId || `group-level-${level}-${Date.now()}`;
                                groupId = originalGroup.id;
                            }
                            
                            groupInfo = { level, name };
                            // Cache it for future use
                            this.levelInfoMap.set(groupId, groupInfo);
                        }
                    }
                }
                
                // Only drill down if group has children (is not a leaf)
                if (groupInfo != null) {
                    const hasChildren = Array.from(element.childNodes).some(
                        child => child.nodeType === Node.ELEMENT_NODE && 
                        (child.tagName === 'g' || this.isLeafRegion(child))
                    );
                    
                    if (hasChildren) {
                        this.drillDownPaths.push({
                            level: groupInfo.level,
                            id: groupId,
                            name: groupInfo.name
                        });
                        this.currentDrillLevel = groupInfo.level + 1; // Drill one level deeper
                        // Store group ID to zoom to after loading
                        this.pendingDrillZoomGroupId = groupId;
                        this.loadSVGContent();
                        // Don't reset view - zoomToElement will be called after SVG loads
                        // Emit visible regions change for legend recalculation after SVG loads
                        // The event will be emitted from loadSVGContent after rendering
                        return;
                    }
                }
            }
            
            // If clicking on a region when at level 0 with startLevel > 0, find parent group
            if (isRegion && this.currentDrillLevel === 0 && this.drillDownStartLevel > 0) {
                // Try to get parent group ID from data attribute (when regions are flattened)
                const parentGroupId = element.getAttribute('data-level-group-id');
                
                if (parentGroupId != null && this.levelInfoMap.has(parentGroupId)) {
                    const groupInfo = this.levelInfoMap.get(parentGroupId);
                    this.drillDownPaths.push({
                        level: groupInfo.level,
                        id: parentGroupId,
                        name: groupInfo.name
                    });
                    this.currentDrillLevel = groupInfo.level + 1;
                    // Store group ID to zoom to after loading
                    this.pendingDrillZoomGroupId = parentGroupId;
                    this.loadSVGContent();
                    // Don't reset view - zoomToElement will be called after SVG loads
                    return;
                }
                
                // Fallback: find parent group in DOM
                let parent = element.parentElement;
                while (parent != null && parent.tagName !== 'g') {
                    parent = parent.parentElement;
                }
                
                if (parent != null) {
                    let groupInfo = null;
                    const parentId = parent.id;
                    
                    if (parentId != null && this.levelInfoMap.has(parentId)) {
                        groupInfo = this.levelInfoMap.get(parentId);
                    } else {
                        // Calculate level and name dynamically for parent group
                        const svg = this.$refs.svgMap;
                        if (svg != null) {
                            const rootGroup = svg.querySelector('g[id="ru"]') || svg.querySelector('g');
                            if (rootGroup != null) {
                                const level = this.getGroupLevel(parent, rootGroup);
                                const name = this.getGroupName(parent);
                                const finalId = parentId || `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                if (parentId == null || parentId === '') {
                                    parent.id = finalId;
                                }
                                groupInfo = { level, name };
                                this.levelInfoMap.set(finalId, groupInfo);
                            }
                        }
                    }
                    
                    if (groupInfo != null) {
                        const finalGroupId = parentId || parent.id;
                        this.drillDownPaths.push({
                            level: groupInfo.level,
                            id: finalGroupId,
                            name: groupInfo.name
                        });
                        this.currentDrillLevel = groupInfo.level + 1;
                        // Store group ID to zoom to after loading
                        this.pendingDrillZoomGroupId = finalGroupId;
                        this.loadSVGContent();
                        // Don't reset view - zoomToElement will be called after SVG loads
                        // Emit visible regions change for legend recalculation after SVG loads
                        // The event will be emitted from loadSVGContent after rendering
                        return;
                    }
                }
            }
            
            // Default: emit region click event
            this.$emit('region-click', regionId);
        },
        
        drillUp() {
            if (this.drillDownPaths.length === 0) {
                return;
            }
            
            // Remove last item from path
            this.drillDownPaths.pop();
            
            // Update current level
            if (this.drillDownPaths.length === 0) {
                this.currentDrillLevel = this.drillDownStartLevel != null ? this.drillDownStartLevel : 0;
            } else {
                const lastItem = this.drillDownPaths[this.drillDownPaths.length - 1];
                this.currentDrillLevel = lastItem.level + 1; // Show one level deeper than the path item
            }
            
            // Clear any pending zoom since we're drilling up
            this.pendingDrillZoomGroupId = null;
            this.loadSVGContent();
            this.resetView();
            // Emit visible regions change for legend recalculation after SVG loads
            // The event will be emitted from loadSVGContent after rendering
        },
        
        drillToLevel(level) {
            // Reset to specified level (level is numeric: 0 = all, 1+ = specific level)
            this.drillDownPaths = [];
            const defaultLevel = this.drillDownStartLevel != null ? this.drillDownStartLevel : 0;
            this.currentDrillLevel = level != null ? level : defaultLevel;
            // Clear any pending zoom since we're resetting to a level
            this.pendingDrillZoomGroupId = null;
            this.loadSVGContent();
            this.resetView();
        },
        
        // Recursively collect level information for all groups
        collectLevelInfo(groupElement, rootGroup, currentLevel) {
            Array.from(groupElement.childNodes).forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'g' && child.id != null) {
                    const level = this.getGroupLevel(child, rootGroup);
                    const name = this.getGroupName(child);
                    this.levelInfoMap.set(child.id, { level, name });
                    // Recurse into children
                    this.collectLevelInfo(child, rootGroup, level);
                }
            });
        },
        
        getGroupName(element) {
            // Try to get name from desc element
            const descElement = element.querySelector('desc');
            if (descElement != null && descElement.textContent != null && descElement.textContent.trim() !== '') {
                return descElement.textContent.trim();
            }
            
            // Fallback to id
            return element.id || 'Unknown Group';
        },
        
        // Legacy method name for compatibility
        getDistrictName(element) {
            return this.getGroupName(element);
        },
        
        getBreadcrumbs() {
            const breadcrumbs = [
                { level: 0, name: 'Вся Россия', id: null }
            ];
            
            this.drillDownPaths.forEach((item) => {
                breadcrumbs.push({
                    level: item.level,
                    name: item.name,
                    id: item.id
                });
            });
            
            return breadcrumbs;
        },
        
        handleBreadcrumbClick(index) {
            // Navigate to the clicked breadcrumb level
            if (index === 0) {
                // Clicked on "Вся Россия" - go to top level
                this.drillToLevel(this.drillDownStartLevel != null ? this.drillDownStartLevel : 0);
            } else {
                // Navigate to specific level by truncating path
                const targetPath = this.drillDownPaths.slice(0, index - 1); // -1 because index 0 is "Вся Россия"
                this.drillDownPaths = targetPath;
                
                if (targetPath.length === 0) {
                    this.currentDrillLevel = this.drillDownStartLevel != null ? this.drillDownStartLevel : 0;
                } else {
                    const lastItem = targetPath[targetPath.length - 1];
                    this.currentDrillLevel = lastItem.level + 1; // Show one level deeper than the path item
                }
                
                // Clear any pending zoom since we're navigating via breadcrumb
                this.pendingDrillZoomGroupId = null;
                this.loadSVGContent();
                this.resetView();
            }
        }
        /* eslint-enable vue/no-unused-properties */
    }
};
</script>

<style scoped>
.choropleth-container {
    display: flex;
    height: calc(100% - 32px);
    width: calc(100% - 32px);
    position: relative;
    background: transparent;
    margin: 16px;
    box-sizing: border-box;
}

.svg-map-container {
    flex-grow: 1;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
}

.choropleth-svg-map {
    width: 100%;
    height: 100%;
    cursor: grab;
    user-select: none;
    touch-action: none;
    display: block;
}

.choropleth-svg-map:active {
    cursor: grabbing;
}

/* Zoom controls */
.zoom-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 1000;
}

.zoom-button {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(229, 231, 235, 0.6);
    border-radius: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.zoom-button:hover {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 0.85) 100%
    );
    transform: translateY(-1px);
}

.zoom-button:active {
    transform: translateY(0);
}

/* NO GLOBAL PATH STYLES - All path styling is managed by JavaScript to avoid whole-map effects */
/* This prevents CSS cascading issues and ensures only individual hovered regions are affected */
/* Global CSS rules would cause ALL paths to react when ANY path changes */

/* Light theme zoom controls - explicit styles */
.zoom-controls.theme-light .zoom-button {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(229, 231, 235, 0.6);
    color: #1e293b;
}

.zoom-controls.theme-light .zoom-button:hover {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 0.85) 100%
    );
    transform: translateY(-1px);
}

/* Dark theme adjustments */
.theme-dark .svg-map-container {
    background: transparent;
}

.zoom-controls.theme-dark .zoom-button {
    background: linear-gradient(
        135deg,
        rgba(17, 24, 39, 0.85) 0%,
        rgba(17, 24, 39, 0.75) 100%
    );
    border: 1px solid rgba(75, 85, 99, 0.4);
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    color: rgb(226, 232, 240);
}

.zoom-controls.theme-dark .zoom-button:hover {
    background: linear-gradient(
        135deg,
        rgba(31, 41, 55, 0.9) 0%,
        rgba(31, 41, 55, 0.8) 100%
    );
    transform: translateY(-1px);
}

/* Blue theme adjustments */
.theme-blue .svg-map-container {
    background: transparent;
}

.zoom-controls.theme-blue .zoom-button {
    background: linear-gradient(
        135deg,
        rgba(30, 58, 138, 0.85) 0%,
        rgba(37, 99, 235, 0.75) 100%
    );
    border: 1px solid rgba(96, 165, 250, 0.5);
    border-top: 1px solid rgba(147, 197, 253, 0.6);
    color: rgb(219, 234, 254);
}

.zoom-controls.theme-blue .zoom-button:hover {
    background: linear-gradient(
        135deg,
        rgba(37, 99, 235, 0.9) 0%,
        rgba(59, 130, 246, 0.85) 100%
    );
    border-color: rgba(96, 165, 250, 0.7);
    transform: translateY(-1px);
}

/* Drill-down Breadcrumbs */
.drill-down-breadcrumbs {
    position: absolute;
    bottom: 80px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.85) 100%
    );
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(229, 231, 235, 0.5);
    z-index: 100;
    font-size: 13px;
    font-family: system-ui, -apple-system, sans-serif;
}

.breadcrumb-item {
    background: transparent;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    color: rgb(75, 85, 99);
    font-size: 13px;
    transition: all 0.2s ease;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.breadcrumb-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(37, 99, 235);
}

.breadcrumb-item.breadcrumb-active {
    color: rgb(37, 99, 235);
    font-weight: 600;
    cursor: default;
}

.breadcrumb-item.breadcrumb-active:hover {
    background: transparent;
}

.breadcrumb-separator {
    color: rgb(156, 163, 175);
    margin: 0 2px;
    font-weight: 400;
}

/* Light theme breadcrumbs - explicit styles */
.drill-down-breadcrumbs.theme-light {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.85) 100%
    );
    border: 1px solid rgba(229, 231, 235, 0.5);
}

.drill-down-breadcrumbs.theme-light .breadcrumb-item {
    color: rgb(75, 85, 99);
}

.drill-down-breadcrumbs.theme-light .breadcrumb-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(37, 99, 235);
}

.drill-down-breadcrumbs.theme-light .breadcrumb-item.breadcrumb-active {
    color: rgb(37, 99, 235);
}

.drill-down-breadcrumbs.theme-light .breadcrumb-separator {
    color: rgb(156, 163, 175);
}

/* Dark theme breadcrumbs */
.drill-down-breadcrumbs.theme-dark {
    background: linear-gradient(
        135deg,
        rgba(31, 41, 55, 0.9) 0%,
        rgba(17, 24, 39, 0.85) 100%
    );
    border: 1px solid rgba(75, 85, 99, 0.4);
}

.drill-down-breadcrumbs.theme-dark .breadcrumb-item {
    color: rgb(209, 213, 219);
}

.drill-down-breadcrumbs.theme-dark .breadcrumb-item:hover {
    background: rgba(59, 130, 246, 0.2);
    color: rgb(147, 197, 253);
}

.drill-down-breadcrumbs.theme-dark .breadcrumb-item.breadcrumb-active {
    color: rgb(147, 197, 253);
}

.drill-down-breadcrumbs.theme-dark .breadcrumb-separator {
    color: rgb(107, 114, 128);
}

/* Blue theme breadcrumbs */
.drill-down-breadcrumbs.theme-blue {
    background: linear-gradient(
        135deg,
        rgba(30, 58, 138, 0.9) 0%,
        rgba(37, 99, 235, 0.85) 100%
    );
    border: 1px solid rgba(96, 165, 250, 0.5);
}

.drill-down-breadcrumbs.theme-blue .breadcrumb-item {
    color: rgb(219, 234, 254);
}

.drill-down-breadcrumbs.theme-blue .breadcrumb-item:hover {
    background: rgba(147, 197, 253, 0.2);
    color: rgb(191, 219, 254);
}

.drill-down-breadcrumbs.theme-blue .breadcrumb-item.breadcrumb-active {
    color: rgb(191, 219, 254);
}

.drill-down-breadcrumbs.theme-blue .breadcrumb-separator {
    color: rgb(147, 197, 253);
}

/* Glassmorphism Tooltip - Dots Style */
.region-tooltip {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    min-width: 180px;
    max-width: 280px;
    padding: 12px 14px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Theme-specific backgrounds */
.region-tooltip.theme-dark {
    background: linear-gradient(
        135deg,
        rgba(17, 24, 39, 0.85) 0%,
        rgba(17, 24, 39, 0.75) 100%
    );
    border: 1px solid rgba(75, 85, 99, 0.4);
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    color: rgb(226, 232, 240);
}

.region-tooltip.theme-light,
.region-tooltip.theme-blue {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.75) 100%
    );
    border: 1px solid rgba(229, 231, 235, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    color: rgb(51, 65, 85);
}

.tooltip-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.tooltip-icon {
    flex-shrink: 0;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.tooltip-title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
}

.tooltip-metrics {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tooltip-metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.tooltip-metric-item:not(:last-child) {
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.tooltip-description {
    margin-bottom: 2px;
    font-size: 12px;
    line-height: 1.4;
    opacity: 0.75;
    font-weight: 500;
}

.tooltip-value {
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}
</style>
