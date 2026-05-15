<template>
  <div 
    class="event-timeline-chart-root p-3"
    role="figure"
    :aria-label="t('chart.title') || 'Event Timeline Chart'" 
  >
    <div class="chart-content relative w-full h-full">
      <canvas 
        ref="canvasRef" 
        class="event-timeline-canvas"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      ></canvas>

      <!-- Significant Day Highlight Display -->
      <transition name="highlight-fade">
        <div 
          v-if="highlightedDayInfo"
          class="highlight-info absolute w-48 p-2 rounded-md text-xs shadow-md overflow-hidden pointer-events-none z-10"
          :class="{
            'bg-gray-800/80 border border-gray-600/50 text-slate-200 backdrop-blur-sm': currentTheme === 'dark',
            'bg-white/70 border border-white/60 text-slate-700 backdrop-blur-sm': currentTheme !== 'dark'
          }"
          :style="highlightInfoStyle"
        >
          <div class="font-semibold mb-1">{{ highlightedDayInfo.formattedDate }}</div>
          <div class="mb-1">
            <span class="font-medium">{{ t('chart.highlight.total', 'Total') }}:</span>
            {{ highlightedDayInfo.total }} 
            <span v-if="highlightedDayInfo.segmentCategory" class="text-xs">({{ t('chart.highlight.segment', 'Segment') }})</span>
          </div>
          <div v-if="highlightedDayInfo.segmentCategory" class="mb-1">
            <span class="font-medium">{{ highlightedDayInfo.segmentCategory }}</span>: {{ highlightedDayInfo.segmentCount }}
          </div>
          <div class="border-t border-current opacity-30 my-1"></div>
          <ul class="space-y-0.5 overflow-y-auto max-h-[calc(100%-45px)]"> 
            <li v-for="(count, category) in highlightedDayInfo.categories" :key="category" class="flex items-center">
               <span 
                 class="w-2 h-2 rounded-sm inline-block mr-1.5 flex-shrink-0"
                 :style="{ backgroundColor: getColorOrDefault(category) }"
               ></span>
               <span 
                 class="font-medium truncate" 
                 :title="category"
                 :style="{ color: getColorOrDefault(category) }"
               >{{ category }}</span>: {{ count }}
            </li>
          </ul>
        </div>
      </transition>
    </div>

     <div 
       v-if="isAnimationReady && !isPlaying && processedData.length === 0"
       class="text-xs text-center italic py-2"
       :class="{ 'text-slate-400': currentTheme === 'dark', 'text-slate-500': currentTheme !== 'dark' }"
     >
       {{ t('chart.noDataAnimationReady', 'Animation ready. Press play to see data.')}}
    </div>
  </div>
</template>

<script>
import {
    CHART_NEON_GLOW_BLUR_RADIUS,
    CHART_NEON_GLOW_COLOR_DARK_THEME,
    CHART_NEON_GLOW_ENABLED_LIGHT_THEME,
    CHART_NEON_GLOW_COLOR_LIGHT_THEME,
    SIGNIFICANT_INCREASE_THRESHOLD,
    SIGNIFICANT_INCREASE_FADE_DAYS
} from '../utils/constants';

/**
 * @file EventTimelineChart.vue
 * @description A component that renders an event timeline chart using Canvas.
 * It displays event counts per category over time, typically used with the Animation mode.
 * The chart is reactive to theme changes, data updates, and animation state.
 * EXACT code from map2, converted to Vue 2 Options API
 */

export default {
    name: 'EventTimelineChart',
    
    props: {
        /** 
         * Array of event data points for the chart. Each object should typically include:
         * { date: string (ISO date), counts: { categoryName: number, ... } }
         */
        eventData: {
            type: Array,
            default: () => []
        },
        /** Object mapping category names to their HEX color strings. */
        categoryColors: {
            type: Object,
            default: () => ({})
        },
        /** Current theme name (e.g., 'dark', 'standard', 'light') for styling the chart. */
        currentTheme: {
            type: String,
            default: 'dark'
        },
        /** The i18n translation function. */
        t: {
            type: Function,
            required: true
        },
        /** The maximum number of events per day, used for Y-axis scaling. */
        maxEventsPerDay: {
            type: Number,
            default: 20
        },
        /** The width of the chart in pixels. */
        chartWidth: {
            type: Number,
            default: 300
        },
        /** The height of the chart in pixels. */
        chartHeight: {
            type: Number,
            default: 150
        },
        /** The total number of days in the current timespan, used for X-axis configuration. */
        totalDaysInTimespan: {
            type: Number,
            default: 366
        },
        /** The padding factor between bars. */
        barPadding: {
            type: Number,
            default: 0.2
        },
        /** The top margin for the chart. */
        marginTop: {
            type: Number,
            default: 10
        },
        /** The right margin for the chart. */
        marginRight: {
            type: Number,
            default: 5
        },
        /** The bottom margin for the chart. */
        marginBottom: {
            type: Number,
            default: 25
        },
        /** The left margin for the chart. */
        marginLeft: {
            type: Number,
            default: 25
        },
        /** Boolean indicating if date labels should be shown. */
        showDateLabels: {
            type: Boolean,
            default: false
        },
        /** The frequency of date labels. */
        dateLabelFrequency: {
            type: Number,
            default: 5
        },
        /** Boolean indicating if the animation is ready to start (data loaded, initial date set). */
        isAnimationReady: {
            type: Boolean,
            default: false
        },
        /** Boolean indicating if the animation is currently playing. */
        isPlaying: {
            type: Boolean,
            default: false
        }
    },
    
    data() {
        return {
            highlightedDayInfo: null,
            activeHoverBarIndex: -1, // For hit detection optimization
            hoverMouseX: 0,
            hoverMouseY: 0
        };
    },
    
    computed: {
        // Calculate inner dimensions
        innerWidth() {
            return Math.max(0, this.chartWidth - this.marginLeft - this.marginRight);
        },
        
        innerHeight() {
            return Math.max(0, this.chartHeight - this.marginTop - this.marginBottom);
        },
        
        // Build stable category order from all event data, sorted by total count (descending) like legend
        stableCategoryOrder() {
            const categoryCounts = {};
            
            // Count total occurrences of each category across all days
            this.eventData.forEach(day => {
                if (day && day.counts) {
                    Object.entries(day.counts).forEach(([category, count]) => {
                        if (!categoryCounts[category]) {
                            categoryCounts[category] = 0;
                        }
                        categoryCounts[category] += count;
                    });
                }
            });
            
            // Sort by count descending (same as legend), then alphabetically for ties
            return Object.keys(categoryCounts).sort((a, b) => {
                const countDiff = categoryCounts[b] - categoryCounts[a];
                if (countDiff !== 0) return countDiff;
                return a.localeCompare(b);
            });
        },
        
        // Process data for stacking, including filtering
        processedData() {
            const categoryOrder = this.stableCategoryOrder;
            
            return this.eventData
                .map(day => {
                    if (!day || Object.keys(day.counts).length === 0) {
                        return null; 
                    }
                    let y0 = 0;
                    // Sort categories according to stable order
                    const segments = Object.entries(day.counts)
                        .sort(([catA], [catB]) => {
                            const indexA = categoryOrder.indexOf(catA);
                            const indexB = categoryOrder.indexOf(catB);
                            // If category not in order (shouldn't happen), fallback to alphabetical
                            if (indexA === -1 && indexB === -1) return catA.localeCompare(catB);
                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;
                            return indexA - indexB;
                        })
                        .map(([category, count]) => {
                            const y1 = y0 + count;
                            const segment = { category, count, y0, y1 };
                            y0 = y1;
                            return segment;
                        });
                    return { date: day.date, segments, total: y0 };
                })
                .filter(day => day !== null);
        },
        
        // Dynamic Y-axis scale based on processed data
        yScaleMax() {
            const maxInData = Math.max(0, ...this.processedData.map(d => d.total));
            const maxTotal = maxInData > 0 ? maxInData : this.maxEventsPerDay;
            return Math.max(1, Math.ceil(maxTotal));
        },
        
        yAxisTicks() {
            const ticks = [];
            const numberOfTicks = 3; // e.g., 0, max/2, max
            const scale = this.yScaleMax; // Use validated scale
            if (scale <= 0) return [{ value: 0, y: this.innerHeight }]; // Should not happen with Math.max(1, ...) but safe guard
            
            for (let i = 0; i <= numberOfTicks; i++) {
                const value = Math.round((scale / numberOfTicks) * i);
                // Calculate y position, ensuring it doesn't go outside bounds due to float precision
                const yPos = this.innerHeight - Math.max(0, Math.min(this.innerHeight, (value / scale) * this.innerHeight));
                ticks.push({ value, y: yPos });
            }
            return ticks;
        },
        
        // Bar width calculation (uses totalDaysInTimespan)
        barWidth() {
            if (this.innerWidth <= 0 || this.totalDaysInTimespan <= 0) return 0;
            const count = this.totalDaysInTimespan || 1;
            const width = this.innerWidth / count;
            return Math.max(1, width * (1 - this.barPadding));
        },
        
        // Bar step calculation (uses totalDaysInTimespan)
        barStep() {
            if (this.innerWidth <= 0 || this.totalDaysInTimespan <= 0) return 0;
            const count = this.totalDaysInTimespan || 1;
            return this.innerWidth / count;
        },
        
        // Computed property for X-axis month labels
        xAxisMonthLabels() {
            const labels = [];
            let lastMonth = -1;

            this.processedData.forEach((dayData, index) => {
                try {
                    // Adding 'T00:00:00' ensures consistent parsing across environments
                    const currentDate = new Date(dayData.date + 'T00:00:00');
                    const currentMonth = currentDate.getMonth();

                    if (currentMonth !== lastMonth) {
                        labels.push({
                            month: currentDate.toLocaleDateString(undefined, { month: 'short' }), // e.g., 'Jan'
                            x: this.calculateBarX(index) + this.barWidth / 2, // Center label
                            y: this.innerHeight + 15 // Position below bars (removed conditional positioning)
                        });
                        lastMonth = currentMonth;
                    }
                } catch (e) {
                    console.error(`[EventTimelineChart] Error parsing date for month label: ${dayData.date}`, e);
                    // Optionally handle the error, e.g., skip this label
                }
            });

            return labels;
        },
        
        // Neon Glow Effect
        neonGlowColor() {
            // Determine glow color based on theme
            // For dark themes, a brighter accent. For light, maybe a subtle dark glow or none.
            if (this.currentTheme === 'light') {
                return 'rgba(0,0,0,0.5)'; // Subtle dark glow for light theme, or disable if preferred
            }
            return '#00ffff'; // Cyan-like glow for dark themes (adjust as needed)
        },
        
        // Calculate hover info position to stay within viewport
        highlightInfoStyle() {
            if (!this.highlightedDayInfo) return {};
            
            const hoverPanelWidth = 192; // w-48 = 12rem = 192px
            const hoverPanelHeight = 200; // Estimated max height
            const padding = 10; // Padding from edges
            
            // Get chart container (parent of chart-content)
            const chartContent = this.$el?.querySelector('.chart-content');
            if (!chartContent) {
                // Fallback to default positioning
                return { top: '0px', right: '0px' };
            }
            
            const contentRect = chartContent.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Prefer positioning above the cursor (move upper)
            // Calculate position relative to mouse/cursor (viewport coordinates)
            let left = this.hoverMouseX + padding;
            // Position above cursor by default (subtract panel height)
            let top = this.hoverMouseY - hoverPanelHeight - padding;
            
            // If not enough space above, position below
            if (top < padding) {
                top = this.hoverMouseY + padding;
            }
            
            // Adjust if would go off right edge of viewport
            if (left + hoverPanelWidth > viewportWidth - padding) {
                left = this.hoverMouseX - hoverPanelWidth - padding;
            }
            
            // Adjust if would go off bottom edge of viewport (when positioned below)
            if (top + hoverPanelHeight > viewportHeight - padding) {
                top = this.hoverMouseY - hoverPanelHeight - padding;
            }
            
            // Ensure it doesn't go off left edge of viewport
            if (left < padding) {
                left = padding;
            }
            
            // Ensure it doesn't go off top edge of viewport
            if (top < padding) {
                top = padding;
            }
            
            // Convert to position relative to chart-content container
            const relativeLeft = left - contentRect.left;
            const relativeTop = top - contentRect.top;
            
            // Ensure it stays within chart content bounds
            const finalLeft = Math.max(0, Math.min(relativeLeft, contentRect.width - hoverPanelWidth));
            const finalTop = Math.max(0, Math.min(relativeTop, contentRect.height - Math.min(hoverPanelHeight, viewportHeight - top - padding)));
            
            return {
                left: `${finalLeft}px`,
                top: `${finalTop}px`,
                maxHeight: `${Math.min(hoverPanelHeight, viewportHeight - top - padding)}px`
            };
        }
    },
    
    watch: {
        processedData: {
            handler(newData) {
                // Draw chart when data changes
                this.$nextTick(() => {
                    this.drawChart();
                });
                
                // Watcher for significant day highlight based on data, not hover (kept from SVG version)
                // This highlights significant increases, not related to direct mouse hover
                let runningTotal = 0;
                let dataPointCount = 0; // Renamed from 'count' to avoid conflict
                let average = 0;
                let potentialHighlight = null;

                newData.forEach((day, index) => {
                    const currentTotal = day.total;
                    if (dataPointCount > 0) { 
                        average = runningTotal / dataPointCount;
                        if (currentTotal > average * (1 + SIGNIFICANT_INCREASE_THRESHOLD)) {
                            potentialHighlight = {
                                date: day.date,
                                formattedDate: this.formatHighlightDate(day.date),
                                total: day.total,
                                categories: day.segments.reduce((acc, seg) => { acc[seg.category] = seg.count; return acc; }, {}),
                                triggerIndex: index,
                                // Not including segmentCategory/segmentCount for this type of highlight
                            };
                        }
                    }
                    runningTotal += currentTotal;
                    dataPointCount++;
                });
     
                // Only update if not currently showing a hover-based highlight
                if (!this.highlightedDayInfo || !this.highlightedDayInfo.segmentCategory) {
                    if (potentialHighlight) {
                        this.highlightedDayInfo = potentialHighlight;
                    } else if (this.highlightedDayInfo && !this.highlightedDayInfo.segmentCategory) {
                        // Auto-fade logic for non-hover highlights
                        const currentLength = newData.length;
                        if (this.highlightedDayInfo.triggerIndex !== undefined) {
                            const triggerIndexOfCurrentHighlight = this.highlightedDayInfo.triggerIndex;
                            const daysSinceCurrentHighlight = currentLength - 1 - triggerIndexOfCurrentHighlight;
                            if (daysSinceCurrentHighlight >= SIGNIFICANT_INCREASE_FADE_DAYS) {
                                this.highlightedDayInfo = null; 
                            }
                            if (this.highlightedDayInfo) {
                                const highlightedDayStillExists = newData.some(d => d.date === this.highlightedDayInfo?.date);
                                if (!highlightedDayStillExists) {
                                    this.highlightedDayInfo = null;
                                }
                            }
                        }
                    }
                }
            },
            immediate: true,
            deep: true
        },
        
        chartWidth() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        chartHeight() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        currentTheme() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        marginLeft() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        marginRight() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        marginTop() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        marginBottom() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        totalDaysInTimespan() {
            this.$nextTick(() => {
                this.drawChart();
            });
        },
        
        barPadding() {
            this.$nextTick(() => {
                this.drawChart();
            });
        }
    },
    
    mounted() {
        const canvas = this.$refs.canvasRef;
        if (canvas) {
            // DPI scaling is handled in drawChart, ensure initial draw
            this.$nextTick(() => {
                this.drawChart();
            });
        }
    },
    
    methods: {
        // --- Calculation Functions ---
        
        calculateBarX(index) {
            return index * this.barStep + (this.barStep * this.barPadding / 2);
        },
        
        calculateSegmentY(y1) {
            const scale = this.yScaleMax;
            if (scale <= 0) return 0; // Position at top if scale is invalid

            // Clamp the scaled value to prevent potential floating point errors
            const scaledY1 = Math.max(0, Math.min(this.innerHeight, (y1 / scale) * this.innerHeight));
            // Return the SVG coordinate (distance from the top edge)
            return this.innerHeight - scaledY1;
        },
        
        calculateSegmentHeight(y1, y0) {
            const scale = this.yScaleMax; // Use validated scale
            if (scale <= 0 || y1 <= y0) return 0.5; // Prevent division by zero or negative height
            
            const segmentValue = y1 - y0;
            const scaledHeight = (segmentValue / scale) * this.innerHeight;
            // Ensure minimum height for visibility, prevent negative heights
            return Math.max(0.5, scaledHeight); 
        },
        
        formatDateLabel(dateString) {
            try {
                // Show only month and day, e.g., "05/21"
                const date = new Date(dateString + 'T00:00:00'); // Ensure local time interpretation
                return date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
            } catch (e) {
                return dateString; // Fallback
            }
        },
        
        // --- Color Helper ---
        getColorOrDefault(category) {
            if (!category) return '#cccccc';
            // Try uppercase first (matches categoryColorsMap keys)
            const upperCategory = category.toUpperCase();
            const color = this.categoryColors[upperCategory] || this.categoryColors[category];
            return color || '#cccccc'; 
        },
        
        // --- Date Formatting Helper ---
        formatHighlightDate(dateString) {
            try {
                const date = new Date(dateString + 'T00:00:00');
                return date.toLocaleDateString(undefined, {
                    weekday: 'short', // e.g., 'Mon'
                    day: '2-digit',   // e.g., '23'
                    month: 'long',   // e.g., 'January'
                });
            } catch (e) {
                console.error(`[EventTimelineChart] Error formatting highlight date: ${dateString}`, e);
                return dateString; // Fallback
            }
        },
        
        // --- Drawing Function ---
        drawChart() {
            if (!this.$refs.canvasRef || this.innerWidth <= 0 || this.innerHeight <= 0) return;
            const canvas = this.$refs.canvasRef;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            const physicalWidth = Math.floor(this.chartWidth * dpr);
            const physicalHeight = Math.floor(this.chartHeight * dpr);

            if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
                canvas.width = physicalWidth;
                canvas.height = physicalHeight;
            }
            canvas.style.width = `${this.chartWidth}px`;
            canvas.style.height = `${this.chartHeight}px`;
            
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Apply DPR scale, then clear and translate
            
            ctx.clearRect(0, 0, this.chartWidth, this.chartHeight);
            
            ctx.save();
            ctx.translate(this.marginLeft, this.marginTop);

            const scale = this.yScaleMax;
            const _innerHeight = this.innerHeight;
            const _barWidth = this.barWidth;
            const _barStep = this.barStep;

            this.processedData.forEach((dayData, index) => {
                const barX = index * _barStep + (_barStep * this.barPadding / 2);
                dayData.segments.forEach(segment => {
                    const segmentY1Canvas = _innerHeight - Math.max(0, Math.min(_innerHeight, (segment.y1 / scale) * _innerHeight));
                    const segmentY0Canvas = _innerHeight - Math.max(0, Math.min(_innerHeight, (segment.y0 / scale) * _innerHeight));
                    const segmentHeightCanvas = Math.max(0.5, segmentY0Canvas - segmentY1Canvas);
                    
                    const segmentColor = this.getColorOrDefault(segment.category);
                    ctx.fillStyle = segmentColor;
                    
                    if (this.currentTheme !== 'light' || CHART_NEON_GLOW_ENABLED_LIGHT_THEME) {
                        ctx.shadowColor = this.currentTheme === 'light' 
                            ? CHART_NEON_GLOW_COLOR_LIGHT_THEME 
                            : (segmentColor || CHART_NEON_GLOW_COLOR_DARK_THEME);
                        ctx.shadowBlur = CHART_NEON_GLOW_BLUR_RADIUS;
                    } else {
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;
                    }
                    
                    ctx.fillRect(barX, segmentY1Canvas, _barWidth, segmentHeightCanvas);
                    ctx.shadowColor = 'transparent'; 
                    ctx.shadowBlur = 0;
                });
            });

            const yAxisTickCount = 3;
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const yTickTextColor = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.fillStyle = yTickTextColor;
            for (let i = 0; i <= yAxisTickCount; i++) {
                const value = Math.round((scale / yAxisTickCount) * i);
                const yPos = _innerHeight - Math.max(0, Math.min(_innerHeight, (value / scale) * _innerHeight));
                ctx.fillText(value.toString(), -5, yPos);
            }

            ctx.textAlign = 'center';
            const xLabelTextColor = this.currentTheme === 'dark' ? '#d1d5db' : '#4b5563';
            let lastLabeledMonth = -1;
            let skipNextMonthLabel = false; // To achieve "one via one"

            this.processedData.forEach((dayData, index) => {
                try {
                    const currentDate = new Date(dayData.date + 'T00:00:00');
                    const currentMonth = currentDate.getMonth();

                    if (currentMonth !== lastLabeledMonth) {
                        if (!skipNextMonthLabel) {
                            const monthStr = currentDate.toLocaleDateString(undefined, { month: 'short' });
                            const xPos = index * _barStep + (_barStep * this.barPadding / 2) + _barWidth / 2;
                            ctx.fillText(monthStr, xPos, _innerHeight + 15);
                            lastLabeledMonth = currentMonth;
                            skipNextMonthLabel = true; // Set to skip the next *new* month
                        } else {
                            // This new month is skipped
                            lastLabeledMonth = currentMonth; // Update last month encountered
                            skipNextMonthLabel = false; // Allow the *next* different month to be labeled
                        }
                    } 
                    // Removed the incorrect 'else' block that prematurely reset skipNextMonthLabel
                } catch (e) { /* ignore date parsing errors for labels */ }
            });

            ctx.restore();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform completely after drawing
        },
        
        handleMouseMove(event) {
            if (!this.$refs.canvasRef || this.processedData.length === 0) return;
            const canvas = this.$refs.canvasRef;
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Store mouse position for hover panel positioning
            this.hoverMouseX = event.clientX;
            this.hoverMouseY = event.clientY;

            // Adjust mouse_x and mouse_y for canvas scaling and offset
            const mouseX = (event.clientX - rect.left);
            const mouseY = (event.clientY - rect.top);
            
            // Adjust for canvas internal translation (margins)
            const canvasCoordX = mouseX - this.marginLeft;
            const canvasCoordY = mouseY - this.marginTop;

            let hoveredBarFound = false;
            const _barStep = this.barStep;
            const _barWidth = this.barWidth;
            const _innerHeight = this.innerHeight;
            const scale = this.yScaleMax;

            for (let i = 0; i < this.processedData.length; i++) {
                const dayData = this.processedData[i];
                const barXStart = i * _barStep + (_barStep * this.barPadding / 2);
                const barXEnd = barXStart + _barWidth;

                if (canvasCoordX >= barXStart && canvasCoordX <= barXEnd) {
                    this.activeHoverBarIndex = i; // Optimization for repeated hover on same bar
                    for (let j = 0; j < dayData.segments.length; j++) {
                        const segment = dayData.segments[j];
                        const segmentY1Canvas = _innerHeight - Math.max(0, Math.min(_innerHeight, (segment.y1 / scale) * _innerHeight));
                        const segmentY0Canvas = _innerHeight - Math.max(0, Math.min(_innerHeight, (segment.y0 / scale) * _innerHeight));
                        // Y is from top, so segmentY1Canvas is the top of the segment, segmentY0Canvas is the bottom
                        if (canvasCoordY >= segmentY1Canvas && canvasCoordY <= segmentY0Canvas) {
                            this.highlightedDayInfo = {
                                date: dayData.date,
                                formattedDate: this.formatHighlightDate(dayData.date),
                                total: dayData.total,
                                categories: dayData.segments.reduce((acc, seg) => { acc[seg.category] = seg.count; return acc; }, {}),
                                segmentCategory: segment.category,
                                segmentCount: segment.count,
                                triggerIndex: i // or a specific segment index if needed
                            };
                            hoveredBarFound = true;
                            break; 
                        }
                    }
                    break; 
                }
            }

            if (!hoveredBarFound) {
                this.activeHoverBarIndex = -1;
                // Don't clear highlightedDayInfo if it's a significant increase highlight (not hover-based)
                if (this.highlightedDayInfo && this.highlightedDayInfo.segmentCategory) {
                    this.highlightedDayInfo = null;
                }
            }
            canvas.style.cursor = hoveredBarFound ? 'pointer' : 'default';
        },
        
        handleMouseLeave() {
            if (this.$refs.canvasRef) this.$refs.canvasRef.style.cursor = 'default';
            // Only clear hover-based highlights, keep significant increase highlights
            if (this.highlightedDayInfo && this.highlightedDayInfo.segmentCategory) {
                this.highlightedDayInfo = null;
            }
            this.activeHoverBarIndex = -1;
        }
    }
};
</script>

<style scoped>
.event-timeline-canvas {
  display: block; 
  /* width and height will be set by style binding from props */
}

/* Highlight Panel Transition */
.highlight-fade-enter-active,
.highlight-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.highlight-fade-enter,
.highlight-fade-leave-to {
  opacity: 0;
  transform: translateX(15px); 
}
/* Optional: Ensure enter-to and leave-from are default states if needed */
/* .highlight-fade-enter-to, .highlight-leave-from { opacity: 1; transform: translateX(0); } */
</style>

