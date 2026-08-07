<template>
    <w-panel>
        <ui-container>
            <ui-select prop="valueMetric" :options="metrics" label="Метрика значения"></ui-select>
            <ui-select prop="benchmarkMetric" :options="metrics" label="Метрика ориентира"></ui-select>
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

    meta: { name: 'Метрики', icon: 'gauge' },

    watch: {
        metrics: {
            handler(metrics) {
                // Auto-select first two metrics if not set
                if (this.props.valueMetric == null && metrics.length > 0) {
                    this.props.valueMetric = metrics[0];
                    this.propChanged('valueMetric');
                    
                    // Set default title to metric name if title is empty
                    if (this.props.title == null || this.props.title === '' || this.props.title === 'Sales Goals') {
                        this.props.title = metrics[0];
                        this.propChanged('title');
                    }
                }
                if (this.props.benchmarkMetric == null && metrics.length > 1) {
                    this.props.benchmarkMetric = metrics[1];
                    this.propChanged('benchmarkMetric');
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

