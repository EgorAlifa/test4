import { cloneDeep, isEqual } from 'lodash';
import { PARAM_STYLE_FACTORY as paramStyleFactory, indicatorConditionRuleFactory } from '../utils/index';
import { RuleDataType } from '../utils/constants';

export const DatasetPanelMixin = {
    watch: {
        dimensionsMetrics: {
            handler() {
                const { dimensions, metrics } = this;
                this.setPropsDefaults({
                    dimensions,
                    metrics
                });
            },
            immediate: true
        }
    },
    created() {
        this.$watch(`props.${this.DATASET_PROP}`, this.metricFormatterHack, { deep: true });
    },
    methods: {
        metricFormatterHack(old, cur) {
            if (isEqual(old, cur)) {
                return;
            }
            if (this.props.metricFormatter === 'n') {
                this.props.metricFormatter = null;
                this.propChanged('metricFormatter');
            }
        },
        setPropsDefaults({ metrics = [], dimensions = [] }) {
            if (metrics.length > 0) {
                this.setPropDefaultsByMetrics(metrics);
                return;
            }
            if (dimensions.length > 0) {
                this.setPropsDefaultsByDimensions(dimensions);
            }
        },
        setPropDefaultsByMetrics(metrics) {
            const { props } = this;
            const originProps = cloneDeep(props);
            const [metricOne, metricTwo] = metrics;

            props.selectedMetric ??= metricOne;
            props.indicatorMetricIcon.targetSource ??= 0;
            props.indicatorMetricIcon.metricValue ??= metricOne;
            props.selectedBench ??= metricTwo ?? null;
            props.indicatorBenchmarkIcon.targetSource ??= 0;
            props.indicatorBenchmarkIcon.metricValue ??= metricOne;

            if (props.conditionBenchStyle.type == null) {
                this.createDefaultConditionBenchStyle(props, [metricOne, metricTwo], 'METRIC');
            }

            if (props.benchmarkIconRules.rules.length === 0) {
                this.createDefaultBenchIconRules(props, metricTwo);
            }

            if (isEqual(originProps, props) === false) {
                this.propChanged();
            }
        },
        setPropsDefaultsByDimensions(dimensions) {
            const { props } = this;
            const originProps = cloneDeep(props);
            const [dimensionOne, dimensionTwo] = dimensions;

            props.type = 'dimension';
            props.selectedDimension ??= dimensionOne;
            props.indicatorMetricIcon.targetSource ??= 0;
            props.indicatorMetricIcon.metricValue ??= dimensionOne;
            props.typeBenchData = 'dimension';
            props.selectedBenchDimension ??= dimensionTwo ?? null;
            props.indicatorBenchmarkIcon.targetSource ??= 0;
            props.indicatorBenchmarkIcon.metricValue ??= dimensionOne;

            if (props.conditionBenchStyle.type == null) {
                this.createDefaultConditionBenchStyle(props, [dimensionOne, dimensionTwo], 'DIMENSION');
            }

            if (props.benchmarkIconRules.rules.length === 0) {
                this.createDefaultBenchIconRules(props, dimensionTwo);
            }

            if (isEqual(originProps, props) === false) {
                this.propChanged();
            }
        },
        createDefaultConditionBenchStyle(props, [entityOne, entityTwo = null], entityType) {
            props.conditionBenchStyle.type = 'METRIC_DIMENSION';
            props.conditionBenchStyle.value = entityOne;
            props.conditionBenchStyle.style = [
                paramStyleFactory({
                    typeCondition: entityType,
                    type: 'GT',
                    value: entityTwo,
                    style: 'color: #11BA2F;'
                }),
                paramStyleFactory({
                    typeCondition: entityType,
                    type: 'LT',
                    value: entityTwo,
                    style: 'color: #F82F58;'
                })
            ];
        },
        createDefaultBenchIconRules(props, entity) {
            props.benchmarkIconRules.rules = [
                indicatorConditionRuleFactory({
                    dataType: RuleDataType.FROM_DATASET,
                    condition: 'GT',
                    value: entity,
                    icon: 'arrow-up-thin',
                    color: '#11BA2F'
                }),
                indicatorConditionRuleFactory({
                    dataType: RuleDataType.FROM_DATASET,
                    condition: 'LT',
                    value: entity,
                    icon: 'arrow-down-thin',
                    color: '#F82F58'
                })
            ];
        }
    }
};
