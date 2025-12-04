import { useDatasetMeta } from '@goodt-common/data';
import { StoreOperation } from '@goodt-wcore/elem';
import { cloneDeep } from 'lodash';
import { TooltipDefaultFactory } from '@goodt-wcore/components';
import { cssVars } from './styles/css-vars';
import panels, { DatasetPanelMixin } from './panels';
import {
    MainTitle,
    Legend,
    DimensionOptions,
    BackgroundColor,
    AxisPointer,
    TooltipOptions,
    ChartTopOptions,
    ToolboxOptions,
    DataZoomOptions,
    DataZoomInsideOptions,
    GridTemplate,
    LegendManualSizeTemplate,
    Axises,
    BreadcrumbTemplate
} from './utils/constants';

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
        metricsStyle: {
            type: Array,
            default: () => []
        },
        selectEvent: {
            type: Object,
            default: () => ({})
        },
        barGap: {
            type: String,
            default: () => '',
            label: 'Отступ'
        },
        tooltip: {
            type: Object,
            default: () => cloneDeep(TooltipOptions)
        },
        metricNames: {
            type: Array,
            default: () => []
        },
        dimensionOptions: {
            type: Object,
            default: () => cloneDeep(DimensionOptions)
        },
        backgroundColor: {
            type: Object,
            default: () => cloneDeep(BackgroundColor)
        },
        mainTitle: {
            type: Object,
            default: () => cloneDeep(MainTitle)
        },
        axis: {
            type: Array,
            default: () => Axises
        },
        legend: {
            type: Object,
            default: () => cloneDeep(Legend)
        },
        axisPointer: {
            type: Object,
            default: () => AxisPointer()
        },
        topOptions: {
            type: Object,
            default: () => cloneDeep(ChartTopOptions)
        },
        toolbox: {
            type: Object,
            default: () => cloneDeep(ToolboxOptions)
        },
        dataZoom: {
            type: Object,
            default: () => cloneDeep(DataZoomOptions)
        },
        dataZoomInside: {
            type: Object,
            default: () => cloneDeep(DataZoomInsideOptions)
        },
        grid: {
            type: Object,
            default: () => GridTemplate()
        },
        legendManualSize: {
            type: Object,
            default: () => LegendManualSizeTemplate()
        },
        breadcrumb: {
            type: Object,
            default: () => BreadcrumbTemplate()
        },
        customTooltip: {
            type: Object,
            default: TooltipDefaultFactory
        },
        multiLevelDimension: {
            type: Object,
            default: () => ({
                isUsed: false,
                shouldResetFirstLevel: false
            })
        },
        shouldSkipLevelWithOneValue: {
            type: Boolean,
            default: true
        },
        shouldSkipLevelWithIdenticalValue: {
            type: Boolean,
            default: false
        },
        shouldResetVar: {
            type: Boolean,
            default: true
        },
        neutralMetrics: {
            type: Object,
            default: () => ({
                isEnabled: false,
                color: 'rgba(230, 230, 230, 1)',
                symbolColor: 'rgba(230, 230, 230, 1)',
                symbolBdrColor: 'rgba(230, 230, 230, 1)'
            })
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
        slotNames: ['tooltip'],
        cssVars,
        panels
    },
    {
        panel: {
            isMultiple: true,
            mixins: [DatasetPanelMixin]
        },
        deviations: true
    }
);
