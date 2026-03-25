<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <a :class="value.cssClass()" :style="value.style()" href="#" @click.prevent="onClick">
                        {{ value.format() }}
                    </a>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
        </ui-tooltip>
    </div>
</template>
<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';
import { buildQueryFromUrlParam } from '../utils/utils';
import { ColumnParamTypeNames } from '../utils/constants';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        value: {
            type: Object,
            default: () => ({})
        },
        url: {
            type: Object,
            default: () => ({})
        },
        urlParamName: {
            type: Object,
            default: () => ({})
        },
        urlParamValue: {
            type: Object,
            default: () => ({})
        },
        shouldOpenNewTab: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, value } = this;
            return tooltip.value == null ? value.format() : tooltip.value;
        }
    },
    methods: {
        onClick() {
            const {
                url: { value: path },
                urlParamName,
                urlParamValue,
                shouldOpenNewTab
            } = this;

            if (this.canRowToggleItself || this.canCollapseExpandRow) {
                this.$emit('click');
            }

            if (path == null) {
                return;
            }

            const query = buildQueryFromUrlParam(urlParamName, urlParamValue);

            this.navigate({ path, query }, shouldOpenNewTab.value);
        }
    }
};
</script>
