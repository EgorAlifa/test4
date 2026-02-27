import { useDatasetMeta } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';
import panels from './panels';
import {
    NODE_TYPES,
    DEFAULT_NODE_COLORS,
    DEFAULT_NODE_SIZES,
    DEFAULT_EDGE_COLOR,
    DEFAULT_EDGE_OPACITY,
    EDGE_WIDTH_MIN,
    EDGE_WIDTH_MAX
} from './constants';

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // Поля датасета (рёбра: источник — цель, опционально вес и подписи/типы узлов)
        sourceIdField: {
            type: String,
            default: null,
            label: 'Поле ID источника (узла)'
        },
        targetIdField: {
            type: String,
            default: null,
            label: 'Поле ID цели (узла)'
        },
        weightField: {
            type: String,
            default: null,
            label: 'Поле веса связи (толщина линии)'
        },
        sourceLabelField: {
            type: String,
            default: null,
            label: 'Поле подписи источника'
        },
        targetLabelField: {
            type: String,
            default: null,
            label: 'Поле подписи цели'
        },
        sourceTypeField: {
            type: String,
            default: null,
            label: 'Поле типа источника (factor / operation / critical)'
        },
        targetTypeField: {
            type: String,
            default: null,
            label: 'Поле типа цели'
        },

        // Внешний вид узлов
        nodeColorFactor: {
            type: String,
            default: DEFAULT_NODE_COLORS[NODE_TYPES.FACTOR],
            label: 'Цвет узлов типа «Фактор»'
        },
        nodeColorOperation: {
            type: String,
            default: DEFAULT_NODE_COLORS[NODE_TYPES.OPERATION],
            label: 'Цвет узлов типа «Прерывание операции»'
        },
        nodeColorCritical: {
            type: String,
            default: DEFAULT_NODE_COLORS[NODE_TYPES.CRITICAL],
            label: 'Цвет узлов типа «Критический»'
        },
        nodeSizeFactor: {
            type: Number,
            default: DEFAULT_NODE_SIZES[NODE_TYPES.FACTOR],
            label: 'Размер узла «Фактор»'
        },
        nodeSizeOperation: {
            type: Number,
            default: DEFAULT_NODE_SIZES[NODE_TYPES.OPERATION],
            label: 'Размер узла «Прерывание операции»'
        },
        nodeSizeCritical: {
            type: Number,
            default: DEFAULT_NODE_SIZES[NODE_TYPES.CRITICAL],
            label: 'Размер узла «Критический»'
        },

        // Рёбра
        edgeColor: {
            type: String,
            default: DEFAULT_EDGE_COLOR,
            label: 'Цвет рёбер'
        },
        edgeOpacity: {
            type: Number,
            default: DEFAULT_EDGE_OPACITY,
            label: 'Прозрачность рёбер'
        },
        edgeWidthMin: {
            type: Number,
            default: EDGE_WIDTH_MIN,
            label: 'Минимальная толщина ребра'
        },
        edgeWidthMax: {
            type: Number,
            default: EDGE_WIDTH_MAX,
            label: 'Максимальная толщина ребра'
        },

        // Поведение
        useWeightForWidth: {
            type: Boolean,
            default: true,
            label: 'Использовать вес связи для толщины линии'
        },
        showLoading: {
            type: Boolean,
            default: true,
            label: 'Показывать загрузку'
        }
    }
});

export const metaBase = {
    descriptor,
    panels,
    isChildAllowed: false
};

export const meta = useDatasetMeta(metaBase, {
    panel: {
        mixins: [DatasetPanelMixin]
    }
});
