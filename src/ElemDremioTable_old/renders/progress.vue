<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div class="row w-100" v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div v-if="valueLeft.value" class="col col-auto col-vmid">
                        <span :class="valueLeft.cssClass()" :style="leftContentStyle" class="left-content">
                            {{ valueLeft.format() }}
                        </span>
                    </div>
                    <div class="col col-vmid">
                        <div
                            class="wrapper h-2.5 scroll-none radius-5"
                            :class="backgroundStyle.cssClass()"
                            :style="backgroundStyle.style()">
                            <div class="progress-line w-0 h-100" :style="retStyle"></div>
                        </div>
                    </div>
                    <div v-if="valueRight.value" class="col col-auto col-vmid">
                        <span :class="valueRight.cssClass()" :style="rightContentStyle" class="right-content">
                            {{ valueRight.format() }}
                        </span>
                    </div>
                </div>
            </template>
            <div :style="tooltipStyle">
                {{ tooltipValue }}
            </div>
        </ui-tooltip>
    </div>
</template>

<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        valueLeft: {
            type: Object,
            default: () => ({})
        },
        valueRight: {
            type: Object,
            default: () => ({})
        },
        lineStyle: {
            type: Object,
            default: () => ({})
        },
        backgroundStyle: {
            type: Object,
            default: () => ({})
        },
        maxProgressVal: {
            type: Object,
            default: () => ({})
        },
        metricsMaxValues: {
            type: Object,
            private: true,
            default: () => ({})
        }
    },
    data() {
        return {
            leftContentWidth: '',
            rightContentWidth: ''
        };
    },
    computed: {
        tooltipValue() {
            const { tooltip, valueLeft, valueRight } = this;

            if (tooltip.value == null) {
                return valueLeft.value ? valueLeft.format() : valueRight.format();
            }

            return tooltip.value;
        },
        leftContentStyle() {
            const varsStyle = this.$widget.genCssVarsStyle({
                'left-content-width': this.leftContentWidth
            });
            return { ...this.valueLeft.style(), ...varsStyle };
        },
        rightContentStyle() {
            const varsStyle = this.$widget.genCssVarsStyle({
                'right-content-width': this.rightContentWidth
            });
            return { ...this.valueRight.style(), ...varsStyle };
        },
        retStyle() {
            const retStyle = this.lineStyle.style();
            const { value = 0 } = this.valueRight.value ? this.valueRight : this.valueLeft;
            const { maxProgressVal, metricsMaxValues } = this;
            let maxVal = maxProgressVal?.name ? Number(maxProgressVal.value) : 100;
            let width = 0;
            if (metricsMaxValues[maxProgressVal.name]) {
                maxVal = Number(metricsMaxValues[maxProgressVal.name]);
            }
            width = value > maxVal ? 100 : (value / maxVal) * 100;
            retStyle.width = `${Math.floor(width)}%`;
            return retStyle;
        }
    },
    watch: {
        lineStyle: {
            handler() {
                this.setColumnsWidth();
            },
            immediate: true
        }
    },
    methods: {
        calculateWidth() {
            const elem = this.$el;
            if (elem == null) {
                return;
            }
            const columnNumber = elem.dataset.column;
            const cellsInColumn = elem.closest('.tbody').querySelectorAll(`[data-column="${columnNumber}"]`);
            const colWidth = [...cellsInColumn].reduce(
                (acc, cell) => {
                    const leftValue = cell.querySelector('[class*=left-content]')?.offsetWidth;
                    const left = Math.max(acc.left, leftValue);
                    const rightValue = cell.querySelector('[class*=right-content]')?.offsetWidth;
                    const right = Math.max(acc.right, rightValue);
                    return { left, right };
                },
                { left: 0, right: 0 }
            );
            this.leftContentWidth = `${colWidth.left}px`;
            this.rightContentWidth = `${colWidth.right}px`;
        },
        setColumnsWidth() {
            this.leftContentWidth = 'auto';
            this.rightContentWidth = 'auto';
            this.$nextTick(() => {
                this.calculateWidth();
            });
        }
    },

    implicitCssModule: true
};
</script>

<style module lang="pcss" src="./progress.pcss"></style>
