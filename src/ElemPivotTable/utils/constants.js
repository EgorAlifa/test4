/* eslint-disable no-magic-numbers */
import { QueryAggregateFunctionName } from '@goodt-common/data';
import { NumberFormat, NumberFormatPattern } from '@goodt-common/utils-number';
import { uniqueId } from 'lodash';
import { getStringToFloat } from './utils';

export const KEY_CODE_C = 67;
export const FAST_SEARCH_DELAY = 500;
export const DRAG_ANIMATION_TIME = 500;
export const FILTER_HEIGHT = 40;
export const FILTER_SCROLLER_ITEMS_COUNT = 5;
export const CELL_MIN_HEIGHT = '1rem';

export const { DIGITS_MAX: NUMBER_FORMAT_DIGITS_MAX, Modifier: NumberFormatPatternModifierKeys } = NumberFormatPattern;
export const { Type: NumberFormatTypeKeys } = NumberFormat;

export const TableDrawTypes = {
    TABLE: 'table',
    FLAT: 'flat'
};

export const MetricsPosition = {
    ROWS: 'rows',
    COLUMNS: 'columns'
};

export const ValueType = {
    STRING: '',
    NUMBER: 'num'
};

export const ValueFilterLogicOperator = {
    AND: '',
    // eslint-disable-next-line id-length
    OR: 'or'
};

export const SubtotalType = {
    EXCLUDED: 'ex',
    ROWS: 'rows',
    COLUMNS: 'columns',
    ALL: 'all'
};

export const SubtotalPosition = {
    TOP: 'top',
    BOTTOM: ''
};

export const ConditionOperator = {
    MORE: 'more',
    LESS: 'less',
    EQUALS: 'equals',
    MORE_EQUALS: 'more_equals',
    LESS_EQUALS: 'less_equals'
};

export const ConditionOperatorSymbol = {
    [ConditionOperator.MORE]: '>',
    [ConditionOperator.LESS]: '<',
    [ConditionOperator.EQUALS]: '=',
    [ConditionOperator.MORE_EQUALS]: '>=',
    [ConditionOperator.LESS_EQUALS]: '<='
};

export const ConditionFunction = {
    [ConditionOperator.MORE]: (condVal, cellVal) => getStringToFloat(condVal) < getStringToFloat(cellVal),
    [ConditionOperator.LESS]: (condVal, cellVal) => getStringToFloat(condVal) > getStringToFloat(cellVal),
    [ConditionOperator.EQUALS]: (condVal, cellVal) => getStringToFloat(condVal) === getStringToFloat(cellVal),
    [ConditionOperator.MORE_EQUALS]: (condVal, cellVal) => getStringToFloat(condVal) <= getStringToFloat(cellVal),
    [ConditionOperator.LESS_EQUALS]: (condVal, cellVal) => getStringToFloat(condVal) >= getStringToFloat(cellVal)
};

export const FieldsPopupDraggableGroupNames = {
    DIMENSIONS: 'dimensions',
    FIELDS: 'fields',
    FILTERS: 'filters',
    METRICS: 'metrics'
};
export const HorizontalAligns = {
    TOP: 'top',
    BOTTOM: 'bottom',
    CENTER: 'center'
};

export const VerticalAligns = {
    RIGHT: 'right',
    LEFT: 'left',
    CENTER: 'center'
};

export const CalculatedCellAggregateMethodsKeys = {
    SUM: 'sum',
    DIVIDED: 'divided'
};

export const CellsTypes = {
    CELL: 'cell',
    TOTAL_CELL: 'total_cell',
    TOTAL_ROW_CELL: 'total_row_cell',
    TOTAL_COLUMN: 'total_title',
    TOTAL_ROW: 'total_row',
    SUBTOTAL_ROW: 'subtotal_row',
    TOTAL_VALUE_TITLE: 'total_value_title',
    ROW: 'row',
    COLUMN: 'column',
    VALUE: 'value',
    TITLE: 'title',
    ROW_TITLE: 'row_title',
    VALUE_TITLE: 'value_title',
    SPACE: 'space',
    ROW_SPACE: 'row_space',
    COLUMN_SPACE: 'column_space',
    TOTAL_SPACE: 'total_space',
    COLUMN_INDEX: 'col_index',
    ROW_INDEX: 'row_index',
    ZERO_INDEX: 'zero_index'
};

export const MdiDropdownClasses = {
    ASC: 'mdi-sort-alphabetical-ascending',
    DESC: 'mdi-sort-alphabetical-descending',
    DOWN: 'mdi-menu-down',
    TOP: 'mdi-menu-right'
};
export const VerticalAlignsOptionsIcons = {
    [VerticalAligns.LEFT]: 'mdi-format-align-left',
    [VerticalAligns.CENTER]: 'mdi-format-align-center',
    [VerticalAligns.RIGHT]: 'mdi-format-align-right'
};
export const TotalPositions = {
    START: 'start',
    END: 'end'
};
export const TotalPositionsInset = {
    horizontal: {
        [TotalPositions.START]: 'left',
        [TotalPositions.END]: 'right'
    },
    vertical: {
        [TotalPositions.START]: 'top',
        [TotalPositions.END]: 'bottom'
    }
};

export const PopupSettings = {
    modal: false,
    fullscreen: false,
    usePadding: false,
    showCloseButton: false,
    dialog: {
        class: {},
        style: {
            width: '1200px'
        }
    }
};
export const FormatPopupSettings = {
    modal: false,
    fullscreen: false,
    usePadding: false,
    showCloseButton: false,
    dialog: {
        class: {},
        style: {
            width: '648px'
        }
    }
};
export const SettingsPopupSettings = {
    modal: false,
    fullscreen: false,
    usePadding: false,
    showCloseButton: false,
    dialog: {
        class: {},
        style: {
            width: '312px'
        }
    }
};
export const ConditionPopupSettings = {
    modal: false,
    fullscreen: false,
    usePadding: false,
    showCloseButton: false,
    dialog: {
        class: {},
        style: {
            width: '776px'
        }
    }
};
export const DialogPopupSettings = {
    modal: false,
    fullscreen: false,
    usePadding: true,
    showCloseButton: true,
    dialog: {
        class: {},
        style: {
            width: '480px'
        }
    }
};

export const CellSortTypes = {
    STRING: 'string',
    NUMBER: 'number'
};

export const createFont = ({ color = '', fontSize = '', fontFamily = '', fontWeight = '' } = {}) => ({
    color,
    fontSize,
    fontFamily,
    fontWeight
});

export const createSubtotalSettings = ({ type = SubtotalType.EXCLUDED, rowPosition = SubtotalPosition.TOP } = {}) => ({
    type,
    rowPosition
});

export const createCalculatedCell = ({
    dataAlias = '',
    aggregate = QueryAggregateFunctionName.SUM,
    method = CalculatedCellAggregateMethodsKeys.SUM,
    isUsed = false
} = {}) => ({ dataAlias, aggregate, method, isUsed });

export const createValueSettings = ({ dataAlias = '', aggregate = QueryAggregateFunctionName.SUM } = {}) => ({
    dataAlias,
    aggregate
});

export const createCellSettings = ({
    isShown = true,
    metricType = MetricType.METRIC,
    dataAlias = '',
    sortAlias = '',
    calculatedCell = createCalculatedCell(),
    sortDataType = CellSortTypes.STRING,
    title = '',
    valueType = ValueType.STRING,
    fontSize = '',
    fontFamily = '',
    fontWeight = '',
    format = '',
    color = '',
    backgroundColor = '',
    spaceBackgroundColor = '',
    sortDesc = false,
    height = 48,
    width = '',
    titleSettings = {},
    filters = {},
    expression = '',
    isCalculated = false,
    verticalAlign = VerticalAligns.LEFT,
    horizontalAlign = HorizontalAligns.CENTER,
    aggregate = QueryAggregateFunctionName.SUM
} = {}) => ({
    isShown,
    metricType,
    expression,
    isCalculated,
    width,
    sortDesc,
    valueType,
    height,
    dataAlias,
    sortAlias,
    sortDataType,
    title,
    fontSize,
    fontFamily,
    fontWeight,
    format,
    color,
    backgroundColor,
    spaceBackgroundColor,
    filters,
    verticalAlign,
    horizontalAlign,
    titleSettings: titleSettings != null ? createCellSettings({ ...titleSettings, titleSettings: null }) : null,
    aggregate,
    calculatedCell: createCalculatedCell(calculatedCell)
});

export const createCalculatedValueCell = ({ isCalculated, metricsOptions = [], ...cellSetting } = {}) => ({
    ...createCellSettings(cellSetting),
    isCalculated,
    metricsOptions: metricsOptions.map(createValueSettings)
});

export const createCondition = ({
    dataAlias = '',
    operator = ConditionOperator.MORE,
    value = 0,
    isFormattingTotal = true,
    cellSettings = createCellSettings()
} = {}) => ({
    dataAlias,
    operator,
    value,
    isFormattingTotal,
    cellSettings: createCellSettings(cellSettings)
});

export const createConditionWithUid = (condition = createCondition()) => ({ ...condition, uid: uniqueId() });

export const createSimpleCondition = ({ value = '', operator = ConditionOperator.MORE } = {}) => ({
    value,
    operator
});

export const createCalculatedMetricsSettings = ({
    isShown = false,
    dragValue = null,
    dragMetric = -1,
    expression = '',
    title = ''
} = {}) => ({
    isShown,
    dragValue,
    dragMetric,
    expression,
    title
});

export const createCell = ({
    type = constants.CellsTypes.CELL,
    level = 0,
    rowIndex = -1,
    hasBeenCollapsed = false,
    path = [],
    value = null,
    isLoader = false
} = {}) => ({
    type,
    level,
    rowIndex,
    hasBeenCollapsed,
    path,
    collapsed: false,
    value,
    isLoader
});

export const LOADER_COLUMN_KEY = '#load#';

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const RequestType = Object.freeze({
    ALL_COLUMNS: 'allColumns',
    ROWS: 'rows',
    DATA: 'data',
    PAGINATION_DATA: 'paginationData',
    TOTAL: 'total'
});

/**
 * @enum {string}
 * @type {Readonly<Record<string, string>>}
 */
export const MetricType = Object.freeze({
    METRIC: 'metric',
    CUSTOM: 'custom'
});
