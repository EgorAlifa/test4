import { usePanelDatasetMixin, PanelDatasetMixinTypes } from '@goodt-common/data';
import { PARAM_STYLE_FACTORY, ParamFormats, ParamSeparateTypes, ParamStyleTypes, ParamTypes } from '../../utils';
import {
    FormatOptions,
    DigitCapacityOptions,
    TypeDataOptions,
    IconPositionOptions,
    RuleDataType,
    RuleDataTypeOptions
} from '../../utils/constants';
import { FontWeightOptions, SizeUnits } from '@goodt-wcore/panels';

const MetricParamTypes = Object.keys(ParamTypes).map((key) => ({ label: ParamTypes[key].name, value: key }));
const MetricParamFormats = Object.entries(ParamFormats).reduce(
    (arr, [key, { name, options }]) => [
        ...arr,
        {
            label: name,
            value: key,
            options
        }
    ],
    [{ label: '-', value: null }]
);

const MetricParamStyleTypes = Object.keys(ParamStyleTypes).map((key) => ({
    label: ParamStyleTypes[key].name,
    value: key
}));

const MetricSeparateParamTypes = Object.keys(ParamSeparateTypes).map((key) => ({
    label: ParamSeparateTypes[key].name,
    value: key
}));

export default {
    mixins: [usePanelDatasetMixin()],
    static: {
        units: SizeUnits,
        FormatOptions,
        RuleDataTypeOptions,
        RuleDataType,
        IconPositionOptions,
        TypeDataOptions,
        DigitCapacityOptions,
        FontWeightOptions,
        PARAM_STYLE_FACTORY,
        MetricParamTypes,
        MetricParamFormats,
        MetricParamStyleTypes,
        MetricSeparateParamTypes
    },
    computed: {
        dimensionsMetricsByDataset() {
            return this.queryModels.map((queryModel) => {
                const { metrics = [], dimensions = [] } = queryModel;
                return [{ value: null, label: '-' }, ...metrics, ...dimensions];
            });
        },
        datasetOptions() {
            return [
                { value: null, label: '-' },
                ...this.datasetRequests.map(({ name }, idx) => ({ value: idx, label: name }))
            ];
        }
    },
    methods: {
        ...PanelDatasetMixinTypes,
        /**
         * @param {string} pathSize
         * @param {string} pathUnits
         * @param {string} _
         * @param {{value: string|number, unit: string}} model
         */
        setFontSize(pathSize, pathUnits, _, { value, unit }) {
            this.props[pathSize] = value;
            this.props[pathUnits] = unit;
            this.propChanged([pathSize, pathUnits]);
        }
    }
};
