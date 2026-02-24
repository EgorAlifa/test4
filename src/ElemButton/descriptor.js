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
