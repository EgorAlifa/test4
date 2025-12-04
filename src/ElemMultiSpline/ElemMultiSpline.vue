<template>
    <w-elem :placeholder="$placeholder">
        <w-tooltip :is-shown.sync="customTooltip.isShown" v-bind="customTooltip.options" class="w-100 h-100">
            <template #target>
                <div class="w-100 h-100" ref="chartAwesome">
                    <div v-if="hasError" class="message message--error">
                        {{ error }}
                        <i class="message__icon message__icon--close" @click="closeErrorWindow"></i>
                    </div>
                </div>
            </template>
            <template #tooltip>
                <div
                    v-if="props.customTooltip.isSlotShown"
                    data-slot="tooltip"
                    @mouseenter="customTooltip.options.isShown = true">
                    <slot name="tooltip">
                        <div class="muted">
                            <code class="text-small">Tooltip slot</code>
                        </div>
                    </slot>
                </div>
            </template>
        </w-tooltip>
        <div v-if="isLoading" class="curtain">
            <div class="curtain__preloader"></div>
        </div>
        <div v-if="!props.dremio" class="message message--warn">no dataset selected</div>

        <div class="breadcrumb" v-if="isBreadcrumbsShown">{{ breadcrumbText }}</div>
    </w-elem>
</template>

<style src="./styles/style.pcss" lang="pcss" module></style>

<script>
import { Elem } from '@goodt-wcore/elem';
import { useElemDatasetBaseMixin, ElemDatasetBaseMixinTypes } from '@goodt-common/data';
import { Tooltip as WTooltip } from '@goodt-wcore/components';
import { convertCssVarToComputedValue } from '@goodt-common/utils';
import echarts from 'echarts';
import { cloneDeep, isEqual as _isEqual, throttle as _throttle, merge as _merge } from 'lodash';
import {
    ComparedSeriesTemplate,
    STACK_TAG,
    PropNames,
    ToolboxOptions,
    RESIZE_THROTTLE_TIMEOUT,
    REQUEST_ANIMATION_TIMEOUT,
    BreadcrumbTemplate,
    ECHARTS_SERIES_MIN_INT_VALUE
} from './utils/constants';
import { unit2PxMixin } from './utils/mixins';
import { utils, propsFixer, setDefaultTooltipStyle } from './utils';
import { meta } from './descriptor';
import { TopType } from './panels/config';

const DatasetMixin = useElemDatasetBaseMixin({ drilldown: true, panel: false, deviations: true });

export default {
    extends: Elem,
    components: { WTooltip },
    mixins: [DatasetMixin, unit2PxMixin],
    meta,
    hooks: {
        then(results) {
            const composedResults = this.resolveComposedResults(results);
            this.results = composedResults;
            if (this.handleSkipDrilldownLevel(composedResults)) {
                return;
            }
            this.constructOpts();
        }
    },
    data() {
        return {
            isLoading: false,
            chartInstance: null,
            lastCommit: null,
            results: [],
            scaleValue: 0,
            isFirstRun: true,
            privateProps: null,
            chosenDimValue: null,
            mainDimValues: [],
            chosenNeutralMetricIndexes: [],
            hasTopMode: true,
            error: null,
            drilldownLastDirection: 1,
            customTooltip: {
                options: {
                    appendToBody: false,
                    data: null,
                    coordinates: [0, 0],
                    isFixed: false
                },
                isShown: false
            },
            ...ElemDatasetBaseMixinTypes
        };
    },
    computed: {
        /**
         *
         * @return {boolean}
         */
        hasError() {
            return this.hasDataset && this.error != null;
        },
        drilldownState() {
            const {
                main: { name: mainDim }
            } = this.props.dimensionOptions;
            return {
                ...this.$drilldown.state[mainDim],
                name: mainDim
            };
        },
        drilldownCanPop() {
            return this.drilldownState?.canPop ?? false;
        },
        drilldownCanPush() {
            return this.drilldownState?.canPush ?? false;
        },
        isBreadcrumbsShown() {
            const {
                props: {
                    breadcrumb: { isShown }
                },
                breadcrumbText
            } = this;
            return isShown && breadcrumbText !== '';
        },
        grid() {
            const { grid, legend } = this.props;
            const { dataZoom } = this;
            return grid?.isManualMode
                ? grid
                : {
                      top: legend.show && legend.top !== null ? '36' : '24',
                      right: '15',
                      bottom: (legend.show && legend.bottom !== null) || dataZoom?.show ? '25' : '15',
                      left: '15',
                      containLabel: true
                  };
        },
        options() {
            const {
                legend: {
                    textStyle: { fontSize: legendFontSize, ...legendTextStyle },
                    ...legend
                },
                mainTitle: {
                    textStyle: { fontSize: mainTitleFontSize, ...mainTitleTextStyle },
                    ...mainTitle
                },
                backgroundColor,
                legendManualSize
            } = this.props;
            const { dataZoom, tooltip, toolbox, axisPointer, grid, datasetRequests } = this;
            return {
                group: 'group',
                series: [],
                toolbox,
                grid,
                title: {
                    ...mainTitle,
                    text: mainTitle.text === '' ? datasetRequests[0]?.name ?? mainTitle.text : mainTitle.text,
                    textStyle: {
                        ...mainTitleTextStyle,
                        fontSize: this.takeUnit2Px({ size: mainTitleFontSize })
                    }
                },
                legend: {
                    ...legend,
                    textStyle: {
                        ...legendTextStyle,
                        fontSize: this.takeUnit2Px({ size: legendFontSize })
                    },
                    ...(legendManualSize.isManualMode && legendManualSize)
                },
                backgroundColor,
                xAxis: [],
                yAxis: [],
                dataZoom,
                axisPointer,
                tooltip,
                animation: true
            };
        },
        toolbox() {
            const { show, itemSize, iconStyle, prevTitle } = this.props.toolbox;
            const { enable, btn } = this.props.topOptions;

            return {
                show,
                itemSize,
                iconStyle: {
                    color: iconStyle.color,
                    // eslint-disable-next-line no-magic-numbers
                    borderWidth: 0.5
                },
                feature: {
                    myPrevBtn: {
                        show: this.drilldownCanPop,
                        name: 'prev',
                        title: prevTitle || ToolboxOptions.prevTitle,
                        icon: 'path://M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z',
                        onclick: this.onPrevBtnClick
                    },
                    myTopBtn: {
                        show: enable && btn.show,
                        name: 'top',
                        title: btn.title,
                        icon: `path://${this.hasTopMode ? btn.defaultIconPath : btn.topIconPath}`,
                        onclick: this.onTopBtnClick
                    }
                }
            };
        },
        tooltip() {
            const { tooltip, metricsStyle } = this.props;
            return {
                ...tooltip,
                formatter: (params) => utils.tooltipFormatter.bind(tooltip)(metricsStyle, params)
            };
        },
        dataZoom() {
            const { dataZoom, dataZoomInside } = this.props;
            const { startPercentValue: start, endPercentValue: end, isPercent, show, handleIcon, endValue } = dataZoom;
            const isHidden = !show;
            const position = isPercent ? { start, end } : {};

            if (isHidden) {
                return null;
            }

            return [
                {
                    ...dataZoom,
                    moveHandleSize: 0,
                    ...position,
                    textStyle: {
                        ...dataZoom.textStyle,
                        fontSize: this.takeUnit2Px({ size: dataZoom.textStyle.fontSize })
                    },
                    handleIcon: `path://${handleIcon}`,
                    endValue: endValue - 1
                },
                {
                    ...dataZoom,
                    ...position,
                    handleIcon: `path://${handleIcon}`,
                    endValue: endValue - 1,
                    ...dataZoomInside
                }
            ];
        },
        axisPointer() {
            const { axisPointer } = this.props;
            if (axisPointer?.show) {
                return {
                    ...axisPointer,
                    triggerOn: 'none',
                    value: this.scaleValue
                };
            }
            return null;
        },
        computedStyle() {
            return this.$el != null ? getComputedStyle(this.$el) : {};
        },
        breadcrumbText() {
            const {
                breadcrumb: { isShown, delimiter }
            } = this.props;

            return isShown
                ? [...(new Set(this.drilldownState.filters?.map(({ value }) => value)) ?? '')].join(
                      delimiter ?? BreadcrumbTemplate().delimiter
                  )
                : '';
        }
    },
    watchEditor: {
        props: {
            handler(props) {
                this.privateProps = propsFixer(props);
            },
            deep: true
        },
        [['cssStyle', 'cssClass', PropNames.map((prop) => `props.${prop}`)]]: {
            handler(param, oldParam) {
                if (param && !_isEqual(param, oldParam)) {
                    const composedResults = this.resolveComposedResults();
                    this.results = composedResults;
                    this.$nextTick().then(this.constructOpts);
                }
            },
            deep: true
        }
    },
    created() {
        this.privateProps = propsFixer(this.props);
        this.addUnit2PxWatcher(this.constructOpts);
    },
    mounted() {
        this.initResize();
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.throttledResize);
        this.destroyChart();
    },

    methods: {
        resolveComposedResults(results = this.results) {
            return results.map((result) => ({
                ...result,
                rows: result.rows.map((row, index) => ({ ...row, ...this.deviations.rows[index] }))
            }));
        },
        closeErrorWindow() {
            this.error = null;
        },

        /**
         *
         */
        initResize() {
            this.throttledResize = _throttle(this.onResize, RESIZE_THROTTLE_TIMEOUT);
            window.addEventListener('resize', this.throttledResize);
        },
        drilldownPop() {
            const { name: drilldown, canPop } = this.drilldownState;
            if (canPop === false) {
                return;
            }
            this.$drilldown.pop(drilldown);
            this.drilldownLastDirection = this.drilldownState.canPop ? -1 : 1;
        },
        drilldownPush(value) {
            const { name: drilldown, canPush } = this.drilldownState;
            if (canPush === false) {
                this.drilldownLastDirection = 1;
                return;
            }

            this.$drilldown.push(drilldown, value);
            this.drilldownLastDirection = this.drilldownState.canPush ? 1 : 0;
        },

        onResize() {
            if (this.chartInstance) {
                this.chartInstance.resize();
            }
        },

        async loadData(requests = this.requests) {
            this.$requestCancel(requests);
            this.isLoading = true;
            try {
                let results = await Promise.all(requests.map((request) => request?.send()));
                results = results.map((result, i) => result ?? this.results[i] ?? null); // ?? []
                this.results = results;

                this.$options.hooks.then.call(this, this.results);
            } catch (error) {
                this.results = [];
                this.$handleError(error);
            } finally {
                this.isLoading = false;
            }
        },

        buildSeriesData(dataRows, seriesOptions, axis) {
            const {
                props: {
                    dimensionOptions: {
                        main: { name: dimName }
                    }
                }
            } = this;
            const categoryAxis = utils.findCategoryAxis(seriesOptions, axis);
            const idx = categoryAxis === 'xAxis' ? seriesOptions.xAxisIndex : seriesOptions.yAxisIndex;
            const curCategoryAxis = axis[categoryAxis][idx];
            const { data, valueFontSize, axisLabel } = curCategoryAxis;
            const { seriesData, axisData } = this.aggregateData(seriesOptions, dataRows);
            axisData.forEach((item) => {
                const { name: itemName } = item;
                if (!data.some(({ name }) => name === itemName)) {
                    const { type, imageMetric, imageHeight, rich } = axisLabel;
                    if (type !== 'value' && imageMetric !== '') {
                        const matchingRow = dataRows.find((row) => row[dimName] === itemName);
                        const image = matchingRow[imageMetric];
                        const richProp = utils.memoTransliterate(itemName).replace(/\s/g, '_');
                        rich[richProp] = { backgroundColor: { image }, height: imageHeight };
                    }
                    item.textStyle.fontSize = valueFontSize;
                    item.textStyle.fontWeight =
                        this.chosenDimValue === itemName && curCategoryAxis.shouldHighlightSelectedLabels
                            ? 'bold'
                            : 'normal';
                    data.push(item);
                }
            });
            let result = this.formSeriesTop(seriesOptions, seriesData, curCategoryAxis);

            if (seriesOptions.isCumulativeTotal) {
                result = utils.getCumulativeTotalData(result);
            }
            if (seriesOptions.isCumulativeDifference) {
                result = utils.getCumulativeDifference(result);
            }
            result = utils.resolveStyleDataItems(seriesOptions, result);
            return result;
        },

        resolveMetricName(seriesOptions) {
            const { metricName, multiMetricMode } = seriesOptions;

            if (multiMetricMode.enable) {
                return multiMetricMode.metricNames[this.drilldownState.index] ?? metricName;
            }

            return metricName;
        },

        aggregateData(seriesOptions, dataRows) {
            const {
                props: {
                    dimensionOptions: {
                        main: { name: mainDimName },
                        minor: { name: minorDimName }
                    },
                    axis
                }
            } = this;
            const metric = this.resolveMetricName(seriesOptions);
            const categoryAxis = axis.find(({ type }) => type === 'category');
            const { isShownNullLabels = false } = categoryAxis ?? {};

            return dataRows.reduce(
                ({ seriesData, axisData }, row) => {
                    const dimValue = row[mainDimName] || row[this.props.topOptions.rest.title];

                    if (dimValue == null) {
                        return { seriesData, axisData };
                    }

                    const metricValue = row[metric];
                    const { customType, name: seriesName, label } = seriesOptions;
                    const itemValue = [null, undefined, ''].includes(metricValue) ? null : Number(metricValue);
                    const { isAddlLabelShown, rich = {} } = label;
                    const additionalLabelValue = isAddlLabelShown ? row[rich.additional?.metric] ?? null : null;

                    if (customType.includes('stacked') === false) {
                        utils.addAgrData(
                            seriesData,
                            dimValue,
                            itemValue,
                            axisData,
                            additionalLabelValue,
                            seriesOptions,
                            isShownNullLabels
                        );
                        return { seriesData, axisData };
                    }

                    const minorDimValue = minorDimName ? row[minorDimName] : null;

                    if (minorDimValue === seriesName) {
                        utils.addAgrData(
                            seriesData,
                            dimValue,
                            itemValue,
                            axisData,
                            additionalLabelValue,
                            seriesOptions,
                            isShownNullLabels
                        );
                        return { seriesData, axisData };
                    }

                    return { seriesData, axisData };
                },
                // eslint-disable-next-line no-restricted-syntax
                { seriesData: [], axisData: [] }
            );
        },

        formSeriesTop(seriesOptions, data, curAxis) {
            const { enable, type, rest, metrics, number, dir } = this.props.topOptions;
            if (!['bar', 'line'].includes(seriesOptions.customType) || type === TopType.METRIC) {
                return data;
            }
            if (enable && this.hasTopMode) {
                if (data.length - 1 <= number) {
                    return data;
                }

                if (rest.show && !curAxis.data.some((axisItem) => axisItem.name === rest.title)) {
                    const { title: name } = rest;
                    curAxis.data.push({
                        name,
                        value: name,
                        textStyle: {
                            fontSize: curAxis.valueFontSize,
                            fontWeight: this.chosenDimValue === name ? 'bold' : 'normal'
                        }
                    });
                }

                if (metrics.includes('all') || metrics.includes(seriesOptions.name)) {
                    const top = utils.getTop(data, { number, dir });
                    let restValue = 0;
                    // eslint-disable-next-line no-restricted-syntax
                    const result = data.map((item, idx) => {
                        if (top.some((topItem) => topItem.index === idx)) {
                            return item;
                        }
                        restValue += item.value;
                        return { ...item, ...{ value: null } };
                    });
                    if (rest.show) {
                        if (rest.reduce.enable) {
                            const topMaxVal = Math.max(...top.map(({ value }) => value));
                            const restMaxVal = topMaxVal + (topMaxVal / 100) * rest.reduce.percent;
                            restValue = restValue > restMaxVal ? restMaxVal : restValue;
                        }
                        result.push({
                            name: rest.title,
                            value: restValue,
                            itemStyle: { color: null }
                        });
                    }
                    return result;
                }

                if (rest.show) {
                    data.push({ name: rest.title, value: null });
                    return data;
                }
            }
            return data;
        },

        storeCommitNulls() {
            const state = [...this.metrics, ...this.dimensions].reduce((acc, key) => ({ ...acc, [key]: null }), {});
            this.$storeCommit(state);
        },
        storeCommitNullsAtFirstLevel() {
            const { isUsed, shouldResetFirstLevel } = this.props.multiLevelDimension;
            if (isUsed && shouldResetFirstLevel && this.drilldownCanPop === false) {
                this.$storeCommit({ [this.drilldownState.name]: null });
            }
        },
        storeCommitState({ value, seriesName }) {
            const {
                shouldResetVar,
                dimensionOptions: {
                    main: { name: dimName },
                    minor: { name: minorDimName = '' }
                }
            } = this.props;

            const state = this.results
                .flatMap(({ rows }) => rows)
                .find((row) => row[dimName] === value && (minorDimName === '' || row[minorDimName] === seriesName));

            if (shouldResetVar === true) {
                this.lastCommit =
                    state == null
                        ? Object.entries(this.lastCommit).reduce((acc, [key]) => ({ ...acc, [key]: null }), {})
                        : state;
                this.$storeCommit(this.lastCommit);
                return;
            }

            this.lastCommit = state;

            if (state != null) {
                this.$storeCommit(state);
            }
        },

        onClickHandler({ componentType, targetType, seriesIndex, seriesName, name, value }, series) {
            this.toggleNeutralSeriesColorsByClick({ series, seriesIndex });

            const clickHandler = (dimValue) => {
                if (this.drilldownCanPush) {
                    this.storeCommitState({ value: dimValue, seriesName });
                    this.drilldownPush(dimValue);
                } else {
                    this.chosenDimValue = this.chosenDimValue === dimValue ? null : dimValue;
                    this.storeCommitState({ value: this.chosenDimValue, seriesName });
                    this.constructOpts();
                }
            };
            if (targetType === 'axisLabel') {
                clickHandler(value);
            }
            if (componentType === 'series') {
                clickHandler(name);
            }
        },

        onPrevBtnClick() {
            // если на последнем уровне дрилла
            if (this.drilldownCanPush === false) {
                this.storeCommitNulls();
            }
            this.drilldownPop();
            if (this.drilldownCanPop === false) {
                this.storeCommitNullsAtFirstLevel();
            } else {
                this.storeCommitNulls();
            }
            this.chosenDimValue = null;
        },

        onTopBtnClick() {
            this.hasTopMode = !this.hasTopMode;
            this.constructOpts();
        },

        composeCustomColors(custom) {
            if (custom?.gradient == null || custom?.gradient === false) {
                return custom?.fillColor
                    ? {
                          areaStyle: {
                              color: convertCssVarToComputedValue(custom.fillColor, this.computedStyle)
                          }
                      }
                    : {};
            }

            const [x, y, x2, y2] = custom?.colorPos?.split(' ');

            return {
                areaStyle: {
                    color: {
                        type: 'linear',
                        x,
                        y,
                        x2,
                        y2,
                        colorStops:
                            custom?.firstColor !== '' && custom?.secondColor !== ''
                                ? [
                                      {
                                          offset: custom.offSetFirstColor,
                                          color: convertCssVarToComputedValue(custom.firstColor, this.computedStyle)
                                      },
                                      {
                                          offset: custom.offSetSecondColor,
                                          color: convertCssVarToComputedValue(custom.secondColor, this.computedStyle)
                                      }
                                  ]
                                : []
                    }
                }
            };
        },

        createStackedSeries(seriesOptions, dataRows, axis) {
            const { main: mainDim, minor: minorDim } = this.props.dimensionOptions;
            const minorDimValues = utils.getDimValues(dataRows, minorDim.name);
            const { customType, stackLines, customColors, color: seriesColor, colorStep } = seriesOptions;
            const isStackedLine = customType.includes('line');
            const stack = isStackedLine && stackLines === false ? '' : STACK_TAG;

            return minorDimValues
                .reduce((acc, dimName, idx) => {
                    if (minorDimValues.includes(dimName) === false) {
                        return acc;
                    }

                    const stackedSeries = cloneDeep(seriesOptions);
                    const {
                        customFillLine,
                        fillSymbol,
                        itemStyle: { color: symbolColor }
                    } = stackedSeries;
                    // eslint-disable-next-line no-restricted-syntax
                    const foundColor = customColors.find(({ name }) => name === dimName);
                    const color =
                        convertCssVarToComputedValue(foundColor?.color, this.computedStyle) ??
                        utils.createColor(
                            convertCssVarToComputedValue(seriesColor, this.computedStyle),
                            colorStep,
                            idx
                        );
                    const mergedStyles = _merge(stackedSeries, {
                        name: dimName,
                        type: isStackedLine ? 'line' : 'bar',
                        customType: isStackedLine ? 'stacked line' : 'stacked',
                        stack,
                        dimensions: mainDim.name,
                        itemStyle: {
                            color: isStackedLine && fillSymbol ? symbolColor : color
                        },
                        lineStyle: {
                            color: isStackedLine ? color : null
                        },
                        tooltip: {
                            formatter: utils.tooltipSeriesFormatter.bind(stackedSeries)
                        },
                        label: {
                            formatter: utils.labelFormatter.bind(stackedSeries)
                        },
                        animationEasingUpdate: stackedSeries.animationEasing,
                        animationDurationUpdate: stackedSeries.animationDuration,
                        animationDelayUpdate: stackedSeries.animationDelay,
                        ...(foundColor && customFillLine ? this.composeCustomColors(foundColor) : {})
                    });

                    const { shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, ...itemStyle } =
                        mergedStyles.itemStyle;
                    return [
                        ...acc,
                        {
                            ...mergedStyles,
                            ...(seriesOptions.customType === 'stacked line'
                                ? {
                                      itemStyle,
                                      lineStyle: {
                                          ...mergedStyles.lineStyle,
                                          shadowBlur,
                                          shadowOffsetX,
                                          shadowOffsetY,
                                          shadowColor: mergedStyles.shouldSyncShadowColor
                                              ? mergedStyles.itemStyle.color
                                              : shadowColor
                                      }
                                  }
                                : {
                                      itemStyle: {
                                          ...itemStyle,
                                          shadowBlur,
                                          shadowOffsetX,
                                          shadowOffsetY,
                                          shadowColor: mergedStyles.shouldSyncShadowColor
                                              ? mergedStyles.itemStyle.color
                                              : shadowColor
                                      }
                                  })
                        }
                    ];
                }, [])
                .map((series) => ({ ...series, data: this.buildSeriesData(dataRows, series, axis) }));
        },

        composeSeriesOption(seriesItem) {
            const { shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, borderColor, ...itemStyle } =
                seriesItem.itemStyle;
            return {
                ...seriesItem,
                ...(seriesItem.fillLine && seriesItem.shouldSyncColor
                    ? {
                          areaStyle: {
                              color: convertCssVarToComputedValue(seriesItem.color, this.computedStyle)
                          }
                      }
                    : {}),
                tooltip: { ...seriesItem.tooltip, formatter: utils.tooltipSeriesFormatter.bind(seriesItem) },
                label: { ...seriesItem.label, formatter: utils.labelFormatter.bind(seriesItem) },
                animationEasingUpdate: seriesItem.animationEasing,
                animationDurationUpdate: seriesItem.animationDuration,
                animationDelayUpdate: seriesItem.animationDelay,
                ...(seriesItem.customType === 'line'
                    ? {
                          itemStyle: {
                              ...itemStyle,
                              ...(() => {
                                  const color = seriesItem.shouldDotsSyncColor
                                      ? convertCssVarToComputedValue(seriesItem.color, this.computedStyle)
                                      : borderColor;

                                  return {
                                      borderColor: color,
                                      color: seriesItem.shouldDotsSyncColor ? color : seriesItem.symbolColor
                                  };
                              })()
                          },
                          lineStyle: {
                              ...seriesItem.lineStyle,
                              shadowBlur,
                              shadowOffsetX,
                              shadowOffsetY,
                              color: seriesItem.color,
                              shadowColor: seriesItem.shouldSyncShadowColor ? seriesItem.color : shadowColor
                          }
                      }
                    : {
                          itemStyle: {
                              ...itemStyle,
                              borderColor,
                              shadowBlur,
                              shadowOffsetX,
                              shadowOffsetY,
                              color: seriesItem.color,
                              shadowColor: seriesItem.shouldSyncShadowColor ? seriesItem.color : shadowColor
                          }
                      })
            };
        },

        buildClassicSeries(seriesOptions, dataRows, axis, originIdx) {
            const {
                main: { name: mainDimName }
            } = this.props.dimensionOptions;
            const { topOptions } = this.props;
            const { metrics } = this;

            return seriesOptions.reduce((result, item) => {
                const notSpecialSeries =
                    item.customType !== 'plan' && item.customType !== 'fact' && !item.customType.includes('stacked');

                const multiMetricCurDataset =
                    item.multiMetricMode?.metricDatasets?.[this.drilldownState.index] || item.originIdx;

                const checkOriginIdx = item.multiMetricMode.enable
                    ? Number(multiMetricCurDataset) === originIdx
                    : originIdx === Number(item.originIdx);

                if (item.showDataSet && notSpecialSeries && checkOriginIdx) {
                    if (item.isTopSeries === false && metrics.includes(item.metricName) === false) {
                        return result;
                    }
                    const { shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, borderColor, ...itemStyle } =
                        item.itemStyle;
                    result.push({
                        ...this.composeSeriesOption(item),
                        dimensions: mainDimName,
                        data: this.buildSeriesData(dataRows, item, axis)
                    });
                }
                return result;
            }, []);
        },

        buildComparedSeries(seriesOptions, dataRows, axis, originIndex) {
            let series = [];
            const factSeries = seriesOptions.find(
                ({ customType, metricName, originIdx }) =>
                    customType === 'fact' && metricName !== '' && Number(originIdx) === originIndex
            );
            const planSeries = seriesOptions.find(
                ({ customType, metricName, originIdx }) =>
                    customType === 'plan' && metricName !== '' && Number(originIdx) === originIndex
            );

            if (!(factSeries && planSeries)) {
                return series;
            }

            const { main: mainDim } = this.props.dimensionOptions;

            factSeries.dimensions = mainDim.name;
            factSeries.stack = STACK_TAG;
            factSeries.itemStyle.color = factSeries.color;
            factSeries.itemStyle.shadowColor = factSeries.shouldSyncShadowColor
                ? factSeries.color
                : factSeries.itemStyle.shadowColor;
            const factData = this.buildSeriesData(dataRows, factSeries, axis);

            planSeries.dimensions = mainDim.name;
            planSeries.stack = STACK_TAG;
            planSeries.itemStyle.color = planSeries.color;
            planSeries.itemStyle.shadowColor = planSeries.shouldSyncShadowColor
                ? planSeries.color
                : planSeries.itemStyle.shadowColor;
            const planData = this.buildSeriesData(dataRows, planSeries, axis);

            const comparedOpts = {
                originIdx: planSeries.originIdx,
                barWidth: planSeries.barWidth,
                barMinWidth: planSeries.barMinWidth,
                barMaxWidth: planSeries.barMaxWidth,
                dimensions: mainDim.name,
                metricSeparator: planSeries.metricSeparator,
                metricFormat: planSeries.metricFormat,
                metricPrefix: planSeries.metricPrefix,
                metricPostfix: planSeries.metricPostfix,
                smooth: planSeries.smooth,
                label: planSeries.excessLackLabel,
                animationEasing: planSeries.animationEasing,
                animationEasingUpdate: planSeries.animationEasing,
                animationDuration: planSeries.animationDuration,
                animationDurationUpdate: planSeries.animationDuration,
                animationDelay: planSeries.animationDelay,
                animationDelayUpdate: planSeries.animationDelay
            };
            const overOpts = {
                name: planSeries.nameExcess,
                color: planSeries.excess.color,
                itemStyle: {
                    shadowColor: planSeries.shouldSyncShadowColor
                        ? planSeries.excess.color
                        : planSeries.itemStyle.shadowColor
                }
            };
            const underOpts = {
                name: planSeries.nameLack,
                color: planSeries.lack.color,
                itemStyle: {
                    shadowColor: planSeries.shouldSyncShadowColor
                        ? planSeries.lack.color
                        : planSeries.itemStyle.shadowColor
                }
            };
            const overSeries = _merge(cloneDeep(ComparedSeriesTemplate), comparedOpts, overOpts);
            const underSeries = _merge(cloneDeep(ComparedSeriesTemplate), comparedOpts, underOpts);

            const categoryAxis = utils.findCategoryAxis(planSeries, axis);

            planData.forEach((planValue) => {
                let factValue = factData.find((item) => item.name === planValue.name);
                let underValue = planValue.value - factValue.value;
                const overValue = factValue.value - planValue.value;
                const emptyBarBdrRds = [0, 0, 0, 0];
                const roundedBdr = 500;
                const fillBarBdrRds =
                    categoryAxis === 'xAxis' ? [roundedBdr, roundedBdr, 0, 0] : [0, roundedBdr, roundedBdr, 0];

                const buildDataItem = (name, value, barBorderRadius = null) => ({
                    name,
                    value,
                    itemStyle: { barBorderRadius }
                });
                if (overValue > 0) {
                    // логика при избытке
                    // удаляем бар факта
                    factSeries.data.push(buildDataItem(planValue.name, null));
                    planSeries.data.push(buildDataItem(planValue.name, planValue.value, emptyBarBdrRds));
                    underSeries.data.push(buildDataItem(planValue.name, null));
                    // добавляем over
                    const overBarBdrRds = overSeries.smooth ? fillBarBdrRds : emptyBarBdrRds;
                    overSeries.data.push(buildDataItem(planValue.name, overValue, overBarBdrRds));
                } else {
                    // логика при недостатке
                    factValue = Number(factValue.value) !== 0 ? factValue.value : null;
                    factSeries.data.push(buildDataItem(planValue.name, factValue, emptyBarBdrRds));
                    // удаляем бар плана
                    planSeries.data.push(buildDataItem(planValue.name, null));
                    overSeries.data.push(buildDataItem(planValue.name, null));
                    underValue = Number(underValue) !== 0 ? underValue : null;
                    const underBarBdrRds = underSeries.smooth ? fillBarBdrRds : emptyBarBdrRds;
                    underSeries.data.push(buildDataItem(planValue.name, underValue, underBarBdrRds));
                }
            });

            const comparedSeries = [factSeries, planSeries, overSeries, underSeries];
            comparedSeries.forEach((seriesOpts) => {
                seriesOpts.tooltip.formatter = utils.tooltipSeriesFormatter.bind(seriesOpts);
                seriesOpts.label.formatter = utils.labelFormatter.bind(seriesOpts);
            });

            series = comparedSeries;
            return series;
        },

        buildStackedSeries(seriesOptions, dataRows, axis, originIdx) {
            const { dimensionOptions } = this.props;
            const { name: minorDimName, sort: sortOrder, format: dimFormat } = dimensionOptions.minor;

            if (minorDimName === '') {
                return [];
            }

            const stackedSeries = seriesOptions.reduce((result, item) => {
                const { showDataSet, metricName, customType, originIdx: idx } = item;

                if (showDataSet && metricName !== '' && customType.includes('stacked') && Number(idx) === originIdx) {
                    const stackedSeriesOptions = this.createStackedSeries(item, dataRows, axis);
                    utils.sortArray(stackedSeriesOptions, sortOrder, dimFormat);
                    return result.concat(stackedSeriesOptions);
                }
                return result;
            }, []);

            return utils.smoothStackedSeries(stackedSeries, axis);
        },

        handleSkipDrilldownLevel(results) {
            const { name: drilldownName, filters, canPop, canPush } = this.drilldownState;
            if (drilldownName === null) {
                return false;
            }
            const { rowCount, rows } = results[0];
            const {
                props: { shouldSkipLevelWithOneValue, shouldSkipLevelWithIdenticalValue }
            } = this;

            if (rowCount === 0 && canPop) {
                this.storeCommitNulls();
                this.drilldownPop();
                this.storeCommitNullsAtFirstLevel();
                return true;
            }

            const shouldSkipLevel =
                rows.length === 1 &&
                (shouldSkipLevelWithOneValue ||
                    (shouldSkipLevelWithIdenticalValue && filters.slice(-1)[0]?.value === rows[0][drilldownName]));

            if (shouldSkipLevel === false) {
                return false;
            }

            if (this.drilldownLastDirection === -1 && canPop) {
                this.drilldownPop();
                return true;
            }

            if (this.drilldownLastDirection === 1 && canPush) {
                const [row] = rows;
                const value = row[drilldownName];
                this.drilldownPush(value);
                return true;
            }

            return false;
        },

        getSeries(seriesOptions, axis) {
            const {
                results,
                props: {
                    topOptions,
                    dimensionOptions: { main: mainDim }
                }
            } = this;

            const { multiMetricMode } = seriesOptions?.[0] ?? {};
            const { enable: isMultiMetricMode } = multiMetricMode ?? {};
            const { name: dimName, sort: sortOrder, format: dimFormat } = mainDim;
            const multiMetricSortOrder = multiMetricMode?.metricSorts?.[this.drilldownState.index] || sortOrder;

            let series = [];
            this.mainDimValues = results
                .reduce((arr, { rows }) => {
                    const dimValues = utils.getDimValues(rows, dimName).filter((value) => !arr.includes(value));
                    return [...arr, ...dimValues];
                }, [])
                .sort(utils.sortDimValues.bind(mainDim));

            const { classicSeries, comparedSeries, stackedSeries } = results.reduce(
                (obj, { rows, rowCount }, idx) => {
                    obj.classicSeries.push(...this.buildClassicSeries(seriesOptions, rows, axis, idx));
                    obj.comparedSeries.push(...this.buildComparedSeries(seriesOptions, rows, axis, idx));
                    obj.stackedSeries.push(...this.buildStackedSeries(seriesOptions, rows, axis, idx));
                    return obj;
                },
                { classicSeries: [], comparedSeries: [], stackedSeries: [] }
            );
            utils.removeUselessDimVals(classicSeries, axis);
            series = series.concat(classicSeries, comparedSeries, stackedSeries);

            utils.postprocessSeriesData(series, axis, isMultiMetricMode ? multiMetricSortOrder : sortOrder, dimFormat);

            series = this.adaptSeriesWithTop(series);
            series = this.adaptSeriesWithNeutral(series);

            return series;
        },

        adaptSeriesWithNeutral(series) {
            const { isEnabled, color, symbolColor, symbolBdrColor } = this.props.neutralMetrics;

            if (isEnabled === false) {
                return series;
            }

            const neutralMetrics = series.map((seriesItem, index) => {
                const { color: lastItemColor, borderColor: lastItemBorderColor } = seriesItem.itemStyle;
                const { color: lastLineColor = null } = seriesItem?.lineStyle ?? {};

                const initialColors = {
                    itemStyle: { color: lastItemColor, borderColor: lastItemBorderColor },
                    lineStyle: { color: lastLineColor }
                };

                const emphasis = {
                    itemStyle: {
                        ...seriesItem?.emphasis?.itemStyle,
                        color: lastItemColor,
                        borderColor: lastItemBorderColor
                    },
                    lineStyle: { ...seriesItem?.emphasis?.lineStyle, color: lastLineColor }
                };

                return this.chosenNeutralMetricIndexes.includes(index)
                    ? { ...seriesItem, initialColors, emphasis }
                    : {
                          ...seriesItem,
                          initialColors,
                          emphasis,
                          itemStyle: {
                              ...seriesItem.itemStyle,
                              color: symbolColor,
                              borderColor: symbolBdrColor
                          },
                          lineStyle: { ...(seriesItem?.lineStyle ?? {}), color }
                      };
            });

            return neutralMetrics;
        },

        toggleNeutralSeriesColorsByClick({ series, seriesIndex }) {
            const { isEnabled } = this.props.neutralMetrics;

            if (isEnabled === false) {
                return;
            }

            let cloneIndexes = [...this.chosenNeutralMetricIndexes];

            if (cloneIndexes.includes(seriesIndex)) {
                cloneIndexes = cloneIndexes.filter((idx) => idx !== seriesIndex);
            } else {
                cloneIndexes.push(seriesIndex);
            }

            this.chosenNeutralMetricIndexes = cloneIndexes;
        },

        toggleNeutralSeriesColors({ series, seriesIndex }) {
            const composedSeries = series.map((seriesItem, index) => {
                const {
                    initialColors: { itemStyle, lineStyle }
                } = seriesItem ?? {};
                return index === seriesIndex
                    ? {
                          ...seriesItem,
                          itemStyle: { ...seriesItem.itemStyle, ...itemStyle },
                          lineStyle: { ...(seriesItem?.lineStyle ?? {}), ...lineStyle }
                      }
                    : seriesItem;
            });

            return composedSeries;
        },
        adaptSeriesWithTop(series) {
            const { enable, type, rest, number, dir, metricsStyle } = this.props.topOptions;

            if (enable === false || this.hasTopMode === false || type === TopType.DIMENSION) {
                return series;
            }

            const allSeriesSums = series.map((ser, idx) => ({
                value: ser.data.reduce((acc, item) => (item.value != null ? acc + item.value : acc), 0),
                index: idx
            }));

            const top = utils.getTopMetric(allSeriesSums, { number, dir });

            const topIndexes = top.map(({ index }) => index);

            const { topMetrics, restMetrics } = series.reduce(
                (acc, ser, idx) => {
                    acc[topIndexes.includes(idx) === true ? 'topMetrics' : 'restMetrics'].push(ser);
                    return acc;
                },
                { topMetrics: [], restMetrics: [] }
            );

            if (rest.show === true) {
                topMetrics.push(
                    this.convertSeriesFields2Px(
                        this.composeSeriesOption(
                            this.buildSeriesOptions([
                                {
                                    ...metricsStyle,
                                    name: rest.title,
                                    metricName: rest.title,
                                    marker: rest.title,
                                    data: Array.from(
                                        { length: Math.max(...restMetrics.map(({ data }) => data?.length ?? 0)) },
                                        (_, index) => ({
                                            value: restMetrics.reduce(
                                                (acc, { data }) => acc + (data[index]?.value ?? 0),
                                                0
                                            )
                                        })
                                    ),
                                    ...(metricsStyle.fillLine &&
                                        metricsStyle.shouldSyncColor === false &&
                                        metricsStyle.gradient === false && {
                                            areaStyle: {
                                                ...(metricsStyle.areaStyle ?? {}),
                                                color: metricsStyle.fillColor
                                            }
                                        }),

                                    isTopSeries: true
                                }
                            ])[0]
                        )
                    )
                );
            }

            return topMetrics;
        },

        buildSeriesOptions(seriesOptions) {
            return seriesOptions.map(({ label: { rich, align, fontSize: labelFontSize, ...label }, ...data }) => {
                const convertingData = this.convertSeriesFields2Px(data);

                const labelOption = {
                    ...label,
                    fontSize: this.takeUnit2Px({ size: labelFontSize }),
                    align: ((position) => {
                        const string = position.toLowerCase();
                        const isLeft = string.includes('left');
                        const isRight = string.includes('right');
                        const isInside = string.includes('inside');
                        if (isLeft) {
                            return isInside ? 'left' : 'right';
                        }
                        if (isRight) {
                            return isInside ? 'right' : 'left';
                        }
                        return 'center';
                    })(label.position)
                };

                if (align !== 'center') {
                    if (align === 'left') {
                        labelOption.offset = [-15, 0];
                    }
                    if (align === 'right') {
                        labelOption.offset = [15, 0];
                    }
                }

                return {
                    ...convertingData,
                    label: {
                        ...labelOption,
                        rich: {
                            ...rich,
                            ...(rich?.additional != null
                                ? {
                                      additional: {
                                          ...rich.additional,
                                          fontSize: this.takeUnit2Px({ size: rich.additional.fontSize })
                                      }
                                  }
                                : {}),
                            ...(rich?.prefix != null
                                ? {
                                      prefix: {
                                          ...rich.prefix,
                                          fontSize: this.takeUnit2Px({ size: rich.prefix.fontSize })
                                      }
                                  }
                                : {}),
                            ...(rich?.postfix != null
                                ? {
                                      postfix: {
                                          ...rich.postfix,
                                          fontSize: this.takeUnit2Px({ size: rich.postfix.fontSize })
                                      }
                                  }
                                : {}),
                            base: {
                                ...labelOption,
                                align
                            }
                        }
                    }
                };
            });
        },

        constructOpts() {
            const {
                results,
                privateProps: { metricsStyle, axis: axisOptions },
                props: {
                    tooltip,
                    axisPointer,
                    dimensionOptions: {
                        main: { name: dimName, format: dimFormat }
                    },
                    dataZoom: { isUsedBaseMinMaxValue, show: isScrollBarShow }
                }
            } = this;
            if (!(results && results.length > 0 && dimName)) {
                return;
            }
            const categoryAxis = axisOptions.find(({ type }) => type === 'category');
            const seriesOptions = this.buildSeriesOptions(metricsStyle);
            const { xAxis, yAxis } = utils.getAxis({
                axisOptions: axisOptions.map(({ valueFontSize, additionalAxisLabel, ...options }) => ({
                    ...options,
                    valueFontSize: this.takeUnit2Px({ size: valueFontSize }),
                    ...(additionalAxisLabel != null
                        ? {
                              additionalAxisLabel: {
                                  ...additionalAxisLabel,
                                  fontSize: this.takeUnit2Px({ size: additionalAxisLabel.fontSize })
                              }
                          }
                        : {})
                })),
                tooltip,
                axisPointer,
                dimFormat,
                dimName,
                rows: results[categoryAxis?.additionalAxisLabel?.datasetIndex ?? 0].rows
            });

            const series = this.getSeries(seriesOptions, { xAxis, yAxis }).map((ser) => {
                const { labelLayout = {}, data } = ser;

                ['x', 'y'].forEach((coord) => {
                    if (labelLayout[coord] === 0) {
                        delete labelLayout[coord];
                    }
                });

                if (labelLayout.use !== true) {
                    ser.labelLayout = {};
                }
                // reset tooltip to default, as Echarts version 4.x
                if (ser.tooltip != null) {
                    setDefaultTooltipStyle(ser);
                }

                return {
                    ...ser,
                    data: data.map(({ value, ...rest }) => ({
                        ...rest,
                        value: value === 0 ? ECHARTS_SERIES_MIN_INT_VALUE : value
                    }))
                };
            });
            if (isUsedBaseMinMaxValue === false && isScrollBarShow) {
                const { min, max } = utils.calcSeriesMinMax(series);
                [yAxis, xAxis].flat().forEach((axis) => {
                    if (axis.type === 'value') {
                        axis.min = axis.min({ min });
                        axis.max = axis.max({ max });
                    }
                });
            }
            const { dataZoom } = this;
            const buildedCategoryAxis = [yAxis, xAxis].flat().find(({ type }) => type === 'category');
            const dataLength = buildedCategoryAxis?.data?.length ?? 0;
            const opts = {
                ...this.options,
                dataZoom:
                    dataZoom != null &&
                    dataZoom
                        .map(({ inverseDirection = false }) => inverseDirection)
                        .find((inverseDirection) => inverseDirection) === true
                        ? dataZoom.map(({ startValue, endValue, ...other }) => ({
                              startValue: dataLength - endValue,
                              endValue: dataLength - startValue,
                              ...other
                          }))
                        : dataZoom,
                series,
                xAxis,
                yAxis
            };

            const { barGap } = this.props;
            if (!isNaN(parseInt(barGap))) {
                opts.barGap = barGap;
            }

            if (opts.legend != null) {
                opts.legend.itemStyle ??= { borderWidth: 0 };
            }
            // reset tooltip to default, as Echarts version 4.x
            if (opts.tooltip != null) {
                setDefaultTooltipStyle(opts);
            }

            // this.setBreadcrumbText();
            this.drawChart(opts);
            this.addEventListeners(series);
        },

        destroyChart() {
            if (this.chartInstance && this.chartInstance.dispose) {
                this.chartInstance.dispose();
                this.chartInstance = null;
            }
        },
        initChart() {
            const el = this.$refs.chartAwesome;
            this.chartInstance = echarts.init(el);
        },
        drawChart(opts) {
            // NOTE fix echarts bug: https://github.com/xieziyu/ngx-echarts/issues/102
            this.destroyChart();
            this.initChart();

            /**
             * TODO для плеера. Чтобы при первом запуске подхватывались кастомные шрифты
             */
            if (this.isFirstRun) {
                this.isFirstRun = false;
                this.resizeByTimeout(RESIZE_THROTTLE_TIMEOUT);
            }
            this.chartInstance.setOption(convertCssVarToComputedValue(opts, this.computedStyle));
            /**
             * TODO для плеера. В сложных графиках шрифты обновляются не везде. Поэтому доп. вызов resize
             * Проверить и возможно убрать после версии echarts 5.4
             */
            this.resizeByTimeout(REQUEST_ANIMATION_TIMEOUT);
        },

        resizeByTimeout(interval) {
            setTimeout(() => {
                this.chartInstance.resize();
            }, interval);
        },

        addEventListeners(series) {
            const { isEnabled, shouldFollowPointer } = this.props.customTooltip;

            this.chartInstance.on('click', 'series', (params) => this.onClickHandler(params, series));
            this.chartInstance.on('mouseover', 'series', (params) => this.onMouseOver(params, series));
            this.chartInstance.on('mouseout', 'series', (params) => this.onMouseOut(params, series));

            if (isEnabled === false || shouldFollowPointer === false) {
                return;
            }

            const onMouseMoveThrottled = _throttle(this.onMouseMove, REQUEST_ANIMATION_TIMEOUT);
            this.chartInstance.on('mousemove', 'series', onMouseMoveThrottled);
        },

        onMouseMove({ event: { event: mouseEvent } }) {
            const { options } = this.customTooltip;

            if (options.isFixed) {
                return;
            }

            const { clientX, clientY } = mouseEvent;
            this.customTooltip.options = { ...options, coordinates: [clientX, clientY] };
        },

        onMouseOut({ seriesIndex, event: { event: mouseEvent } }, series) {
            const { isEnabled: isNeutralMetricsEnabled } = this.props.neutralMetrics;

            if (isNeutralMetricsEnabled === true) {
                this.chartInstance.setOption({ series: this.adaptSeriesWithNeutral(series, seriesIndex) });
            }

            const { isFixed } = this.customTooltip.options;

            if (isFixed) {
                return;
            }

            const { shouldRespondToPointerEvents } = this.props.customTooltip;

            if (shouldRespondToPointerEvents === false) {
                this.customTooltip.isShown = false;
                return;
            }

            const { relatedTarget } = mouseEvent;

            if (relatedTarget == null) {
                this.customTooltip.isShown = false;
            }
        },

        onMouseOver({ seriesIndex, name: dimensionName, seriesName, value, event: { event: mouseEvent } }, series) {
            const { isEnabled: isNeutralMetricsEnabled } = this.props.neutralMetrics;

            if (isNeutralMetricsEnabled === true) {
                this.chartInstance.setOption({ series: this.toggleNeutralSeriesColors({ series, seriesIndex }) });
            }

            const { isEnabled, shouldFollowPointer } = this.props.customTooltip;

            if (isEnabled === false) {
                return;
            }

            const {
                results,
                customTooltip: { options, isShown }
            } = this;

            if (options.isFixed && isShown) {
                return;
            }

            const { dimensionOptions } = this.props;
            const { metricName } = series.find(({ name }) => name === seriesName);
            const { clientX, clientY } = mouseEvent;

            this.customTooltip.options = {
                ...options,
                coordinates: [clientX, clientY],
                data: utils.buildCustomTooltipData(
                    results,
                    dimensionOptions,
                    { dimensionName, value },
                    { seriesName, metricName }
                )
            };
            this.customTooltip.isShown = true;
        }
    },
    implicitCssModule: true
};
</script>
