import { createSeriesTemplateByIndex } from '../utils/constants';
import { utils } from '../utils';

export const DatasetPanelMixin = {
    data: (vm) => ({
        templateIndex: 0
    }),

    watch: {
        metrics: {
            handler(metrics) {
                this.updateMetricNames(metrics);
            },
            immediate: true
        },
        'props.metricNames': {
            handler(names) {
                const { metricsStyle } = this.props;
                if (metricsStyle.length === 0) {
                    names.forEach((name) => {
                        const originIdx = this.queryModels.findIndex(({ metrics }) => metrics.includes(name));
                        this.addMetric({ metricName: name, originIdx: `${originIdx}` });
                    });
                }
            },
            immediate: true
        },
        dimensions: {
            handler(dimensions) {
                const { main: mainDim, minor: minorDim } = this.props.dimensionOptions;
                const [name] = dimensions;

                if (name != null && (mainDim.name === '' || dimensions.includes(mainDim.name) === false)) {
                    mainDim.name = name;
                    this.propChanged('dimensionOptions');
                }

                if (minorDim.name !== '' && dimensions.includes(minorDim.name) === false) {
                    minorDim.name = '';
                    this.propChanged('dimensionOptions');
                }
            },
            immediate: true
        }
    },

    methods: {
        /**
         *
         */
        updateMetricNames(metrics) {
            this.props.metricNames = metrics;
            this.propChanged('metricNames');
        },
        /**
         * @param {object} options - initial options of new metric
         * @param {string} options.metricName - name of new metric
         * @param {string} options.originIdx - index of dataset that metric will use
         */
        addMetric({ metricName, originIdx }) {
            const newMetric = {
                ...createSeriesTemplateByIndex(this.templateIndex),
                name: metricName,
                marker: metricName,
                uid: utils.uid(),
                metricName,
                originIdx
            };
            this.props.metricsStyle.push(newMetric);

            this.templateIndex += 1;

            this.propChanged('metricsStyle');
        }
    }
};
