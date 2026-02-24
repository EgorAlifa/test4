import { useDatasetMeta } from '@goodt-common/data';
import { DatasetPanelMixin } from './panels';

import panels from './panels';


/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        metric: {
            type: String,
            default: null,
            label: 'Метрика'
        },
        dimension: {
            type: String,
            default: null,
            label: 'Измерение'
        },
        dimensionOrMetric: {
            type: String,
            default: null,
            label: 'Измерение/метрика'
        },
        field: {
            type: String,
            default: null,
            label: 'Поле'
        },
        drilldownName: {
            type: String,
            default: null,
            label: 'Дриллдаун'
        },
        title: {
            type: String,
            default: null,
            label: 'Заголовок'
        },
        subTitle: {
            type: String,
            default: null,
            label: 'Подзаголовок'
        },
        variant: {
            type: String,
            default: 'default',
            label: 'Вариант'
        },
        size: {
            type: String,
            default: 'md',
            label: 'Размер'
        },
        radius: {
            type: String,
            default: 'md',
            label: 'Скругление'
        },
        align: {
            type: String,
            default: 'left',
            label: 'Выравнивание'
        },
        icon: {
            type: String,
            default: '',
            label: 'Иконка'
        },
        colorScheme: {
            type: String,
            default: 'blue',
            label: 'Цветовая схема'
        },
        showDelta: {
            type: Boolean,
            default: true,
            label: 'Показывать изменение'
        },
        deltaMode: {
            type: String,
            default: 'auto',
            label: 'Режим изменения'
        },
        decimals: {
            type: Number,
            default: 0,
            label: 'Десятичные'
        },
        goodIsPositive: {
            type: Boolean,
            default: true,
            label: 'Рост — хорошо'
        },
        elevation: {
            type: Number,
            default: 1,
            label: 'Тень'
        },
        showSparkline: {
            type: Boolean,
            default: true,
            label: 'Показывать спарклайн'
        },
        showBadge: {
            type: Boolean,
            default: false,
            label: 'Показывать бэйдж'
        },
        badgeText: {
            type: String,
            default: '',
            label: 'Текст бэйджа'
        },
        unit: {
            type: String,
            default: '',
            label: 'Единица измерения'
        },
        sparklineScheme: {
            type: String,
            default: 'emerald',
            label: 'Цвет спарклайна'
        },
        iconScheme: {
            type: String,
            default: 'pink',
            label: 'Цвет иконки'
        },
        showTitle: {
            type: Boolean,
            default: true,
            label: 'Показывать заголовок'
        },
        showIcon: {
            type: Boolean,
            default: true,
            label: 'Показывать иконку'
        },
        showUnit: {
            type: Boolean,
            default: true,
            label: 'Показывать единицу'
        },
        showBorder: {
            type: Boolean,
            default: true,
            label: 'Показывать бордер'
        },
        positiveColor: {
            type: String,
            default: 'emerald',
            label: 'Цвет роста'
        },
        negativeColor: {
            type: String,
            default: 'red',
            label: 'Цвет падения'
        },
        deltaIconStyle: {
            type: String,
            default: 'circle',
            label: 'Стиль иконки дельты (circle/arrow)'
        },
        sparklineFollowDelta: {
            type: Boolean,
            default: true,
            label: 'Цвет спарклайна по тренду'
        },
        sparklineWidth: {
            type: Number,
            default: 1.5,
            label: 'Толщина спарклайна'
        },
        sparklineHeight: {
            type: Number,
            default: 48,
            label: 'Высота спарклайна (px)'
        },
        sparklineFillOpacity: {
            type: Number,
            default: 0.15,
            label: 'Непрозрачность заливки спарклайна'
        },
        useSparklineFill: {
            type: Boolean,
            default: true,
            label: 'Заливка под графиком'
        },
        iconUrl: {
            type: String,
            default: '',
            label: 'URL иконки'
        },
        titleFontColor: {
            type: String,
            default: '#0a0a0a',
            label: 'Цвет заголовка'
        },
        titleFontSize: {
            type: String,
            default: '1rem',
            label: 'Размер заголовка'
        },
        titleFontWeight: {
            type: String,
            default: '600',
            label: 'Насыщенность заголовка'
        },
        titleFontFamily: {
            type: String,
            default: 'inherit',
            label: 'Шрифт заголовка'
        },
        metricFontColor: {
            type: String,
            default: '#0a0a0a',
            label: 'Цвет метрики'
        },
        metricFontSize: {
            type: String,
            default: '1.25rem',
            label: 'Размер метрики'
        },
        metricFontWeight: {
            type: String,
            default: '700',
            label: 'Насыщенность метрики'
        },
        metricFontFamily: {
            type: String,
            default: 'inherit',
            label: 'Шрифт метрики'
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

