/* eslint-disable no-restricted-syntax */
import panels from './panels';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({
    ROUTE: 'route'
});

/**
 * @typedef {object} FilterItem
 * @property {string} name
 * @property {string} data
 */
export const descriptor = () => ({
    props: {
        url: {
            type: String,
            default: '',
            hasConst: true
        },
        eventName: {
            type: [Array, String],
            default() {
                return [];
            },
            getCompat: (val) => (typeof val === 'string' ? val.split(',') : val)
        },
        cutParams: {
            type: [Array, String],
            default() {
                return [];
            },
            getCompat: (val) => (typeof val === 'string' ? val.split(',') : val)
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
        urlFilters: {
            type: Array,
            default() {
                return [];
            },
            /** @return {FilterItem[]} */
            factory() {
                return { name: '' };
            }
        },
        isClickSelf: {
            type: Boolean,
            default: false
        },
        isTargetBlank: {
            type: Boolean,
            default: false
        },
        isCopyStore: {
            type: Boolean,
            default: false,
            label: 'Копировать состояние экрана',
            hint: 'Создание ссылки на страницу со всеми примененными фильтрациями\nи сохранение в буфер обмена.'
        },
        shouldCopyText: {
            type: Boolean,
            default: false,
            label: 'Копировать текст'
        },
        textToCopy: {
            type: String,
            default: ''
        },
        isSaveUrlForStore: {
            type: Boolean,
            default: false
        },
        routeQueryParamNames: {
            type: Array,
            default: () => []
        },
        // ── Appearance ────────────────────────────────────────────────
        btnBg: {
            type: String,
            default: '#4f6aff'
        },
        btnColor: {
            type: String,
            default: '#ffffff'
        },
        btnBorderRadius: {
            type: String,
            default: '8px'
        },
        btnFontSize: {
            type: String,
            default: '14px'
        },
        btnFontWeight: {
            type: String,
            default: '500'
        },
        btnPaddingV: {
            type: String,
            default: '10px'
        },
        btnPaddingH: {
            type: String,
            default: '20px'
        },
        btnShadow: {
            type: String,
            default: '0 2px 12px rgba(79, 106, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)'
        },
        btnBorderWidth: {
            type: String,
            default: '0px'
        },
        btnBorderColor: {
            type: String,
            default: 'transparent'
        },
        btnCustomCss: {
            type: String,
            default: ''
        },
        btnHoverCss: {
            type: String,
            default: ''
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    cssVars: {}
});

export const meta = {
    descriptor,
    panels,
    isChildAllowed: true
};

export default descriptor;
