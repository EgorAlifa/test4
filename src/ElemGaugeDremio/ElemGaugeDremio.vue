<template>
    <w-elem :placeholder="$placeholder" :style="props.showBackground ? { backgroundColor: props.backgroundColor } : {}">
        <div class="d-flex flex-col w-100 h-100">
            <div v-if="props.showTitle" class="header" ref="header">{{ props.title }}</div>
            <div class="content d-flex w-100" :style="contentStyle">
                <w-gauge
                    v-if="metricsSet.length > 0"
                    :percent-show="props.percentPosition === 'center'"
                    :percent-format="props.percentFormat"
                    :show-percent="props.showPercent"
                    :metrics-set="metricsSet"
                    :icon-show="props.iconShow"
                    :icon-class="props.iconClass"
                    :style="gaugeStyle" />
                <w-legend v-if="props.showLegend" :metrics-set="metricsSet" ref="legend" />
                <w-percent
                    v-if="props.showPercent && props.percentPosition !== 'center'"
                    :percent-format="props.percentFormat"
                    :metrics-set="metricsSet"
                    ref="percent" />
            </div>
        </div>
    </w-elem>
</template>
<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetMixin, ElemDatasetMixinTypes } from '@goodt-common/data';
import { meta } from './descriptor';
import WGauge from './components/Gauge.vue';
import WLegend from './components/Legend.vue';
import WPercent from './components/Percent.vue';
import { DatasetPanelMixin } from './panels';

export default {
    name: 'ElemGaugeDremio',
    extends: Elem,
    components: { WGauge, WLegend, WPercent },
    mixins: [useElemDatasetMixin({ panel: { mixins: [DatasetPanelMixin] } })],

    meta,

    data() {
        return {
            /** @public */
            contentHeight: null,
            gaugeHeight: null,
            ...ElemDatasetMixinTypes
        };
    },
    computed: {
        metricsSet() {
            const { result, metrics } = this;
            const { levels } = this.props;
            let radius = 0;
            const targetRow = result?.rows?.[0] ?? {};
            const resolveMetricName = (metric) => (typeof metric === 'string' ? metric : metrics[metric] ?? '');
            const getMetricValue = (row, key) => Number(row[key] ?? 0);
            return levels.map((level, index) => {
                radius += Number(level.indent);
                radius += index ? Number(level.valueWidth) : 0;
                const valueName = resolveMetricName(level.value);
                const limitName = resolveMetricName(level.limit);
                return {
                    valueName,
                    limitName,
                    radius,
                    metricNameValue: level.metricNameValue,
                    metricNameLimit: level.metricNameLimit,
                    nameLimit: level.nameLimit,
                    nameValue: level.nameValue,
                    dashed: level.dashed,
                    dasharray: level.dasharray,
                    dashoffset: level.dashoffset,
                    indent: level.indent,
                    rounded: level.rounded,
                    limitColor: level.limitColor,
                    valueColor: level.valueColor,
                    limitWidth: level.limitWidth,
                    valueWidth: level.valueWidth,
                    value: getMetricValue(targetRow, valueName),
                    limit: getMetricValue(targetRow, limitName),
                    showLimit: level.showLimit,
                    showValueSign: level.showValueSign,
                    showLimitSign: level.showLimitSign,
                    limitPosX: level.limitPosX,
                    limitPosY: level.limitPosY,
                    valuePosX: level.valuePosX,
                    valuePosY: level.valuePosY,
                    limitSignColor: level.limitSignColor,
                    limitSignFont: level.limitSignFont,
                    limitSignFontSize: level.limitSignFontSize,
                    valueSignColor: level.valueSignColor,
                    valueSignFont: level.valueSignFont,
                    valueSignFontSize: level.valueSignFontSize,
                    format: level.format,
                    dropShadow: level.dropShadow ?? ''
                };
            });
        },
        contentStyle() {
            return this.contentHeight ? { height: `${this.contentHeight}px` } : '';
        },
        gaugeStyle() {
            return this.gaugeHeight ? { height: `${this.gaugeHeight}px` } : '';
        }
    },
    watchEditor: {
        props: {
            handler() {
                this.calcContentHeight();
            },
            deep: true
        }
    },
    subscribe: [
        {
            event() {
                return this.props.updateEvent;
            },
            handler() {
                this.loadData();
            }
        }
    ],
    mounted() {
        this.calcContentHeight();
    },
    methods: {
        calcContentHeight() {
            if (this.props.fitHeight === false) {
                this.contentHeight = null;
                this.gaugeHeight = null;
                return;
            }
            const { header, legend, percent } = this.$refs;
            const { showTitle, showLegend, showPercent, percentPosition } = this.props;

            this.contentHeight = this.$el.clientHeight;
            if (showTitle) {
                this.contentHeight -= header.clientHeight;
            }

            this.gaugeHeight = this.contentHeight;
            if (showLegend && ['top', 'bottom'].includes(percentPosition)) {
                this.gaugeHeight -= legend.$el.clientHeight;
            }
            if (showPercent && ['top', 'bottom'].includes(percentPosition)) {
                this.gaugeHeight -= percent.$el.clientHeight;
            }
        }
    }
};
</script>

<style scoped>
.content {
    flex-direction: var(--w-percent-align);
}
.header {
    width: 100%;
    display: var(--w-title_display);
    color: var(--w-title_color);
    font-size: var(--w-title_font-size);
    font-family: var(--w-title_font-family);
}
</style>
