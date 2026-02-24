/* eslint-disable no-restricted-syntax */
import { useDatasetMeta } from '@goodt-common/data';
import { StoreOperation } from '@goodt-wcore/elem';
import panels, { DatasetPanelMixin } from './panels';
import { cssVars } from './css-vars';
import { AbsoluteHintTemplate } from './utils/constants';

export const Events = Object.freeze({
    UPDATE: 'update'
});

const descriptor = () => ({
    props: {
        metricDynamicColor: {
            type: Boolean,
            default: true
        },
        benchDynamicColor: {
            type: Boolean,
            default: true
        },
        varForListen: {
            type: String,
            default: ''
        },
        typeDynamicColor: {
            type: String,
            default: 'standard'
        },
        benchTypeDynamicColor: {
            type: String,
            default: 'standard'
        },
        metricDigitCapacity: {
            type: String,
            default: '0'
        },
        benchDigitCapacity: {
            type: String,
            default: '0'
        },
        metricPositiveColor: {
            type: String,
            default: '#000000'
        },
        benchPositiveColor: {
            type: String,
            default: '#000000'
        },
        metricNegativeColor: {
            type: String,
            default: '#000000'
        },
        benchNegativeColor: {
            type: String,
            default: '#000000'
        },
        preFix: {
            type: String,
            default: ''
        },
        postFix: {
            type: String,
            default: ''
        },
        selectedMetric: {
            type: String,
            default: null
        },
        selectedBench: {
            type: String,
            default: null
        },
        metrics: {
            type: Array,
            default() {
                return [];
            }
        },
        type: {
            type: String,
            default: 'metric'
        },
        dimensions: {
            type: Array,
            default() {
                return [];
            }
        },
        selectedDimension: {
            type: String,
            default: ''
        },
        showBench: {
            default: false,
            type: Boolean
        },
        colorMetric: {
            default: '#000000',
            type: String
        },
        colorBench: {
            default: 'rgba(38, 50, 56, 0.6)',
            type: String
        },
        fontMetric: {
            default: 'Roboto, sans-serif',
            type: String
        },
        fontBench: {
            default: 'Roboto, sans-serif',
            type: String
        },
        sizeMetric: {
            default: '2rem',
            type: String
        },
        sizeBench: {
            default: '1.2rem',
            type: String
        },
        sizeUnitMetric: {
            default: 'rem',
            type: String
        },
        sizeUnitBench: {
            default: 'rem',
            type: String
        },
        benchmarkFontWeight: {
            type: String
        },
        positionMetric: {
            default: 'left',
            type: String
        },
        showCard: {
            default: false,
            type: Boolean
        },
        showTitle: {
            default: false,
            type: Boolean
        },
        colorTitle: {
            default: '#000000',
            type: String
        },
        fontTitle: {
            default: 'Roboto, sans-serif',
            type: String
        },
        sizeTitle: {
            default: '20px',
            type: String
        },
        sizeUnitTitle: {
            default: 'px',
            type: String
        },
        textTitle: {
            default: '',
            type: String
        },
        isEntityNameTitle: {
            type: Boolean,
            default: true
        },
        backgroundGrad: {
            type: Boolean,
            default: false
        },
        backgroundSimpleColor: {
            type: String,
            default: '#ffffff'
        },
        backgroundGradColor1: {
            type: String,
            default: '#ffffff'
        },
        backgroundGradColor2: {
            type: String,
            default: '#F7F8F9'
        },
        backgroundGradPos: {
            type: String,
            default: 'to bottom'
        },
        showHint: {
            default: false,
            type: Boolean
        },
        textHint: {
            default: '',
            type: String
        },
        colorHint: {
            type: String,
            default: '#000000'
        },
        bgColorTooltipHint: {
            type: String,
            default: '#626F86'
        },
        positionHint: {
            type: String,
            default: 'right'
        },
        isHintShownByTitle: {
            type: Boolean,
            default: true
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
        metricFormat: {
            type: String,
            default: ''
        },
        metricFormatter: {
            type: String,
            default: 'n'
        },
        benchFormat: {
            type: String,
            default: ''
        },
        positionBench: {
            type: String,
            default: 'bottom'
        },
        posRelBench: {
            type: String,
            default: 'flex-start'
        },
        posCenterMetric: {
            type: Boolean,
            default: true
        },
        cnpMode: {
            type: Boolean,
            default: false
        },
        colorHintText: {
            type: String,
            default: '#FFFFFF'
        },
        sizeHint: {
            type: Number,
            default: 0.875
        },
        sizeUnitHint: {
            type: String,
            default: 'rem'
        },
        sizeIcon: {
            type: Number,
            default: 0.875
        },
        sizeUnitIcon: {
            type: String,
            default: 'rem'
        },
        sizeWidthHint: {
            type: Number,
            default: 300
        },
        sizeUnitWidthHint: {
            type: String,
            default: 'px'
        },
        sizeMarginLeft: {
            type: Number,
            default: 1
        },
        sizeUnitMarginLeft: {
            type: String,
            default: 'px'
        },
        turnPadding: {
            type: Boolean,
            default: false
        },
        defaultDisabled: {
            type: Boolean,
            default: false
        },
        defaultDisabledPlaceholder: {
            type: String,
            default: ''
        },
        conditionMetricStyle: {
            type: Object,
            default() {
                return { type: null, value: '', style: [] };
            }
        },
        conditionBenchStyle: {
            type: Object,
            default() {
                return { type: null, value: '', style: [] };
            }
        },
        defaultValueFontSize: {
            type: Number,
            default: 0.875
        },
        defaultValueFontSizeUnit: {
            type: String,
            default: 'rem'
        },
        defaultValueColor: {
            type: String,
            default: '#000000'
        },
        prefixColor: {
            type: String,
            default: '#000000'
        },
        prefixFont: {
            type: String,
            default: 'Roboto, sans-serif'
        },
        prefixFontSize: {
            type: String,
            default: '1.2rem'
        },
        prefixFontSizeUnit: {
            type: String,
            default: 'rem'
        },
        prefixIcon: {
            type: String,
            default: ''
        },
        prefixIconColor: {
            type: String,
            default: '#000000'
        },
        prefixIconFontSize: {
            type: Number,
            default: 1.2
        },
        prefixIconFontSizeUnit: {
            type: String,
            default: 'rem'
        },
        postfixColor: {
            type: String,
            default: '#000000'
        },
        postfixFont: {
            type: String,
            default: 'Roboto, sans-serif'
        },
        postfixFontSize: {
            type: String,
            default: '1.2rem'
        },
        postfixFontSizeUnit: {
            type: String,
            default: 'rem'
        },
        enablePlaceHolder: {
            type: Boolean,
            default: false
        },
        textPlaceHolder: {
            type: String,
            default: ''
        },
        typeBenchData: {
            type: String,
            default: 'metric'
        },
        selectedBenchDimension: {
            type: String,
            default: ''
        },
        benchPreFix: {
            type: String,
            default: ''
        },
        benchPostFix: {
            type: String,
            default: ''
        },
        benchPrefixColor: {
            type: String,
            default: '#000000'
        },
        benchPrefixFont: {
            type: String,
            default: 'Roboto, sans-serif'
        },
        benchPrefixFontSize: {
            type: String,
            default: '1rem'
        },
        benchPostfixColor: {
            type: String,
            default: '#000000'
        },
        benchPostfixFont: {
            type: String,
            default: 'Roboto, sans-serif'
        },
        benchPostfixFontSize: {
            type: String,
            default: '1rem'
        },
        benchPrefixIcon: {
            type: String,
            default: ''
        },
        benchPrefixIconColor: {
            type: String,
            default: '#000000'
        },
        benchPrefixIconFontSize: {
            type: String,
            default: '0.875rem'
        },
        prefixFontWeight: {
            type: String,
            default: 'normal'
        },
        postfixFontWeight: {
            type: String,
            default: 'normal'
        },
        benchPrefixFontWeight: {
            type: String,
            default: 'normal'
        },
        benchPostfixFontWeight: {
            type: String,
            default: 'normal'
        },
        isMetricNumber: {
            type: Boolean,
            default: true
        },
        showNumberAnimation: {
            type: Boolean,
            default: false
        },
        numberAnimationDigits: {
            type: String,
            default: '3'
        },
        showEditorNumberAnimation: {
            type: Boolean,
            default: false
        },
        numberAnimationDelay: {
            type: Number,
            default: 100
        },
        conditionPrefixIconStyle: {
            type: Object,
            default() {
                return { enable: false, type: null, value: '', style: [] };
            }
        },
        isViewModeAbsolute: {
            type: Boolean,
            default: false
        },
        prefixRightMargin: {
            type: String,
            default: '0px'
        },
        postfixLeftMargin: {
            type: String,
            default: '0px'
        },
        benchPrefixRightMargin: {
            type: String,
            default: '0px'
        },
        benchPostfixLeftMargin: {
            type: String,
            default: '0px'
        },
        metricFontWeight: {
            type: String,
            default: 'normal'
        },
        titleFontWeight: {
            type: String,
            default: 'normal'
        },
        indicatorMetricIcon: {
            type: Object,
            default: () => ({
                isVisible: false,
                metricValue: null,
                targetSource: null,
                direction: 'row-reverse',
                iconDown: {
                    name: 'arrow-down-thin',
                    fontSize: '24px',
                    color: '#F82F58'
                },
                iconUp: {
                    name: 'arrow-up-thin',
                    fontSize: '24px',
                    color: '#11BA2F'
                }
            })
        },
        metricIconRules: {
            type: Object,
            default: () => ({
                shouldUseRules: false,
                fontSize: '24px',
                rules: []
            })
        },
        benchmarkIconRules: {
            type: Object,
            default: () => ({
                shouldUseRules: true,
                fontSize: '20px',
                rules: []
            })
        },
        indicatorBenchmarkIcon: {
            type: Object,
            default: () => ({
                isVisible: false,
                metricValue: null,
                targetSource: null,
                direction: 'row-reverse',
                iconDown: {
                    name: 'arrow-up-thin',
                    fontSize: '20px',
                    color: '#F82F58'
                },
                iconUp: {
                    name: 'arrow-up-thin',
                    fontSize: '20px',
                    color: '#11BA2F'
                }
            })
        },
        isRoundValue: {
            type: Boolean,
            default: false
        },
        isAwaitVariableMode: {
            type: Boolean,
            default: false
        },
        awaitVariableModeSettings: {
            type: Object,
            default: () => ({
                variables: []
            })
        },
        shouldCountingNumber: {
            type: Boolean,
            default: false
        },
        absoluteHint: {
            type: Object,
            default: AbsoluteHintTemplate
        }
    },
    events: {
        [Events.UPDATE]: {
            listen: `varForListen`
        }
    },
    vars: {},
    dataset: {
        vars: {
            dimension: { operation: StoreOperation.ALL }
        }
    }
});

export const baseMeta = {
    descriptor,
    panels,
    cssVars,
    isChildAllowed: false,
    slotNames: []
};

export const meta = useDatasetMeta(baseMeta, {
    panel: {
        isMultiple: true,
        mixins: [DatasetPanelMixin]
    }
});
