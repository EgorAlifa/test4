<template>
    <w-panel>
        <ui-container>
            <ui-select v-model="seriesType" :options="SeriesTypeOptions" @change="onSeriesTypeChange">
                Шаблоны метрик
            </ui-select>

            <ui-draggable-accordion
                v-model="props.metricsStyle"
                v-bind="{ toolboxControls }"
                @change="propChanged('metricsStyle')">
                <template #header="{ item }">{{ item.marker }}</template>
                <template #default="{ item, index }">
                    <w-metric-settings
                        :key="item.uid"
                        v-bind="{
                            styles: item,
                            index,
                            axis: props.axis,
                            seriesType,
                            metricNames,
                            metricsStyleNames,
                            dimensionOptions: props.dimensionOptions,
                            datasetNames,
                            dimValueNames,
                            minorDimensionNames,
                            condStyleTypes: conditionStyleTypes,
                            condStyleFactory,
                            elemComputedStyles,
                            templateIndex
                        }"
                        class="p"
                        @change-style="changeStyles"
                        @delete="deleteMetric"></w-metric-settings>
                </template>
            </ui-draggable-accordion>

            <ui-button type="ghost" @click="addMetric">Добавить метрику</ui-button>
        </ui-container>
    </w-panel>
</template>
<script>
import { Panel } from '@goodt-wcore/panel';
import { UiDraggableAccordion } from '@goodt-wcore/panel-ui';
import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { cloneDeep as _cloneDeep } from 'lodash';
import { createSeriesTemplateByIndex } from '../utils/constants';
import { utils, condStyleTypes, condStyleFactory, propsFixer } from '../utils';
import { SeriesTypeOptions } from './config';
import WMetricSettings from './components/Metric.vue';

/**
 *
 * @type {import('./OptionsPanel').IInstance}
 */
const PanelInstanceTypes = undefined;

export default {
    extends: Panel,
    mixins: [usePanelDatasetMixin()],
    components: { WMetricSettings, UiDraggableAccordion },

    meta: { name: 'Метрики', icon: 'gauge' },

    static: {
        condStyleFactory,
        SeriesTypeOptions
    },

    data: (vm) => ({
        seriesType: null,
        templateIndex: 0,
        toolboxControls: [
            { icon: 'mdi-minus-box-outline', label: 'Удалить', handler: vm.deleteMetric },
            { icon: 'mdi-content-copy', label: 'Копировать', handler: vm.copyMetric }
        ]
    }),

    computed: {
        /**
         * @return {object[]}
         */
        metricNames() {
            const metricNames = this.queryModels.flatMap(({ metrics }, index) =>
                metrics.map((name) => ({
                    label: name,
                    value: name,
                    dimensionIndex: index
                }))
            );
            if (this.deviations.length > 0) {
                return metricNames.concat(
                    this.deviations.map((name) => ({
                        label: name,
                        value: name,
                        dimensionIndex: -1
                    }))
                );
            }
            return metricNames;
        },
        /**
         * @return {string[]}
         */
        metricsStyleNames() {
            return this.props.metricsStyle.map(({ metricName }) => metricName);
        },
        /**
         * @return {string[]}
         */
        datasetNames() {
            return this.datasetRequests.map(({ name }) => name);
        },
        /**
         * @return {{ label: string, value: any }[]}
         */
        conditionStyleTypes() {
            return Object.entries(condStyleTypes).map(([key, val]) => ({ label: val.name, value: key }));
        },
        /**
         * @return {{ label: string, value: string }[]}
         */
        dimValueNames() {
            return this.elementInstance?.mainDimValues ?? [];
        },
        /**
         * @return {string[]}
         */
        minorDimensionNames() {
            const {
                minor: { name: minorDimName }
            } = this.props.dimensionOptions;
            const results = this.elementInstance?.results ?? [];
            return results
                .reduce((acc, { rows }) => [...acc, ...utils.getDimValues(rows, minorDimName)], [])
                .sort((a, b) => a.localeCompare(b));
        },
        elemComputedStyles() {
            return this.elementInstance != null ? getComputedStyle(this.elementInstance.$el) : {};
        }
    },

    created() {
        this.props = propsFixer(this.props);
        this.propChanged();

        const { props } = this;

        if (props.metricsStyle.every(({ type }) => type === 'bar')) {
            this.seriesType = 'bar';
            return;
        }

        if (props.metricsStyle.every(({ type }) => type === 'line')) {
            this.seriesType = 'line';
        }
    },

    methods: {
        ...PanelInstanceTypes,
        ...PanelDatasetMixinTypes,
        /**
         *
         */
        addMetric() {
            const {
                props: { metricsStyle }
            } = this;

            const newMetric = createSeriesTemplateByIndex(this.templateIndex);

            newMetric.uid = utils.uid();
            metricsStyle.push(newMetric);

            this.templateIndex += 1;

            this.propChanged('metricsStyle');
        },
        copyMetric(idx) {
            const {
                props: { metricsStyle }
            } = this;

            this.templateIndex = this.templateIndex + 1;

            const newMetric = _cloneDeep(metricsStyle[idx]);

            newMetric.uid = utils.uid();
            metricsStyle.push(newMetric);

            this.propChanged('metricsStyle');
        },
        /**
         * @param {number} idx - metric`s index
         */
        deleteMetric(idx) {
            this.templateIndex -= this.templateIndex - 1 < 0 ? 0 : 1;
            this.props.metricsStyle.splice(idx, 1);
            this.propChanged('metricsStyle');
        },
        /**
         * @param {object} styles - metric`s styles
         * @param {number} idx - metric`s index
         */
        changeStyles(styles, idx) {
            this.$set(this.props.metricsStyle, idx, _cloneDeep(styles));
            this.propChanged('metricsStyle');
        },
        onSeriesTypeChange(seriesType) {
            if (seriesType == null) {
                return;
            }

            const { props } = this;

            props.metricsStyle = props.metricsStyle.map((metric) => {
                const { colorForLine, colorForBar, symbolBdrWidth, symbolBdrColor, itemStyle } = metric;

                if (metric.type === 'line' && seriesType === 'bar') {
                    metric.colorForBar = colorForLine;
                }
                if (metric.type === 'bar' && seriesType === 'line') {
                    metric.colorForLine = colorForBar;
                }
                metric.type = seriesType;
                metric.customType = seriesType;

                metric = {
                    ...metric,
                    itemStyle: {
                        ...itemStyle,
                        borderWidth: symbolBdrWidth,
                        borderColor: symbolBdrColor
                    }
                };
                return metric;
            });

            this.propChanged();
        }
    }
};
</script>
