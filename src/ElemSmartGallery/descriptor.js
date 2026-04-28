/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-syntax */
import { useDatasetMeta } from '@goodt-common/data';
import panels from './panels';
import { DEFAULT_SLOT_NAME, Metric } from './constants';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Vars = Object.freeze({
    SLOT_NAMES: 'slot_names'
});

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const Events = Object.freeze({
    UPDATE_DATA: 'updateData'
});

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        grid: {
            type: Object,
            default: () => ({
                cols: 2,
                gap: '1rem',
                rowMinHeight: '100%'
            }),
            label: {
                cols: 'Кол-во колонок',
                gap: 'Отступ',
                rowMinHeight: 'Мин. высота слота'
            }
        },
        slots: {
            type: Array,
            default: () => [],
            label: 'Слоты',
            /**
             * @param {import('./types').Slot} slot
             * @return {import('./types').Slot}
             */
            factory: ({ name = '', rules = [], show = true } = {}) => ({ name, rules, show })
        },
        isShowDefaultSlot: {
            type: Boolean,
            default: false,
            label: 'Дефолтный слот'
        },
        metrics: {
            type: Object,
            default: () => Object.values(Metric).reduce((acc, key) => ({ ...acc, [key]: null }), {})
        },
        awaitStoreFilter: {
            type: Boolean,
            default: false,
            label: 'Ожидать фильтрацию из хранилища'
        },
        awaitVariableModeVariables: {
            type: Array,
            default: () => []
        },
        isEqualWidthColumns: {
            type: Boolean,
            default: true,
            label: 'Колонки равны по ширине'
        },
        isUseSkeleton: {
            type: Boolean,
            default: true,
            label: 'Использовать скелетон при ожидании'
        },
        isSaveFirstMetricValue: {
            type: Boolean,
            default: false,
            label: 'Тригер первого значения'
        },
        height: {
            default: 100
        },
        heightUnit: {
            default: '%'
        },
        isDremioPaginationLimit: {
            type: Boolean,
            default: false,
            label: 'Ограничение из пагинации'
        },
        events: {
            type: Object,
            default: () => ({ [Events.UPDATE_DATA]: '' }),
            label: { [Events.UPDATE_DATA]: 'Событие для обновления данных' }
        }
    },
    vars: Object.values(Vars).reduce((acc, varName) => ({ ...acc, [varName]: { description: varName } }), {}),
    events: {
        [Events.UPDATE_DATA]: {
            listen: `events.${Events.UPDATE_DATA}`
        }
    }
});

export const DATASET_ADDITIONAL_PROP = 'dremioAddons';

export const meta = useDatasetMeta(
    {
        descriptor,
        panels,
        isChildAllowed: true,
        slotNames: ({ props }) => [...props.slots.map(({ name }) => name), DEFAULT_SLOT_NAME],
        cssVars: {
            'grid-cols': 'grid.cols',
            'grid-gap': 'grid.gap',
            'grid-row-min-height': 'grid.rowMinHeight',
            'grid-col-min-width': (props) => (props.isEqualWidthColumns ? '1fr' : '0fr')
        }
    },
    {
        prop: DATASET_ADDITIONAL_PROP,
        panel: {
            isMultiple: true,
            meta: { name: 'Источники фильтрации', icon: 'database-refresh' }
        }
    }
);

export default descriptor;
