import { useDatasetMeta } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';

import panels from './panels';


/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        // Основные настройки данных
        metric: {
            type: String,
            default: null,
            label: 'Метрика (количество товаров)'
        },
        dimension: {
            type: String,
            default: null,
            label: 'Основное измерение (категория товаров)'
        },
        drilldownName: {
            type: String,
            default: null,
            label: 'Дриллдаун'
        },
        
        // Настройки карточек
        titleField: {
            type: String,
            default: null,
            label: 'Поле для названия товара'
        },
        imageField: {
            type: String,
            default: null,
            label: 'Поле для изображения'
        },
        priceField: {
            type: String,
            default: null,
            label: 'Поле для цены'
        },
        descriptionField: {
            type: String,
            default: null,
            label: 'Поле для описания'
        },
        
        // Стилистика карточек
        cardStyle: {
            type: String,
            default: 'modern',
            label: 'Стиль карточки'
        },
        cardSize: {
            type: String,
            default: 'medium',
            label: 'Размер карточки'
        },
        colorScheme: {
            type: String,
            default: 'blue',
            label: 'Цветовая схема'
        },
        showBadges: {
            type: Boolean,
            default: true,
            label: 'Показывать бейджи'
        },
        showRatings: {
            type: Boolean,
            default: false,
            label: 'Показывать рейтинги'
        },
        
        // Отображение
        columnsCount: {
            type: Number,
            default: 3,
            label: 'Количество колонок'
        },
        showPagination: {
            type: Boolean,
            default: true,
            label: 'Показывать пагинацию'
        },
        showSearch: {
            type: Boolean,
            default: false,
            label: 'Показывать поиск'
        }
    }
});

export const metaBase = {
    descriptor,
    panels,
    isChildAllowed: false
    /*
    cssVars,
    slotNames: ['default']
    */
};

export const meta = useDatasetMeta(metaBase, {
    panel: {
        // meta: { name: '', icon: '' },
        // isMultiple: false // (false by default)
        // DatasetPanelMixin расширяет поведение стандартной DatasetPanel.vue
        mixins: [DatasetPanelMixin]
    }
});

