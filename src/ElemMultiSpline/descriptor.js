import { cloneDeep } from 'lodash';
import { TooltipDefaultFactory } from '@goodt-wcore/components';
import { cssVars } from './styles/css-vars';
import { panels } from './panels';
import { DeviationPanelAsync } from './deviations/panels';
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

export const Vars = Object.freeze({});

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
        deviationMeta: {
            type: Object,
            default: () => ({
                dimensionIndex: 0,
                mainSourceIdentifier: null,
                addlSourceIdentifier: null,
                deviations: []
            })
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
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {})
});

export const meta = {
    descriptor,
    isChildAllowed: true,
    slotNames: ['tooltip'],
    cssVars,
    panels: [...panels, DeviationPanelAsync]
};
