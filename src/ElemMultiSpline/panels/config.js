/* eslint-disable no-restricted-syntax */
export const VerticalAlignOptions = [
    { label: 'Сверху', value: 'top' },
    { label: 'Посередине', value: 'middle' },
    { label: 'Снизу', value: 'bottom' }
];

export const DIM_VALUE_FORMATS = [
    { label: 'Строка', value: 'string' },
    { label: 'ДД.ММ.ГГГГ', value: 'DD.MM.YYYY' },
    { label: 'ДД.ММ', value: 'DD.MM' },
    { label: 'ДД', value: 'DD' }
];

export const SORT_OPTIONS = [
    { label: 'Без сортировки', value: 'none' },
    { label: 'По возрастанию', value: 'ascending' },
    { label: 'По убыванию', value: 'descending' }
];

export const SYMBOL_TYPES = [
    { label: 'Точка', value: 'emptyCircle' },
    { label: 'Точка с заливкой', value: 'circle' },
    { label: 'Квадрат', value: 'rect' },
    { label: 'Ромб', value: 'diamond' },
    { label: 'Треугольник', value: 'triangle' }
];

export const TOP_DIRECTIONS = [
    { label: 'По убыванию', value: 'top' },
    { label: 'По возрастанию', value: 'bottom' }
];

export const LINE_TYPES = [
    { label: 'Сплошная', value: 'solid' },
    { label: 'Пунктир', value: 'dashed' },
    { label: 'Точки', value: 'dotted' }
];

export const LEGEND_POSITIONS = [
    { label: 'Сверху', value: 'top' },
    { label: 'Снизу', value: 'bottom' }
];

export const TRIGGER_OPTIONS = [
    { value: 'item', label: 'Метрику' },
    { value: 'axis', label: 'Ось' }
];

export const METRIC_FORMAT_OPTIONS = [
    { value: '0', label: '1000' },
    { value: '1', label: '1000,1' },
    { value: '2', label: '1000,12' },
    { value: '3', label: '1000,123' },
    { value: '0%', label: '12%' },
    { value: '1%', label: '12,3%' },
    { value: '2%', label: '12,34%' },
    { value: '3%', label: '12,345%' }
];

export const SEPARATOR_OPTIONS = [
    { value: '0', label: '10000' },
    { value: '1', label: '10 000' },
    { value: '2', label: '10.000' },
    { value: '3', label: '10,000' }
];

export const GRADIENT_POS_OPTIONS = [
    { value: '0 1 0 0', label: '↑' },
    { value: '1 0 0 0', label: '←' },
    { value: '0 0 1 0', label: '→' },
    { value: '0 0 0 1', label: '↓' },
    { value: '1 1 0 0', label: '↖' },
    { value: '0 1 1 0', label: '↗' },
    { value: '0 0 1 1', label: '↘' },
    { value: '1 0 0 1', label: '↙' }
];

export const NAME_LOCATIONS = [
    { value: 'start', label: 'Снизу' },
    { value: 'middle', label: 'В центре' },
    { value: 'end', label: 'Сверху' }
];

export const AXIS_DIR_TYPES = [
    { value: 'x', label: 'X' },
    { value: 'y', label: 'Y' }
];

export const AXIS_TYPES = [
    { value: 'category', label: 'Категория' },
    { value: 'value', label: 'Значение' }
];

export const AXIS_VALUE_FORMATS = [
    { value: 'value', label: 'Value' },
    { value: 'percent', label: 'Percent' }
];

export const AxisLabelTypes = [
    { value: 'text', label: 'Текст' },
    { value: 'image', label: 'Изображение' },
    { value: 'text&image', label: 'Текст и изображение' },
    { value: 'text&label', label: 'Текст и доп.подпись' }
];

export const CHART_TYPES = [
    { value: 'bar', label: 'Bar chart' },
    { value: 'line', label: 'Line chart' },
    { value: 'plan', label: 'Compared plan' },
    { value: 'fact', label: 'Compared fact' },
    { value: 'stacked', label: 'Stacked bar' },
    { value: 'stacked line', label: 'Stacked line' }
];

export const LABEL_POS_OPTIONS = [
    { value: 'top', label: 'Сверху' },
    { value: 'left', label: 'Слева' },
    { value: 'right', label: 'Справа' },
    { value: 'bottom', label: 'Снизу' },
    { value: 'inside', label: 'Внутри' },
    { value: 'insideLeft', label: 'Слева внутри' },
    { value: 'insideRight', label: 'Справа внутри' },
    { value: 'insideTop', label: 'Сверху внутри' },
    { value: 'insideBottom', label: 'Снизу внутри' },
    { value: 'insideTopLeft', label: 'Сверху слева внутри' },
    { value: 'insideBottomLeft', label: 'Снизу слева внутри' },
    { value: 'insideTopRight', label: 'Сверху справа внутри' },
    { value: 'insideBottomRight', label: 'Снизу справа внутри' }
];

export const FILL_POSITIONS = [
    { value: 'start', label: 'Под линией' },
    { value: 'end', label: 'Над линией' }
];

export const ANIMATION_TYPES = [
    { value: 'linear', label: 'Linear' },
    { value: 'cubicIn', label: 'CubicIn' },
    { value: 'cubicOut', label: 'CubicOut' },
    { value: 'cubicInOut', label: 'CubicInOut' },
    { value: 'elasticIn', label: 'ElasticIn' },
    { value: 'elasticOut', label: 'ElasticOut' },
    { value: 'elasticInOut', label: 'ElasticInOut' },
    { value: 'bounceIn', label: 'BounceIn' },
    { value: 'bounceOut', label: 'BounceOut' },
    { value: 'backIn', label: 'BackIn' },
    { value: 'backOut', label: 'BackOut' },
    { value: 'backInOut', label: 'BackInOut' }
];

export const DATA_ZOOM_ORIENT = [
    { value: 'horizontal', label: 'Горизонтальное' },
    { value: 'vertical', label: 'Вертикальное' }
];

export const COMMON_UNITS = ['px', '%'];

export const DATA_ZOOM_TOP_POSITIONS = [
    { label: 'Авто', value: 'auto' },
    { label: 'Сверху', value: 'top' },
    { label: 'Посередине', value: 'middle' },
    { label: 'Снизу', value: 'bottom' }
];

export const DATA_ZOOM_LEFT_POSITIONS = [
    { label: 'Авто', value: 'auto' },
    { label: 'Слева', value: 'left' },
    { label: 'Посередине', value: 'center' },
    { label: 'Справа', value: 'right' }
];

export const AdditionalLabelPositionOptions = [
    { label: 'Сверху', value: 'top' },
    { label: 'Снизу', value: 'bottom' }
];

export const LabelAlignOptions = [
    { label: 'По центру', value: 'center' },
    { label: 'Слева', value: 'left' },
    { label: 'Справа', value: 'right' }
];

export const AdditionalAxisLabelPositionOptions = [
    { label: 'Слева', value: 'left' },
    { label: 'Сверху', value: 'top' },
    { label: 'Справа', value: 'right' },
    { label: 'Снизу', value: 'bottom' }
];

export const SortOptions = [
    { label: 'Без сортировки', value: '' },
    { label: 'По возрастанию', value: 'ascending' },
    { label: 'По убыванию', value: 'descending' }
];

export const LegendIconOptions = [
    { label: 'Стандартный', value: '' },
    { label: 'Круг', value: 'circle' },
    { label: 'Прямоугольник', value: 'rect' },
    { label: 'Скругленный прямоугольник', value: 'roundRect' },
    { label: 'Треугольник', value: 'triangle' },
    { label: 'Ромб', value: 'diamond' },
    { label: 'Шарик', value: 'pin' },
    { label: 'Стрелка', value: 'arrow' },
    { label: 'Без иконки', value: 'none' }
];

export const DataZoomDirectionOptions = [
    { label: 'Слева', value: false },
    { label: 'Справа', value: true }
];

export const SeriesTypeOptions = [
    { label: 'Без шаблона', value: null },
    { label: 'Все линии', value: 'line' },
    { label: 'Все бары', value: 'bar' }
];

export const TopType = {
    DIMENSION: 'dimension',
    METRIC: 'metric'
};
export const TopTypeOptions = [
    { label: 'Измерение', value: TopType.DIMENSION },
    { label: 'Метрика', value: TopType.METRIC }
];

export const FontSizeFirstPxUnits = ['px', 'rem', 'em', '%'];
export const CommonSizeFirstPxUnits = ['px', 'rem', 'em', 'vh', 'vw', '%'];
