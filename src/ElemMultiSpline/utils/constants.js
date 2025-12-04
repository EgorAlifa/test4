/* eslint-disable id-length, no-magic-numbers, no-restricted-syntax */
import { merge } from 'lodash';
import { TopType } from '../panels/config';

const GridTemplate = () => ({
    isManualMode: false,
    left: '10%',
    top: '20%',
    right: '2%',
    bottom: '22%'
});

const LegendManualSizeTemplate = () => ({
    isManualMode: false,
    left: '50%',
    top: '50%',
    right: '50%',
    bottom: '50%'
});

const BreadcrumbTemplate = () => ({
    isShown: false,
    delimiter: '. ',
    left: '15px',
    top: '15px',
    right: 'auto',
    bottom: 'auto',
    fontSize: '1rem',
    color: '#2C3E5D',
    fontWeight: 'inherit',
    fontFamily: 'inherit'
});

const ColorConditionFactory = ({ comparedValue = '', type = '', color = '' } = {}) => ({
    comparedValue,
    type,
    color
});

const AdditionalAxisLabelFactory = ({
    datasetIndex = 0,
    color = '#2C333A',
    fontFamily = '',
    fontSize = 14,
    conditions = [],
    position = 'bottom',
    format = '',
    metric = '',
    verticalAlign = 'middle',
    enablePlusValues = true,
    fontWeight = '400',
    width = '0%',
    textOffset = 20
} = {}) => ({
    datasetIndex,
    color,
    conditions,
    fontFamily,
    fontSize,
    position,
    format,
    metric,
    verticalAlign,
    enablePlusValues,
    fontWeight,
    width,
    textOffset
});
const AxisTemplate = () => ({
    typeAxis: 'x',
    showAxisName: false,
    silent: true,
    triggerEvent: false,
    id: 0,
    type: 'value',
    format: 'value',
    boundaryGap: [0, 0],
    hasGap: true,
    isFullPercentageScale: true,
    calcMinMax: true,
    manualMinMax: false,
    min: 0,
    max: null,
    isRoundedDynamicMinValue: true,
    isRoundedDynamicMaxValue: true,
    isNotAboveZeroDynamicMinValue: false,
    dynamicMinValue: 25,
    dynamicMaxValue: 25,
    dynamicMaxValuePrecision: 0,
    minValue: 0,
    maxValue: 100,
    enableMax: false,
    name: '',
    show: true,
    position: 'left',
    axisSplitNum: null,
    inverse: false,
    scale: false,
    offset: 0,
    nameTextStyle: {
        color: '#2C333A',
        fontFamily: ''
    },
    nameLocation: 'middle',
    nameGap: 20,
    nameRotate: 0,
    valueFontSize: 12,
    interval: 0,
    axisLabel: {
        show: true,
        margin: 8,
        interval: 0,
        fontFamily: 'sans-serif',
        color: '#2C333A',
        backgroundColor: 'transparent',
        rotate: 30,
        format: '0',
        extendedFormat: null,
        separator: '1',
        formatter: null,
        isNumberFormatActive: false,
        breakLongValues: true,
        longValuesLength: 0,
        rich: {},
        type: 'text',
        imageMetric: '',
        imageHeight: 24
    },
    additionalAxisLabel: AdditionalAxisLabelFactory(),
    axisLine: {
        show: false,
        lineStyle: {
            color: 'rgba(0, 0, 0, 0.4)',
            width: 2
        }
    },
    axisTick: {
        show: false
    },
    axisPointer: {
        show: false
    },
    splitLine: {
        show: true,
        lineStyle: {
            color: '#DCDFE4',
            type: 'dashed'
        }
    },
    shouldHighlightSelectedLabels: true,
    isShownNullLabels: false
});

const Legend = {
    show: false,
    type: 'scroll',
    position: 'top',
    bottom: null,
    top: 0,
    left: 'center',
    padding: [5, 45, 5, 5],
    itemWidth: 25,
    itemHeight: 14,
    icon: '',
    itemStyle: {
        borderWidth: 0,
        borderType: 'solid',
        borderColor: 'orange'
    },
    textStyle: {
        fontSize: 12,
        fontFamily: 'sans-serif',
        color: '#2C3E5D'
    }
};

const MainTitle = {
    show: false,
    position: 'top',
    left: 'left',
    text: '',
    textStyle: {
        fontSize: '1.2rem',
        fontFamily: 'sans-serif',
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 1)'
    },
    backgroundColor: 'transparent'
};

const BackgroundColor = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
        {
            offset: 1,
            color: 'transparent'
        },
        {
            offset: 1,
            color: 'transparent'
        }
    ]
};

const LabelOptions = () => ({
    show: false,
    rotate: 0,
    offset: [0, 0],
    color: 'rgba(51, 51, 51, 1)',
    backgroundColor: 'transparent',
    fontFamily: 'Roboto',
    fontSize: 12,
    position: 'top',
    formatter: null,
    isAddlLabelShown: false,
    isZeroValueShown: false,
    align: 'center'
});

const AdditionalLabelPrefixFactory = () => ({
    value: '',
    valueConditions: [],
    offset: 0,
    height: 16,
    padding: [0, 0, 0, 0],
    color: 'rgba(255, 255, 255, 1)',
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400'
});

const AdditionalLabelFactory = () => ({
    additional: {
        metric: null,
        format: '',
        position: 'bottom',
        gap: 0,
        colorConditions: [],
        height: 16,
        padding: [8, 8, 8, 8],
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'Roboto',
        fontSize: 12,
        fontWeight: '400',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        align: 'center',
        borderRadius: [0, 0, 0, 0]
    }
});

const STACK_TAG = 'stackSeries';

const DimensionOptions = {
    main: {
        name: '',
        format: 'string',
        sort: 'none'
    },
    minor: {
        name: '',
        format: 'string',
        sort: 'ascending'
    }
};

const AxisPointer = () => ({
    show: false,
    type: 'line',
    value: 0,
    status: 'show',
    snap: true,
    handle: {
        show: true,
        size: 0
    },
    lineStyle: {
        color: '#BD014A',
        width: 1
    },
    label: {
        backgroundColor: '#777'
    },
    triggerTooltip: false,
    triggerOn: 'none'
});

const TooltipOptions = {
    show: true,
    trigger: 'item',
    format: '0',
    separator: '0',
    prefix: '',
    postfix: '',
    showCategory: false,
    showNullishValues: true,
    isAbsoluteValue: false,
    reverseMetrics: false,
    appendToBody: true,
    isNestedFromMetric: false,
    excludes: []
};

const SeriesTemplate = {
    metricName: '',
    showDataSet: true,
    nullValues: false,
    voidValues: false,
    isCumulativeTotal: false,
    isCumulativeDifference: false,
    dimensions: null,
    name: '',
    marker: '',
    customType: 'line',
    type: 'line',
    smooth: true,
    seriesLayoutBy: 'column',
    excess: {
        color: 'black',
        firstColor: '#50f547',
        secondColor: '#ddff45',
        firstOffSet: '0',
        secondOffSet: '1',
        gradPos: '0 0 0 1',
        gradient: false
    },
    lack: {
        color: 'black',
        firstColor: '#50f547',
        secondColor: '#ddff45',
        firstOffSet: '0',
        secondOffSet: '1',
        gradPos: '0 0 0 1',
        gradient: false
    },
    nameExcess: 'Избыток',
    nameLack: 'Недостаток',
    excessLackLabel: LabelOptions(),
    xAxisIndex: 0,
    yAxisIndex: 0,
    originIdx: null,
    z: 10,
    barWidth: '50',
    barMinWidth: 1,
    barMaxWidth: 20,
    barMinHeight: 16,

    colorStep: 10,
    color: '#EB2316',
    customColors: [],
    metricFormat: '0',
    metricSeparator: '1',
    metricPrefix: '',
    metricPostfix: '',
    isAbsoluteValue: false,
    isAutoRound: false,
    colorForBar: '#6EB9FF',
    barFirstColor: '#50f547',
    barSecondColor: '#ddff45',
    barFirstOffSet: '0',
    barSecondOffSet: '1',
    barPos: '0 0 0 1',
    gradientForBar: false,
    fillLine: false,
    customFillLine: false,
    customFillLines: [],
    origin: 'start',
    smartFill: false,
    fillColor: '#DCDFE4',
    gradient: false,
    firstColor: 'red',
    secondColor: 'red',
    offSetFirstColor: '0',
    offSetSecondColor: '1',
    colorPos: '0 0 0 1',
    colorForLine: '#359EFF',
    lineStyle: {
        type: 'solid',
        width: 2
    },
    areaStyle: null,
    isRoundedBarBorder: true,
    roundedBarBorder: { leftTop: 2, rightTop: 2, rightBottom: 0, leftBottom: 0 },
    itemStyle: {
        color: 'red',
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        barBorderRadius: [5, 5, 5, 5],
        borderWidth: '2px'
    },
    shouldSyncShadowColor: false,
    shouldSyncColor: true,
    shouldDotsSyncColor: true,
    stack: '',
    stackLines: false,
    label: LabelOptions(),
    tooltip: {
        formatter: null
    },
    styleConditions: {
        enable: false,
        conditions: []
    },
    multiMetricMode: {
        enable: false,
        metricNames: [],
        metricDatasets: [],
        metricSorts: []
    },
    animation: true,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    animationDuration: 1000,
    animationDurationUpdate: 1000,
    animationDelay: 0,
    animationDelayUpdate: 0,
    symbol: 'emptyCircle',
    showSymbol: true,
    fillSymbol: true,
    symbolSize: 8,
    symbolColor: '#359EFF',
    symbolBdrWidth: '2px',
    symbolBdrColor: '#359EFF',
    connectNulls: true,
    data: [],
    uid: '',
    isUsedBarMinHeightConditions: false,
    labelLayout: {
        use: false,
        x: 0,
        y: 0,
        align: 'right',
        verticalAlign: 'top'
    },
    barMinHeightConditions: []
};

const SeriesTemplateSet = [
    { primaryColor: '#F18D13', secondaryColor: '#FFE2BD' },
    { primaryColor: '#82B536', secondaryColor: '#D3F1A7' },
    { primaryColor: '#9F8FEF', secondaryColor: '#DFD8FD' },
    { primaryColor: '#E2B203', secondaryColor: '#F8E6A0' },
    { primaryColor: '#E774BB', secondaryColor: '#FDD0EC' },
    { primaryColor: '#4BCE97', secondaryColor: '#BAF3DB' },
    { primaryColor: '#60C6D2', secondaryColor: '#C1F0F5' },
    { primaryColor: '#F87462', secondaryColor: '#FFD2CC' },
    { primaryColor: '#0788FF', secondaryColor: '#CAE5FF' },
    { primaryColor: '#6EB9FF', secondaryColor: '#CAE5FF' }
];

const createSeriesTemplateByIndex = (index) => {
    if (index === 0) {
        return { ...SeriesTemplate, customType: 'bar', type: 'bar', color: '#6EB9FF' };
    }

    const templateIndex = (index - 1) % SeriesTemplateSet.length;
    const { primaryColor, secondaryColor } = SeriesTemplateSet[templateIndex];
    return merge(
        {},
        {
            ...SeriesTemplate,
            color: primaryColor,
            colorForLine: primaryColor,
            symbolColor: primaryColor,
            symbolBdrColor: primaryColor,
            fillColor: secondaryColor
        },
        {
            itemStyle: {
                borderColor: primaryColor
            }
        }
    );
};

const BarMinHeightConditionFactory = () => ({
    isMax: true,
    limitValue: 0,
    value: 0
});

const ComparedSeriesTemplate = {
    type: 'bar',
    name: '',
    xAxisIndex: 0,
    yAxisIndex: 0,
    originIdx: null,
    z: 10,
    seriesLayoutBy: 'column',
    stack: STACK_TAG,
    metricFormat: '0',
    barMinHeight: 16,
    tooltip: {
        formatter: null
    },
    animation: true,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    animationDuration: 1000,
    animationDurationUpdate: 1000,
    animationDelay: 0,
    animationDelayUpdate: 0,
    showSymbol: true,
    data: []
};

export const SeriesTopTemplate = {
    metricName: '',
    showDataSet: true,
    nullValues: false,
    voidValues: false,
    isCumulativeTotal: false,
    isCumulativeDifference: false,
    dimensions: null,
    name: '',
    marker: '',
    customType: 'line',
    type: 'line',
    smooth: true,
    seriesLayoutBy: 'column',
    excess: {
        color: 'black',
        firstColor: '#50f547',
        secondColor: '#ddff45',
        firstOffSet: '0',
        secondOffSet: '1',
        gradPos: '0 0 0 1',
        gradient: false
    },
    lack: {
        color: 'black',
        firstColor: '#50f547',
        secondColor: '#ddff45',
        firstOffSet: '0',
        secondOffSet: '1',
        gradPos: '0 0 0 1',
        gradient: false
    },
    nameExcess: 'Избыток',
    nameLack: 'Недостаток',
    excessLackLabel: LabelOptions(),
    xAxisIndex: 0,
    yAxisIndex: 0,
    originIdx: null,
    z: 10,
    barWidth: '50',
    barMinWidth: 1,
    barMaxWidth: 20,
    barMinHeight: 16,

    colorStep: 10,
    color: '#359EFF',
    customColors: [],
    metricFormat: '0',
    metricSeparator: '1',
    metricPrefix: '',
    metricPostfix: '',
    isAbsoluteValue: false,
    isAutoRound: false,
    colorForBar: '#6EB9FF',
    barFirstColor: '#50f547',
    barSecondColor: '#ddff45',
    barFirstOffSet: '0',
    barSecondOffSet: '1',
    barPos: '0 0 0 1',
    gradientForBar: false,
    fillLine: false,
    customFillLine: false,
    customFillLines: [],
    origin: 'start',
    smartFill: false,
    fillColor: '#DCDFE4',
    gradient: false,
    firstColor: 'red',
    secondColor: 'red',
    offSetFirstColor: '0',
    offSetSecondColor: '1',
    colorPos: '0 0 0 1',
    colorForLine: '#359EFF',
    lineStyle: {
        type: 'solid',
        width: 2
    },
    areaStyle: null,
    isRoundedBarBorder: true,
    roundedBarBorder: { leftTop: 2, rightTop: 2, rightBottom: 0, leftBottom: 0 },
    itemStyle: {
        color: 'red',
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        barBorderRadius: [5, 5, 5, 5],
        borderWidth: 2
    },
    shouldSyncShadowColor: false,
    shouldSyncColor: true,
    shouldDotsSyncColor: true,
    stack: '',
    stackLines: false,
    label: LabelOptions(),
    tooltip: {
        formatter: null
    },
    styleConditions: {
        enable: false,
        conditions: []
    },
    multiMetricMode: {
        enable: false,
        metricNames: [],
        metricDatasets: [],
        metricSorts: []
    },
    animation: true,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    animationDuration: 1000,
    animationDurationUpdate: 1000,
    animationDelay: 0,
    animationDelayUpdate: 0,
    symbol: 'emptyCircle',
    showSymbol: true,
    fillSymbol: true,
    symbolSize: 8,
    symbolColor: '#359EFF',
    symbolBdrWidth: '2px',
    symbolBdrColor: '#359EFF',
    connectNulls: true,
    data: [],
    uid: '',
    isUsedBarMinHeightConditions: false,
    labelLayout: {
        use: false,
        x: 0,
        y: 0,
        align: 'right',
        verticalAlign: 'top'
    },
    barMinHeightConditions: []
};

const ChartTopOptions = {
    enable: false,
    type: TopType.DIMENSION,
    metrics: ['all'],
    number: 10,
    dir: 'top',
    btn: {
        show: true,
        topIconPath:
            'M12,7.09L14.45,8.58L13.8,5.77L16,3.89L13.11,3.64L12,1L10.87,3.64L8,3.89L10.18,5.77L9.5,8.58L12,7.09M4,13.09L6.45,14.58L5.8,11.77L8,9.89L5.11,9.64L4,7L2.87,9.64L0,9.89L2.18,11.77L1.5,14.58L4,13.09M20,10.09L22.45,11.58L21.8,8.77L24,6.89L21.11,6.64L20,4L18.87,6.64L16,6.89L18.18,8.77L17.5,11.58L20,10.09M15,23H9V10H15V23M7,23H1V17H7V23M23,23H17V13H23V23Z',
        defaultIconPath: 'M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z',
        title: 'top'
    },
    rest: {
        show: true,
        title: 'Остальные',
        reduce: {
            enable: false,
            percent: 25
        }
    },

    metricsStyle: SeriesTopTemplate
};

const ToolboxOptions = {
    show: true,
    itemSize: 16,
    prevTitle: 'prev',
    iconStyle: {
        color: '#2C3E5D'
    }
};

const PropNames = [
    'dimensionOptions',
    'axis',
    'barGap',
    'metricsStyle',
    'backgroundColor',
    'mainTitle',
    'legend',
    'tooltip',
    'axisPointer',
    'topOptions',
    'toolbox',
    'dataZoom',
    'dataZoomInside',
    'legendManualSize',
    'grid',
    'breadcrumb',
    'shouldSkipLevelWithOneValue',
    'customTooltip',
    'neutralMetrics',
    'deviations'
];

const DataZoomOptions = {
    show: false,
    moveHandleSize: 0,
    backgroundColor: '#091E420F',
    fillerColor: '#091E4224',
    borderColor: '#091E420F',
    handleSize: '100%',
    handleIcon:
        'M8.2,13.6V3.9H6.3v9.7H3.1v14.9h3.3v9.7h1.8v-9.7h3.3V13.6H8.2z M9.7,24.4H4.8v-1.4h4.9V24.4z M9.7,19.1H4.8v-1.4h4.9V19.1z',
    handleStyle: {
        color: 'rgba(167, 183, 204, 1)',
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 0
    },
    textStyle: {
        color: 'rgba(51, 51, 51, 1)',
        fontFamily: 'Roboto',
        fontSize: 12
    },
    dataBackground: {
        lineStyle: {
            color: '#6EB9FF',
            opacity: 1,
            width: 0.5
        },
        areaStyle: {
            color: '#6EB9FF',
            opacity: 1
        }
    },
    showDetail: true,
    xAxisIndex: null,
    yAxisIndex: null,
    isPercent: false,
    startValue: 0,
    endValue: 5,
    inverseDirection: false,
    startPercentValue: 0,
    endPercentValue: 100,
    minPercentValue: 0,
    maxPercentValue: 100,
    orient: 'horizontal',
    zoomLock: false,
    left: 'center',
    top: 'bottom',
    right: 'auto',
    bottom: '-5%',
    isUsedBaseMinMaxValue: true
};

const DataZoomInsideOptions = {
    type: 'inside',
    zoomOnMouseWheel: false,
    moveOnMouseMove: false,
    moveOnMouseWheel: false
};

const Axises = [
    {
        ...AxisTemplate(),
        ...{
            type: 'category',
            boundaryGap: true,
            position: 'bottom',
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'solid',
                    color: 'rgba(0, 0, 0, 0.3)'
                }
            },
            splitNumber: 5
        }
    },
    merge(AxisTemplate(), {
        typeAxis: 'y',
        name: 'Значения Метрик',
        nameGap: 25,
        nameRotate: 90,
        splitNumber: 4,
        calcMinMax: false,
        axisLabel: {
            rotate: 0
        }
    })
];

const RESIZE_THROTTLE_TIMEOUT = 500;

const REQUEST_ANIMATION_TIMEOUT = 16;

const ADDITIONAL_AXIS_LABEL_RICH_NAME = 'additional';
const ADDITIONAL_AXIS_LABEL_RICH_CONDITION_NAME = 'condition';

const ECHARTS_SERIES_MIN_INT_VALUE = 1e-13;

export {
    AxisTemplate,
    Legend,
    BackgroundColor,
    MainTitle,
    AxisPointer,
    DimensionOptions,
    TooltipOptions,
    SeriesTemplate,
    createSeriesTemplateByIndex,
    ComparedSeriesTemplate,
    ChartTopOptions,
    ToolboxOptions,
    STACK_TAG,
    PropNames,
    LabelOptions,
    AdditionalLabelPrefixFactory,
    AdditionalLabelFactory,
    DataZoomOptions,
    GridTemplate,
    LegendManualSizeTemplate,
    ColorConditionFactory,
    Axises,
    DataZoomInsideOptions,
    BreadcrumbTemplate,
    RESIZE_THROTTLE_TIMEOUT,
    ADDITIONAL_AXIS_LABEL_RICH_NAME,
    ADDITIONAL_AXIS_LABEL_RICH_CONDITION_NAME,
    AdditionalAxisLabelFactory,
    REQUEST_ANIMATION_TIMEOUT,
    BarMinHeightConditionFactory,
    ECHARTS_SERIES_MIN_INT_VALUE
};

export const SeriesFields = [
    'lineStyle.width',
    'symbolSize',
    'itemStyle.borderWidth',
    'barMinHeight',
    'barWidth',
    'barMinWidth',
    'barMaxWidth'
];
