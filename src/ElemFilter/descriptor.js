/* eslint-disable no-magic-numbers */
import { useDatasetMeta } from '@goodt-common/data';
import { StoreOperation } from '@goodt-wcore/elem';
import panels, { DatasetPanelMixin } from './panels';
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
        selectedDimension: {
            type: Number,
            default: null
        },
        selectedMetric: {
            type: Number,
            default: null
        },
        isTrimTheLine: {
            type: Boolean,
            default: false
        },
        cutStringLength: {
            type: Number,
            default: 10
        },
        isMultiMode: {
            type: Boolean,
            default: true
        },
        isMultiCount: {
            type: Boolean,
            default: false
        },
        backlight: {
            type: String,
            default: '#1a67fe'
        },
        textPlaceholder: {
            type: String,
            default: 'Измерение'
        },
        isMetricTextPlaceholder: {
            type: Boolean,
            default: true
        },
        textPlaceholderMultiCount: {
            type: Object,
            default() {
                return {
                    text: 'Измерение',
                    fontSize: '12px',
                    color: '#ffffff',
                    fontWeight: '400',
                    fontFamily: ''
                };
            }
        },
        tooltip: {
            type: Object,
            default() {
                return {
                    fontSize: '',
                    color: '',
                    fontWeight: '400',
                    fontFamily: '',
                    background: ''
                };
            }
        },
        shouldShowRadioButton: {
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
        isClearEnable: {
            type: Boolean,
            default: true
        },
        btnClear: {
            type: Object,
            default() {
                return {
                    isShown: true,
                    classes: [],
                    styles: [],
                    text: 'Сбросить все',
                    background: '#ffffff',
                    fontSize: '12px',
                    color: '#4E4E55',
                    fontWeight: '400',
                    fontFamily: '',
                    icon: {
                        isUsed: false,
                        class: '',
                        position: 'row',
                        style: { color: '', fontSize: '', margin: ['0px', '0px', '0px', '0px'] }
                    },
                    border: {
                        isEnabled: true,
                        borders: {
                            width: null,
                            color: null,
                            style: null
                        },
                        borderRadius: {
                            topLeft: '0.25rem',
                            topRight: '0.25rem',
                            bottomRight: '0.25rem',
                            bottomLeft: '0.25rem'
                        }
                    }
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
                    background: '#146FF8',
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: '400',
                    fontFamily: '',
                    icon: {
                        isUsed: false,
                        class: '',
                        position: 'row',
                        style: { color: '', fontSize: '', margin: ['0px', '0px', '0px', '0px'] }
                    },
                    border: {
                        isEnabled: true,
                        borders: {
                            width: '1px',
                            color: 'rgb(255, 255, 255)',
                            style: 'solid'
                        },
                        borderRadius: {
                            topLeft: '0.25rem',
                            topRight: '0.25rem',
                            bottomRight: '0.25rem',
                            bottomLeft: '0.25rem'
                        }
                    }
                };
            }
        },
        btnCancel: {
            type: Object,
            default() {
                return {
                    isShown: true,
                    classes: [],
                    styles: [],
                    text: 'Отменить',
                    background: '#ffffff',
                    fontSize: '12px',
                    color: '#4E4E55',
                    fontWeight: '400',
                    fontFamily: '',
                    icon: {
                        isUsed: false,
                        class: '',
                        position: 'row',
                        style: { color: '', fontSize: '', margin: ['0px', '0px', '0px', '0px'] }
                    },
                    border: {
                        isEnabled: true,
                        borders: {
                            width: '1px',
                            color: 'rgb(255, 255, 255)',
                            style: 'solid'
                        },
                        borderRadius: {
                            topLeft: '0.25rem',
                            topRight: '0.25rem',
                            bottomRight: '0.25rem',
                            bottomLeft: '0.25rem'
                        }
                    }
                };
            }
        },
        btnSelectAll: {
            type: Object,
            default() {
                return {
                    classes: [],
                    styles: [],
                    text: 'Выбрать все',
                    background: '#ffffff',
                    fontSize: '12px',
                    color: '#4E4E55',
                    fontWeight: '400',
                    fontFamily: '',
                    icon: {
                        isUsed: false,
                        class: '',
                        position: 'row',
                        style: { color: '', fontSize: '', margin: ['0px', '0px', '0px', '0px'] }
                    },
                    border: {
                        isEnabled: true,
                        borders: {
                            width: '1px',
                            color: 'rgb(255, 255, 255)',
                            style: 'solid'
                        },
                        borderRadius: {
                            topLeft: '0.25rem',
                            topRight: '0.25rem',
                            bottomRight: '0.25rem',
                            bottomLeft: '0.25rem'
                        }
                    }
                };
            }
        },
        btnPasteFromClipboard: {
            type: Object,
            default() {
                return {
                    isShown: false,
                    classes: [],
                    styles: [],
                    text: '',
                    background: '#ffffff',
                    fontSize: '12px',
                    color: 'rgba(0,0,028)',
                    fontWeight: '400',
                    fontFamily: '',
                    icon: {
                        isUsed: true,
                        class: 'mdi-microsoft-excel',
                        position: 'row',
                        style: { color: '', fontSize: '18px', margin: ['0px', '0px', '0px', '0px'] }
                    },
                    border: {
                        isEnabled: false,
                        borders: {
                            width: '1px',
                            color: 'rgb(255, 255, 255)',
                            style: 'solid'
                        },
                        borderRadius: {
                            topLeft: '0.25rem',
                            topRight: '0.25rem',
                            bottomRight: '0.25rem',
                            bottomLeft: '0.25rem'
                        }
                    }
                };
            }
        },
        multiCountTextUnit: {
            type: String,
            default: 'шт.'
        },
        multiCountSizeUnit: {
            type: String,
            default: '0.875rem'
        },
        shouldMuteFiltrationRows: {
            type: Boolean,
            default: false
        },
        sizeHeight: {
            type: String,
            default: '440px'
        },
        widgetColor: {
            type: String,
            default: '#ffffff'
        },
        inputBackgroundColor: {
            type: String,
            default: '#fff'
        },
        borderRadius: {
            type: Object,
            default() {
                return {
                    topLeft: '4px',
                    topRight: '4px',
                    bottomRight: '4px',
                    bottomLeft: '4px'
                };
            }
        },
        defaultValues: {
            type: Array,
            default() {
                return [];
            }
        },
        shouldSelectFirstValue: {
            type: Boolean,
            default: false
        },
        isAlwaysFirstValue: {
            type: Boolean,
            default: false
        },
        placeholderStyles: {
            type: Object,
            default() {
                return {
                    fontSize: '14px',
                    color: '#A0A0A7',
                    fontWeight: '400',
                    fontFamily: ''
                };
            }
        },
        dimensionsStyles: {
            type: Object,
            default() {
                return {
                    fontSize: '14px',
                    color: '#050505',
                    fontWeight: '400',
                    fontFamily: ''
                };
            }
        },
        shadowStyles: {
            type: Object,
            default() {
                return {
                    color: '#00000014',
                    blur: '8px',
                    shiftX: '0px',
                    shiftY: '0px',
                    type: ''
                };
            }
        },
        iconFontSize: {
            type: String,
            default: '1.5rem'
        },
        checkboxFontSize: {
            type: String,
            default: '18px'
        },
        isNoFullReset: {
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
            default: true
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
                    prefixFontSize: '24px',
                    prefixColor: '#A0A0A7',
                    prefixMarginLeft: '4px',
                    postfixColor: 'rgba(0, 0, 0, 0.8)',
                    postfixFontSize: '1rem',
                    postfixMarginRight: '4px',
                    borderWidth: '0px',
                    borderColor: 'rgb(0, 0, 0)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#000000',
                    fontWeight: '400',
                    fontFamily: '',
                    isMetricTextPlaceholder: true
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
        isMenuAlwaysOpen: {
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
        isOpeningByEnter: {
            type: Boolean,
            default: false
        },
        isSmartSearchGeneralPreview: {
            type: Boolean,
            default: false
        },
        shouldDisableContentHiding: {
            type: Boolean,
            default: false
        },
        shouldShowBtnSelectAll: {
            type: Boolean,
            default: true
        },
        paginationOptions: {
            type: Object,
            default() {
                return {
                    color: '#146FF8',
                    fontFamily: '',
                    fontSize: '12px',
                    fontWeight: '400',
                    activeColor: '#ffffff',
                    activeBackground: '#146FF8',
                    inactiveBackground: '#ffffff',
                    isEnable: true,
                    numItems: 8,
                    height: '18px',
                    width: '18px',
                    borderRadius: {
                        topLeft: '4px',
                        topRight: '4px',
                        bottomRight: '4px',
                        bottomLeft: '4px'
                    },
                    padding: ['4px', '8px', '4px', '8px'],
                    gap: '',
                    digitSeparator: 'ru-RU',
                    justify: 'flex-end'
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
        metricNavigateLink: {
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
        embeddedSearch: {
            type: Object,
            default() {
                return {
                    isEnabled: true,
                    fontSize: '14px',
                    color: '#A0A0A7',
                    fontWeight: '400',
                    fontFamily: '',
                    isMetricTextPlaceholder: true
                };
            }
        },
        smartSearchHeight: {
            type: String,
            default: ''
        },
        isMetricDisplayed: {
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
        shouldClearSearchValueOnFetchDataEvent: {
            type: Boolean,
            default: false
        },
        sort: {
            type: Object,
            default() {
                return {
                    isEnabled: true,
                    value: '',
                    fontSize: '12px',
                    color: '#a0a0a7',
                    fontWeight: '400',
                    fontFamily: ''
                };
            }
        },
        optionHover: {
            type: Object,
            default() {
                return {
                    isEnabled: true,
                    color: '#0156fd',
                    background: '#F7F8F9'
                };
            }
        },
        loadDataOnOpen: {
            type: Boolean,
            default: false,
            label: 'Загрузка данных при раскрытии'
        },
        isChangeCategoryResetValues: {
            type: Boolean,
            default: false,
            label: 'Сброс значений при изменении категории'
        },
        isQueryFilterOperatorLike: {
            type: Boolean,
            default: false,
            label: 'Режим работы с like'
        },
        moveSelectedValue: {
            type: Boolean,
            default: true,
            label: 'Поднимать выбранные значения'
        }
    },
    vars: Vars,
    dataset: {
        vars: {
            dimension: { operation: StoreOperation.ALL }
        }
    }
});

const baseMeta = {
    descriptor,
    panels,
    isChildAllowed: true,
    cssVars,
    slotNames: ['default']
};

export const meta = useDatasetMeta(baseMeta, {
    panel: {
        isMultiple: true,
        mixins: [DatasetPanelMixin]
    }
});
