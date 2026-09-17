/* eslint-disable no-magic-numbers */
import panels from './panels';
import { cssVars } from './styles/css-vars';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({
    EXCLUDE_FILTER_VALUE: 'exclude_filter_value'
});

export const Events = Object.freeze({
    HARD_RELOAD: 'hardReload'
});

/**
 * @description Don't change `descriptor` exported name
 */
export const descriptor = () => ({
    props: {
        dremio: {
            type: Object,
            default() {
                return null;
            }
        },
        selectedDimension: {
            type: String,
            default: ''
        },
        selectedMetric: {
            type: String,
            default: ''
        },
        trimTheLine: {
            type: Boolean,
            default: false
        },
        cutStringLength: {
            type: Number,
            default: 10
        },
        multiMode: {
            type: Boolean,
            default: false
        },
        multiCount: {
            type: Boolean,
            default: false
        },
        backlight: {
            type: String,
            default: '#1a67fe'
        },
        multiModeHoverColor: {
            type: String,
            default: ''
        },
        fontColor: {
            type: String,
            default: '#ffffff'
        },
        textPlaceholder: {
            type: String,
            default: 'Измерение'
        },
        textPlaceholderMultiCount: {
            type: Object,
            default() {
                return {
                    textPlaceholder: 'Измерение',
                    placeHolderFontSize: '0.875rem'
                };
            }
        },
        useRadioButton: {
            type: Boolean,
            default: false
        },
        radioButtonSettings: {
            type: Object,
            default() {
                return {
                    backlight: '#1a67fe',
                    size: '1rem'
                };
            }
        },
        clearEnable: {
            type: Boolean,
            default: false
        },
        btnClear: {
            type: Object,
            default() {
                return {
                    isShown: true,
                    classes: [],
                    styles: [],
                    text: 'Сброс',
                    background: '#1a67fe',
                    fontSize: '.875rem',
                    color: '#fff'
                };
            }
        },
        btnDo: {
            type: Object,
            default() {
                return {
                    isShown: true,
                    classes: [],
                    styles: [],
                    text: 'Применить',
                    background: '#1a67fe',
                    fontSize: '.875rem',
                    color: '#fff'
                };
            }
        },
        textUnit: {
            type: String,
            default: 'шт.'
        },
        sizeUnit: {
            type: String,
            default: '0.875rem'
        },
        filtrationMode: {
            type: Boolean,
            default: false
        },
        sizeHeight: {
            type: String,
            default: '450px'
        },
        widgetColor: {
            type: String,
            default: '#f5f5f5'
        },
        inputBackgroundColor: {
            type: String,
            default: '#fff'
        },
        inputColor: {
            type: String,
            default: '#000000'
        },
        dimensionsColor: {
            type: String,
            default: '#050505'
        },
        borderRadius: {
            type: String,
            default: '0.25rem'
        },
        shadow: {
            type: String,
            default: '0px 4px 8px #00000029'
        },
        defaultValues: {
            type: Array,
            default() {
                return [];
            }
        },
        firstValue: {
            type: Boolean,
            default: false
        },
        isAlwaysFirstValue: {
            type: Boolean,
            default: false
        },
        placeHolderFontSize: {
            type: String,
            default: '0.875rem'
        },
        placeHolderColor: {
            type: String,
            default: '#000'
        },
        iconFontSize: {
            type: String,
            default: '1.5rem'
        },
        checkBoxFontSize: {
            type: String,
            default: '0.875rem'
        },
        searchFontSize: {
            type: String,
            default: '0.875rem'
        },
        dimensionsFontSize: {
            type: String,
            default: '0.875rem'
        },
        noReset: {
            type: Boolean,
            default: false
        },
        customEvent: {
            type: Object,
            default() {
                return {
                    enable: false,
                    onSelectName: '',
                    onResetName: ''
                };
            }
        },
        isSearchMode: {
            type: Boolean,
            default: false
        },
        dynamicEvent: {
            type: Object,
            default() {
                return {
                    enable: false,
                    onSelectName: '',
                    onResetName: ''
                };
            }
        },
        searchModeInput: {
            type: Object,
            default() {
                return {
                    placeholder: 'Поиск',
                    marginLeft: '4px',
                    prefix: 'mdi-magnify',
                    prefixFontSize: '1rem',
                    prefixColor: 'rgba(0, 0, 0, 0.2)',
                    prefixMarginLeft: '4px',
                    postfixColor: 'rgba(0, 0, 0, 0.8)',
                    postfixFontSize: '1rem',
                    postfixMarginRight: '4px',
                    borderWidth: '0px',
                    borderColor: 'rgb(0, 0, 0)',
                    borderRadius: '4px'
                };
            }
        },
        isSingleSelectBacklight: {
            type: Boolean,
            default: false
        },
        selectedDimensionBacklightColor: {
            type: String,
            default: 'rgb(26, 237, 93)'
        },
        isShowMenuByCursor: {
            type: Boolean,
            default: false
        },
        isSmartSearch: {
            type: Boolean,
            default: false
        },
        smartSearchDimensions: {
            type: Array,
            default() {
                return [];
            }
        },
        closingMode: {
            type: String,
            default: 'simple'
        },
        openWidth: {
            type: String,
            default: '300px'
        },
        isQuickInput: {
            type: Boolean,
            default: false
        },
        isResizable: {
            type: Boolean,
            default: false
        },
        headerPadding: {
            type: String,
            default: '0'
        },
        contentPadding: {
            type: String,
            default: ''
        },
        contentBoxShadow: {
            type: String,
            default: '0px 8px 8px #00000029'
        },
        isResetToDefault: {
            type: Boolean,
            default: false
        },
        isGeneralPreview: {
            type: Boolean,
            default: false
        },
        events: {
            type: Object,
            default() {
                return {
                    [Events.HARD_RELOAD]: 'hardReload'
                };
            }
        },
        isOpeningByEnter: {
            type: Boolean,
            default: false
        },
        isSmartSearchGeneralPreview: {
            type: Boolean,
            default: false
        },
        disableContentHiding: {
            type: Boolean,
            default: false
        },
        btnSelectAllEnable: {
            type: Boolean,
            default: false
        },
        btnSelectAll: {
            type: Object,
            default() {
                return {
                    classes: [],
                    styles: [],
                    text: 'Выделить все',
                    background: '#1a67fe',
                    fontSize: '0.875rem',
                    color: '#fff'
                };
            }
        },
        paginationOptions: {
            type: Object,
            default() {
                return {
                    fontFamily: '',
                    fontSize: '',
                    activeColor: '#fff',
                    activeBackground: '#1a67fe',
                    isEnable: false,
                    numItems: 7
                };
            }
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
        dimensionsFontWeight: {
            type: String,
            default: ''
        },
        placeholderFontWeight: {
            type: String,
            default: ''
        },
        dremioUrlFieldName: {
            type: String,
            default: ''
        },
        isOpenedUrlFromNewTab: {
            type: Boolean,
            default: false
        },
        isListeningVar: {
            type: Boolean,
            default: false
        },
        filters: {
            type: Array,
            default() {
                return [];
            },
            /** @return {FilterItem[]} */
            factory() {
                return { name: '', data: '' };
            }
        },
        useEmbeddedSearch: {
            type: Boolean,
            default: true
        },
        smartSearchHeight: {
            type: String,
            default: ''
        },
        isDisplayMetric: {
            type: Boolean,
            default: false
        },
        metricOptions: {
            type: Object,
            default() {
                return {
                    color: '',
                    fontFamily: '',
                    fontSize: '',
                    fontWeight: '',
                    backgroundColor: '',
                    textAlign: 'center',
                    format: ''
                };
            }
        },
        excludedField: {
            type: String,
            default: ''
        },
        minSearchingLength: {
            type: Number,
            default: 1
        },
        shouldClearEnteredValueAfterHardReloadEvent: {
            type: Boolean,
            default: false
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    events: {
        [Events.HARD_RELOAD]: {
            listen: `events[${Events.HARD_RELOAD}]`
        }
    }
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true,
    cssVars
};
