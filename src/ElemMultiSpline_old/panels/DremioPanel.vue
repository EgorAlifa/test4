<script>
/**
 * @typedef {import('./OptionsPanel').IComponentOptions} IComponentOptions
 * @typedef {import('./OptionsPanel').IInstance} IInstance
 */
import { DremioMultiPanel as DremioPanel } from '@goodt-common/dremio-panels';
import { Dremio } from 'goodt-wcore';
import { cloneDeep } from 'lodash';

import { SeriesTemplate } from '../utils/constants';
import { utils } from '../utils';

const { Query } = Dremio;

/**
 * @type {IComponentOptions}
 */
export default {
    extends: DremioPanel,

    computed: {
        /**
         * @return {string|null}
         */
        dremioStr() {
            try {
                return JSON.stringify(this.props.dremio);
            } catch (e) {
                return null;
            }
        },
        /**
         * @return {object[]}
         */
        queryHelper() {
            return this?.elementInstance?.getQueryHelper() || [];
        },
        /**
         * @return {object[]}
         */
        metrics() {
            return this.elementInstance && this.elementInstance.getMetrics ? this.elementInstance.getMetrics() : [];
        },
        /**
         * @return {string[]}
         */
        dimensionNames() {
            const { dremio } = this.props;
            const dimensions = dremio.reduce((acc, { dimensionList }) => [...acc, ...Object.keys(dimensionList)], []);
            return [...new Set(dimensions)];
        }
    },

    watch: {
        dremioStr: {
            handler(val) {
                if (val != null) {
                    this.updateMetricNames();
                }
            },
            immediate: true
        },
        'props.metricNames': {
            handler(names) {
                const { metricsStyle } = this.props;
                if (metricsStyle.length === 0) {
                    names.forEach((name) => {
                        const originIdx = this.queryHelper.findIndex(({ query }) =>
                            Query.queryMetricNames(query).includes(name)
                        );
                        this.addMetric({ metricName: name, originIdx: `${originIdx}` });
                    });
                }
            },
            immediate: true
        },
        dimensionNames: {
            handler(dimensionNames) {
                const { main: mainDim, minor: minorDim } = this.props.dimensionOptions;
                const [name] = dimensionNames;

                if (name != null && (mainDim.name === '' || dimensionNames.includes(mainDim.name) === false)) {
                    mainDim.name = name;
                    this.propChanged('dimensionOptions');
                }

                if (minorDim.name !== '' && dimensionNames.includes(minorDim.name) === false) {
                    minorDim.name = '';
                    this.propChanged('dimensionOptions');
                }
            },
            immediate: true
        }
    },

    created() {
        this.props.dremio = this.props.dremio ?? [];
        this.propChanged('dremio');
    },

    methods: {
        /**
         *
         */
        updateMetricNames() {
            this.props.metricNames = this.metrics.map((metric) => Query.getMetricName(metric));
            this.propChanged('metricNames');
        },
        /**
         * @param {object} options - initial options of new metric
         * @param {string} options.metricName - name of new metric
         * @param {string} options.originIdx - index of dataset that metric will use
         */
        addMetric({ metricName, originIdx }) {
            const { metricsStyle } = this.props;
            const newMetric = {
                ...cloneDeep(SeriesTemplate),
                ...{
                    name: `Метрика ${metricsStyle.length + 1}`,
                    marker: `Метрика ${metricsStyle.length + 1}`,
                    uid: utils.uid(),
                    metricName,
                    originIdx
                }
            };
            this.props.metricsStyle.push(newMetric);
            this.propChanged('metricsStyle');
        }
    }
};
</script>
