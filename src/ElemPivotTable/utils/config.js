import { QueryAggregateFunctionName } from '@goodt-common/data';
import {
    VerticalAligns,
    DRAG_ANIMATION_TIME,
    FieldsPopupDraggableGroupNames,
    NumberFormatPatternModifierKeys,
    NumberFormatTypeKeys,
    createCellSettings,
    ConditionOperator,
    ConditionOperatorSymbol,
    SubtotalType,
    SubtotalPosition,
    CellSortTypes,
    CalculatedCellAggregateMethodsKeys,
    TableDrawTypes,
    MetricsPosition
} from './constants';

import { calcArraySum, calcArrayAvg, findArrayMax, findArrayMin, uniqArray } from './utils';

export const NumberFormatTypesOptions = [
    { label: 'Число', value: NumberFormatTypeKeys.DECIMAL },
    { label: 'Валюта', value: NumberFormatTypeKeys.CURRENCY }
];

export const NumberFormatPatternModifierOptions = [
    { label: 'Режим проценты', value: NumberFormatPatternModifierKeys.PERCENT },
    { label: 'Компактный режим', value: NumberFormatPatternModifierKeys.COMPACT },
    { label: 'Скрывать нули после запятой', value: NumberFormatPatternModifierKeys.FIXED }
];

export const VerticalAlignsOptions = [
    { label: 'Слева', value: VerticalAligns.LEFT },
    { label: 'Центр', value: VerticalAligns.CENTER },
    { label: 'Справа', value: VerticalAligns.RIGHT }
];

export const DraggableOptions = {
    animation: DRAG_ANIMATION_TIME,
    handle: '.drag-handle'
};

export const DimensionsDraggableOptions = {
    animation: DRAG_ANIMATION_TIME,
    handle: '.drag-handle',
    group: 'dimensions'
};

export const FieldsPopupDraggableOptions = {
    animation: DRAG_ANIMATION_TIME,
    handle: '.drag-handle'
};
export const FieldsPopupValuesDraggableOptions = {
    ...FieldsPopupDraggableOptions,
    group: FieldsPopupDraggableGroupNames.METRICS
};

export const AllFieldsPopupDraggableOptions = {
    ...FieldsPopupDraggableOptions,
    sort: false,
    clone: createCellSettings
};

export const AllFieldsPopupDimensionsDraggableOptions = {
    ...AllFieldsPopupDraggableOptions,
    group: { name: FieldsPopupDraggableGroupNames.DIMENSIONS, pull: 'clone', put: false }
};
export const AllFieldsPopupMetricsDraggableOptions = {
    ...AllFieldsPopupDraggableOptions,
    group: { name: FieldsPopupDraggableGroupNames.METRICS, pull: 'clone', put: false }
};

export const AggregateMethodsOptions = [
    {
        label: 'Значение',
        value: QueryAggregateFunctionName.VALUE
    },
    {
        label: 'Сумма',
        value: QueryAggregateFunctionName.SUM
    },
    {
        label: 'Количество',
        value: QueryAggregateFunctionName.COUNT
    },
    {
        label: 'Среднее',
        value: QueryAggregateFunctionName.AVG
    },
    {
        label: 'Максимум',
        value: QueryAggregateFunctionName.MAX
    },
    {
        label: 'Минимум',
        value: QueryAggregateFunctionName.MIN
    },
    {
        label: 'Группировка с объединением',
        value: QueryAggregateFunctionName.GROUP_CONCAT
    },
    {
        label: 'Группировка с объединением уникальных',
        value: QueryAggregateFunctionName.GROUP_UCONCAT
    }
];

export const AggregateFieldsMethodsOptions = [
    {
        label: 'Значение',
        value: QueryAggregateFunctionName.VALUE
    },
    {
        label: 'Сумма',
        value: QueryAggregateFunctionName.SUM
    },
    {
        label: 'Количество',
        value: QueryAggregateFunctionName.COUNT
    },
    {
        label: 'Среднее',
        value: QueryAggregateFunctionName.AVG
    },
    {
        label: 'Максимум',
        value: QueryAggregateFunctionName.MAX
    },
    {
        label: 'Минимум',
        value: QueryAggregateFunctionName.MIN
    }
];

export const ConditionsOptions = [
    { label: ConditionOperatorSymbol[ConditionOperator.MORE], value: ConditionOperator.MORE },
    { label: ConditionOperatorSymbol[ConditionOperator.LESS], value: ConditionOperator.LESS },
    { label: ConditionOperatorSymbol[ConditionOperator.EQUALS], value: ConditionOperator.EQUALS },
    { label: ConditionOperatorSymbol[ConditionOperator.MORE_EQUALS], value: ConditionOperator.MORE_EQUALS },
    { label: ConditionOperatorSymbol[ConditionOperator.LESS_EQUALS], value: ConditionOperator.LESS_EQUALS }
];

export const CalculatedCellAggregateMethodFunction = {
    [CalculatedCellAggregateMethodsKeys.SUM]: (val1, val2) => Number(val1) + Number(val2),
    [CalculatedCellAggregateMethodsKeys.DIVIDED]: (val1, val2) => Number(val1) / Number(val2)
};

export const AggregateMethodFunction = {
    [QueryAggregateFunctionName.VALUE]: (values) => values?.[0],
    [QueryAggregateFunctionName.SUM]: calcArraySum,
    [QueryAggregateFunctionName.COUNT]: (...values) => values.flat().length,
    [QueryAggregateFunctionName.AVG]: calcArrayAvg,
    [QueryAggregateFunctionName.MAX]: findArrayMax,
    [QueryAggregateFunctionName.MIN]: findArrayMin,
    [QueryAggregateFunctionName.GROUP_CONCAT]: (...values) => values.flat(),
    [QueryAggregateFunctionName.GROUP_UCONCAT]: uniqArray
};

export const SubtotalTypeOptions = [
    { label: 'Отключить', value: SubtotalType.EXCLUDED },
    { label: 'Строки и столбцы', value: SubtotalType.ALL },
    { label: 'Только строки', value: SubtotalType.ROWS },
    { label: 'Только столбцы', value: SubtotalType.COLUMNS }
];

export const SubtotalRowsPositionOptions = [
    { label: 'Снизу', value: SubtotalPosition.BOTTOM },
    { label: 'Сверху', value: SubtotalPosition.TOP }
];

export const CellSortTypeFunctions = {
    [CellSortTypes.STRING]: (value) => `${value}`,
    [CellSortTypes.NUMBER]: (value) => Number(value)
};

export const CalculatedMetricsOperatorsOptions = [
    { label: '+', value: '+' },
    { label: '-', value: '-' },
    { label: '÷', value: '/' },
    { label: '×', value: '*' }
];

export const CalculatedMetricsAggregateOptions = [
    { label: 'SUM', value: `${QueryAggregateFunctionName.SUM}()` },
    { label: 'AVG', value: `${QueryAggregateFunctionName.AVG}()` },
    { label: 'COUNT', value: `${QueryAggregateFunctionName.COUNT}()` },
    { label: 'MIN', value: `${QueryAggregateFunctionName.MIN}()` },
    { label: 'MAX', value: `${QueryAggregateFunctionName.MAX}()` }
];

export const TableDrawOptions = [
    { label: 'Табличный', value: TableDrawTypes.TABLE },
    { label: 'Плоский', value: TableDrawTypes.FLAT }
];

export const MetricsPositionOptions = [
    { label: 'Строки', value: MetricsPosition.ROWS },
    { label: 'Столбцы', value: MetricsPosition.COLUMNS }
];

export const ExportFileType = {
    EXCEL: 'xlsx'
};
