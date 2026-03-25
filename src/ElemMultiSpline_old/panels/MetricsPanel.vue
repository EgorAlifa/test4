<template>
    <div>
        <w-metric-settings
            v-for="(item, index) in props.metricsStyle"
            :key="item.uid"
            v-bind="{
                styles: item,
                index,
                axis: props.axis,
                metricNames,
                metricsStyleNames,
                dimensionOptions: props.dimensionOptions,
                datasetNames,
                dimValueNames,
                minorDimensionNames,
                condStyleTypes: conditionStyleTypes,
                condStyleFactory,
                elemComputedStyles,
                $c
            }"
            class="p"
            @change-style="changeStyles"
            @delete="deleteMetric"></w-metric-settings>
        <ui-button type="ghost" @click="addMetric">Добавить метрику</ui-button>
    </div>
</template>
<script>
/**
 * @typedef {import('./OptionsPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./OptionsPanel').IInstance} IInstance
 */
import { Panel, Dremio } from 'goodt-wcore';
import { cloneDeep as _cloneDeep } from 'lodash';
import WMetricSettings from './components/Metric.vue';
import { SeriesTemplate } from '../utils/constants';
import { utils, condStyleTypes, condStyleFactory, propsFixer } from '../utils';

const { Query } = Dremio;
/**
 * @type {IComponentOptions}
 */
export default {
    extends: Panel,
    components: { WMetricSettings },
    data() {
        return {
            /** @public */
            $meta: { name: 'Метрики', icon: 'gauge' },
            condStyleFactory
        };
    },

    computed: {
        /**
         * @return {object[]}
         */
        queryHelper() {
            return this.elementInstance && this.elementInstance.getQueryHelper
                ? this.elementInstance.getQueryHelper()
                : [];
        },
        /**
         * @return {object[]}
         */
        metricNames() {
            const { dremio, deviationMeta } = this.props;
            const metricNames = dremio.flatMap(({ query: { [Query.KEY.METRICS]: metrics } }, index) =>
                metrics.map((name) => ({
                    label: Object.keys(name)[0],
                    value: Object.keys(name)[0],
                    dimensionIndex: index
                }))
            );
            if (deviationMeta.deviations.length > 0) {
                return metricNames.concat(
                    deviationMeta.deviations.map(({ name }) => ({
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
            return this.queryHelper.map(({ query }) => query[Query.KEY.FROM].join('/'));
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
            const mainDimValues = this.elementInstance?.mainDimValues ?? [];
            return mainDimValues.map((name) => ({ label: name, value: name }));
        },
        /**
         * @return {string[]}
         */
        minorDimensionNames() {
            const {
                minor: { name: minorDimName }
            } = this.props.dimensionOptions;
            const dremioData = this.elementInstance?.resData ?? [];
            return dremioData
                .reduce((acc, { rows }) => [...acc, ...utils.getDimValues(rows, minorDimName)], [])
                .sort((a, b) => a.localeCompare(b));
        },
        elemComputedStyles() {
            return this.elementInstance != null ? getComputedStyle(this.elementInstance.$el) : {};
        },
        $c() {
            // eslint-disable-next-line goodt-rules/deprecate-member-expression
            return this.elementInstance?.$c;
        }
    },

    created() {
        this.props = propsFixer(this.props);
        this.propChanged();
    },

    methods: {
        /**
         *
         */
        addMetric() {
            const newMetric = _cloneDeep(SeriesTemplate);
            const { length } = this.props.metricsStyle;
            newMetric.marker = `Метрика ${length + 1}`;
            newMetric.name = newMetric.marker;
            newMetric.uid = utils.uid();
            this.props.metricsStyle.push(newMetric);
            this.propChanged('metricsStyle');
        },
        /**
         * @param {number} idx - metric`s index
         */
        deleteMetric(idx) {
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
        }
    }
};
</script>
