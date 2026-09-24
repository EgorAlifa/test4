const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const componentPath = path.resolve(__dirname, '..', 'ElemPivotTable.vue');
const tableCellsPath = path.resolve(__dirname, '..', 'workers', 'generateTableCells.js');

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

const clearObjectVoidValues = (value) =>
    Object.fromEntries(Object.entries(value).filter(([, item]) => item != null && item !== ''));

const removeImports = (source) => source.replace(/^import[\s\S]*?;\r?\n/gm, '');

const loadComponent = () => {
    const source = fs.readFileSync(componentPath, 'utf8');
    const [, script] = source.match(/<script>([\s\S]*?)<\/script>/);
    const module = { exports: {} };
    const scope = new Proxy(
        {
            ApiMixins: [],
            buildCellCssVars: (settings) => settings,
            CellActionsMixin: {},
            CellsTypes,
            clearObjectVoidValues,
            DatasetMixin: {},
            Elem: {},
            meta: {},
            SizeConverter: {
                instance: { convertToAbsoluteValue: () => 16 }
            },
            CELL_MIN_HEIGHT: '1rem',
            Vars: {}
        },
        {
            get(target, name) {
                if (name in target) {
                    return target[name];
                }
                return globalThis[name] ?? (() => {});
            },
            has(_target, name) {
                return name !== 'module';
            }
        },
    );
    const code = removeImports(script).replace('export default', 'module.exports.default =');

    new Function('module', 'scope', `with (scope) { ${code} }`)(module, scope);
    return module.exports.default;
};

const PivotTable = loadComponent();

const loadGenerateTableCells = () => {
    const source = fs.readFileSync(tableCellsPath, 'utf8');
    const module = { exports: {} };
    const code = `${removeImports(source).replace(/\bexport\s+/g, '')}\nmodule.exports.generateTableCells = generateTableCells;`;

    new Function('module', code)(module);
    return module.exports.generateTableCells;
};

const generateTableCells = loadGenerateTableCells();

const workerConstants = {
    ...CellsTypes,
    CellsTypes,
    LOADER_COLUMN_KEY: 'loader',
    MetricType: { CUSTOM: 'custom' },
    MetricsPosition: { ROWS: 'rows' },
    QueryAggregateFunctionName: { COUNT: 'count', MAX: 'max', MIN: 'min', SUM: 'sum' },
    TableDrawTypes: { TABLE: 'table' },
    TotalPositions: { START: 'start' },
    ValueType: { NUMBER: 'number' }
};

const workerRuntime = {
    config: {
        AggregateMethodFunction: {
            sum: (values) => values.reduce((total, value) => total + value, 0)
        },
        CellSortTypeFunctions: { string: (value) => `${value}` },
        CalculatedCellAggregateMethodFunction: {}
    },
    constants: workerConstants,
    utils: {
        buildArgsAliases: () => ({}),
        buildExpression: () => '',
        calculate: () => 0,
        createCell: (cell) => cell,
        findIntesection: (first, second) => first.filter((item) => second.includes(item))
    }
};

const createTableModelAfterMovingPublisherToColumns = () => {
    const rowsBeforeMove = [
        { dataAlias: 'publisher', height: 48, sortDataType: 'string', title: 'Издатель', valueType: 'string' }
    ];

    return {
        columnSortOptions: { isUsed: false },
        columns: rowsBeforeMove.concat([
            { dataAlias: 'quarter', height: 48, sortDataType: 'string', title: 'Квартал', valueType: 'string' }
        ]),
        columnsHeap: {
            rows: [0, 1],
            First: { rows: [0], Q1: { rows: [0] } },
            Second: { rows: [1], Q2: { rows: [1] } }
        },
        columnsPaths: [
            ['First', 'Q1'],
            ['Second', 'Q2']
        ],
        columnsTotalPosition: 'end',
        data: [
            { amount: 10, publisher: 'First', quarter: 'Q1' },
            { amount: 20, publisher: 'Second', quarter: 'Q2' }
        ],
        indexesHeight: 24,
        isReplacingEmptyMetricValues: false,
        isShownColumnsTotal: true,
        isShownHead: true,
        isShownRowTotal: false,
        isUsedIndexes: false,
        metrics: ['amount'],
        resizedColumnsIndexes: [],
        resizedRowsIndexes: [],
        rowMinHeight: 24,
        rowTotalPosition: 'end',
        rows: [],
        rowsHeap: { rows: [0, 1] },
        rowsHeight: 48,
        rowsPaths: [[]],
        titleHeight: 48,
        valuesData: [
            {
                aggregate: 'sum',
                calculatedCell: { isUsed: false },
                dataAlias: 'amount',
                isCalculated: false,
                metricType: 'metric',
                title: 'Сумма'
            }
        ]
    };
};

const createContext = ({ columnsWidth, playerRows = [] }) => ({
    playerRows,
    playerColumns: [
        { titleSettings: {}, width: '' },
        { titleSettings: {}, width: '' }
    ],
    playerValues: [{ titleSettings: {} }],
    baseRowsCssVars: {},
    baseColumnsCssVars: {},
    baseValuesCssVars: {},
    baseIndexesCssVars: {},
    rowTotalCssVars: {},
    rowTotalTitleCssVars: {},
    columnsTotalCssVars: {},
    columnsTotalTitleCssVars: {},
    props: {
        baseRowsSettings: { spaceBackgroundColor: '#ffffff' },
        columnsWidth
    },
    $genCssVarsStyle: (styles) =>
        Object.fromEntries(Object.entries(styles).map(([name, value]) => [`--w-${name}`, value])),
    genCellCssVarsStyle: PivotTable.methods.genCellCssVarsStyle
});

const getWidth = (styles) => styles['--w-width'];

const resolveRenderedCellStyle = (context, styles, cell) =>
    PivotTable.methods.resolveCellCssStyle.call(
        {
            props: { useZebra: false },
            zebraCssVars: {},
            getCellCssStyle: PivotTable.methods.getCellCssStyle.bind({
                cellsCssVars: styles,
                playerRows: context.playerRows
            }),
            $genCssVarsStyle: context.$genCssVarsStyle,
            genCellCssVarsStyle: context.genCellCssVarsStyle,
            getCellCssStyleByCondition: () => ({}),
            buildResizedCellStyleByIndexes: () => ({}),
            buildFixedFirstColumnStyle: () => ({})
        },
        { cell, index: 0 }
    );

test('nested column headers without row dimensions use the configured column width', () => {
    const context = createContext({ columnsWidth: '10rem' });
    const styles = PivotTable.computed.cellsCssVars.call(context);
    const getCellCssStyle = PivotTable.methods.getCellCssStyle.bind({ cellsCssVars: styles, playerRows: [] });

    assert.deepEqual(styles[CellsTypes.TITLE].map(getWidth), ['10rem', '10rem']);
    assert.deepEqual(styles[CellsTypes.COLUMN].map(getWidth), ['10rem', '10rem']);
    assert.deepEqual(styles[CellsTypes.VALUE_TITLE].map(getWidth), ['10rem']);
    assert.deepEqual(styles[CellsTypes.CELL].map(getWidth), ['10rem']);
    assert.equal(getWidth(getCellCssStyle({ type: CellsTypes.SPACE, level: 0 })), '10rem');
});

test('calculated row-header width remains independent from the configured column width', () => {
    const defaultStyles = PivotTable.computed.cellsCssVars.call(createContext({ columnsWidth: '150px' }));
    const rowContext = createContext({
        columnsWidth: '10rem',
        playerRows: [{ width: 'calc(12rem - 8px)' }]
    });
    const rowStyles = PivotTable.computed.cellsCssVars.call(rowContext);
    const getRowCellCssStyle = PivotTable.methods.getCellCssStyle.bind({
        cellsCssVars: rowStyles,
        playerRows: rowContext.playerRows
    });

    assert.deepEqual(defaultStyles[CellsTypes.TITLE].map(getWidth), ['150px', '150px']);
    assert.equal(getWidth(getRowCellCssStyle({ type: CellsTypes.ROW_TITLE, level: 0 })), 'calc(12rem - 8px)');
    assert.equal(getWidth(getRowCellCssStyle({ type: CellsTypes.SPACE, rowIndex: 0, level: 0 })), 'calc(12rem - 8px)');
    assert.equal(getWidth(getRowCellCssStyle({ type: CellsTypes.TITLE, level: 0 })), '10rem');
    assert.equal(getWidth(rowStyles[CellsTypes.COLUMN][0]), '10rem');
    assert.equal(getWidth(rowStyles[CellsTypes.CELL][0]), '10rem');
    assert.equal(
        getWidth(resolveRenderedCellStyle(rowContext, rowStyles, { type: CellsTypes.ROW_TITLE, level: 0 })),
        'calc(12rem - 8px)'
    );
    assert.equal(
        getWidth(resolveRenderedCellStyle(rowContext, rowStyles, { type: CellsTypes.TITLE, level: 0 })),
        '10rem'
    );
    assert.equal(
        getWidth(resolveRenderedCellStyle(rowContext, rowStyles, { type: CellsTypes.CELL, level: 0 })),
        '10rem'
    );
});

test('percentage column width stays independent from row width', () => {
    const context = createContext({
        columnsWidth: '15%',
        playerRows: [{ titleSettings: {}, width: '35%' }]
    });
    const styles = PivotTable.computed.cellsCssVars.call(context);

    assert.equal(getWidth(styles[CellsTypes.ROW][0]), '35%');
    assert.equal(getWidth(styles[CellsTypes.ROW_TITLE][0]), '35%');
    assert.equal(getWidth(styles[CellsTypes.SPACE][0]), '35%');
    assert.equal(getWidth(styles[CellsTypes.TOTAL_ROW][0]), '35%');
    assert.deepEqual(styles[CellsTypes.TITLE].map(getWidth), ['15%', '15%']);
    assert.deepEqual(styles[CellsTypes.COLUMN].map(getWidth), ['15%', '15%']);
    assert.deepEqual(styles[CellsTypes.VALUE_TITLE].map(getWidth), ['15%']);
    assert.deepEqual(styles[CellsTypes.CELL].map(getWidth), ['15%']);
    assert.deepEqual(styles[CellsTypes.TOTAL_COLUMN].map(getWidth), ['15%', '15%']);
    assert.deepEqual(styles[CellsTypes.TOTAL_SPACE].map(getWidth), ['15%', '15%']);
});

test('column widths preserve supported native CSS length tokens', () => {
    const widths = ['10%', '15%', '120px', '10rem', '10vw', '10vh', 'calc(10% + 20px)', 'calc(10vw - 8px)', ''];

    widths.forEach((columnsWidth) => {
        const context = createContext({ columnsWidth });
        const styles = PivotTable.computed.cellsCssVars.call(context);
        const expectedWidth = columnsWidth || undefined;

        assert.deepEqual(styles[CellsTypes.TITLE].map(getWidth), [expectedWidth, expectedWidth]);
        assert.deepEqual(styles[CellsTypes.COLUMN].map(getWidth), [expectedWidth, expectedWidth]);
        assert.deepEqual(styles[CellsTypes.CELL].map(getWidth), [expectedWidth]);
        assert.deepEqual(styles[CellsTypes.TOTAL_COLUMN].map(getWidth), [expectedWidth, expectedWidth]);
        assert.deepEqual(styles[CellsTypes.TOTAL_SPACE].map(getWidth), [expectedWidth, expectedWidth]);
    });
});

test('moving publisher to the first column retains data and the configured column width', () => {
    const tableModel = createTableModelAfterMovingPublisherToColumns();
    let tableRows;
    assert.doesNotThrow(() => {
        tableRows = generateTableCells(tableModel, workerRuntime);
    });

    assert.deepEqual(tableModel.rows, []);
    assert.equal(tableModel.columns[0].dataAlias, 'publisher');
    const headerRow = tableRows.find(({ cells }) => cells[0].type === CellsTypes.TITLE);
    const bodyRow = tableRows.find(({ cells }) => cells[0].type === CellsTypes.ROW);
    const totalRow = tableRows.find(({ cells }) => cells[0].type === CellsTypes.TOTAL_ROW);
    const context = createContext({ columnsWidth: '10rem' });
    const styles = PivotTable.computed.cellsCssVars.call(context);

    assert.equal(headerRow.cells[0].type, CellsTypes.TITLE);
    assert.equal(bodyRow.cells[0].type, CellsTypes.ROW);
    assert.equal(totalRow.cells[0].type, CellsTypes.TOTAL_ROW);
    assert.ok(bodyRow.cells.some(({ type }) => type === CellsTypes.CELL));
    assert.ok(totalRow.cells.some(({ type }) => type === CellsTypes.TOTAL_ROW_CELL));
    assert.ok(tableRows.every(({ cells }) => cells.length === 3));
    assert.equal(getWidth(resolveRenderedCellStyle(context, styles, headerRow.cells[0])), '10rem');
    assert.equal(getWidth(resolveRenderedCellStyle(context, styles, bodyRow.cells[0])), '10rem');
    assert.equal(
        getWidth(
            resolveRenderedCellStyle(
                context,
                styles,
                bodyRow.cells.find(({ type }) => type === CellsTypes.CELL)
            )
        ),
        '10rem'
    );
    assert.equal(getWidth(resolveRenderedCellStyle(context, styles, totalRow.cells[0])), '10rem');
    assert.equal(
        getWidth(
            resolveRenderedCellStyle(
                context,
                styles,
                totalRow.cells.find(({ type }) => type === CellsTypes.TOTAL_ROW_CELL)
            )
        ),
        '10rem'
    );
});
