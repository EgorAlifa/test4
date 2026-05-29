import {
    TotalPositions,
    ValueType,
    CellSortTypes,
    MetricType,
    CalculatedCellAggregateMethodsKeys
} from '../utils/constants';

export const VerticalTotalPositionOptions = [
    { label: 'Слева', value: TotalPositions.START },
    { label: 'Справа', value: TotalPositions.END }
];
export const TotalPositionOptions = [
    { label: 'Сверху', value: TotalPositions.START },
    { label: 'Снизу', value: TotalPositions.END }
];

export const VerticalAlignOptions = [
    { value: 'flex-start', label: 'Слева', icon: 'mdi-format-align-left' },
    { value: 'center', label: 'По центру', icon: 'mdi-format-align-center' },
    { value: 'flex-end', label: 'Справа', icon: 'mdi-format-align-right' }
];
export const HorizontalAlignOptions = [
    { value: 'flex-start', label: 'Сверху', icon: 'mdi-format-align-top' },
    { value: 'center', label: 'По центру', icon: 'mdi-format-align-middle' },
    { value: 'flex-end', label: 'Снизу', icon: 'mdi-format-align-bottom' }
];

export const ValueTypeOptions = [
    { label: 'Строка', value: ValueType.STRING },
    { label: 'Число', value: ValueType.NUMBER }
];

export const CellSortTypeOptions = [
    { label: 'Строка', value: CellSortTypes.STRING },
    { label: 'Число', value: CellSortTypes.NUMBER }
];

export const CalculatedCellAggregateMethodsOptions = [
    { label: 'Сумма', value: CalculatedCellAggregateMethodsKeys.SUM },
    { label: 'Отношение', value: CalculatedCellAggregateMethodsKeys.DIVIDED }
];

export const MetricTypeOptions = [
    { label: 'Метрика', value: MetricType.METRIC },
    { label: 'Поле', value: MetricType.CUSTOM }
];
