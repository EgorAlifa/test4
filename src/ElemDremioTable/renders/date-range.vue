<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div :class="valueFrom.cssClass()" :style="valueFrom.style()">
                        {{ valueFrom.format() || '-' }}
                    </div>
                    <div :class="valueTo.cssClass()" :style="valueTo.style()">
                        {{ valueTo.format() || '-' }}
                    </div>
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
        valueFrom: {
            type: Object,
            default: () => ({})
        },
        valueTo: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, valueFrom, valueTo } = this;
            return tooltip.value == null ? `${valueFrom.format() || '-'} ${valueTo.format() || '-'}` : tooltip.value;
        }
    }
};
</script>
