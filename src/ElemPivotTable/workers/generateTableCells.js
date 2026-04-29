import { runWorker } from './worker';

function generateTableCells(
    {
        metrics,
        columnSortOptions,
        isUsedIndexes,
        isShownColumnsTotal,
        columnsTotalPosition,
        isShownRowTotal,
        rowTotalPosition,
        rowsHeap,
        columnsHeap,
        columnsPaths,
        rowsPaths,
        rows,
        rowsHeight,
        titleHeight,
        indexesHeight,
        columns,
        valuesData,
        isShownRowsSubtotals = false,
        isBottomSubtotal = true,
        collapsedRows = [],
        collapsedColumns = [],
        data,
        resizedColumnsIndexes,
        resizedRowsIndexes,
        rowMinHeight,
        isShownHead = true,
        columnsTotalHeap = null,
        rowsTotalHeap = null,
        tableDrawType = null,
        metricsPosition = null,
        rowTotalData,
        columnTotalData,
        isDatasetTotalAggregation,
        rowTotalsMap = {},
        columnTotalsMap = {}
    },
    { config, constants, utils }
) {
    const rowsCount = Object.keys(rowsPaths).length;
    const columnsCount = Object.keys(columnsPaths).length;
    const isStartedTotalColumnPositionStart = rowTotalPosition === constants.TotalPositions.START;
    const isStartedTotalRowPositionStart = columnsTotalPosition === constants.TotalPositions.START;
    const canShownTotalColumn = isShownRowTotal || columnsCount === 0 || columns.length === 0;
    const canShownTotalRow = isShownColumnsTotal || rowsCount === 0 || rows.length === 0;
    const expressionMetricsAliases = utils.buildArgsAliases(metrics);
    const resizedRowsAliases = Object.fromEntries(resizedRowsIndexes);
    const resizedColumnsAliases = Object.fromEntries(resizedColumnsIndexes);

    if (columns.length + rows.length + valuesData.length === 0) {
        return [];
    }

    const getHeapNodeByPath = ({ heap, path }) => {
        let heapLevel = heap;
        path.forEach((key) => {
            heapLevel = heapLevel?.[key];
        });
        return heapLevel;
    };
    const getHeapNodeRowsByPath = ({ heap, path }) => getHeapNodeByPath({ heap, path })?.rows ?? [];
    const getHeapNodeSortByPath = ({ heap, path }) => getHeapNodeByPath({ heap, path })?.sort;

    const strToFloat = (str) => parseFloat(`${str}`.replace(/\s/gi, '').replace(',', '.'));
    const buildCellValue = ({
        metricType,
        aggregate,
        dataAlias,
        equalIndexes,
        calculatedCell,
        isCalculated,
        expression,
        usedRows = data
    }) => {
        const dataMapperByName = (name) => equalIndexes.map((index) => usedRows[index][name]);
        const {
            isUsed: isUsedMoreAliases,
            dataAlias: additionalAlias,
            aggregate: additionalAggregate,
            method
        } = calculatedCell;
        if (isCalculated) {
            const exp = utils.buildExpression(expression, expressionMetricsAliases);
            const args = Object.fromEntries(
                metrics.map((name) => [expressionMetricsAliases[name], dataMapperByName(name)])
            );
            return utils.calculate(exp, { ...args, ...config.AggregateMethodFunction });
        }
        if (metricType === constants.MetricType.CUSTOM) {
            const customMetricName = `${aggregate}(${dataAlias})`;
            const isCustomMetricNameExists = usedRows.some((row) =>
                Object.prototype.hasOwnProperty.call(row ?? {}, customMetricName)
            );
            return config.AggregateMethodFunction[constants.QueryAggregateFunctionName.SUM](
                dataMapperByName(isCustomMetricNameExists ? customMetricName : dataAlias)
            );
        }
        const value = config.AggregateMethodFunction[aggregate](dataMapperByName(dataAlias));
        if (!isUsedMoreAliases || additionalAlias === '') {
            return value;
        }

        return config.CalculatedCellAggregateMethodFunction[method](
            value,
            config.AggregateMethodFunction[additionalAggregate](dataMapperByName(additionalAlias))
        );
    };

    const resolveCellEqualIndexes = ({
        rowPathParts,
        columnPathParts,
        anotherColumnsHeap = null,
        anotherRowsHeap = null
    } = {}) => {
        const rowIndexes = getHeapNodeRowsByPath({ heap: anotherRowsHeap ?? rowsHeap, path: rowPathParts });
        const columnIndexes = getHeapNodeRowsByPath({ heap: anotherColumnsHeap ?? columnsHeap, path: columnPathParts });
        if (rowPathParts.length === 0) {
            return columnIndexes;
        }
        if (columnPathParts.length === 0) {
            return rowIndexes;
        }

        return utils.findIntesection(rowIndexes, columnIndexes);
    };

    const buildSortedPathsIndexes = ({
        paths = [],
        heap,
        levelsOptions = [],
        columnOptions = { isUsed: false, path: null, valueLevel: 0, isDesc: false, isTotal: false }
    } = {}) => {
        if (paths.length === 0) {
            return [];
        }
        const pathsEntries = Object.entries(paths);
        if (pathsEntries.length === 0) {
            return [];
        }
        const levels = rows.length;

        for (let level = 0; level < levels; level++) {
            pathsEntries.sort(([aliasKey1, path1], [aliasKey2, path2]) => {
                for (let i = 0; i < level; i++) {
                    if (path1[i] !== path2[i] || path1?.[i] == null || path2?.[i] == null) {
                        return 0;
                    }
                }
                if (path1[level] == null) {
                    return isBottomSubtotal ? 1 : -1;
                }
                if (path2[level] == null) {
                    return isBottomSubtotal ? -1 : 1;
                }
                if (path1[level] === constants.LOADER_COLUMN_KEY) {
                    return 1;
                }
                if (path2[level] === constants.LOADER_COLUMN_KEY) {
                    return -1;
                }
                if (level === levels - 1 && columnOptions.isUsed) {
                    const { path, valueLevel, isDesc } = columnOptions;
                    const resultTrue = isDesc === true ? -1 : 1;
                    const resultFalse = isDesc === true ? 1 : -1;

                    const path1Val = buildCellValue({
                        ...valuesData[valueLevel],
                        equalIndexes: columnOptions?.isTotal
                            ? getHeapNodeRowsByPath({ path: path1, heap })
                            : resolveCellEqualIndexes({ rowPathParts: path1, columnPathParts: path })
                    });

                    const path2Val = buildCellValue({
                        ...valuesData[valueLevel],
                        equalIndexes: columnOptions?.isTotal
                            ? getHeapNodeRowsByPath({ path: path2, heap })
                            : resolveCellEqualIndexes({ rowPathParts: path2, columnPathParts: path })
                    });

                    return path1Val > path2Val ? resultTrue : resultFalse;
                }
                const { sortDesc = false, valueType, sortDataType } = levelsOptions?.[level] ?? {};
                const resultTrue = sortDesc === true ? -1 : 1;
                const resultFalse = sortDesc === true ? 1 : -1;
                const agrFunc = config.CellSortTypeFunctions[sortDataType];
                const sort1Val = getHeapNodeSortByPath({ heap, path: path1.slice(0, level + 1) });
                const sort2Val = getHeapNodeSortByPath({ heap, path: path2.slice(0, level + 1) });
                const typesSort1Val = sort1Val == null ? null : agrFunc(sort1Val);
                const typesSort2Val = sort2Val == null ? null : agrFunc(sort2Val);
                const curPath1Sort = typesSort1Val ?? path1[level];
                const curPath2Sort = typesSort2Val ?? path2[level];

                if (valueType === constants.ValueType.NUMBER) {
                    return strToFloat(path1[level]) > strToFloat(path2[level]) ? resultTrue : resultFalse;
                }

                return curPath1Sort > curPath2Sort ? resultTrue : resultFalse;
            });
        }
        return pathsEntries.map((val) => val[0]);
    };

    const isDrawTypeTable = tableDrawType === constants.TableDrawTypes?.TABLE || tableDrawType == null;
    const isMetricsInRows = metricsPosition === constants.MetricsPosition?.ROWS;
    const useDrawTypeTableView = isDrawTypeTable && isMetricsInRows;
    const getRowTotals = (rowPathParts = []) => {
        const key = rowPathParts.join('.');
        const rowTotals = { ...rowTotalsMap?.[key] };
        const defaultTotal = Object.keys(rowTotals.rowTotalData?.[0] ?? {}).reduce(
            (acc, name) => ({ ...acc, [name]: 0 }),
            {}
        );

        const containsAllPathParts = (row) => {
            const valueCount = Object.values(row).reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});

            const requiredCount = rowPathParts.reduce((acc, part) => {
                acc[part] = (acc[part] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(requiredCount).every(([value, count]) => (valueCount[value] || 0) >= count);
        };

        if (Object.values(rowTotals).length === 0) {
            const rowTotalsDefault = { ...(rowTotalsMap?.default ?? {}) };
            rowTotalsDefault.rowTotalData = [rowTotalsDefault.rowTotalData?.find(containsAllPathParts) ?? defaultTotal];
            return rowTotalsDefault;
        }
        rowTotals.rowTotalData = [rowTotals.rowTotalData?.find(containsAllPathParts) ?? defaultTotal];
        return rowTotals ?? {};
    };
    const getColumnTotals = (rowPathParts = []) => {
        const key = rowPathParts.slice(0, -1).join('.');
        const columnTotals = { ...columnTotalsMap?.[key] };
        const defaultTotal = Object.keys(columnTotals.columnTotalData?.[0] ?? {}).reduce(
            (acc, name) => ({ ...acc, [name]: 0 }),
            {}
        );

        const containsAllPathParts = (row) => {
            const valueCount = Object.values(row).reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});

            const requiredCount = rowPathParts.reduce((acc, part) => {
                acc[part] = (acc[part] || 0) + 1;
                return acc;
            }, {});

            return Object.entries(requiredCount).every(([value, count]) => (valueCount[value] || 0) >= count);
        };

        if (Object.values(columnTotals).length === 0) {
            if (isMetricsInRows) {
                return columnTotalsMap.default;
            }

            const columnTotalsDefault = { ...(columnTotalsMap?.default ?? {}) };
            columnTotalsDefault.columnTotalData = [
                columnTotalsDefault.columnTotalData?.find(containsAllPathParts) ?? defaultTotal
            ];
            return columnTotalsDefault;
        }
        columnTotals.columnTotalData = [columnTotals.columnTotalData?.find(containsAllPathParts) ?? defaultTotal];
        return columnTotals ?? {};
    };

    function createCell({
        type,
        equalIndexes,
        valueOptions,
        level,
        useDatasetAggregation = false,
        totalsRowData = null,
        totalsColumnData = null
    }) {
        let usedRows = data;
        if (useDatasetAggregation) {
            const safeEqualIndexes = Array.isArray(equalIndexes) && equalIndexes.length > 0 ? equalIndexes : [0];
            if (type === constants.CellsTypes.TOTAL_CELL) {
                usedRows = totalsColumnData ?? columnTotalData ?? [];
                equalIndexes = [safeEqualIndexes[0]];
            } else if (type === constants.CellsTypes.TOTAL_ROW_CELL) {
                usedRows = totalsRowData ?? rowTotalData ?? [];
                equalIndexes = [0];
            } else {
                equalIndexes = safeEqualIndexes;
            }
        }
        return utils.createCell({
            type,
            level,
            value: buildCellValue({ ...valueOptions, equalIndexes, usedRows })
        });
    }

    function buildAggregatedCells(
        equalIndexes,
        cellType,
        useDatasetAggregation = false,
        { totalsRowData = null, totalsColumnData = null } = {}
    ) {
        const cells = valuesData.map((valueOptions, level) =>
            createCell({
                type: cellType,
                equalIndexes,
                valueOptions,
                level,
                useDatasetAggregation,
                totalsRowData,
                totalsColumnData
            })
        );
        // Для табличного режима и когда метрики в строках не дублируем значения по метрикам только для тоталов
        if (
            !useDrawTypeTableView ||
            (cellType !== constants.CellsTypes.TOTAL_CELL && cellType !== constants.CellsTypes.TOTAL_ROW_CELL)
        ) {
            return cells;
        }
        if (cells.length > 0) {
            return [cells[0]];
        }
        return [];
    }
    function buildRowByPath({
        rowPathParts,
        columnPathParts,
        cellType = constants.CellsTypes.CELL,
        anotherColumnsHeap = null,
        anotherRowsHeap = null,
        useDatasetAggregation = false,
        totalsRowData = null,
        totalsColumnData = null
    } = {}) {
        return buildAggregatedCells(
            resolveCellEqualIndexes({ rowPathParts, columnPathParts, anotherColumnsHeap, anotherRowsHeap }),
            cellType,
            useDatasetAggregation,
            { totalsRowData, totalsColumnData }
        );
    }

    function buildSingleValueCellByPath({
        rowPathParts,
        columnPathParts,
        valueIndex,
        cellType = constants.CellsTypes.CELL,
        anotherColumnsHeap = null,
        anotherRowsHeap = null,
        useDatasetAggregation = false
    } = {}) {
        const valueOptions = valuesData[valueIndex];
        const columnTotal = cellType === constants.CellsTypes.TOTAL_CELL ? getColumnTotals(rowPathParts) : {};
        const { rowTotalData: scopedRowTotalData } =
            cellType === constants.CellsTypes.TOTAL_ROW_CELL ? getRowTotals(rowPathParts) : {};
        const equalIndexes = resolveCellEqualIndexes({
            rowPathParts,
            columnPathParts,
            anotherColumnsHeap,
            anotherRowsHeap
        });
        return createCell({
            type: cellType,
            equalIndexes,
            level: valueIndex,
            valueOptions,
            useDatasetAggregation,
            totalsRowData:
                scopedRowTotalData ?? (cellType === constants.CellsTypes.TOTAL_ROW_CELL ? rowTotalData : null),
            totalsColumnData:
                columnTotal.columnTotalData ?? (cellType === constants.CellsTypes.TOTAL_CELL ? columnTotalData : null)
        });
    }

    function createCollapsedPaths({ collapseMap, sortedMap, paths }) {
        const used = [];
        return sortedMap.reduce((acc, pathIndex) => {
            const collapseIndex = collapseMap.pathToCollapse?.[pathIndex];
            if (used.includes(collapseIndex)) {
                return acc;
            }
            const collapsePath = collapseMap.sortedCollapsedPaths?.[collapseIndex];
            if (collapseIndex != null) {
                used.push(collapseIndex);
                acc.push(collapsePath);
                return acc;
            }
            acc.push(paths[pathIndex]);
            return acc;
        }, []);
    }
    function buildCollapsedPathsIndexes({ paths, collapsedPaths, heap }) {
        const sortedCollapsedPaths = buildSortedPathsIndexes({
            paths: collapsedPaths.map((path, key) => [key, path]),
            heap
        })
            .map((key) => collapsedPaths[key])
            .sort((path1, path2) => path1.length - path2.length);
        const { front: pathToCollapse, reverse: collapseToPath } = paths.reduce(
            ({ front, reverse }, path, index) => {
                const findCollapsedPathIndex = sortedCollapsedPaths.findIndex((collapsedPath) =>
                    collapsedPath.every((name, level) => name === path[level])
                );
                if (findCollapsedPathIndex === -1) {
                    return {
                        front,
                        reverse
                    };
                }
                front[index] = findCollapsedPathIndex;
                if (reverse?.[findCollapsedPathIndex] == null) {
                    reverse[findCollapsedPathIndex] = [];
                }
                reverse[findCollapsedPathIndex].push(index);
                return {
                    front,
                    reverse
                };
            },
            { front: {}, reverse: {} }
        );
        return {
            sortedCollapsedPaths,
            pathToCollapse,
            collapseToPath
        };
    }

    function buildHeader(columnsCollapsedPaths) {
        const result = columns.reduce((resultRows, { title, height }, level) => {
            const titleCells = (rows.length === 0 ? [0] : rows).map((__, index) =>
                utils.createCell({
                    type: index === 0 ? constants.CellsTypes.TITLE : constants.CellsTypes.SPACE,
                    value: index === 0 ? title : null,
                    rowIndex: index,
                    level
                })
            );
            let offsetCell = null;
            let namesCells = [];
            let totalCells = [];

            if (useDrawTypeTableView) {
                // Меняем оси: возвращаем одну колонку Итого (не дублируем по метрикам)
                offsetCell = utils.createCell({ type: constants.CellsTypes.TOTAL_SPACE, level });
                const valuesLoopItems = [null];
                namesCells = columnsCollapsedPaths.flatMap((columnPathParts) =>
                    valuesLoopItems.map((__unusedVal, valueDataIndex) =>
                        utils.createCell({
                            type: constants.CellsTypes.COLUMN,
                            level,
                            path: columnPathParts.slice(0, level + 1),
                            value: columnPathParts[level],
                            hasBeenCollapsed:
                                true &&
                                level < columns.length - 1 &&
                                !columns
                                    .slice(0, level + 1)
                                    .every(
                                        (__, colLevel) =>
                                            columnsCollapsedPaths[colLevel - 1] === columnPathParts?.[colLevel]
                                    )
                        })
                    )
                );
                totalCells = canShownTotalColumn
                    ? [
                          utils.createCell({
                              level,
                              value: level === 0 ? 'Итого' : null,
                              type: constants.CellsTypes.TOTAL_COLUMN
                          })
                      ]
                    : [];
            } else {
                namesCells = columnsCollapsedPaths.flatMap((columnPathParts) =>
                    (valuesData.length > 0 ? valuesData : [{}]).map((__unusedVal, valueDataIndex) =>
                        utils.createCell({
                            type: constants.CellsTypes.COLUMN,
                            level,
                            path: columnPathParts.slice(0, level + 1),
                            value: columnPathParts[level],
                            hasBeenCollapsed:
                                valueDataIndex === 0 &&
                                level < columns.length - 1 &&
                                !columns
                                    .slice(0, level + 1)
                                    .every(
                                        (_, colLevel) =>
                                            columnsCollapsedPaths[colLevel - 1] === columnPathParts?.[colLevel]
                                    )
                        })
                    )
                );
                totalCells = canShownTotalColumn
                    ? valuesData.map((__unusedVal, valueDataIndex) =>
                          utils.createCell({
                              level,
                              value: valueDataIndex === 0 && level === 0 ? 'Итого' : null,
                              type: constants.CellsTypes.TOTAL_COLUMN
                          })
                      )
                    : [];
            }
            resultRows.push({
                id: level,
                size:
                    resizedColumnsAliases[level + (isUsedIndexes ? 1 : 0)] != null
                        ? Math.max(resizedColumnsAliases[level + (isUsedIndexes ? 1 : 0)], rowMinHeight)
                        : height,
                cells: (() => {
                    if (useDrawTypeTableView) {
                        const beforeTotal = isStartedTotalColumnPositionStart ? totalCells : [];
                        const afterTotal = isStartedTotalColumnPositionStart ? [] : totalCells;
                        return titleCells.concat([offsetCell]).concat(beforeTotal).concat(namesCells).concat(afterTotal);
                    }
                    const before = isStartedTotalColumnPositionStart ? totalCells : [];
                    const after = isStartedTotalColumnPositionStart ? [] : totalCells;
                    return titleCells.concat(before).concat(namesCells).concat(after);
                })()
            });

            return resultRows;
        }, []);

        const rowsTitles = (rows.length === 0 ? [0] : rows).map(({ title = null }, level) =>
            utils.createCell({
                type: rows.length === 0 ? constants.CellsTypes.SPACE : constants.CellsTypes.ROW_TITLE,
                level,
                value: title
            })
        );
        let valuesCells = [];
        let offsetCellSecond = null;
        let totalCellsSecondItems = [];
        if (useDrawTypeTableView) {
            // Строка значений пустая; слева от столбцов добавляем отступ. Вторая строка для тотал-колонки не нужна
            valuesCells = columnsCollapsedPaths.map(() => utils.createCell({ type: constants.CellsTypes.TOTAL_SPACE }));
            offsetCellSecond = utils.createCell({ type: constants.CellsTypes.TOTAL_COLUMN });
            totalCellsSecondItems = canShownTotalColumn
                ? [
                      utils.createCell({
                          level: 0,
                          value: null,
                          type: constants.CellsTypes.TOTAL_SPACE
                      })
                  ]
                : [];
        } else {
            valuesCells = columnsCollapsedPaths.flatMap((columnPathParts) =>
                valuesData.map(({ title }, level) =>
                    utils.createCell({
                        type: constants.CellsTypes.VALUE_TITLE,
                        level,
                        path: columnPathParts,
                        value: title
                    })
                )
            );
            totalCellsSecondItems = canShownTotalColumn
                ? valuesData.map(({ title }, level) =>
                      utils.createCell({
                          level,
                          value: title,
                          type: constants.CellsTypes.TOTAL_VALUE_TITLE
                      })
                  )
                : [];
        }
        result.push({
            id: result.length,
            size: titleHeight,
            cells: (() => {
                const before = isStartedTotalColumnPositionStart ? totalCellsSecondItems : [];
                const after = isStartedTotalColumnPositionStart ? [] : totalCellsSecondItems;
                if (useDrawTypeTableView) {
                    return rowsTitles.concat(before).concat([offsetCellSecond]).concat(valuesCells).concat(after);
                }
                return rowsTitles.concat(before).concat(valuesCells).concat(after);
            })()
        });
        return result;
    }

    function buildBody({
        startId,
        rowCollapsedPaths,
        columnsCollapsedPaths,
        checkCollapsed = true,
        rowCellType = constants.CellsTypes.ROW,
        valuesCellType = constants.CellsTypes.CELL
    }) {
        const bodyRows = useDrawTypeTableView
            ? rowCollapsedPaths.flatMap((rowPathParts, index) => {
                  const idBase = startId + index;
                  return valuesData.map((metricSettings, metricIndex) => ({
                      id: idBase + metricIndex / 1000,
                      size:
                          resizedRowsAliases[idBase + (isUsedIndexes ? 1 : 0)] != null
                              ? Math.max(resizedRowsAliases[idBase + (isUsedIndexes ? 1 : 0)], rowMinHeight)
                              : rowsHeight,
                      cells: (rows.length > 0 ? rows : [0])
                          .map((__unused, level, cur) => {
                              const hasBeenCollapsed =
                                  checkCollapsed &&
                                  level < cur.length - 1 &&
                                  !cur
                                      .slice(0, level + 1)
                                      .every(
                                          (__unusedEvery, rowLevel) =>
                                              rowCollapsedPaths?.[index - 1]?.[rowLevel] === rowPathParts?.[rowLevel]
                                      );

                              const isNextHasBeenCollapsed =
                                  checkCollapsed &&
                                  level < cur.length - 1 &&
                                  (rowCollapsedPaths?.[index + 1] === null ||
                                      !cur
                                          .slice(0, level + 1)
                                          .every(
                                              (__unusedEvery, rowLevel) =>
                                                  rowCollapsedPaths?.[index + 1]?.[rowLevel] ===
                                                  rowPathParts?.[rowLevel]
                                          ));
                              const isSubtotalRow =
                                  isShownRowsSubtotals &&
                                  ((!isBottomSubtotal && hasBeenCollapsed) ||
                                      (isBottomSubtotal && isNextHasBeenCollapsed));

                              const baseValue = rowPathParts?.[level];
                              const totalValue =
                                  isShownRowsSubtotals &&
                                  isBottomSubtotal &&
                                  !hasBeenCollapsed &&
                                  isNextHasBeenCollapsed &&
                                  baseValue != null
                                      ? `${baseValue} итого`
                                      : null;

                              const isLoader = baseValue === constants.LOADER_COLUMN_KEY;
                              const loaderValue = isLoader ? 'Загрузить еще' : null;
                              if (rowCellType === constants.CellsTypes.TOTAL_CELL) {
                                  return utils.createCell({
                                      type: isSubtotalRow ? constants.CellsTypes.SUBTOTAL_ROW : rowCellType,
                                      level,
                                      hasBeenCollapsed,
                                      path: rowPathParts.slice(0, level + (isLoader ? 0 : 1)),
                                      value: loaderValue ?? totalValue ?? baseValue,
                                      isLoader
                                  });
                              }
                              return utils.createCell({
                                  type: isSubtotalRow ? constants.CellsTypes.SUBTOTAL_ROW : rowCellType,
                                  level,
                                  hasBeenCollapsed,
                                  path: rowPathParts.slice(0, level + (isLoader ? 0 : 1)),
                                  value: loaderValue ?? totalValue ?? baseValue,
                                  isLoader
                              });
                          })
                          // Новая колонка "Значения" с названием метрики (идёт перед Итого)
                          .concat([
                              utils.createCell({
                                  type: constants.CellsTypes.VALUE_TITLE,
                                  level: metricIndex,
                                  value: metricSettings?.title ?? null
                              })
                          ])
                          // Столбец Итого: позиция зависит от isStartedTotalColumnPositionStart
                          .concat(
                              (() => {
                                  if (!canShownTotalColumn || !isStartedTotalColumnPositionStart) {
                                      return [];
                                  }
                                  const perMetricTotalCell = buildSingleValueCellByPath({
                                      rowPathParts,
                                      columnPathParts: [],
                                      valueIndex: metricIndex,
                                      cellType: constants.CellsTypes.TOTAL_CELL,
                                      anotherRowsHeap: isDatasetTotalAggregation ? rowsTotalHeap : null,
                                      useDatasetAggregation: isDatasetTotalAggregation
                                  });
                                  return [perMetricTotalCell];
                              })()
                          )
                          .concat(
                              columnsCollapsedPaths.map((columnPathParts) =>
                                  buildSingleValueCellByPath({
                                      rowPathParts,
                                      columnPathParts,
                                      valueIndex: metricIndex,
                                      cellType: valuesCellType
                                  })
                              )
                          )
                          .concat(
                              (() => {
                                  if (!canShownTotalColumn || isStartedTotalColumnPositionStart) {
                                      return [];
                                  }
                                  const perMetricTotalCell = buildSingleValueCellByPath({
                                      rowPathParts,
                                      columnPathParts: [],
                                      valueIndex: metricIndex,
                                      cellType: constants.CellsTypes.TOTAL_CELL,
                                      anotherRowsHeap: isDatasetTotalAggregation ? rowsTotalHeap : null,
                                      useDatasetAggregation: isDatasetTotalAggregation
                                  });
                                  return [perMetricTotalCell];
                              })()
                          )
                  }));
              })
            : rowCollapsedPaths.map((rowPathParts, index) => {
                  const id = startId + index;
                  const { columnTotalData: scopedColumnTotalData, columnsTotalHeap: scopedColumnsTotalHeap } =
                      getColumnTotals(rowPathParts);
                  const totalCol = canShownTotalColumn
                      ? buildRowByPath({
                            rowPathParts,
                            columnPathParts: [],
                            cellType: constants.CellsTypes.TOTAL_CELL,
                            anotherRowsHeap:
                                isDatasetTotalAggregation && scopedColumnsTotalHeap
                                    ? scopedColumnsTotalHeap
                                    : isDatasetTotalAggregation
                                    ? rowsTotalHeap
                                    : null,
                            useDatasetAggregation: isDatasetTotalAggregation,
                            totalsColumnData: scopedColumnTotalData ?? columnTotalData
                        })
                      : [];
                  return {
                      id,
                      size:
                          resizedRowsAliases[id + (isUsedIndexes ? 1 : 0)] != null
                              ? Math.max(resizedRowsAliases[id + (isUsedIndexes ? 1 : 0)], rowMinHeight)
                              : rowsHeight,
                      cells: (rows.length > 0 ? rows : [0])
                          .map((__unused, level, cur) => {
                              const hasBeenCollapsed =
                                  checkCollapsed &&
                                  level < cur.length - 1 &&
                                  !cur
                                      .slice(0, level + 1)
                                      .every(
                                          (_, rowLevel) =>
                                              rowCollapsedPaths?.[index - 1]?.[rowLevel] === rowPathParts?.[rowLevel]
                                      );

                              const isNextHasBeenCollapsed =
                                  checkCollapsed &&
                                  level < cur.length - 1 &&
                                  (rowCollapsedPaths?.[index + 1] === null ||
                                      !cur
                                          .slice(0, level + 1)
                                          .every(
                                              (_, rowLevel) =>
                                                  rowCollapsedPaths?.[index + 1]?.[rowLevel] ===
                                                  rowPathParts?.[rowLevel]
                                          ));
                              const isSubtotalRow =
                                  isShownRowsSubtotals &&
                                  ((!isBottomSubtotal && hasBeenCollapsed) ||
                                      (isBottomSubtotal && isNextHasBeenCollapsed));

                              const baseValue = rowPathParts?.[level];
                              const totalValue =
                                  isShownRowsSubtotals &&
                                  isBottomSubtotal &&
                                  !hasBeenCollapsed &&
                                  isNextHasBeenCollapsed &&
                                  baseValue != null
                                      ? `${baseValue} итого`
                                      : null;

                              const isLoader = baseValue === constants.LOADER_COLUMN_KEY;
                              const loaderValue = isLoader ? 'Загрузить еще' : null;
                              if (rowCellType === constants.CellsTypes.TOTAL_CELL) {
                                  return utils.createCell({
                                      type: isSubtotalRow ? constants.CellsTypes.SUBTOTAL_ROW : rowCellType,
                                      level,
                                      hasBeenCollapsed,
                                      path: rowPathParts.slice(0, level + (isLoader ? 0 : 1)),
                                      value: loaderValue ?? totalValue ?? baseValue,
                                      isLoader
                                  });
                              }
                              return utils.createCell({
                                  type: isSubtotalRow ? constants.CellsTypes.SUBTOTAL_ROW : rowCellType,
                                  level,
                                  hasBeenCollapsed,
                                  path: rowPathParts.slice(0, level + (isLoader ? 0 : 1)),
                                  value: loaderValue ?? totalValue ?? baseValue,
                                  isLoader
                              });
                          })
                          .concat(isStartedTotalColumnPositionStart ? totalCol : [])
                          .concat(
                              columnsCollapsedPaths.flatMap((columnPathParts) =>
                                  buildRowByPath({ rowPathParts, columnPathParts, cellType: valuesCellType })
                              )
                          )
                          .concat(!isStartedTotalColumnPositionStart ? totalCol : [])
                  };
              });
        if (!canShownTotalRow) {
            return bodyRows;
        }
        if (!useDrawTypeTableView) {
            const grandTotal = canShownTotalColumn
                ? buildRowByPath({
                      rowPathParts: [],
                      columnPathParts: [],
                      cellType: constants.CellsTypes.TOTAL_ROW_CELL,
                      anotherColumnsHeap: columnsTotalHeap,
                      useDatasetAggregation: isDatasetTotalAggregation
                  })
                : [];
            const totalRow = {
                id: startId + bodyRows.length,
                size: rowsHeight,
                cells: (rows.length > 0 ? rows : [0])
                    .map((_, level) =>
                        utils.createCell({
                            type: constants.CellsTypes.TOTAL_ROW,
                            level,
                            value: level === 0 ? 'Итого' : null
                        })
                    )
                    .concat(isStartedTotalColumnPositionStart ? grandTotal : [])
                    .concat(
                        columnsCollapsedPaths.flatMap((columnPathParts) =>
                            buildRowByPath({
                                rowPathParts: [],
                                columnPathParts,
                                cellType: constants.CellsTypes.TOTAL_ROW_CELL,
                                anotherColumnsHeap: columnsTotalHeap
                            })
                        )
                    )
                    .concat(isStartedTotalColumnPositionStart ? [] : grandTotal)
            };
            return isStartedTotalRowPositionStart ? [totalRow].concat(bodyRows) : bodyRows.concat([totalRow]);
        }

        // Итоги построчно по метрикам; "Итого" в верхней строке
        const metricTotalsRows = valuesData.map((metricSettings, metricIndex) => {
            const headerCells = (rows.length > 0 ? rows : [0]).map((_, level) =>
                utils.createCell({
                    type: constants.CellsTypes.TOTAL_ROW,
                    level,
                    value: level === 0 && metricIndex === 0 ? 'Итого' : null
                })
            );
            const { columnTotalData: scopedColumnTotalData, columnsTotalHeap: scopedColumnsTotalHeap } =
                getColumnTotals([]);
            const totalColCell = canShownTotalColumn
                ? buildSingleValueCellByPath({
                      rowPathParts: [],
                      columnPathParts: [],
                      valueIndex: metricIndex,
                      cellType: constants.CellsTypes.TOTAL_ROW_CELL,
                      anotherColumnsHeap:
                          isDatasetTotalAggregation && scopedColumnsTotalHeap
                              ? scopedColumnsTotalHeap
                              : isDatasetTotalAggregation
                              ? columnsTotalHeap
                              : null,
                      useDatasetAggregation: isDatasetTotalAggregation,
                      totalsColumnData: scopedColumnTotalData ?? columnTotalData
                  })
                : null;
            // В строчных итогах порядок как в теле: «Значения» затем «Итого»   
            const before = [
                utils.createCell({
                    type: constants.CellsTypes.TOTAL_VALUE_TITLE,
                    level: metricIndex,
                    // помечаем как «колоночный» заголовок для сортировок/дропдауна
                    rowIndex: 0,
                    path: [],
                    value: metricSettings?.title ?? null
                }),
                ...(canShownTotalColumn && isStartedTotalColumnPositionStart ? [totalColCell] : [])
            ];
            const after = canShownTotalColumn && !isStartedTotalColumnPositionStart ? [totalColCell] : [];
            const valueTitleCell = null;
            const cellsByColumns = columnsCollapsedPaths.map((columnPathParts) =>
                buildSingleValueCellByPath({
                    rowPathParts: [],
                    columnPathParts,
                    valueIndex: metricIndex,
                    cellType: constants.CellsTypes.TOTAL_ROW_CELL,
                    anotherColumnsHeap: columnsTotalHeap
                })
            );
            return {
                id: startId + bodyRows.length + metricIndex,
                size: rowsHeight,
                cells: headerCells.concat(before).concat(cellsByColumns).concat(after)
            };
        });
        return isStartedTotalRowPositionStart ? metricTotalsRows.concat(bodyRows) : bodyRows.concat(metricTotalsRows);
    }

    function appendIndexes({ tableRows }) {
        if (!isUsedIndexes) {
            return;
        }
        tableRows.unshift({
            id: -1,
            size: indexesHeight,
            cells: tableRows[0].cells.map((_, index) =>
                utils.createCell({
                    type: constants.CellsTypes.COLUMN_INDEX,
                    level: index,
                    value: index + 1
                })
            )
        });
        tableRows.forEach(({ cells }, i) => {
            cells.unshift(
                utils.createCell({
                    type: i === 0 ? constants.CellsTypes.ZERO_INDEX : constants.CellsTypes.ROW_INDEX,
                    value: i === 0 ? null : i
                })
            );
        });
    }

    const rowsPathsColumnSortOptions = columnSortOptions.isUsed
        ? {
              isUsed: columnSortOptions?.isUsed ?? false,
              path: columnSortOptions?.path,
              valueLevel: columnSortOptions?.level ?? false,
              isDesc: columnSortOptions?.sortDesc ?? false,
              isTotal: columnSortOptions?.isTotal ?? false
          }
        : { isUsed: columnSortOptions?.isUsed ?? false };

    const sortedRowsPathsIndexes = buildSortedPathsIndexes({
        paths: rowsPaths,
        levelsOptions: rows,
        columnOptions: rowsPathsColumnSortOptions,
        heap: rowsHeap
    });

    const sortedColumnsPathsIndexes = buildSortedPathsIndexes({
        paths: columnsPaths,
        levelsOptions: columns,
        heap: columnsHeap
    });

    const rowsPathsCollapsed = buildCollapsedPathsIndexes({
        paths: rowsPaths,
        collapsedPaths: collapsedRows,
        heap: rowsHeap
    });

    const columnsPathsCollapsed = buildCollapsedPathsIndexes({
        paths: columnsPaths,
        collapsedPaths: collapsedColumns,
        heap: columnsHeap
    });

    const columnsCollapsedPaths = createCollapsedPaths({
        collapseMap: columnsPathsCollapsed,
        sortedMap: sortedColumnsPathsIndexes,
        paths: columnsPaths
    });
    const rowCollapsedPaths = createCollapsedPaths({
        collapseMap: rowsPathsCollapsed,
        sortedMap: sortedRowsPathsIndexes,
        paths: rowsPaths
    });

    const tableRowsHeader = isShownHead ? buildHeader(columnsCollapsedPaths) : [];

    const tableRowsBody = buildBody({
        startId: tableRowsHeader.length,
        rowCollapsedPaths,
        columnsCollapsedPaths
    });

    const resultRows = tableRowsHeader.concat(tableRowsBody);

    appendIndexes({
        tableRows: resultRows
    });
    return resultRows;
}

export const asyncGenerateTableCells = (message) =>
    runWorker({
        func: generateTableCells,
        message
    });
