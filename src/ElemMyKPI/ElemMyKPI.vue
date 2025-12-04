<template>
    <w-elem :placeholder="$placeholder">
        <div
            class="relative w-full overflow-hidden"
            :class="[radiusClass, elevationClass]"
        >
            <div
                class="p-4 md:p-5 flex flex-col gap-3 bg-clip-padding overflow-hidden"
                :class="[scheme.base, props.showBorder ? borderSoftClass : '', radiusClass]"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div v-if="props.showIcon && (props.icon || props.iconUrl)" class="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full overflow-hidden"
                             :class="iconBadgeClass" aria-hidden="true">
                            <img v-if="props.iconUrl" :src="props.iconUrl" alt="" class="w-8 h-8 object-cover" />
                            <template v-else>
                                <span v-if="props.icon === 'trend'">📈</span>
                                <span v-else-if="props.icon === 'currency'">💰</span>
                                <span v-else-if="props.icon === 'users'">👥</span>
                                <span v-else-if="props.icon === 'time'">⏱️</span>
                                <span v-else-if="props.icon === 'heart'">❤️</span>
                            </template>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 v-if="props.showTitle !== false" class="truncate" :class="scheme.textPrimary" :style="titleStyle">
                                    {{ displayTitle }}
                                </h3>
                                <span v-if="props.showBadge && props.badgeText" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                    {{ props.badgeText }}
                                </span>
                            </div>
                            <p v-if="props.subTitle" class="truncate" :class="['mt-0.5', scheme.textMuted]">
                                {{ props.subTitle }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-1" :class="alignClass">
                    <div class="font-bold tracking-tight flex items-baseline gap-2" :class="scheme.textPrimary" :style="metricStyle">
                        <span>{{ formattedValue }}</span>
                        <span v-if="props.showUnit !== false && props.unit" class="text-sm font-medium" :class="scheme.textMuted">{{ props.unit }}</span>
                    </div>
                    <div v-if="props.showDelta && hasDelta" class="inline-flex items-center gap-2">
                        <span v-if="props.deltaIconStyle === 'circle'" class="inline-flex items-center justify-center w-6 h-6 rounded-full leading-none overflow-visible p-0.5 align-middle" :class="deltaIconWrapperClass" :style="deltaCircleStyle" aria-hidden="true">{{ deltaSymbol }}</span>
                        <span v-else aria-hidden="true" class="inline-flex items-center justify-center w-6 h-6 leading-none overflow-visible align-middle" :class="deltaClass" :style="deltaTextStyle">{{ deltaSymbol }}</span>
                        <span :class="[deltaTextSizeClass, deltaClass]" :style="deltaTextStyle">{{ formattedDelta }}</span>
                    </div>
                </div>

                <div v-if="props.showSparkline && sparklinePoints.length" class="mt-1">
                    <svg :viewBox="viewBox" preserveAspectRatio="none" class="block" :style="{ height: `${sparklineHeight}px`, width: '100%' }" role="img" :aria-label="'Динамика показателя из ' + sparklinePoints.length + ' точек'">
                        <defs>
                            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" :stop-color="sparklineStroke" :stop-opacity="props.useSparklineFill ? props.sparklineFillOpacity : 0" />
                                <stop offset="100%" :stop-color="sparklineStroke" stop-opacity="0" />
                            </linearGradient>
                            <clipPath :id="clipId">
                                <rect x="0" y="0" width="100" height="40" />
                            </clipPath>
                        </defs>
                        <g :clip-path="`url(#${clipId})`">
                            <polyline :points="sparklinePoints.join(' ')" :class="sparklineClass" :style="{ stroke: sparklineStroke }" fill="none" :stroke-width="props.sparklineWidth || 1.25" stroke-linecap="round" stroke-linejoin="round" />
                            <polygon v-if="props.useSparklineFill" :points="areaPoints" :fill="`url(#${gradientId})`" />
                        </g>
                    </svg>
                </div>

                <div class="flex items-center justify-end">
                    <div v-if="isLoading" class="text-xs" :class="scheme.textMuted">Загрузка…</div>
                    <div v-else-if="error" class="text-xs text-red-600">{{ error }}</div>
                </div>
            </div>
        </div>
    </w-elem>
    
</template>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import { ElemInstanceTypeDescriptor } from './types';
import { options, defaults, uiMaps, schemeToClasses, colorText500, colorText600, colorBgSoft, colorBorderSoft, colorHex500, colorHex600, colorBgSoftHex } from './config';
import { formatNumber } from '../common/utils/number';

const DatasetMixin = useElemDatasetMixin({
    drilldown: true,
    panel: false,
});

export default {
    extends: Elem,
    mixins: [DatasetMixin],

    meta,

    hooks: {
        // @todo: delete if unused
        // before – optional hook
        before(cancel) { /* use cancel() to prevent loading */ },
        // then – optional hook
        then(result) {},
        // catch – optional hook
        catch(error) {},
        // finally – optional hook
        finally() {}
    },
    data: (/* vm */) => ({ options, defaults }),
    computed: {
        drilldownState() {
            return {
                canPop: false,
                canPush: false,
                ...this.$drilldown.state[this.props.drilldownName]
            };
        },
        drilldownCanPop() {
            return this.drilldownState.canPop;
        },
        drilldownCanPush() {
            return this.drilldownState.canPush;
        },
        drilldownDimension() {
            return this.drilldownState.dimension;
        },
        displayTitle() {
            const explicit = this.props.title ?? '';
            if (explicit) return explicit;
            return this.props.metric || 'KPI';
        },
        scheme() {
            return schemeToClasses(this.props.colorScheme || 'blue');
        },
        textSizeClass() {
            return uiMaps.sizeToText[this.props.size] || uiMaps.sizeToText.md;
        },
        valueSizeClass() {
            return uiMaps.sizeToValue[this.props.size] || uiMaps.sizeToValue.md;
        },
        deltaTextSizeClass() {
            return uiMaps.sizeToDelta[this.props.size] || uiMaps.sizeToDelta.md;
        },
        radiusClass() {
            return uiMaps.radiusToClass[this.props.radius] || uiMaps.radiusToClass.md;
        },
        alignClass() {
            return uiMaps.alignToClass[this.props.align] || uiMaps.alignToClass.left;
        },
        elevationClass() {
            return uiMaps.elevationToClass[this.props.elevation] || uiMaps.elevationToClass[1];
        },
        titleStyle() {
            return {
                color: this.props.titleFontColor || '#0a0a0a',
                fontSize: this.props.titleFontSize || '1rem',
                fontWeight: this.props.titleFontWeight || '600',
                fontFamily: this.props.titleFontFamily || 'inherit'
            };
        },
        metricStyle() {
            return {
                color: this.props.metricFontColor || '#0a0a0a',
                fontSize: this.props.metricFontSize || '1.25rem',
                fontWeight: this.props.metricFontWeight || '700',
                fontFamily: this.props.metricFontFamily || 'inherit'
            };
        },
        borderSoftClass() {
            const color = this.props.colorScheme || 'zinc';
            return colorBorderSoft[color] || colorBorderSoft.zinc;
        },
        iconBadgeClass() {
            const color = this.props.iconScheme || 'pink';
            return [`bg-${color}-100 text-${color}-600 dark:bg-${color}-950/40 dark:text-${color}-400`].join(' ');
        },
        numericValue() {
            if (!this.result || !this.result.rows || !this.props.metric) return null;
            const row = this.result.rows[0] || {};
            const value = row[this.props.metric];
            return typeof value === 'number' ? value : Number(value);
        },
        formattedValue() {
            if (this.numericValue === null || Number.isNaN(this.numericValue)) return '—';
            return formatNumber(this.numericValue, { maximumFractionDigits: this.props.decimals ?? 0 });
        },
        deltaValue() {
            if (!this.result || !this.result.rows || this.result.rows.length < 2) return null;
            const rows = this.result.rows;
            const current = Number(rows[0][this.props.metric]);
            const prev = Number(rows[1][this.props.metric]);
            if (Number.isNaN(current) || Number.isNaN(prev)) return null;
            if (this.props.deltaMode === 'absolute') return current - prev;
            if (this.props.deltaMode === 'percent') return prev === 0 ? null : ((current - prev) / Math.abs(prev)) * 100;
            // auto
            return prev === 0 ? null : ((current - prev) / Math.abs(prev)) * 100;
        },
        hasDelta() {
            return this.deltaValue !== null && !Number.isNaN(this.deltaValue);
        },
        isDeltaPositive() {
            return (this.deltaValue ?? 0) >= 0;
        },
        deltaClass() {
            const isGood = this.props.goodIsPositive ? this.isDeltaPositive : !this.isDeltaPositive;
            const pos = this.props.positiveColor || 'emerald';
            const neg = this.props.negativeColor || 'red';
            return isGood ? colorText600[pos] : colorText600[neg];
        },
        deltaSymbol() {
            if (!this.hasDelta) return '';
            return this.isDeltaPositive ? '▲' : '▼';
        },
        formattedDelta() {
            if (!this.hasDelta) return '';
            const value = this.deltaValue;
            if (this.props.deltaMode === 'absolute') return formatNumber(value, { maximumFractionDigits: this.props.decimals ?? 0 });
            return `${formatNumber(value, { maximumFractionDigits: 1 })}%`;
        },
        sparklinePoints() {
            if (!this.props.showSparkline || !this.result || !Array.isArray(this.result.rows)) return [];
            const values = this.result.rows
                .map((r) => Number(r[this.props.metric]))
                .filter((n) => Number.isFinite(n));
            if (!values.length) return [];
            const width = 100;
            const height = 40;
            const padding = this.sparklinePaddingY;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1;
            return values.map((v, i) => {
                const x = (i / (values.length - 1 || 1)) * width;
                const y = padding + (1 - ((v - min) / range)) * (height - padding * 2);
                return `${x},${y}`;
            });
        },
        areaPoints() {
            if (!this.sparklinePoints.length) return '';
            const baseY = 40 - this.sparklinePaddingY; // низ viewBox с небольшим отступом
            const open = `0,${baseY}`;
            const line = this.sparklinePoints.join(' ');
            const close = `100,${baseY}`;
            return `${open} ${line} ${close}`;
        },
        sparklineClass() {
            if (this.props.sparklineFollowDelta && this.hasDelta) {
                const isGood = this.props.goodIsPositive ? this.isDeltaPositive : !this.isDeltaPositive;
                const color = isGood ? (this.props.positiveColor || 'emerald') : (this.props.negativeColor || 'red');
                return colorText500[color];
            }
            const explicit = this.props.sparklineScheme || 'emerald';
            return colorText500[explicit] || colorText500.emerald;
        },
        sparklineStroke() {
            if (this.props.sparklineFollowDelta && this.hasDelta) {
                const isGood = this.props.goodIsPositive ? this.isDeltaPositive : !this.isDeltaPositive;
                const color = isGood ? (this.props.positiveColor || 'emerald') : (this.props.negativeColor || 'red');
                return colorHex500[color];
            }
            const explicit = this.props.sparklineScheme || 'emerald';
            return colorHex500[explicit] || colorHex500.emerald;
        },
        deltaIconWrapperClass() {
            const isGood = this.props.goodIsPositive ? this.isDeltaPositive : !this.isDeltaPositive;
            const color = isGood ? (this.props.positiveColor || 'emerald') : (this.props.negativeColor || 'red');
            return `${colorBgSoft[color]} ${colorText600[color]}`;
        },
        deltaTextStyle() {
            const isGood = this.props.goodIsPositive ? this.isDeltaPositive : !this.isDeltaPositive;
            const color = isGood ? (this.props.positiveColor || 'emerald') : (this.props.negativeColor || 'red');
            return { color: colorHex600[color] };
        },
        deltaCircleStyle() {
            const isGood = this.props.goodIsPositive ? this.isDeltaPositive : !this.isDeltaPositive;
            const color = isGood ? (this.props.positiveColor || 'emerald') : (this.props.negativeColor || 'red');
            return { color: colorHex600[color], backgroundColor: colorBgSoftHex[color] };
        },
        viewBox() {
            return '0 0 100 40';
        },
        sparklineHeight() {
            const h = Number(this.props.sparklineHeight);
            return Number.isFinite(h) && h > 0 ? h : 36;
        },
        gradientId() {
            return `kpiGradient-${this._uid}`;
        },
        clipId() {
            return `kpiClip-${this._uid}`;
        },
        sparklinePaddingY() {
            const stroke = Number(this.props.sparklineWidth || 1.25);
            const minPad = 1.5;
            const extra = stroke * 0.8;
            return Math.max(minPad, extra);
        }
    },
    methods: {
        // IDE suggestion helper
        ...ElemInstanceTypeDescriptor,
        ...ElemDatasetMixinTypes,
        loadDataPage(page) {
            this.page = page;
            this.loadData();
        },
        
    }
};
</script>
