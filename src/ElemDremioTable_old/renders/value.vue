<template>
    <div :class="cellCssClass" v-on="cellEventHandlers">
        <ui-tooltip v-bind="{ ...tooltipOpts }">
            <template #target="{ events, binds }">
                <div v-bind="binds" v-on="tooltip.enable ? events : {}">
                    <span
                        v-if="isNumerationColumn"
                        :class="shouldDisplayNumeration.cssClass()"
                        :style="shouldDisplayNumeration.style()">
                        {{ rowNumber }}
                    </span>
                    <span v-else :class="value.cssClass()" :style="value.style()">
                        {{ value.format() }}
                    </span>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltipValue }}</div>
        </ui-tooltip>
    </div>
</template>
<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import RenderMixin from './render-mixin';
import { ColumnParamTypeNames } from '../utils/constants';

export default {
    components: { UiTooltip },
    mixins: [RenderMixin],
    props: {
        value: {
            type: Object,
            default: () => ({})
        },
        shouldDisplayNumeration: {
            type: Object,
            default: () => ({
                value: false,
                type: ColumnParamTypeNames.BOOLEAN
            })
        }
    },
    computed: {
        tooltipValue() {
            const { tooltip, value, isNumerationColumn, rowNumber } = this;

            if (tooltip.value == null) {
                return isNumerationColumn ? rowNumber : value.format();
            }

            return tooltip.value;
        },
        isNumerationColumn() {
            return this.shouldDisplayNumeration.value === true;
        },
        rowNumber() {
            return this.queryOffset + this.rowIndex + 1;
        }
    }
};
</script>
