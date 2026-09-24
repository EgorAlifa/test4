const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const componentPath = path.join(__dirname, '..', 'ElemPivotTable.vue');
const flatWorkerPath = path.join(__dirname, '..', 'workers', 'generateFlatTable.js');

const loadMethod = (name, nextMethodSignature, dependencies = {}, signature = `        ${name}() {`) => {
    const source = fs.readFileSync(componentPath, 'utf8');
    const start = source.indexOf(signature);
    const end = source.indexOf(`        ${nextMethodSignature}`, start);

    assert.notEqual(start, -1, `PivotTable ${name}() must exist`);
    assert.notEqual(end, -1, `PivotTable ${name}() boundary must exist`);

    const method = source.slice(start, end);
    return new Function(...Object.keys(dependencies), `return ({ ${method} }).${name};`)(
        ...Object.values(dependencies)
    );
};

const load = loadMethod('load', 'async applyEmptyFilterResult() {', {}, '        async load() {');
const restoreTableSettings = loadMethod(
    'restoreTableSettings',
    '...ElemInstanceTypeDescriptor,',
    {
        cloneDeep: structuredClone,
        isEqual: (first, second) => JSON.stringify(first) === JSON.stringify(second),
        keyBy: (items, key) => Object.fromEntries(items.map((item) => [item[key], item])),
        merge: (...items) => Object.assign({}, ...items),
        createCellSettings: (settings) => settings,
        createCondition: (condition) => condition
    },
    '        restoreTableSettings(tableSettings) {'
);
const onSettingsPopupSave = loadMethod(
    'onSettingsPopupSave',
    'setGroupByMetrics(',
    {},
    '        onSettingsPopupSave({'
);

const loadFlatWorker = () => {
    const source = fs.readFileSync(flatWorkerPath, 'utf8');
    const start = source.indexOf('function generateFlatTable(');
    const end = source.indexOf('export const asyncGenerateFlatTable', start);

    assert.notEqual(start, -1, 'flat worker must define generateFlatTable()');
    assert.notEqual(end, -1, 'flat worker export boundary must exist');

    return new Function(`${source.slice(start, end)}; return generateFlatTable;`)();
};

const generateFlatTable = loadFlatWorker();
const totalCellType = 'total-row-cell';
const totalRowType = 'total-row';

const workerDependencies = {
    config: {
        AggregateMethodFunction: {
            sum: (values) => values.reduce((sum, value) => sum + Number(value ?? 0), 0)
        },
        CalculatedCellAggregateMethodFunction: {}
    },
    constants: {
        CellsTypes: {
            CELL: 'cell',
            COLUMN_INDEX: 'column-index',
            ROW: 'row',
            ROW_INDEX: 'row-index',
            ROW_TITLE: 'row-title',
            TOTAL_ROW: totalRowType,
            TOTAL_ROW_CELL: totalCellType,
            TOTAL_SPACE: 'total-space',
            TOTAL_VALUE_TITLE: 'total-value-title',
            VALUE_TITLE: 'value-title',
            ZERO_INDEX: 'zero-index'
        },
        MetricType: { CUSTOM: 'custom' },
        MetricsPosition: { ROWS: 'rows' },
        QueryAggregateFunctionName: { COUNT: 'count' },
        TotalPositions: { START: 'start' }
    },
    utils: {
        buildArgsAliases: (metrics) => Object.fromEntries(metrics.map((metric, index) => [metric, `metric${index}`])),
        buildExpression: (expression) => expression,
        calculate: () => undefined,
        createCell: (cell) => cell
    }
};

const valueSettings = {
    aggregate: 'sum',
    calculatedCell: { isUsed: false },
    dataAlias: 'amount',
    isCalculated: false,
    metricType: 'metric',
    title: 'Amount'
};

const createSettings = (isShownColumnsTotal) => ({
    columnsTotalPosition: 'end',
    isDuplicateDimensions: false,
    isPagination: true,
    isShownColumnsTotal,
    isShownRowTotal: false,
    isUsedCollapse: false,
    isUsedIndexes: false,
    isUsedNullRows: false,
    isUsedZeroRows: false,
    metricsPosition: 'columns',
    rowTotalPosition: 'end',
    shouldBeFixedFirstColumn: false,
    shouldBeFixedHeader: false,
    subtotal: { type: 'ex' },
    tableDrawType: 'flat'
});

const createContext = (isShownColumnsTotal) => {
    const requests = { page: 0, total: 0 };
    const context = {
        canLoadData: false,
        canShownPagination: true,
        hasAppliedEmptyFilter: () => false,
        hasPaginationByButtonNextPage: false,
        isFirstInitTableMaps: true,
        isFirstLoad: false,
        isFlat: true,
        isPaginationByButton: false,
        isPendingPaginationByButton: false,
        needLoad: false,
        pendingDefaultTotalsPromise: null,
        playerCalculatedValues: [],
        playerColumns: [],
        playerConditions: [],
        playerFilters: [],
        playerRows: [{ dataAlias: 'category', title: 'Category' }],
        playerSettings: createSettings(isShownColumnsTotal),
        playerValues: [valueSettings],
        props: {
            columns: [],
            isUsedNullRows: false,
            isUsedZeroRows: false,
            rows: [],
            values: [valueSettings]
        },
        tableMaps: {},
        buildSlicedRequest: () => ({
            limit: 10,
            send: async () => {
                requests.page += 1;
                return { rows: [{ amount: 1, category: 'Current page' }] };
            }
        }),
        fetchTotal: async () => {
            requests.total += 1;
            return { rows: [{ amount: 10 }] };
        },
        generateTableMaps: async () => undefined,
        loaderEnd: () => undefined,
        loaderStart: () => undefined,
        updateConditionsFilters: () => undefined,
        updateValuesFilters: () => undefined,
        $handleError: (error) => {
            throw error;
        }
    };

    context.generateTableRows = async () => {
        context.tableRows = generateFlatTable(
            {
                columnsSettings: [],
                columnsTotalPosition: context.playerSettings.columnsTotalPosition,
                data: context.result.rows,
                isReplacingEmptyFields: false,
                isReplacingEmptyMetricValues: false,
                isShownColumnsTotal: context.playerSettings.isShownColumnsTotal,
                isUsedIndexes: false,
                metrics: ['amount'],
                metricsPosition: context.playerSettings.metricsPosition,
                replacingNullValue: '',
                replacingVoidValue: '',
                resizedRowsIndexes: [],
                rowMinHeight: 1,
                rowsHeight: 1,
                rowsSettings: [{ dataAlias: 'category', title: 'Category' }],
                titleHeight: 1,
                totalData: context.tableMaps.totalData,
                valuesSettigns: [valueSettings]
            },
            workerDependencies
        );
    };

    return { context, requests };
};

const findTotalCell = (tableRows) => tableRows.flatMap(({ cells }) => cells).find(({ type }) => type === totalCellType);
const hasTotalRow = (tableRows) => tableRows.some(({ cells }) => cells.some(({ type }) => type === totalRowType));

test('flat paginated table skips the aggregate request and total row when totals are hidden', async () => {
    const { context, requests } = createContext(false);

    await load.call(context);

    assert.deepEqual(requests, { page: 1, total: 0 });
    assert.equal(hasTotalRow(context.tableRows), false);
    assert.equal(findTotalCell(context.tableRows), undefined);
});

test('flat paginated table requests and renders the common total when totals are shown', async () => {
    const { context, requests } = createContext(true);

    await load.call(context);

    assert.deepEqual(requests, { page: 1, total: 1 });
    assert.equal(hasTotalRow(context.tableRows), true);
    assert.equal(findTotalCell(context.tableRows).value, 10);
});

test('restored totals setting controls the first flat paginated load', async () => {
    const { context, requests } = createContext(true);
    context.setPage = () => {
        context.initialLoadPromise = load.call(context);
    };

    restoreTableSettings.call(
        context,
        JSON.stringify({
            rows: [{ dataAlias: 'category', title: 'Category' }],
            columns: [],
            filters: [],
            values: [valueSettings],
            calculatedValues: [],
            conditions: [],
            settings: createSettings(false)
        })
    );
    await context.initialLoadPromise;

    assert.equal(context.playerSettings.isShownColumnsTotal, false);
    assert.deepEqual(requests, { page: 1, total: 0 });
    assert.equal(hasTotalRow(context.tableRows), false);
});

test('toggling flat paginated totals reloads and changes aggregate-request behavior', async () => {
    const { context, requests } = createContext(false);
    context.commitTableSettingsToStore = () => undefined;
    context.updateGroupByMetrics = () => undefined;
    context.loadSlicedData = () => {
        context.reloadPromise = load.call(context);
    };

    await load.call(context);
    onSettingsPopupSave.call(context, createSettings(true));
    await context.reloadPromise;

    assert.deepEqual(requests, { page: 2, total: 1 });
    assert.equal(findTotalCell(context.tableRows).value, 10);
});
