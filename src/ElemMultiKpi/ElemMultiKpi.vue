<template>
    <w-elem :placeholder="$placeholder">
        <div class="pos-rel w-100 h-100" :class="kpiWrapperClasses" :style="backgroundColoring" @click="onWidgetClick">
            <div v-if="isShownHintAbsolute" :style="absoluteHintCssVars" class="absolute-hint">
                <ui-kpi-hint />
            </div>

            <div v-if="props.showTitle" class="kpi-title" :class="kpiTitleClasses">
                <div v-if="isHintShownByTitle && props.positionHint === 'left'" class="mar-right-l1">
                    <ui-kpi-hint />
                </div>
                {{ title }}
                <div v-if="isHintShownByTitle && props.positionHint === 'right'" class="mar-left-l1">
                    <ui-kpi-hint />
                </div>
            </div>
            <div
                :style="{
                    ...customStyle,
                    'font-size': fontSizeMetric,
                    'justify-content': positionMetric
                }"
                :class="[metricPosition, props.isViewModeAbsolute ? 'pos-abs' : '']"
                class="kpi-data">
                <div :class="metricClasses">
                    <div
                        :class="
                            props.positionBench === 'left' || props.positionBench === 'right' ? 'd-flex' : 'd-block'
                        ">
                        <div
                            class="d-flex"
                            v-if="
                                !isLoading &&
                                (props.positionBench === 'left' || props.positionBench === 'top') &&
                                props.showBench
                            "
                            :style="{
                                ...styleBench,
                                ...customBenchStyle,
                                'font-family': props.fontBench,
                                'font-size': fontSizeBench
                            }">
                            <div class="mar-right-2">
                                <i
                                    v-if="props.indicatorBenchmarkIcon.direction === 'row'"
                                    class="benchmark-icon"
                                    :class="indicatorBenchmarkClasses"
                                    :style="indicatorBenchmarkCssStyle" />
                                <span v-if="props.benchPrefixIcon">
                                    <i
                                        class="mdi"
                                        :class="props.benchPrefixIcon"
                                        :style="{
                                            color: props.benchPrefixIconColor,
                                            fontSize: props.benchPrefixIconFontSize
                                        }"></i>
                                </span>
                                <span class="bench-prefix-text">
                                    {{ '' + props.benchPreFix + ' ' }}
                                </span>
                                <span class="benchmark-value">
                                    {{ formattedBench }}
                                </span>
                                <span class="bench-postfix-text">
                                    {{ ' ' + props.benchPostFix }}
                                </span>
                                <i
                                    v-if="props.indicatorBenchmarkIcon.direction === 'row-reverse'"
                                    class="benchmark-icon"
                                    :class="indicatorBenchmarkClasses"
                                    :style="indicatorBenchmarkCssStyle" />
                            </div>
                        </div>

                        <div v-if="isLoading && !props.showNumberAnimation" class="preloader color-primary"></div>
                        <div v-else class="d-flex items-baseline">
                            <div v-if="isHintShownByMetric && props.positionHint === 'left'" class="mar-right-l1">
                                <ui-kpi-hint />
                            </div>
                            <div>
                                <i
                                    v-if="props.indicatorMetricIcon.direction === 'row'"
                                    class="metric-icon"
                                    :class="indicatorMetricClasses"
                                    :style="indicatorMetricCssStyle" />
                                <span v-if="props.prefixIcon">
                                    <i class="prefix-icon mdi" :class="props.prefixIcon" :style="prefixIconStyles" />
                                </span>
                                <span class="prefix-text">{{ metricPrefix }}</span>
                                <template v-if="shouldAnimateNumber">
                                    <ui-number-animation
                                        v-if="props.showEditorNumberAnimation"
                                        :number-css-vars="animatedNumberCssVars"
                                        :digit-number="props.numberAnimationDigits"
                                        :metric-digit-capacity="props.metricDigitCapacity"
                                        :delay="props.numberAnimationDelay"
                                        class="number-animation"></ui-number-animation>
                                    <ui-number-counting
                                        v-if="props.shouldCountingNumber"
                                        :number-css-vars="animatedNumberCssVars"
                                        :key="formattedValue"
                                        :value="formattedValue"
                                        :delay="props.numberAnimationDelay"
                                        class="number-animation"></ui-number-counting>
                                </template>
                                <span v-else>{{ roundValue(formattedValue) }}</span>
                                <span class="postfix-text">
                                    {{ props.postFix }}
                                </span>
                                <i
                                    v-if="props.indicatorMetricIcon.direction === 'row-reverse'"
                                    class="metric-icon"
                                    :class="indicatorMetricClasses"
                                    :style="indicatorMetricCssStyle" />
                            </div>
                            <div v-if="isHintShownByMetric && props.positionHint === 'right'" class="mar-left-l1">
                                <ui-kpi-hint />
                            </div>
                        </div>

                        <div
                            v-if="
                                !isLoading &&
                                props.positionBench !== 'left' &&
                                props.positionBench !== 'top' &&
                                props.showBench
                            "
                            :style="{
                                ...styleBench,
                                ...customBenchStyle,
                                'font-family': props.fontBench,
                                'font-size': fontSizeBench
                            }">
                            <div class="mar-left-2">
                                <i
                                    v-if="props.indicatorBenchmarkIcon.direction === 'row'"
                                    class="benchmark-icon"
                                    :class="indicatorBenchmarkClasses"
                                    :style="indicatorBenchmarkCssStyle" />
                                <span v-if="props.benchPrefixIcon">
                                    <i
                                        class="mdi"
                                        :class="props.benchPrefixIcon"
                                        :style="{
                                            color: props.benchPrefixIconColor,
                                            fontSize: props.benchPrefixIconFontSize
                                        }"></i>
                                </span>
                                <span class="bench-prefix-text">
                                    {{ '' + props.benchPreFix + ' ' }}
                                </span>
                                <span class="benchmark-value">
                                    {{ formattedBench }}
                                </span>
                                <span class="bench-postfix-text">
                                    {{ ' ' + props.benchPostFix }}
                                </span>
                                <i
                                    v-if="props.indicatorBenchmarkIcon.direction === 'row-reverse'"
                                    class="benchmark-icon"
                                    :class="indicatorBenchmarkClasses"
                                    :style="indicatorBenchmarkCssStyle" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </w-elem>
</template>
<script>
/* eslint-disable vue/no-unused-properties */
import { Elem } from '@goodt-wcore/elem';
import { get as _get } from 'lodash';
import { Const } from '@goodt-wcore/core';
import { ElemDatasetBaseMixinTypes, useElemDatasetBaseMixin } from '@goodt-common/data';
import { formatNumber } from '@goodt-widgets-insight/utils';
import { SizeConverter } from '@goodt-common/utils';
import UiNumberAnimation from './components/NumberAnimation.vue';
import UiNumberCounting from './components/NumberCounting.vue';
import UiKpiHint from './components/KpiHint.vue';
import { ParamStyleTypes, resolveValueWithUnits, convertLegacyFormat, LegacyNumberFormatNoFormat } from './utils';
import { Events, meta } from './descriptor';
import { RuleDataType } from './utils/constants';

const convertToAbsoluteValue = SizeConverter.instance.convertToAbsoluteValue.bind(SizeConverter.instance);
/**
 * @typedef {import('./types/ElemMultiKpi').TInstance} TInstance
 * @type {TInstance}
 */
const ComponentInstanceTypeDescriptor = undefined;
const DatasetMixin = useElemDatasetBaseMixin({ panel: false });

export default {
    extends: Elem,

    components: {
        UiKpiHint,
        UiNumberAnimation,
        UiNumberCounting
    },

    mixins: [DatasetMixin],

    meta,

    static: {
        resolveValueWithUnits
    },
    data() {
        return {
            formattedValue: 0,
            formattedBench: 0,
            isHovered: false,
            target: Const.PORTAL_TARGET_NAME_POPUP
        };
    },
    computed: {
        shouldAnimateNumber() {
            const { showNumberAnimation, showEditorNumberAnimation, shouldCountingNumber } = this.props;
            const { isLoading, formattedValue } = this;
            return (
                !isLoading &&
                parseFloat(formattedValue) &&
                showNumberAnimation &&
                (showEditorNumberAnimation || shouldCountingNumber)
            );
        },
        fontSizeMetric() {
            const { hasSomeResponseChosenMD } = this;
            const { sizeMetric, sizeUnitMetric, enablePlaceHolder, defaultValueFontSize } = this.props;
            return enablePlaceHolder && !hasSomeResponseChosenMD
                ? defaultValueFontSize
                : typeof sizeMetric === 'string'
                ? sizeMetric
                : `${sizeMetric}${sizeUnitMetric}`;
        },
        customStyle() {
            const { metricDynamicColor, conditionMetricStyle } = this.props;
            if (metricDynamicColor === true && this.hasSomeResponseChosenMD && !this.isLoading) {
                const styles = conditionMetricStyle?.style ?? [];
                const type = conditionMetricStyle?.type ?? '';
                const value = conditionMetricStyle?.value ?? null;
                let obj = {
                    ...this.defaultColor
                };

                const metricValue = type === 'METRIC_DIMENSION' ? this.findMetricValue(this.results, value) : value;

                styles.forEach((item) => {
                    const handler = _get(ParamStyleTypes, `[${item.type}].handler`, null);
                    const itemValue = this.getItemValue(item.value, item.typeCondition);
                    if (handler && handler(Number(metricValue), Number(itemValue))) {
                        obj = {
                            ...obj,
                            ...this.cssStrToObj(typeof item.style === 'string' ? item.style : item.style.join(';'))
                        };
                    }
                });

                return obj;
            }

            return this.defaultColor;
        },
        customBenchStyle() {
            if (this.props.benchDynamicColor) {
                const styles = _get(this.props.conditionBenchStyle, 'style', []);
                const type = _get(this.props.conditionBenchStyle, 'type', '');
                const value = _get(this.props.conditionBenchStyle, 'value', null);
                let obj = {
                    color: this.props.colorBench
                };

                const metricValue = type === 'METRIC_DIMENSION' ? this.findMetricValue(this.results, value) : value;

                styles.forEach((item) => {
                    const handler = _get(ParamStyleTypes, `[${item.type}].handler`, null);
                    const itemValue = this.getItemValue(item.value, item.typeCondition);
                    if (handler && handler(Number(metricValue), Number(itemValue))) {
                        obj = {
                            ...obj,
                            ...this.cssStrToObj(typeof item.style === 'string' ? item.style : item.style.join(';'))
                        };
                    }
                });

                return obj;
            }

            return {
                color: this.props.colorBench
            };
        },
        prefixIconStyles() {
            const { enable, style: styles, type, value } = this.props.conditionPrefixIconStyle;
            if (enable === false) {
                return null;
            }

            const { results } = this;
            const metricValue = type === 'METRIC_DIMENSION' ? this.findMetricValue(results, value) : value;
            return styles.reduce((acc, item) => {
                const handler = _get(ParamStyleTypes, `[${item.type}].handler`, null);
                const itemValue = this.getItemValue(item.value, item.typeCondition);
                if (handler && handler(Number(metricValue), Number(itemValue))) {
                    return {
                        ...acc,
                        ...this.cssStrToObj(typeof item.style === 'string' ? item.style : item.style.join(';'))
                    };
                }
                return acc;
            }, {});
        },
        hasSomeResponseChosenMD() {
            const { results } = this;
            const { type, selectedMetric, selectedDimension } = this.props;
            const selectedMD = type === 'metric' ? selectedMetric : selectedDimension;
            return results.some(({ rows }) => rows.some((row) => row[selectedMD] !== undefined));
        },
        isAllowedLoadData() {
            const {
                isAwaitVariableMode,
                awaitVariableModeSettings: { variables }
            } = this.props;

            if (!isAwaitVariableMode) {
                return true;
            }

            return variables.every((variable) => this.$storeState[variable] != null);
        },
        indicatorMetricIconValue() {
            return this.resolveIconValue(this.props.indicatorMetricIcon);
        },
        indicatorBenchmarkIconValue() {
            return this.resolveIconValue(this.props.indicatorBenchmarkIcon);
        },
        foundMetricRule() {
            const {
                indicatorMetricIcon: { targetSource },
                metricIconRules
            } = this.props;
            return this.resolveValueFromRules({
                targetSource,
                iconValue: this.indicatorMetricIconValue,
                settings: metricIconRules
            });
        },
        foundBenchmarkRule() {
            const {
                indicatorBenchmarkIcon: { targetSource },
                benchmarkIconRules
            } = this.props;
            return this.resolveValueFromRules({
                targetSource,
                iconValue: this.indicatorBenchmarkIconValue,
                settings: benchmarkIconRules
            });
        },
        indicatorMetricClasses() {
            const { indicatorMetricIcon, metricIconRules } = this.props;
            return this.resolveIndicatorClasses({
                settings: indicatorMetricIcon,
                iconValue: this.indicatorMetricIconValue,
                iconRules: metricIconRules,
                foundRule: this.foundMetricRule,
                type: 'metric'
            });
        },
        indicatorMetricCssStyle() {
            if (this.foundMetricRule == null) {
                return {};
            }

            return { color: this.foundMetricRule.color };
        },
        indicatorBenchmarkClasses() {
            const { indicatorBenchmarkIcon, benchmarkIconRules } = this.props;
            return this.resolveIndicatorClasses({
                settings: indicatorBenchmarkIcon,
                iconValue: this.indicatorBenchmarkIconValue,
                iconRules: benchmarkIconRules,
                foundRule: this.foundBenchmarkRule,
                type: 'benchmark'
            });
        },
        indicatorBenchmarkCssStyle() {
            if (this.foundBenchmarkRule == null) {
                return {};
            }

            return { color: this.foundBenchmarkRule.color };
        },
        isStateEmpty() {
            const stateValues = Object.values(this.$storeState);
            return stateValues.length === 0 || stateValues.every((val) => val == null);
        },
        defaultColor() {
            const { colorMetric, enablePlaceHolder, defaultValueColor } = this.props;
            const color = enablePlaceHolder && !this.hasSomeResponseChosenMD ? defaultValueColor : colorMetric;
            return { color };
        }
    },
    computedEditor: {
        absoluteHintCssVars() {
            const { absoluteHint, sizeIcon, sizeUnitIcon } = this.props;
            const { positionX, positionY } = absoluteHint;

            return this.$genCssVarsStyle({
                hint_top: this.resolveAbsoluteHintStyleValue({ pos: positionY, size: sizeIcon, unit: sizeUnitIcon }),
                hint_left: this.resolveAbsoluteHintStyleValue({ pos: positionX, size: sizeIcon, unit: sizeUnitIcon })
            });
        },
        animatedNumberCssVars() {
            const { sizeMetric, sizeUnitMetric, colorMetric } = this.props;
            const fontSize = resolveValueWithUnits(sizeMetric, sizeUnitMetric);
            const mappingVars = () => ({
                'numbers_font-size': () => fontSize,
                numbers_color: () => colorMetric,
                'numbers_line-height': fontSize
            });
            return this.$buildCssVarsStyle(mappingVars());
        },
        metricPrefix() {
            return `${this.props.preFix} `;
        },
        title() {
            const { isEntityNameTitle, selectedMetric, selectedDimension, textTitle } = this.props;

            if (isEntityNameTitle) {
                return selectedMetric || selectedDimension;
            }

            return textTitle;
        },
        styleBench() {
            const { posRelBench, positionBench } = this.props;
            return ['bottom', 'top'].includes(positionBench)
                ? { display: 'flex', width: '100%', 'justify-content': posRelBench }
                : { display: 'flex', 'align-items': posRelBench };
        },
        metricPosition() {
            const { isViewModeAbsolute, posCenterMetric, showTitle } = this.props;

            if (isViewModeAbsolute && posCenterMetric) {
                return 'metric-center';
            }

            if (isViewModeAbsolute && showTitle) {
                return 'metric-bottom';
            }

            if (isViewModeAbsolute) {
                return 'metric-top';
            }

            if (posCenterMetric === true) {
                return 'items-center';
            }

            if (showTitle === true) {
                return 'items-end';
            }

            return '';
        },
        positionMetric() {
            switch (this.props.positionMetric) {
                case 'left': {
                    return 'flex-start';
                }
                case 'center': {
                    return 'center';
                }
                case 'right': {
                    return 'flex-end';
                }
                default: {
                    return 'flex-start';
                }
            }
        },
        fontSizeBench() {
            const { sizeBench, sizeUnitBench } = this.props;
            return typeof sizeBench === 'string' ? sizeBench : resolveValueWithUnits(sizeBench, sizeUnitBench);
        },
        backgroundColoring() {
            if (this.props.showCard) {
                if (this.props.backgroundGrad === false) {
                    return `background-color:${this.props.backgroundSimpleColor};`;
                }

                return `background: linear-gradient(${this.props.backgroundGradPos}, ${this.props.backgroundGradColor1}, ${this.props.backgroundGradColor2})`;
            }
            return 'background-color: transparent';
        },
        kpiWrapperClasses() {
            return {
                panel: this.props.showCard,
                'pad-5': !this.props.turnPadding && !this.props.isViewModeAbsolute,
                'kpi-no-absolute-mode': !this.props.isViewModeAbsolute
            };
        },
        kpiTitleClasses() {
            return {
                'pos-abs': this.props.isViewModeAbsolute,
                'mar-5': this.props.isViewModeAbsolute
            };
        },
        metricClasses() {
            return {
                'mar-5': this.props.isViewModeAbsolute && !this.props.turnPadding
            };
        },
        isHintShownByMetric() {
            return this.props.showHint && this.props.cnpMode;
        },
        isHintShownByTitle() {
            return this.props.showHint && this.props.isHintShownByTitle;
        },
        isShownHintAbsolute() {
            const { absoluteHint, showHint } = this.props;
            return showHint && absoluteHint.isEnabled;
        }
    },
    watchEditor: {
        props: {
            handler() {
                this.buildRenderData();
            }
        },
        'props.isAwaitVariableMode': {
            handler() {
                if (this.isAllowedLoadData) {
                    this.loadData();
                }
            }
        }
    },
    subscribe: [
        {
            event: Events.UPDATE,
            handler() {
                if (this.isAllowedLoadData) {
                    this.loadData();
                }
            }
        }
    ],
    methods: {
        ...ElemDatasetBaseMixinTypes,
        resolveAbsoluteHintStyleValue({ pos, size, unit }) {
            const hintIconWidth = Math.floor(convertToAbsoluteValue({ size: resolveValueWithUnits(size, unit) }));
            const posPx = Math.floor((convertToAbsoluteValue({ size: `${pos}%` }) * 100) / 2);

            if (posPx <= hintIconWidth / 2) {
                return `0%`;
            }

            return `calc(${pos - 1}% - ${hintIconWidth}px)`;
        },
        buildRenderData() {
            this.buildMetricValue();
            this.buildBenchValue();
        },
        buildMetricValue() {
            const {
                props: {
                    defaultDisabled,
                    defaultDisabledPlaceholder,
                    enablePlaceHolder,
                    type,
                    selectedMetric,
                    selectedDimension,
                    metricFormat,
                    textPlaceHolder
                },
                results,
                hasSomeResponseChosenMD
            } = this;

            this.formattedValue = 0;

            if (defaultDisabled && this.isStateEmpty) {
                this.formattedValue = defaultDisabledPlaceholder;
                return;
            }
            if (defaultDisabled && !hasSomeResponseChosenMD && this.checkCountRows(results) === false) {
                this.formattedValue = defaultDisabledPlaceholder;
                return;
            }
            if (hasSomeResponseChosenMD) {
                /* @NOTE legacy metric format prop (uses legacy format) */
                const { metricFormatter: metricFormatLegacy = null } = this.props;
                /* @NOTE try to use legacy format (auto convert to new format; else fallback to new format) */
                const format = convertLegacyFormat(metricFormatLegacy, metricFormat);
                const value = this.getDatasetsValue(type === 'metric' ? selectedMetric : selectedDimension);
                this.formattedValue = this.getFormattedValue({ value, format });
                return;
            }
            if (enablePlaceHolder === true) {
                this.formattedValue = textPlaceHolder;
            }
        },
        findMetricValue(response = [], metricName) {
            // eslint-disable-next-line no-restricted-syntax
            for (const { rows } of response) {
                const foundRow = rows.find((row) => row[metricName] != null);
                if (foundRow != null) {
                    return foundRow[metricName];
                }
            }

            return null;
        },
        buildBenchValue() {
            const { hasSomeResponseChosenMD } = this;
            const { showBench, selectedBench, selectedBenchDimension, typeBenchData, benchFormat } = this.props;

            if (showBench && (selectedBench || selectedBenchDimension) === false) {
                return;
            }

            if (hasSomeResponseChosenMD) {
                /* @NOTE legacy metric format prop (uses legacy format) */
                const { formatterBench: benchFormatLegacy = null } = this.props;
                /* @NOTE try to use legacy format (auto convert to new format; else fallback to new format) */
                const format = convertLegacyFormat(benchFormatLegacy, benchFormat);

                const benchEntity = typeBenchData === 'metric' ? selectedBench : selectedBenchDimension;
                const value = this.getDatasetsValue(benchEntity);

                this.formattedBench = this.getFormattedValue({ value, format, isBench: true });
                return;
            }

            this.formattedBench = 0;
        },
        /**
         * @public
         * @overrides
         * @param requests
         * @return {Promise<void>}
         */
        async loadData(requests = this.requests) {
            if (this.isAllowedLoadData === false) {
                return;
            }
            this.isLoading = true;
            this.$requestCancel(requests);
            try {
                const results = await Promise.all(requests.map((request) => request?.send()));
                this.results = results.map((result, i) => result ?? this.results[i] ?? null); // ?? []
                this.buildRenderData();
            } catch (error) {
                this.results = [];
                this.$handleError(error);
            } finally {
                this.isLoading = false;
            }
        },
        checkCountRows(results = []) {
            return results.some((dremioResult) => _get(dremioResult, 'rows.length', 0) > 0);
        },
        cssStrToObj(str) {
            if (str == null || str === '') {
                return {};
            }
            return str.split(';').reduce((acc, el) => {
                const params = el.split(':').map((elem) => elem.trim());
                // eslint-disable-next-line no-magic-numbers
                if (params.length === 2) {
                    // пытаемся заменить константу
                    // eslint-disable-next-line goodt-rules/deprecate-member-expression
                    acc[params[0]] = this.$c(params[1]);
                }
                return acc;
            }, {});
        },
        getDatasetsValue(selectedEntity) {
            if (this.results.length === 0) {
                return 0;
            }

            if (['', null, undefined].includes(selectedEntity)) {
                return 0;
            }

            return this.results.reduce((acc, { rows }) => {
                const [row] = rows;

                if (selectedEntity in row === false) {
                    return acc;
                }

                return row[selectedEntity];
            }, 0);
        },
        getFormattedValue({ value, format = '', isBench = false }) {
            if (value === null && this.isPlaceholder(isBench)) {
                return this.getPlaceholder(isBench);
            }

            if (this.props.isRoundValue && !isBench) {
                return value;
            }

            if (this.props.isMetricNumber || isBench) {
                const tempValue = Number(value);
                return Number.isNaN(tempValue) ? value : formatNumber(tempValue, format);
            }

            return value;
        },
        roundValue(value) {
            if (value === '' || value == null) {
                return 0;
            }

            const { isMetricNumber, defaultDisabled, enablePlaceHolder } = this.props;
            const shouldRoundNumber = this.props.isRoundValue;
            const shouldShowPlaceholder = enablePlaceHolder && this.checkCountRows(this.results) === false;
            const shouldShowStateValue = defaultDisabled && this.isStateEmpty;
            const isNonNumberFormat = Number.isNaN(Number(value)) || !Number.isFinite(Number(value));
            if (
                !isMetricNumber ||
                !shouldRoundNumber ||
                shouldShowStateValue ||
                shouldShowPlaceholder ||
                isNonNumberFormat
            ) {
                return value;
            }

            const number = parseFloat(value);
            if (number === 0) {
                return number;
            }

            const absValue = Math.abs(number);
            const formatNumberPartial = (format) => formatNumber(number, format);
            if (absValue >= 1) {
                return formatNumberPartial('0||/d');
            }

            if (absValue >= 0.1 && absValue < 1) {
                return formatNumberPartial('1||/d');
            }

            if (absValue >= 0.01 && absValue < 0.1) {
                return formatNumberPartial('2||/d');
            }

            return formatNumberPartial('3||/d');
        },
        getItemValue(itemValue, type) {
            const convertedType = type ? type.toLowerCase() : '';
            if (convertedType === 'metric' || convertedType === 'dimension') {
                return this.getDatasetsValue(itemValue);
            }

            const itemNumber = Number(itemValue);
            if (!Number.isNaN(itemNumber)) {
                return itemNumber;
            }
            return null;
        },
        isPlaceholder(isBench) {
            if (!isBench) {
                return this.props.enablePlaceHolder;
            }

            return false;
        },
        getPlaceholder(isBench) {
            if (!isBench) {
                return this.props.textPlaceHolder;
            }

            return '';
        },
        resolveIndicatorClasses({ settings, iconValue, foundRule, iconRules, type }) {
            if (iconValue == null) {
                return '';
            }

            const { iconDown, iconUp } = settings;
            const { shouldUseRules } = iconRules;

            if (shouldUseRules) {
                return `mdi-${foundRule?.icon} ${type}-icon--by-rule`;
            }

            return iconValue > 0 ? `mdi-${iconUp.name} ${type}-icon--up` : `mdi-${iconDown.name} ${type}-icon--down`;
        },
        resolveIconValue(settings) {
            const { isVisible, metricValue, targetSource } = settings;

            if (!isVisible || metricValue == null || targetSource == null) {
                return null;
            }

            try {
                return this.results[targetSource]?.rows[0][metricValue];
            } catch (error) {
                return null;
            }
        },
        resolveValueFromRules({ targetSource, iconValue, settings }) {
            if (iconValue == null) {
                return null;
            }

            const { shouldUseRules, rules } = settings;
            if (!shouldUseRules) {
                return null;
            }

            return this.findRule({ rules, value: iconValue, targetSource });
        },
        findRule({ rules, value, targetSource }) {
            return rules.find((rule) => {
                const handler = _get(ParamStyleTypes, `[${rule.condition}].handler`, null);
                const dremioValue = this.results[targetSource].rows[0][rule.value];
                const itemValue = rule.dataType === RuleDataType.VALUE ? rule.value : dremioValue;
                return handler && handler(Number(value), Number(itemValue));
            });
        },
        onWidgetClick() {
            const { type, selectedMetric, selectedDimension, typeBenchData, selectedBench, selectedBenchDimension } =
                this.props;
            const mainEntity = type === 'metric' ? selectedMetric : selectedDimension;
            const benchmarkEntity = typeBenchData === 'metric' ? selectedBench : selectedBenchDimension;
            const payload = {
                [mainEntity]: this.getDatasetsValue(mainEntity),
                [benchmarkEntity]: this.getDatasetsValue(benchmarkEntity)
            };
            this.$storeCommit(payload);
        },
        ...ComponentInstanceTypeDescriptor
    },
    implicitCssModule: true
};
</script>
<style module lang="pcss" src="./style.pcss" />
