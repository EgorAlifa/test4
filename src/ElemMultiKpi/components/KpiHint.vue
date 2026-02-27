<template>
    <w-tooltip>
        <template #target="{ events, binds }">
            <div v-bind="binds" v-on="events" class="kpi-hint icon self-center">
                <i class="kpi-hint-icon mdi mdi-help-circle-outline"></i>
            </div>
        </template>
        <template #tooltip>
            <div :style="cssVarsStyle" class="kpi-tooltip tooltip">
                {{ text }}
            </div>
        </template>
    </w-tooltip>
</template>
<script>
import { Tooltip as WTooltip } from 'goodteditor-ui';
import { useComputedWhenMixin } from '@goodt-wcore/utils';
import { resolveValueWithUnits } from '../utils';

export default {
    components: {
        WTooltip
    },
    mixins: [useComputedWhenMixin()],
    inject: ['$widget'],
    computedEditor: {
        text() {
            return this.$widget.props.textHint;
        },
        cssVarsStyle() {
            return this.$widget.buildCssVarsStyle({
                tooltip_width: ({ sizeWidthHint, sizeUnitWidthHint }) =>
                    resolveValueWithUnits(sizeWidthHint, sizeUnitWidthHint),
                'tooltip_font-size': ({ sizeHint, sizeUnitHint }) => resolveValueWithUnits(sizeHint, sizeUnitHint),
                tooltip_color: 'colorHintText',
                'tooltip_bg-color': 'bgColorTooltipHint'
            });
        }
    }
};
</script>
<style scoped lang="pcss">
@b kpi-tooltip {
    width: var(--w-tooltip_width);
    font-size: var(--w-tooltip_font-size);
    color: var(--w-tooltip_color);
    background-color: var(--w-tooltip_bg-color);
}

@b kpi-hint {
    white-space: pre-wrap;
    line-height: 1;
}

@b kpi-hint-icon {
    color: var(--w-kpi-hint-icon_color);
    font-size: var(--w-kpi-hint-icon_font-size);
}
</style>
