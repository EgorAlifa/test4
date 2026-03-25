<template>
    <ui-panel-container>
        <ui-container>
            <ui-input prop="grid.cols" min="1" type="number">
                {{ descriptor.props.grid.label.cols }}
            </ui-input>
            <ui-input-units prop="grid.gap" :units="SizeUnits">
                {{ descriptor.props.grid.label.gap }}
            </ui-input-units>
            <ui-input-units prop="grid.rowMinHeight" :units="SizeUnits" :options="options">
                {{ descriptor.props.grid.label.rowMinHeight }}
            </ui-input-units>
            <ui-switch prop="isEqualWidthColumns">
                {{ descriptor.props.isEqualWidthColumns.label }}
            </ui-switch>
        </ui-container>
    </ui-panel-container>
</template>
<script>
import { Panel } from '@goodt-wcore/core';
import { SizeUnits } from '@goodt-wcore/panels';
import { PanelInstanceTypeDescriptor } from '../types';
import UiContainer from './components/UiContainer.vue';

export default {
    extends: Panel,
    components: { UiContainer },
    static: {
        SizeUnits,
        options: [{ value: 'inherit', label: 'inherit' }]
    },
    meta: { name: 'Сетка', icon: 'grid' },
    data: () => ({
        ...PanelInstanceTypeDescriptor
    })
};
</script>
