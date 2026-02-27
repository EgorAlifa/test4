import { useDatasetMeta } from '@goodt-common/data';
import { StoreOperation } from '@goodt-wcore/elem';
import panels, { DatasetPanelMixin } from './panels';
import {
    DEFAULT_TOP_N,
    DEFAULT_NODE_COLOR,
    DEFAULT_ROOT_COLOR,
    DEFAULT_CONNECTOR_COLOR,
    DEFAULT_PLUS_BG
} from './constants';

export const descriptor = () => ({
    props: {
        dremio: {
            type: Array,
            default: () => []
        },
        additionalDremio: {
            type: Object,
            default: null
        },
        width: {
            type: String,
            default: ''
        },
        widthUnit: {
            type: String,
            default: ''
        },
        height: {
            type: String,
            default: '100'
        },
        heightUnit: {
            type: String,
            default: '%'
        },
        position: {
            type: String,
            default: 'pos-rel'
        },
        metricName: {
            type: String,
            default: ''
        },
        explainByDimensionNames: {
            type: Array,
            default: () => []
        },
        planField: {
            type: String,
            default: ''
        },
        topNPerLevel: {
            type: Number,
            default: DEFAULT_TOP_N
        },
        metricFormat: {
            type: String,
            default: '1'
        },
        metricSeparator: {
            type: String,
            default: '1'
        },
        nodeColor: {
            type: String,
            default: DEFAULT_NODE_COLOR
        },
        rootNodeColor: {
            type: String,
            default: DEFAULT_ROOT_COLOR
        },
        levelColors: {
            type: Array,
            default: () => []
        },
        connectorColor: {
            type: String,
            default: DEFAULT_CONNECTOR_COLOR
        },
        plusButtonBg: {
            type: String,
            default: DEFAULT_PLUS_BG
        },
        selectEvent: {
            type: Object,
            default: () => ({})
        },
        defaultSelectedPath: {
            type: Array,
            default: () => []
        },
        defaultExpandedNodes: {
            type: Object,
            default: () => ({})
        },
        defaultLevelExpandedDimensions: {
            type: Array,
            default: () => []
        }
    },
    vars: {},
    dataset: {
        vars: {
            dimension: { operation: StoreOperation.ALL }
        }
    }
});

export const meta = useDatasetMeta(
    {
        descriptor,
        isChildAllowed: true,
        cssVars: () => ({}),
        panels
    },
    {
        panel: {
            isMultiple: true,
            mixins: [DatasetPanelMixin]
        },
        deviations: false
    }
);

