/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-syntax */
import { useDatasetMeta } from '@goodt-common/data';
import panels from './panels';
import { DEFAULT_SLOT_NAME, Metric, Mode } from './constants';

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
        // ─── Mode ────────────────────────────────────────────────────────────
        mode: {
            type: String,
            default: Mode.GALLERY,
            label: 'Режим'
        },

        // ─── Gallery mode ─────────────────────────────────────────────────────
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
        },

        // ─── Stack mode (ElemEventStack) ─────────────────────────────────────
        activeState: {
            type: String,
            default: 'default',
            label: 'Активное состояние'
        },
        states: {
            type: Array,
            default: () => [{ name: 'default', event: '' }],
            label: 'Состояния'
        },

        // ─── Container mode (ElemEventContainer) ─────────────────────────────
        eventShow: {
            type: String,
            default: '',
            label: 'Событие показа'
        },
        eventHide: {
            type: String,
            default: '',
            label: 'Событие скрытия'
        },
        eventShowHide: {
            type: String,
            default: '',
            label: 'Событие показа/скрытия'
        },
        initShow: {
            type: Boolean,
            default: true,
            label: 'Показывать по умолчанию'
        },
        showMode: {
            type: Boolean,
            default: false,
            label: 'Один ивент (boolean)'
        },
        reverseEvent: {
            type: Boolean,
            default: false,
            label: 'Инвертировать значение'
        },

        // ─── Appearance (AppearancePanel) ─────────────────────────────────────
        backgroundColor: { type: String, default: '' },
        textColor:       { type: String, default: '' },
        borderRadius:    { type: String, default: '0' },
        boxShadow:       { type: String, default: '' },
        opacity:         { type: [String, Number], default: 1 },

        // ─── DesignerPanel ────────────────────────────────────────────────────
        customStyles: {
            type: Object,
            default: () => ({}),
            description: 'Custom CSS per UI element (DesignerPanel). Keys: container, slot, stackSlot'
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
        slotNames: ({ props }) => {
            const mode = props.mode || Mode.GALLERY;
            if (mode === Mode.STACK) return (props.states || []).map((s) => s.name);
            if (mode === Mode.CONTAINER) return ['default'];
            return [...props.slots.map(({ name }) => name), DEFAULT_SLOT_NAME];
        },
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
