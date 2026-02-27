<template>
    <w-panel>
        <ui-container>
            <!-- your panel goes here -->
            <ui-select prop="metric" :options="metrics"></ui-select>
            <ui-select prop="dimension" :options="dimensions"></ui-select>
            <ui-select prop="dimensionOrMetric" :options="dimensionsMetricsOptions"></ui-select>
            <ui-select prop="field" :options="fields"></ui-select>
            <ui-select prop="drilldownName" :options="drilldowns"></ui-select>
            <ui-select :options="drilldownDimensionsOptions">
                Выберите измерение из дриллдауна
            </ui-select>
        </ui-container>
    </w-panel>
</template>

<script>
import { Panel } from '@goodt-wcore/panel';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PanelInstanceTypeDescriptor } from '../types';

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],

    meta: { name: 'Настройки виджета', icon: 'widgets' },

    data: () => ({}),
    computed: {
        dimensionsMetricsOptions() {
            return this.buildOptions(this.dimensionsMetrics, { empty: true });
        },
        drilldownDimensionsOptions() {
            return this.$drilldown.getDimensions(this.props.drilldown).map((dimension, index) => ({
                label: dimension,
                value: index
            }));
        },
    },
    watch: {
        dimensions: {
            handler(dimensions) {
                if (dimensions.includes(this.props.dimension) === false) {
                    this.props.dimension = dimensions[0] ?? '';
                    this.propChanged('dimension');
                }
            },
            immediate: true
        }
    },
    methods: {
        ...PanelInstanceTypeDescriptor,
        ...PanelDatasetMixinTypes
    }
};
</script>

