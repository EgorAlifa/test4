const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '..', 'ElemPivotTable.vue'), 'utf8');
const start = source.indexOf('        updateStartedData() {');
const end = source.indexOf('        updateWidget() {', start);

assert.notEqual(start, -1);
assert.notEqual(end, -1);

const updateStartedData = new Function(
    'createMemoization',
    'formatNumber',
    `return ({${source.slice(start, end)}}).updateStartedData;`
)(() => undefined, () => undefined);

const createContext = (conditions) => ({
    _settingsRestored: true,
    tableMaps: null,
    tableRows: null,
    memoFormatNumber: null,
    conditionMetricsCache: null,
    collapsedRows: null,
    collapsedColumns: null,
    totalDataCache: null,
    pendingDefaultTotalsPromise: null,
    playerValues: [{ dataAlias: 'metric' }],
    playerConditionsFilters: [[]],
    playerFiltersValues: null,
    dimensions: [],
    isFirstInitTableMaps: true,
    resizedColumnsIndexes: null,
    resizedRowsIndexes: null,
    valueConditionsFilters: [conditions],
    updateConditionsFilters() {
        this.playerConditionsFilters = this.valueConditionsFilters.map((rules) => rules.map(({ uid }) => uid));
    },
    resetFilterValuesState() {}
});

test('restored modern conditional rules remain active through first-load initialization', () => {
    const context = createContext([{ uid: '11' }, { uid: '1' }]);
    updateStartedData.call(context);
    assert.deepEqual(context.playerConditionsFilters, [['11', '1']]);
});

test('restored legacy conditional rule identifiers remain active through first-load initialization', () => {
    const context = createContext([{ uid: 12 }]);
    updateStartedData.call(context);
    assert.deepEqual(context.playerConditionsFilters, [[12]]);
});
