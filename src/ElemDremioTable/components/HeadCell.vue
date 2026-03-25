<template>
    <div class="d-inline-flex flex-v-center">
        <ui-tooltip v-if="isIconEnable" v-bind="tooltipOptions">
            <template #target="{ events, binds }">
                <div
                    v-bind="binds"
                    :class="iconClass"
                    :style="iconStyle"
                    class="title-icon"
                    v-on="tooltip.enable ? events : {}">
                    <i class="mdi" :class="mdiClass"/>
                </div>
            </template>
            <div :style="tooltipStyle">{{ tooltip.text }}</div>
        </ui-tooltip>
        <div class="order-none" :class="{ 'text-truncate': widgetProps.shouldTruncateHeader }">
            <div
                v-if="column.sort"
                class="row row-gap-2 cursor-pointer flex-nowrap"
                @click="$emit('column-sorted', column)">
                <div class="col col-vmid text-truncate">
                    <div :class="titleClass" v-html="column.title"></div>
                </div>
                <div class="col col-vmid col-auto">
                    <i class="mdi" :class="sortIconClass"/>
                </div>
            </div>
            <div v-else :class="titleClass" v-html="column.title"></div>
        </div>
    </div>
</template>

<script>
import { Tooltip as UiTooltip } from 'goodteditor-ui';
import { buildIconCssVariables } from '../utils';
import { sortIconClassesMap } from '../utils/config';
import { TitleIconFactory, TooltipFactory } from '../utils/constants';

export default {
    components: { UiTooltip },
    inject: ['$widget', 'cssStrToObj'],
    props: {
        column: {
            type: Object,
            default: () => ({})
        },
        getColumnSortType: {
            type: Function,
            default: () => {}
        }
    },
    computed: {
        titleIcon() {
            return this.column.icon ?? TitleIconFactory();
        },
        isIconEnable() {
            return this.titleIcon?.enable;
        },
        iconClass() {
            return this.titleIcon.position === '1' ? 'mar-left-3' : 'mar-right-3';
        },
        iconStyle() {
            const { size, position, color, colorHover } = this.titleIcon;
            return this.$widget.genCssVarsStyle(buildIconCssVariables({ size, position, color, colorHover }));
        },
        mdiClass() {
            return `mdi-${this.titleIcon.name}`;
        },
        sortIconClass() {
            const sortType = this.getColumnSortType(this.column);
            const { value } = this.column.params;
            const iconClass = sortIconClassesMap[sortType].get(value?.format);
            return { [iconClass]: true };
        },
        tooltip() {
          return this.titleIcon.tooltip ?? TooltipFactory();
        },
        tooltipOptions() {
            const { position, hideDelay, offsetX, offsetY } = this.tooltip;
            return {
                position,
                // eslint-disable-next-line no-restricted-syntax
                positionOffset: [offsetX, offsetY],
                hideDelay
            };
        },
        tooltipStyle() {
            return this.cssStrToObj(this.tooltip.style);
        },
        widgetProps() {
            return this.$widget.props;
        },
        titleClass() {
            return this.widgetProps.shouldTruncateHeader ? 'text-truncate' : 'whitespace-normal';
        }
    },
    implicitCssModule: true
};
</script>
<style module lang="postcss">
.title-icon {
    composes: icon from global;

    width: fit-content;
    height: fit-content;
    align-self: center;
    order: var(--w-icon_order);

    & > i {
        font-size: var(--w-icon_font-size);
        color: var(--w-icon_color);
        line-height: 1;
        transition: color 0.2s ease;

        &:hover {
            color: var(--w-icon--hover_color);
        }
    }
}
</style>
