<template>
    <div ref="container" class="gauge-container">
        <div :class="[percentShow ? 'goal-gauge-flex' : 'goal-gauge']">
            <svg class="w-100 h-100" :viewBox="viewBox">
                <w-gauge-group
                    v-for="(group, i) in svgGaugeGroups"
                    :key="i"
                    v-bind="group.binds"
                    :transform="resolveTransform(group.binds)"></w-gauge-group>
            </svg>

            <div class="metric-percent">
                <i v-if="iconShow" class="mdi icon" :class="[iconClass]"></i>

                <span v-for="(metric, index) in metricsSet" :key="index" v-show="percentShow && showPercent">
                    {{ getValueByFormat(metric.value, metric.limit, metric.format, percentFormat)
                    }}{{ metric.format === 'percent' ? '%' : '' }}
                </span>
            </div>

            <ui-portal :to="portalTarget">
                <div
                    v-if="tooltipMetric"
                    class="tooltip pos-fixed pos-top-left events-none mar-3"
                    :style="tooltipStyle">
                    <div>
                        {{ tooltipType === 'value' ? tooltipMetric.nameValue : tooltipMetric.nameLimit }}
                    </div>
                    <div class="nobr">
                        <span
                            class="tooltip-content"
                            :style="{
                                backgroundColor:
                                    tooltipType === 'value' ? tooltipMetric.valueColor : tooltipMetric.limitColor
                            }"></span>
                        <template v-if="tooltipType === 'value'">
                            {{ tooltipMetric.valueName }}:
                            {{
                                getValueByFormat(
                                    tooltipMetric.value,
                                    tooltipMetric.limit,
                                    tooltipMetric.format,
                                    percentFormat
                                )
                            }}{{ tooltipMetric.format === 'percent' ? '%' : '' }}
                        </template>
                        <template v-else>
                            {{ tooltipMetric.limitName }}:
                            {{
                                getValueByFormat(
                                    tooltipMetric.limit,
                                    tooltipMetric.limit,
                                    tooltipMetric.format,
                                    percentFormat
                                )
                            }}{{ tooltipMetric.format == 'percent' ? '%' : '' }}
                        </template>
                    </div>
                </div>
            </ui-portal>
        </div>
    </div>
</template>

<script>
import { Const } from 'goodt-wcore';
import { Portal as UiPortal } from '@goodt-wcore/components';
import { mixinGauge } from '../utils/helper';
import WGaugeGroup from './GaugeGroup.vue';

export default {
    components: { WGaugeGroup, UiPortal },
    mixins: [mixinGauge],
    props: {
        metricsSet: {
            type: Array,
            required: true
        },
        showPercent: {
            type: Boolean
        },
        percentFormat: {
            type: String,
            default: ''
        },
        percentShow: {
            type: Boolean,
            default: false
        },
        iconShow: {
            type: Boolean,
            default: false
        },
        iconClass: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            tooltipMetric: null,
            tooltipType: null,
            tooltipPos: { x: 0, y: 0 },
            portalTarget: Const.PORTAL_TARGET_NAME_POPUP
        };
    },
    computed: {
        viewBox() {
            const { svgViewBoxSize } = this;
            return `0 0 ${svgViewBoxSize} ${svgViewBoxSize}`;
        },
        svgGaugeGroups() {
            const { metricsSet } = this;
            let indentAcc = 0;
            return metricsSet
                .map((metricSetItem) => {
                    const {
                        value,
                        valueWidth,
                        valueColor,
                        limit,
                        limitWidth,
                        limitColor,
                        indent,
                        format,
                        rounded,
                        dashed,
                        dasharray,
                        dashoffset,
                        dropShadow
                    } = metricSetItem;
                    const width = Math.max(valueWidth, limitWidth);
                    const radius = indent + width / 2 + indentAcc;
                    indentAcc += indent + width;
                    return {
                        binds: {
                            radius,
                            value: format === 'delta' ? limit - value : value,
                            valueWidth,
                            valueColor,
                            limit,
                            limitWidth,
                            limitColor,
                            useSegments: format === 'segment',
                            linecap: rounded ? 'round' : 'butt',
                            'stroke-dasharray': dashed ? dasharray : null,
                            'stroke-dashoffset': dashed ? dashoffset : null,
                            valueListeners: {
                                mousemove: this.mouseMoveHandler,
                                mouseenter: () => this.mouseEnterHandler(metricSetItem, 'value'),
                                mouseleave: this.mouseLeaveHandler
                            },
                            limitListeners: {
                                mousemove: this.mouseMoveHandler,
                                mouseenter: () => this.mouseEnterHandler(metricSetItem, 'limit'),
                                mouseleave: this.mouseLeaveHandler
                            },
                            dropShadow
                        },
                        metric: metricSetItem
                    };
                })
                .reverse();
        },
        svgViewBoxSize() {
            return this.svgGaugeGroups.reduce((acc, { binds }) => {
                const { radius, valueWidth, limitWidth, dropShadow } = binds;
                const dropShadowGroup = this.buildDropShadow(dropShadow);
                const width = Math.max(valueWidth, limitWidth);
                const n = (radius + width / 2 + dropShadowGroup.blurRadius * 2) * 2;
                return acc > n ? acc : n;
            }, 0);
        },
        tooltipStyle() {
            const { x, y } = this.tooltipPos;
            return { transform: `translate(${x}px, ${y}px)` };
        }
    },
    methods: {
        resolveTransform({ radius }) {
            return `translate(${this.svgViewBoxSize / 2 - radius}, ${this.svgViewBoxSize / 2 - radius})`;
        },
        mouseEnterHandler(item, type) {
            this.tooltipType = type;
            this.tooltipMetric = item;
        },
        mouseLeaveHandler() {
            this.tooltipMetric = null;
        },
        mouseMoveHandler({ x, y }) {
            this.tooltipPos = { x, y };
        },
        buildDropShadow(textDropShadow) {
            const [offsetX = 0, offsetY = 0, blurRadius = 0, color = ''] = textDropShadow.split(' ');

            return {
                offsetX: parseInt(offsetX, 10),
                offsetY: parseInt(offsetY, 10),
                blurRadius: parseInt(blurRadius, 10),
                color
            };
        }
    }
};
</script>

<style lang="pcss" scoped>
svg {
    position: relative;
    z-index: 20;
    circle {
        fill: none;
        stroke: #191919;
        transition: 0.2s;
    }
}

.goal-gauge {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.goal-gauge-flex {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.metric-percent {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--w-percent_color);
    font-size: var(--w-percent_font-size);
    font-family: var(--w-percent_font-family);
}

.goal-icon {
    width: 100%;
    pointer-events: none;
}

.goal-gauge .goal-icon {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}
.gauge-container {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    z-index: 0;
}

.tooltip- {
    background: rgba(50, 50, 50, 0.7);
    padding: 5px;
    border-radius: 4px;
    pointer-events: none;
    min-width: 150px;
    opacity: 0;
    transition: opacity 0.4s;
    color: rgb(255, 255, 255);
}

.tooltip-content {
    display: inline-block;
    margin-right: 5px;
    border-radius: 10px;
    width: 10px;
    height: 10px;
    background-color: hsl(0, 0%, 20%);
}

.icon {
    font-size: var(--w-icon-size);
    color: var(--w-icon-color);
}
</style>
