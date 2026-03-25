<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div class="d-flex" :class="{ 'flex-col': !shouldLineUp.value }">
                        <div v-for="(item, i) in value" :class="item.cssClass()" :key="i" :style="item.style()">
                            {{ item.format() }}
                        </div>
                    </div>
                </div>
            </template>
            <div v-if="tooltip.value == null">
                <div v-for="(item, i) in value" :key="i" :style="tooltipStyle">
                    {{ item.format() }}
                </div>
            </div>
            <div v-else :style="tooltipStyle">
                {{ tooltip.value }}
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
        value: {
            type: Array,
            default: () => []
        },
        shouldLineUp: {
            type: Object,
            default: () => ({
                value: false,
                type: 'BOOLEAN'
            })
        }
    }
};
</script>
