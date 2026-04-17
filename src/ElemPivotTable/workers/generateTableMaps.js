/* eslint-disable no-undef */
import { runWorker } from './worker';

function generateTableMaps({
    isReplacingEmptyFields,
    replacingVoidValue,
    replacingNullValue,
    data,
    rows,
    filters,
    columns,
    isShownRowsSubtotals,
    isShownColumnsSubtotals,
    startIndex,
    updateRowsHeap = null,
    updateColumnsHeap = null,
    rowPath = []
} = {}) {
    const columnsNames = columns.map(({ dataAlias }) => dataAlias);
    const columnsSortAliases = columns.map(({ sortAlias }) => sortAlias);
    const rowsNames = rows.map(({ dataAlias }) => dataAlias);
    const rowsSortAliases = rows.map(({ sortAlias }) => sortAlias);
    const filtersNames = filters.map(({ dataAlias }) => dataAlias);

    const filterFields = rowsNames.concat(columnsNames).concat(filtersNames);

    const resolveFieldName = (name) => {
        if (!isReplacingEmptyFields || (name != null && name !== '')) {
            return name;
        }
        return name == null ? replacingNullValue : replacingVoidValue;
    };
    const createHeapLevel = () => ({
        rows: [],
        sort: null
    });

    // used mutation function for
    const updateHeap = ({
        path = [],
        heap,
        row,
        paths,
        collapsedPaths,
        names,
        rowIndex,
        sortAliases,
        isShownSubtotal
    }) => {
        const columnNames = [];
        (heap.rows = heap?.rows ?? []).push(rowIndex);
        for (let level = 0, heapLevel = heap; level < names.length; level++) {
            const name = resolveFieldName(row[names[level]]);

            if (name == null) {
                continue;
            }

            const realLevel = level;
            if (row[names[level + 1]] === undefined) {
                level = names.length - 1;
            }
            const isNew = heapLevel?.[name] == null;
            const isLast = level === names.length - 1;

            columnNames.push(name);

            if (path.every((pathName, pathLevel) => pathName === columnNames?.[pathLevel]) && path.length <= level) {
                heapLevel[name] = isNew ? createHeapLevel() : heapLevel?.[name];
                heapLevel[name].rows.push(rowIndex);
                heapLevel[name].sort = row?.[sortAliases?.[realLevel]] ?? null;
                if (isNew && (isLast || isShownSubtotal)) {
                    paths.push(columnNames.map((_) => _));
                }
                if (isNew && !isLast) {
                    collapsedPaths.push(columnNames.map((_) => _));
                }
            }
            heapLevel = heapLevel[name];
        }
    };

    const checkIfARowContainsNull = (row) => filterFields.some((field) => row[field] === null);
    return data.reduce(
        (curMap, row, rowIndex) => {
            if (!isReplacingEmptyFields && checkIfARowContainsNull(row)) {
                return curMap;
            }
            const { rowsHeap, columnsHeap, columnsPaths, rowsPaths, collapsedColumnsPaths, collapsedRowsPaths } =
                curMap;

            updateHeap({
                heap: columnsHeap,
                row,
                paths: columnsPaths,
                names: columnsNames,
                rowIndex: rowIndex + startIndex,
                collapsedPaths: collapsedColumnsPaths,
                sortAliases: columnsSortAliases,
                isShownSubtotal: isShownColumnsSubtotals
            });
            updateHeap({
                path: rowPath,
                heap: rowsHeap,
                row,
                paths: rowsPaths,
                names: rowsNames,
                rowIndex: rowIndex + startIndex,
                collapsedPaths: collapsedRowsPaths,
                sortAliases: rowsSortAliases,
                isShownSubtotal: isShownRowsSubtotals
            });

            return {
                rowsHeap,
                columnsHeap,
                columnsPaths,
                rowsPaths,
                collapsedColumnsPaths,
                collapsedRowsPaths
            };
        },
        {
            rowsHeap: updateRowsHeap ?? { count: 0 },
            columnsHeap: updateColumnsHeap ?? { count: 0 },
            valuesMap: {},
            columnsPaths: [],
            rowsPaths: [],
            subtitlesHeap: {},
            collapsedColumnsPaths: [],
            collapsedRowsPaths: []
        }
    );
}

export const asyncGenerateTableMaps = (message) =>
    runWorker({
        func: generateTableMaps,
        message
    });
