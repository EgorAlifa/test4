import { useDatasetMeta } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';
import panels from './panels';
import {
    IMAGE_SOURCE_TYPES,
    DEFAULT_CURRENT_INDEX,
    DEFAULT_TRANSITION_DURATION,
    DEFAULT_ARROW_SIZE,
    DEFAULT_ARROW_COLOR,
    DEFAULT_ARROW_BACKGROUND_COLOR,
    DEFAULT_INDICATOR_COLOR
} from './constants';

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // Источник данных
        imageSource: {
            type: String,
            default: IMAGE_SOURCE_TYPES.MANUAL,
            label: 'Источник изображений'
        },
        imageField: {
            type: String,
            default: null,
            label: 'Поле с URL изображения'
        },
        images: {
            type: Array,
            default: () => [],
            label: 'Массив URL изображений'
        },

        // Навигация
        currentIndex: {
            type: Number,
            default: DEFAULT_CURRENT_INDEX,
            label: 'Текущий индекс'
        },
        showArrows: {
            type: Boolean,
            default: true,
            label: 'Показывать стрелки навигации'
        },
        arrowSize: {
            type: Object,
            default: () => DEFAULT_ARROW_SIZE,
            label: 'Размер стрелок'
        },
        arrowColor: {
            type: String,
            default: DEFAULT_ARROW_COLOR,
            label: 'Цвет стрелок'
        },
        arrowBackgroundColor: {
            type: String,
            default: DEFAULT_ARROW_BACKGROUND_COLOR,
            label: 'Цвет фона стрелок'
        },
        enableSwipe: {
            type: Boolean,
            default: true,
            label: 'Поддержка свайпов'
        },

        // Отображение
        imageFit: {
            type: String,
            default: 'contain',
            label: 'Способ заполнения изображения'
        },
        showIndicators: {
            type: Boolean,
            default: true,
            label: 'Показывать индикаторы'
        },
        indicatorColor: {
            type: String,
            default: DEFAULT_INDICATOR_COLOR,
            label: 'Цвет индикаторов'
        },
        transitionDuration: {
            type: Number,
            default: DEFAULT_TRANSITION_DURATION,
            label: 'Длительность перехода (мс)'
        },
        showLoading: {
            type: Boolean,
            default: true,
            label: 'Показывать лоадер'
        },
        
        // Переменная для выбора изображения
        imageVariable: {
            type: String,
            default: null,
            label: 'Переменная для выбора изображения'
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

