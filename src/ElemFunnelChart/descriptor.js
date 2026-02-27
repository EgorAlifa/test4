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
            label: 'Метрика (значения воронки)'
        },
        dimension: {
            type: String,
            default: null,
            label: 'Измерение (названия этапов)'
        },
        drilldownName: {
            type: String,
            default: null,
            label: 'Дриллдаун'
        },
        
        // Настройки отображения воронки
        orientation: {
            type: String,
            default: 'vertical',
            label: 'Ориентация'
        },
        sort: {
            type: String,
            default: 'descending',
            label: 'Сортировка'
        },
        labelPosition: {
            type: String,
            default: 'outside',
            label: 'Позиция лейблов'
        },
        showPercentage: {
            type: Boolean,
            default: true,
            label: 'Показывать проценты'
        },
        
        // Размеры и отступы
        funnelWidth: {
            type: String,
            default: '80%',
            label: 'Ширина воронки'
        },
        funnelHeight: {
            type: String,
            default: '80%',
            label: 'Высота воронки'
        },
        gap: {
            type: Number,
            default: 2,
            label: 'Расстояние между сегментами'
        },
        
        // Цветовая схема
        colorScheme: {
            type: String,
            default: 'default',
            label: 'Цветовая схема'
        },
        
        // Настройки заголовка
        showTitle: {
            type: Boolean,
            default: true,
            label: 'Показывать заголовок'
        },
        title: {
            type: String,
            default: '',
            label: 'Заголовок диаграммы'
        },
        
        // Настройки легенды
        showLegend: {
            type: Boolean,
            default: true,
            label: 'Показывать легенду'
        },
        legendPosition: {
            type: String,
            default: 'right',
            label: 'Позиция легенды'
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