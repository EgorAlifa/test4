/* eslint-disable id-length, no-magic-numbers, no-restricted-syntax */

const GridTemplate = () => ({
    isManualMode: false,
    left: '50%',
    top: '50%',
    right: '50%',
    bottom: '50%'
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
    color: 'inherit',
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
    color = '#000',
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
    name: 'name',
    show: true,
    position: 'left',
    axisSplitNum: null,
    inverse: false,
    scale: false,
    offset: 0,
    nameTextStyle: {
        color: 'transparent',
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
        color: 'rgba(0, 0, 0, 0.4)',
        backgroundColor: 'transparent',
        rotate: 0,
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
            color: 'rgba(0, 0, 0, 0.4)',
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
        color: '#333'
    }
};

const MainTitle = {
    show: false,
    position: 'top',
    left: 'center',
    text: 'Widget',
    textStyle: {
        fontSize: 12,
        fontFamily: 'sans-serif',
        color: '#333'
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
        sort: 'ascending'
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
    smooth: false,
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
    colorForBar: '#FF0000',
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
    fillColor: 'red',
    gradient: false,
    firstColor: 'red',
    secondColor: 'red',
    offSetFirstColor: '0',
    offSetSecondColor: '1',
    colorPos: '0 0 0 1',
    colorForLine: '#EB2316',
    lineStyle: {
        type: 'solid',
        width: 2
    },
    areaStyle: null,
    isRoundedBarBorder: false,
    roundedBarBorder: { leftTop: 10, rightTop: 10, rightBottom: 0, leftBottom: 0 },
    itemStyle: {
        color: 'red',
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        barBorderRadius: [5, 5, 5, 5],
        borderWidth: 0
    },
    shouldSyncShadowColor: false,
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
    fillSymbol: false,
    symbolSize: 5,
    symbolColor: '#EB2316',
    symbolBdrWidth: 0,
    symbolBdrColor: '#000',
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

const ChartTopOptions = {
    enable: false,
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
    }
};

const ToolboxOptions = {
    show: true,
    itemSize: 16,
    prevTitle: 'prev',
    iconStyle: {
        color: '#666'
    }
};

const PropNames = [
    'dimensionOptions',
    'axis',
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
    'deviationMeta',
    'customTooltip'
];

const DataZoomOptions = {
    show: false,
    moveHandleSize: 0,
    backgroundColor: 'rgba(24, 61, 127, 1)',
    fillerColor: 'rgba(104, 227, 246, 1)',
    borderColor: 'rgba(24, 61, 127, 1)',
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
            color: 'rgba(24, 61, 127, 0.3)',
            opacity: 1,
            width: 0.5
        },
        areaStyle: {
            color: 'rgba(104, 227, 246, 0.3)',
            opacity: 1
        }
    },
    showDetail: true,
    xAxisIndex: null,
    yAxisIndex: null,
    isPercent: false,
    startValue: 0,
    endValue: 10,
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
    {
        ...AxisTemplate(),
        ...{
            typeAxis: 'y',
            nameGap: 25,
            nameRotate: 90,
            splitNumber: 2
        }
    }
];

const RESIZE_THROTTLE_TIMEOUT = 500;

const REQUEST_ANIMATION_TIMEOUT = 16;

const ADDITIONAL_AXIS_LABEL_RICH_NAME = 'additional';
const ADDITIONAL_AXIS_LABEL_RICH_CONDITION_NAME = 'condition';

export {
    AxisTemplate,
    Legend,
    BackgroundColor,
    MainTitle,
    AxisPointer,
    DimensionOptions,
    TooltipOptions,
    SeriesTemplate,
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
    BarMinHeightConditionFactory
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
