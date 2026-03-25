<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div class="row row-collapse" v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <div v-if="imageLeft.value" class="col col-auto col-vmid">
                        <img
                            :src="imageLeft.value"
                            :class="imageLeft.cssClass()"
                            :style="imageLeft.style()"
                            class="mar-right-3" />
                    </div>
                    <div class="col col-vmid">
                        <div :class="value.cssClass()" :style="value.style()">{{ value.format() }}</div>
                    </div>
                    <div v-if="imageRight.value" class="col col-auto col-vmid">
                        <img
                            :src="imageRight.value"
                            :class="imageRight.cssClass()"
                            :style="imageRight.style()"
                            class="mar-left-3" />
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
        value: {
            type: Object,
            default: () => ({})
        },
        imageLeft: {
            type: Object,
            default: () => ({})
        },
        imageRight: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, value } = this;
            return tooltip.value == null ? value.format() : tooltip.value;
        }
    }
};
</script>
