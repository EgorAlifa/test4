<template>
    <w-elem :placeholder="$placeholder">
        <div
            class="gauge-container relative w-full h-full overflow-hidden"
            :class="[radiusClass, elevationClass, themeBackgroundClass]"
            :style="mergedContainerStyle"
        >
                <!-- Half Circle Gauge -->
                <div v-if="props.gaugeStyle === 'halfCircle'" class="relative w-full h-full flex items-center justify-center">
                    <svg
                        class="gauge-svg block w-full h-full"
                        viewBox="0 0 34 17"
                        preserveAspectRatio="xMidYMid slice"
                        role="img"
                        :aria-label="gaugeAriaLabel"
                        :style="mergedSvgStyle"
                    >
                        <g transform="translate(17,17)">
                            <!-- Render segments -->
                            <path
                                v-for="(angle, index) in segmentAngles"
                                :key="index"
                                class="gauge-segment"
                                :class="segmentClass(index)"
                                :d="segmentPath"
                                :fill="segmentColor(index)"
                                :style="customSegmentStyle"
                                :transform="getSegmentTransform(angle)"
                            />
                        </g>
                    </svg>
                    
                    <!-- Value and Title on diameter baseline -->
                    <div class="gauge-text-container absolute left-0 right-0 flex flex-col items-center gap-1" :style="mergedTextContainerStyle">
                        <div v-if="props.showValue" :style="mergedValueStyle" class="gauge-value-text text-center leading-none">
                            {{ formattedValue }}
                        </div>
                        <div
                            v-if="props.showTitle"
                            class="gauge-title-text text-center leading-tight"
                            :style="mergedTitleStyle"
                        >
                            {{ displayTitle }}
                        </div>
                    </div>
                </div>

            <!-- Ring Gauge (Full Circle with Dots) -->
            <div v-if="props.gaugeStyle === 'ring'" class="relative w-full h-full flex items-center justify-center">
                    <svg
                        class="gauge-svg block w-full h-full"
                        viewBox="0 0 16 16"
                        preserveAspectRatio="xMidYMid slice"
                        role="img"
                        :aria-label="gaugeAriaLabel"
                        :style="mergedSvgStyle"
                    >
                        <g fill="currentcolor" transform="translate(8,8)">
                            <!-- Background dots -->
                            <circle
                                v-for="(angle, index) in ringDotAngles"
                                :key="'dot-' + index"
                                class="gauge-dot"
                                r="0.5"
                                :fill="dotColor"
                                :style="customDotStyle"
                                :transform="getDotTransform(angle)"
                            />
                            <!-- Progress arc -->
                            <circle
                                class="gauge-arc"
                                :class="arcClass"
                                :r="ringArc.radius"
                                fill="none"
                                stroke-linecap="round"
                                :stroke-width="ringArc.strokeWidth"
                                :stroke-dasharray="arcDashArray"
                                :stroke-dashoffset="ringArc.offset"
                                :stroke="arcColor"
                                :style="customArcStyle"
                                transform="rotate(-90)"
                            />
                        </g>
                    </svg>
                    
                    <!-- Value and Title centered -->
                    <div class="gauge-text-container absolute inset-0 flex flex-col items-center justify-center gap-1" :style="customTextContainerStyle">
                        <div v-if="props.showValue" :style="mergedValueStyle" class="gauge-value-text text-center leading-none">
                            {{ formattedValue }}
                        </div>
                        <div
                            v-if="props.showTitle"
                            class="gauge-title-text text-center leading-tight"
                            :style="mergedTitleStyle"
                        >
                            {{ displayTitle }}
                        </div>
                    </div>
                </div>

            <!-- Needle Gauge (Tachometer-style: bands + ticks + needle) -->
            <div v-if="props.gaugeStyle === 'needle'" class="relative w-full h-full flex items-center justify-center">
                    <svg
                        class="gauge-svg block w-full h-full"
                        viewBox="0 0 34 18"
                        preserveAspectRatio="xMidYMid slice"
                        role="img"
                        :aria-label="gaugeAriaLabel"
                        :style="mergedSvgStyle"
                    >
                        <g transform="translate(17,17)">
                            <!-- Tick marks -->
                            <template v-if="props.showTicks">
                                <line
                                    v-for="(tick, index) in tickLines"
                                    :key="'tick-' + index"
                                    class="gauge-tick"
                                    :x1="tick.x1"
                                    :y1="tick.y1"
                                    :x2="tick.x2"
                                    :y2="tick.y2"
                                    :stroke="props.tickColor"
                                    stroke-width="0.25"
                                    :style="customTickStyle"
                                />
                            </template>
                            <!-- Color bands -->
                            <path
                                v-for="(band, index) in needleBandArcPaths"
                                :key="'band-' + index"
                                class="gauge-band"
                                :d="band.d"
                                fill="none"
                                :stroke="band.color"
                                :stroke-width="props.needleBandWidth"
                                :stroke-linecap="props.needleBandStyle"
                                :style="customBandStyle"
                            />
                            <!-- Needle -->
                            <g class="gauge-needle" :style="customNeedleStyle" :transform="'rotate(' + needleRotation + ')'">
                                <path :d="needlePath" :fill="props.needleColor" />
                            </g>
                            <circle r="1.1" :fill="props.needlePivotColor" />
                        </g>
                    </svg>

                    <!-- Value and Title on diameter baseline -->
                    <div class="gauge-text-container absolute left-0 right-0 flex flex-col items-center gap-1" :style="mergedTextContainerStyle">
                        <div v-if="props.showValue" :style="mergedValueStyle" class="gauge-value-text text-center leading-none">
                            {{ formattedValue }}
                        </div>
                        <div
                            v-if="props.showTitle"
                            class="gauge-title-text text-center leading-tight"
                            :style="mergedTitleStyle"
                        >
                            {{ displayTitle }}
                        </div>
                    </div>
                </div>

            <!-- Loading and Error States -->
            <div v-if="isLoading" class="gauge-loading absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80" :style="customLoadingStyle">
                <div class="text-sm" :class="scheme.textMuted">Загрузка…</div>
            </div>
            <div v-if="error" class="gauge-error absolute bottom-2 left-2 right-2 text-center text-xs text-red-600" :style="customErrorStyle">
                {{ error }}
            </div>
        </div>
    </w-elem>
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { uiMaps, schemeToClasses } from './config';
import {
    formatGaugeValue,
    calculateSegmentAngles,
    getActiveSegmentIndex,
    getSegmentPath,
    calculateRingDotAngles,
    calculateRingArc,
    polarToCartesian,
    describeArc,
    resolveNeedleBands,
    calculateNeedleBandArcs,
    calculateTickAngles,
    calculateNeedleAngle
} from './utils';
import { unit2PxMixin } from './utils/mixins';

const DatasetMixin = useElemDatasetMixin({
    drilldown: false,
    panel: false,
});

export default {
    extends: Elem,
    mixins: [DatasetMixin, unit2PxMixin],

    meta,

    hooks: {
        before(cancel) { /* optional hook */ },
        then(result) {},
        catch(error) {},
        finally() {}
    },

    data: (/* vm */) => ({
        animatedPercent: 0,
        animationFrameId: null
    }),

    computed: {
        displayTitle() {
            return this.props.title || 'Gauge';
        },
        scheme() {
            return schemeToClasses('zinc');
        },
        radiusClass() {
            return uiMaps.radiusToClass[this.props.radius] || uiMaps.radiusToClass.large;
        },
        elevationClass() {
            const defaultElevation = 2;
            return uiMaps.elevationToClass[this.props.elevation] || uiMaps.elevationToClass[defaultElevation];
        },
        themeBackgroundClass() {
            if (this.props.theme === 'dark') {
                return '';
            }
            return '';
        },
        containerStyle() {
            const defaultPaddingSize = 16;
            const isDark = this.props.theme === 'dark';
            
            const paddingObj = this.props.containerPadding || { size: defaultPaddingSize, unit: 'px' };
            const padding = this.takeUnit2Px({ 
                value: paddingObj.size > 0 ? paddingObj.size : defaultPaddingSize, 
                unit: paddingObj.unit || 'px' 
            });
            
            return {
                padding: `${padding}px`,
                backgroundColor: isDark ? '#3b4d61' : '#ffffff'
            };
        },
        svgStyle() {
            return {
                width: '100%',
                height: 'auto'
            };
        },
        textPositionStyle() {
            // Position text vertically based on user setting
            // Default 70% positions it near the diameter line of the half-circle
            const defaultPosition = 70;
            const position = this.props.textVerticalPosition || defaultPosition;
            return {
                top: `${position}%`,
                transform: 'translateY(0)'
            };
        },
        valueStyle() {
            const isDark = this.props.theme === 'dark';
            const defaultColor = isDark ? '#ffffff' : '#0a0a0a';
            const defaultValueSize = 4;
            
            const fontFamily = this.props.valueFontFamily || 'Inter, system-ui, sans-serif';
            const color = this.props.valueFontColor || defaultColor;
            
            const fontSizeObj = this.props.valueFontSize || { size: defaultValueSize, unit: 'rem' };
            const fontSize = this.takeUnit2Px({ 
                value: fontSizeObj.size > 0 ? fontSizeObj.size : defaultValueSize, 
                unit: fontSizeObj.unit || 'px' 
            });
            
            return {
                color,
                fontSize: `${fontSize}px`,
                fontWeight: '700',
                fontFamily,
                lineHeight: '1'
            };
        },
        titleStyle() {
            const isDark = this.props.theme === 'dark';
            const defaultColor = isDark ? '#ffffff' : '#0a0a0a';
            const defaultTitleSize = 3;
            
            const fontFamily = this.props.titleFontFamily || 'Inter, system-ui, sans-serif';
            const color = this.props.titleFontColor || defaultColor;
            
            const fontSizeObj = this.props.titleFontSize || { size: defaultTitleSize, unit: 'rem' };
            const fontSize = this.takeUnit2Px({ 
                value: fontSizeObj.size > 0 ? fontSizeObj.size : defaultTitleSize, 
                unit: fontSizeObj.unit || 'px' 
            });
            
            return {
                color,
                fontSize: `${fontSize}px`,
                fontWeight: '400',
                fontFamily
            };
        },
        valueMetricValue() {
            if (this.result == null || this.result.rows == null || this.props.valueMetric == null) {
                return null;
            }
            const row = this.result.rows[0] || {};
            const value = row[this.props.valueMetric];
            return typeof value === 'number' ? value : Number(value);
        },
        benchmarkMetricValue() {
            if (this.result == null || this.result.rows == null || this.props.benchmarkMetric == null) {
                return null;
            }
            const row = this.result.rows[0] || {};
            const value = row[this.props.benchmarkMetric];
            return typeof value === 'number' ? value : Number(value);
        },
        percentValue() {
            if (this.valueMetricValue === null || Number.isNaN(this.valueMetricValue)) {
                return 0;
            }
            if (this.benchmarkMetricValue === null || Number.isNaN(this.benchmarkMetricValue) || this.benchmarkMetricValue === 0) {
                return 0;
            }
            // Calculate percentage by dividing value by benchmark
            return this.valueMetricValue / this.benchmarkMetricValue;
        },
        formattedValue() {
            const valueToFormat = this.props.animation ? this.animatedPercent : this.percentValue;
            if (valueToFormat === null || Number.isNaN(valueToFormat)) {
                return '—';
            }
            return formatGaugeValue(
                valueToFormat,
                this.props.format || '1%',
                this.props.separator || '1',
                this.props.prefix || '',
                this.props.postfix || ''
            );
        },
        segmentAngles() {
            const defaultSegments = 14;
            const numSegments = this.props.numberOfSegments || defaultSegments;
            return calculateSegmentAngles(numSegments);
        },
        activeSegmentIndex() {
            const defaultSegments = 14;
            const numSegments = this.props.numberOfSegments || defaultSegments;
            const valueToUse = this.props.animation ? this.animatedPercent : this.percentValue;
            return getActiveSegmentIndex(valueToUse, numSegments);
        },
        segmentPath() {
            const isRounded = this.props.segmentStyle === 'rounded';
            return getSegmentPath(isRounded);
        },
        gaugeAriaLabel() {
            return `Gauge showing ${this.formattedValue}`;
        },
        // Ring gauge specific computed properties
        ringDotAngles() {
            const defaultDots = 16;
            const numDots = this.props.numberOfDots || defaultDots;
            return calculateRingDotAngles(numDots);
        },
        ringArc() {
            const defaultRadius = 5.5;
            const defaultStrokeWidth = 1;
            const valueToUse = this.props.animation ? this.animatedPercent : this.percentValue;
            return calculateRingArc(valueToUse, defaultRadius, defaultStrokeWidth);
        },
        dotColor() {
            const isDark = this.props.theme === 'dark';
            return isDark ? '#e5e7eb' : '#6b7280';
        },
        arcColor() {
            return this.props.activeColor || '#ef4444';
        },
        arcClass() {
            return 'transition-all duration-300';
        },
        arcDashArray() {
            const circ = this.ringArc.circumference;
            return `${circ} ${circ}`;
        },
        // Needle gauge specific computed properties
        needleBandRadius() {
            return 14;
        },
        needleBandArcPaths() {
            const bands = calculateNeedleBandArcs(resolveNeedleBands(this.props.needleBands || []));
            return bands.map(({ startAngle, endAngle, color }) => ({
                color,
                d: describeArc(this.needleBandRadius, startAngle, endAngle)
            }));
        },
        tickLines() {
            const defaultTicks = 9;
            const numberOfTicks = this.props.numberOfTicks || defaultTicks;
            const innerRadius = 14.6;
            const outerRadius = 16;
            return calculateTickAngles(numberOfTicks).map((angle) => {
                const inner = polarToCartesian(innerRadius, angle);
                const outer = polarToCartesian(outerRadius, angle);
                return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
            });
        },
        needleRotation() {
            const valueToUse = this.props.animation ? this.animatedPercent : this.percentValue;
            const scaleMax = this.props.needleScaleMax || 1;
            return calculateNeedleAngle(valueToUse, scaleMax);
        },
        needlePath() {
            const length = 13;
            const halfBaseWidth = 0.45;
            const halfTipWidth = 0.15;
            return `M -${halfBaseWidth} 0 L ${halfBaseWidth} 0 L ${halfTipWidth} -${length} L -${halfTipWidth} -${length} Z`;
        },
        // Custom styles computed properties
        parsedCustomStyles() {
            const customStyles = this.props.customStyles || {};
            const parsed = {};
            
            Object.keys(customStyles).forEach(key => {
                if (customStyles[key] != null && customStyles[key].trim() !== '') {
                    parsed[key] = this.parseCssString(customStyles[key]);
                } else {
                    parsed[key] = {};
                }
            });
            
            return parsed;
        },
        mergedContainerStyle() {
            return { ...this.containerStyle, ...this.parsedCustomStyles.container };
        },
        mergedSvgStyle() {
            return { ...this.svgStyle, ...this.parsedCustomStyles.svg };
        },
        mergedValueStyle() {
            return { ...this.valueStyle, ...this.parsedCustomStyles.valueText };
        },
        mergedTitleStyle() {
            return { ...this.titleStyle, ...this.parsedCustomStyles.titleText };
        },
        mergedTextContainerStyle() {
            return { ...this.textPositionStyle, ...this.parsedCustomStyles.textContainer };
        },
        customSegmentStyle() {
            return this.parsedCustomStyles.segment || {};
        },
        customDotStyle() {
            return this.parsedCustomStyles.dot || {};
        },
        customArcStyle() {
            return this.parsedCustomStyles.arc || {};
        },
        customTickStyle() {
            return this.parsedCustomStyles.tick || {};
        },
        customBandStyle() {
            return this.parsedCustomStyles.band || {};
        },
        customNeedleStyle() {
            return this.parsedCustomStyles.needle || {};
        },
        customTextContainerStyle() {
            return this.parsedCustomStyles.textContainer || {};
        },
        customLoadingStyle() {
            return this.parsedCustomStyles.loadingState || {};
        },
        customErrorStyle() {
            return this.parsedCustomStyles.errorState || {};
        }
    },

    watch: {
        percentValue: {
            handler(newVal, oldVal) {
                const from = oldVal || 0;
                this.animateValue(from, newVal);
            },
            immediate: true
        }
    },

    beforeDestroy() {
        if (this.animationFrameId == null) {
            return;
        }
        cancelAnimationFrame(this.animationFrameId);
    },

    methods: {
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,

        segmentClass(index) {
            return 'transition-colors duration-300';
        },

            segmentColor(index) {
                const isActive = index < this.activeSegmentIndex;
                const activeColor = this.props.activeColor || '#ef4444';
                const inactiveColor = this.props.inactiveColor || '#64748b';

                return isActive ? activeColor : inactiveColor;
            },

        getSegmentTransform(angle) {
            const radius = 13.5;
            return `rotate(${angle}) translate(-${radius},0)`;
        },

        getDotTransform(angle) {
            const radius = 5.5;
            return `rotate(${angle}) translate(0,-${radius})`;
        },

        animateValue(from, to) {
            if (this.animationFrameId != null) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            if (this.props.animation === false) {
                this.animatedPercent = to;
                return;
            }

            const duration = this.props.animationDuration || 1000; // eslint-disable-line no-magic-numbers
            const delay = this.props.animationDelay || 0;
            const startTime = performance.now() + delay;
            const delta = to - from;

            const easing = this.getEasingFunction(this.props.animationEasing || 'ease-out');

            const animate = (currentTime) => {
                if (currentTime < startTime) {
                    this.animationFrameId = requestAnimationFrame(animate);
                    return;
                }

                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing(progress);

                this.animatedPercent = from + delta * easedProgress;

                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    this.animatedPercent = to;
                    this.animationFrameId = null;
                }
            };

            this.animationFrameId = requestAnimationFrame(animate);
        },

        getEasingFunction(type) {
            const easingFunctions = {
                linear: (progress) => progress,
                'ease': (progress) => progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress, // eslint-disable-line no-magic-numbers
                'ease-in': (progress) => progress * progress,
                'ease-out': (progress) => progress * (2 - progress), // eslint-disable-line no-magic-numbers
                'ease-in-out': (progress) => progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress // eslint-disable-line no-magic-numbers
            };

            return easingFunctions[type] || easingFunctions['ease-out'];
        },

        parseCssString(cssString) {
            if (cssString == null || typeof cssString !== 'string' || cssString.trim() === '') {
                return {};
            }

            const styleObject = {};
            const declarations = cssString.split(';').filter(decl => decl.trim() !== '');

            declarations.forEach(declaration => {
                const colonIndex = declaration.indexOf(':');
                if (colonIndex === -1) {
                    return;
                }

                const property = declaration.substring(0, colonIndex).trim();
                const value = declaration.substring(colonIndex + 1).trim();

                if (property === '' || value === '') {
                    return;
                }

                // Convert kebab-case to camelCase for Vue style binding
                const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                styleObject[camelCaseProperty] = value;
            });

            return styleObject;
        }
    }
};
</script>

