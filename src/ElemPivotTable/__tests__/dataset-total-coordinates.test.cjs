/* eslint-disable id-length, no-magic-numbers, no-new-func, no-restricted-syntax */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const workerPath = path.resolve(__dirname, '..', 'workers', 'generateTableCells.js');
const source = fs.readFileSync(workerPath, 'utf8');
const loadedModule = { exports: {} };
const code = `${source.replace(/^import[\s\S]*?;\r?\n/gm, '').replace(/\bexport\s+/g, '')}\nmodule.exports.generateTableCells = generateTableCells;`;
new Function('module', code)(loadedModule);

const CellsTypes = {
    CELL: 'cell',
    COLUMN: 'column',
    COLUMN_INDEX: 'col_index',
    ROW: 'row',
    ROW_INDEX: 'row_index',
    ROW_TITLE: 'row_title',
    SPACE: 'space',
    SUBTOTAL_ROW: 'subtotal_row',
    TITLE: 'title',
    TOTAL_CELL: 'total_cell',
    TOTAL_COLUMN: 'total_title',
    TOTAL_ROW: 'total_row',
    TOTAL_ROW_CELL: 'total_row_cell',
    TOTAL_SPACE: 'total_space',
    TOTAL_VALUE_TITLE: 'total_value_title',
    VALUE_TITLE: 'value_title',
    ZERO_INDEX: 'zero_index'
};

const runtime = {
    config: {
        AggregateMethodFunction: {
            sum: (values) => values.reduce((total, value) => total + (value ?? 0), 0)
        },
        CalculatedCellAggregateMethodFunction: {
            add: (first, second) => first + second
        },
        CellSortTypeFunctions: { string: (value) => `${value}` }
    },
    constants: {
        ...CellsTypes,
        CellsTypes,
        LOADER_COLUMN_KEY: 'loader',
        MetricType: { CUSTOM: 'custom' },
        MetricsPosition: { ROWS: 'rows' },
        QueryAggregateFunctionName: { COUNT: 'count', MAX: 'max', MIN: 'min', SUM: 'sum' },
        TableDrawTypes: { TABLE: 'table' },
        TotalPositions: { START: 'start' },
        ValueType: { NUMBER: 'number' }
    },
    utils: {
        buildArgsAliases: (metrics) => Object.fromEntries(metrics.map((metric) => [metric, metric])),
        buildExpression: (expression) => expression,
        calculate: (_expression, args) => args.ordinary[0] + args['sum(custom)'][0],
        createCell: (cell) => cell,
        findIntesection: (first, second) => first.filter((item) => second.includes(item))
    }
};

const createModel = (total) => {
    const heap = {
        rows: [1],
        Action: { rows: [1] },
        Publisher: { rows: [1] }
    };
    return {
        columnSortOptions: { isUsed: false },
        columns: [{ dataAlias: 'publisher', height: 48, sortDataType: 'string', valueType: 'string' }],
        columnsHeap: { rows: [1], Publisher: { rows: [1] } },
        columnsPaths: [['Publisher']],
        columnsTotalPosition: 'end',
        columnTotalData: [total],
        columnsTotalHeap: { rows: [1], Publisher: { rows: [1] } },
        columnTotalsMap: {
            default: {
                columnTotalData: [total],
                columnsTotalHeap: { rows: [1], Publisher: { rows: [1] } }
            }
        },
        data: [
            { genre: 'Action', publisher: 'Other', ordinary: 90, 'sum(custom)': 80, additional: 70 },
            {
                genre: 'Action',
                publisher: 'Publisher',
                ordinary: total.ordinary,
                'sum(custom)': total['sum(custom)'],
                additional: total.additional
            }
        ],
        indexesHeight: 24,
        isReplacingEmptyMetricValues: false,
        isShownColumnsTotal: true,
        isShownHead: true,
        isShownRowTotal: true,
        isUsedIndexes: false,
        metrics: ['ordinary', 'sum(custom)', 'additional'],
        resizedColumnsIndexes: [],
        resizedRowsIndexes: [],
        rowMinHeight: 24,
        rowTotalData: [total],
        rowTotalPosition: 'end',
        rowTotalsMap: {
            default: {
                rowTotalData: [total],
                rowsTotalHeap: { rows: [1], Action: { rows: [1] } }
            }
        },
        rows: [{ dataAlias: 'genre', height: 48, sortDataType: 'string', valueType: 'string' }],
        rowsHeap: { rows: [1], Action: { rows: [1] } },
        rowsHeight: 48,
        rowsPaths: [['Action']],
        titleHeight: 48,
        valuesData: [
            {
                aggregate: 'sum',
                calculatedCell: { isUsed: false },
                dataAlias: 'ordinary',
                isCalculated: false,
                isDatasetTotalAggregation: true,
                metricType: 'metric'
            },
            {
                aggregate: 'sum',
                calculatedCell: { isUsed: false },
                dataAlias: 'custom',
                isCalculated: false,
                isDatasetTotalAggregation: true,
                metricType: 'custom'
            },
            {
                aggregate: 'sum',
                calculatedCell: { isUsed: false },
                dataAlias: 'calculated',
                expression: 'ordinary + custom',
                isCalculated: true,
                isDatasetTotalAggregation: true,
                metricType: 'metric'
            },
            {
                aggregate: 'sum',
                calculatedCell: { aggregate: 'sum', dataAlias: 'additional', isUsed: true, method: 'add' },
                dataAlias: 'ordinary',
                isCalculated: false,
                isDatasetTotalAggregation: true,
                metricType: 'metric'
            }
        ]
    };
};

const getTotalCells = (model) =>
    loadedModule.exports
        .generateTableCells(model, runtime)
        .flatMap(({ cells }) => cells)
        .filter(({ type }) => type === CellsTypes.TOTAL_ROW_CELL || type === CellsTypes.TOTAL_CELL);

const assertRoutes = (cells, expected) => {
    [CellsTypes.TOTAL_CELL, CellsTypes.TOTAL_ROW_CELL].forEach((type) => {
        const values = cells.filter((cell) => cell.type === type).map(({ value }) => value);
        assert.deepEqual(values.slice(0, expected.length), expected, `${type} route order`);
    });
};

test('dataset totals use selected-row coordinates for ordinary, custom, calculated and additional metrics', () => {
    const cells = getTotalCells(createModel({ genre: 'Action', ordinary: 7, 'sum(custom)': 8, additional: 9 }));

    assertRoutes(cells, [7, 8, 15, 16]);
});

test('dataset total zero is preserved through ordinary, custom, calculated and additional routes', () => {
    const cells = getTotalCells(createModel({ genre: 'Action', ordinary: 0, 'sum(custom)': 0, additional: 0 }));

    assertRoutes(cells, [0, 0, 0, 0]);
});
