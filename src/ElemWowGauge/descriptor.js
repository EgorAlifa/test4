import { useDatasetMeta } from '@goodt-common/data';
import panels, { DatasetPanelMixin } from './panels';

/**
 * @description Don't change `descriptor` exported name
 * @return {ElemDescriptor}
 */
export const descriptor = () => ({
    props: {
        valueMetric: {
            type: String,
            default: null,
            label: 'Метрика значения'
        },
        benchmarkMetric: {
            type: String,
            default: null,
            label: 'Метрика ориентира'
        },
        gaugeStyle: {
            type: String,
            default: 'halfCircle',
            label: 'Стиль датчика'
        },
        theme: {
            type: String,
            default: 'dark',
            label: 'Тема'
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
            default: '',
            label: 'Заголовок'
        },
        showTitle: {
            type: Boolean,
            default: true,
            label: 'Показывать заголовок'
        },
        titleFontColor: {
            type: String,
            default: '#ffffff',
            label: 'Цвет заголовка'
        },
        titleFontSize: {
            type: Object,
            default: () => ({ size: 3, unit: 'rem' }), // eslint-disable-line no-magic-numbers
            label: 'Размер заголовка'
        },
        titleFontFamily: {
            type: String,
            default: 'Inter, system-ui, sans-serif',
            label: 'Шрифт заголовка'
        },
        radius: {
            type: String,
            default: 'lg',
            label: 'Скругление'
        },
        activeColor: {
            type: String,
            default: '#ef4444',
            label: 'Цвет активных сегментов'
        },
        inactiveColor: {
            type: String,
            default: '#64748b',
            label: 'Цвет неактивных сегментов'
        },
        format: {
            type: String,
            default: '1%',
            label: 'Формат метрики'
        },
        separator: {
            type: String,
            default: '1',
            label: 'Формат разделителя разрядов'
        },
        prefix: {
            type: String,
            default: '',
            label: 'Префикс'
        },
        postfix: {
            type: String,
            default: '',
            label: 'Постфикс'
        },
        elevation: {
            type: Number,
            default: 0,
            label: 'Тень'
        },
        showBorder: {
            type: Boolean,
            default: false,
            label: 'Показывать бордер'
        },
        showValue: {
            type: Boolean,
            default: true,
            label: 'Показывать значение'
        },
        valueFormat: {
            type: String,
            default: 'percent',
            label: 'Формат значения'
        },
        segmentStyle: {
            type: String,
            default: 'rounded',
            label: 'Стиль сегментов'
        },
        labelPosition: {
            type: String,
            default: 'bottom',
            label: 'Позиция метки'
        },
        numberOfSegments: {
            type: Number,
            default: 14, // eslint-disable-line no-magic-numbers
            label: 'Количество сегментов'
        },
        numberOfDots: {
            type: Number,
            default: 16, // eslint-disable-line no-magic-numbers
            label: 'Количество точек (кольцо)'
        },
        gaugePadding: {
            type: Number,
            default: 20, // eslint-disable-line no-magic-numbers
            label: 'Отступ датчика'
        },
        segmentGap: {
            type: Number,
            default: 2, // eslint-disable-line no-magic-numbers
            label: 'Зазор между сегментами'
        },
        valueFontColor: {
            type: String,
            default: '#ffffff',
            label: 'Цвет значения'
        },
        valueFontSize: {
            type: Object,
            default: () => ({ size: 4, unit: 'rem' }), // eslint-disable-line no-magic-numbers
            label: 'Размер значения'
        },
        valueFontFamily: {
            type: String,
            default: 'Inter, system-ui, sans-serif',
            label: 'Шрифт значения'
        },
        containerPadding: {
            type: Object,
            default: () => ({ size: 16, unit: 'px' }), // eslint-disable-line no-magic-numbers
            label: 'Отступ контейнера'
        },
        gaugeWidth: {
            type: Number,
            default: 340, // eslint-disable-line no-magic-numbers
            label: 'Ширина датчика (px)'
        },
        gaugeHeight: {
            type: Number,
            default: 170, // eslint-disable-line no-magic-numbers
            label: 'Высота датчика (px)'
        },
        animation: {
            type: Boolean,
            default: true,
            label: 'Анимация'
        },
        animationEasing: {
            type: String,
            default: 'ease-out',
            label: 'Тип анимации'
        },
        animationDuration: {
            type: Number,
            default: 1000, // eslint-disable-line no-magic-numbers
            label: 'Длительность анимации (мс)'
        },
        animationDelay: {
            type: Number,
            default: 0,
            label: 'Задержка анимации (мс)'
        },
        textVerticalPosition: {
            type: Number,
            default: 70, // eslint-disable-line no-magic-numbers
            label: 'Вертикальная позиция текста (%)'
        },
        // ── Needle (tachometer) gauge ──────────────────────────────
        needleBands: {
            type: Array,
            default: () => [
                { to: 0.9, color: '#ef4444' },
                { to: 1, color: '#22c55e' }
            ],
            label: 'Цветовые зоны шкалы'
        },
        needleBandStyle: {
            type: String,
            default: 'round',
            label: 'Стиль концов зон'
        },
        needleBandWidth: {
            type: Number,
            default: 1.6, // eslint-disable-line no-magic-numbers
            label: 'Толщина зон шкалы'
        },
        needleColor: {
            type: String,
            default: '#0f172a',
            label: 'Цвет стрелки'
        },
        needlePivotColor: {
            type: String,
            default: '#0f172a',
            label: 'Цвет оси стрелки'
        },
        showTicks: {
            type: Boolean,
            default: true,
            label: 'Показывать деления'
        },
        numberOfTicks: {
            type: Number,
            default: 9, // eslint-disable-line no-magic-numbers
            label: 'Количество делений'
        },
        tickColor: {
            type: String,
            default: '#94a3b8',
            label: 'Цвет делений'
        },
        needleScaleMax: {
            type: Number,
            default: 1,
            label: 'Значение (%) на конце шкалы'
        },
        customStyles: {
            type: Object,
            default: () => ({
                container: '',
                svg: '',
                segment: '',
                dot: '',
                arc: '',
                tick: '',
                band: '',
                needle: '',
                valueText: '',
                titleText: '',
                textContainer: '',
                loadingState: '',
                errorState: ''
            }),
            label: 'Кастомные стили CSS'
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

