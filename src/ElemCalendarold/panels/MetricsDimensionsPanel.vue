<template>
    <w-panel>
        <ui-select prop="metrics.date" :options="metricDimensionOptions">Выбранная дата</ui-select>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    meta: { name: 'Измерения/Метрики', icon: 'gauge' },
    data: () => ({
        ...PanelDatasetMixinTypes,
        ...PanelInstanceTypeDescriptor
    }),
    computed: {
        metricDimensionOptions() {
            return this.buildOptions([...this.dimensions, ...this.metrics], { empty: true });
        }
    }
};
</script>
