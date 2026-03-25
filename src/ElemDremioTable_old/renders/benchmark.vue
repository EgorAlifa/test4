<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div class="d-inline-flex" :class="value.cssClass()" :style="value.style()">
                        {{ value.format() }}
                    </div>
                    <i class="mdi" :class="indicatorClass" :style="indicator.style()"></i>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
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
        value: {
            type: Object,
            default: () => ({})
        },
        indicator: {
            type: Object,
            default: () => ({})
        },
        icons: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, value } = this;
            return tooltip.value == null ? value.format() : tooltip.value;
        },
        indicatorClass() {
            const { indicator, icons } = this;
            const classes = [...indicator.cssClass()];

            if (indicator.value === 0) {
                return classes;
            }

            const isPositive = indicator.value > 0;
            let [upIconClass, downIconClass] = ['mdi-menu-up', 'mdi-menu-down'];

            if (icons.value === null) {
                return [...classes, isPositive ? upIconClass : downIconClass];
            }

            if (icons.value.includes(',')) {
                [upIconClass, downIconClass] = icons.value.split(',');
                return [...classes, isPositive ? upIconClass : downIconClass];
            }

            return [...classes, icons.value];
        }
    }
};
</script>
