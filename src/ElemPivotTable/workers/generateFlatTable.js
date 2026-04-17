import { runWorker } from './worker';

function generateFlatTable(
    {
        rowsSettings,
        columnsSettings,
        valuesSettigns,
        data,
        metrics,
        rowsHeight,
        rowMinHeight,
        titleHeight,
        isUsedIndexes,
        resizedRowsIndexes,
        isShownColumnsTotal,
        columnsTotalPosition,
        rowsHeap,
        columnsHeap,
        rowsPaths,
        columnsPaths,
        totalData = null,
        metricsPosition = null
    } = {},
    { config, constants, utils }
) {
    const isStartedTotalRowPositionStart = columnsTotalPosition === constants.TotalPositions.START;
    const expressionMetricsAliases = utils.buildArgsAliases(metrics);
    const resizedRowsAliases = Object.fromEntries(resizedRowsIndexes);
    const rowsAndColumns = [...rowsSettings, ...columnsSettings];

    const isMetricsInRows = metricsPosition === constants.MetricsPosition?.ROWS;

    const calcHeight = (level) =>
        resizedRowsAliases[level + (isUsedIndexes ? 1 : 0)] != null
            ? Math.max(resizedRowsAliases[level + (isUsedIndexes ? 1 : 0)], rowMinHeight)
            : null;

    const buildCellValue = ({
        metricType,
        aggregate,
        dataAlias,
        usedRows,
        calculatedCell,
        isCalculated,
        expression
    }) => {
        const dataMapperByName = (name) => usedRows.map((row) => row[name]);
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
            return config.AggregateMethodFunction[additionalAggregate](
                dataMapperByName(isCustomMetricNameExists ? customMetricName : dataAlias)
            );
        }
        const value = config.AggregateMethodFunction[aggregate](usedRows.map((row) => row[dataAlias]));
        if (!isUsedMoreAliases || additionalAlias === '') {
            return value;
        }

        return config.CalculatedCellAggregateMethodFunction[method](
            value,
            config.AggregateMethodFunction[additionalAggregate](dataMapperByName(additionalAlias))
        );
    };

    function appendIndexes(tableRows) {
        if (!isUsedIndexes) {
            return;
        }
        tableRows.unshift({
            id: -1,
            size: calcHeight(-1),
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
        return tableRows;
    }

    const namesTitles = rowsAndColumns.map(({ title = null }, level) =>
        utils.createCell({
            type: constants.CellsTypes.ROW_TITLE,
            level,
            value: title
        })
    );

    const valuesTitles = isMetricsInRows
        ? []
        : valuesSettigns.map(({ title = null }, level) =>
              utils.createCell({
                  type: constants.CellsTypes.VALUE_TITLE,
                  level,
                  value: title
              })
          );
    const additionalColumns = isMetricsInRows
        ? [
              utils.createCell({
                  type: constants.CellsTypes.TOTAL_SPACE,
                  level: 0,
                  value: null
              }),
              utils.createCell({
                  type: constants.CellsTypes.TOTAL_SPACE,
                  level: 0,
                  value: null
              })
          ]
        : [];

    const titleRow = {
        id: 0,
        cells: namesTitles.concat(valuesTitles).concat(additionalColumns),
        size: calcHeight(0) ?? titleHeight
    };
    const resolveSort = ({ firstVal, secondVal, resultTrue, resultFalse }) => {
        if (firstVal === secondVal) {
            return 0;
        }
        return firstVal > secondVal ? resultTrue : resultFalse;
    };

    const resultRows = isMetricsInRows
        ? data.flatMap((row, rowIndex) =>
              valuesSettigns.map((settings, metricIndex) => {
                  const baseId = rowIndex * valuesSettigns.length + metricIndex + 1;
                  return {
                      id: baseId,
                      cells: rowsSettings
                          .map(({ dataAlias }, level) =>
                              utils.createCell({
                                  type: constants.CellsTypes.ROW,
                                  level,
                                  path: rowsSettings
                                      .slice(0, level + 1)
                                      .map(({ dataAlias: pathAlias }) => row[pathAlias]),
                                  value: row?.[dataAlias]
                              })
                          )
                          .concat(
                              columnsSettings.map(({ dataAlias }, level) =>
                                  utils.createCell({
                                      type: constants.CellsTypes.ROW,
                                      level,
                                      path: columnsSettings
                                          .slice(0, level + 1)
                                          .map(({ dataAlias: pathAlias }) => row[pathAlias]),
                                      value: row?.[dataAlias]
                                  })
                              )
                          )
                          .concat([
                              // Столбец с названием метрики
                              utils.createCell({
                                  type: constants.CellsTypes.VALUE_TITLE,
                                  level: metricIndex,
                                  value: settings.title || `Метрика ${metricIndex + 1}`
                              }),
                              // Столбец со значением метрики
                              utils.createCell({
                                  type: constants.CellsTypes.CELL,
                                  level: metricIndex,
                                  value: buildCellValue({ ...settings, usedRows: [row] })
                              })
                          ]),
                      size: calcHeight(baseId) ?? rowsHeight
                  };
              })
          )
        : data.map((row, id) => ({
              id: id + 1,
              cells: rowsSettings
                  .map(({ dataAlias }, level) =>
                      utils.createCell({
                          type: constants.CellsTypes.ROW,
                          level,
                          path: rowsSettings.slice(0, level + 1).map(({ dataAlias: pathAlias }) => row[pathAlias]),
                          value: row?.[dataAlias]
                      })
                  )
                  .concat(
                      columnsSettings.map(({ dataAlias }, level) =>
                          utils.createCell({
                              type: constants.CellsTypes.ROW,
                              level,
                              path: columnsSettings
                                  .slice(0, level + 1)
                                  .map(({ dataAlias: pathAlias }) => row[pathAlias]),
                              value: row?.[dataAlias]
                          })
                      )
                  )
                  .concat(
                      valuesSettigns.map((settings, level) =>
                          utils.createCell({
                              type: constants.CellsTypes.CELL,
                              level,
                              value: buildCellValue({ ...settings, usedRows: [row] })
                          })
                      )
                  ),
              size: calcHeight(id + 1) ?? rowsHeight
          }));

    if (!isShownColumnsTotal) {
        resultRows.unshift(titleRow);
        appendIndexes(resultRows);
        return resultRows;
    }

    const totalRows = isMetricsInRows
        ? valuesSettigns.map((settings, metricIndex) => ({
              id: resultRows.length + metricIndex + 1,
              cells: rowsAndColumns
                  .map((_, level) =>
                      utils.createCell({
                          type: constants.CellsTypes.TOTAL_ROW,
                          level,
                          value: level === 0 && metricIndex === 0 ? 'Итого' : null
                      })
                  )
                  .concat([
                      // Столбец с названием метрики для итогов
                      utils.createCell({
                          type: constants.CellsTypes.TOTAL_VALUE_TITLE,
                          level: metricIndex,
                          value: settings.title || `Метрика ${metricIndex + 1}`
                      }),
                      // Столбец со значением метрики для итогов
                      utils.createCell({
                          type: constants.CellsTypes.TOTAL_ROW_CELL,
                          level: metricIndex,
                          value: buildCellValue({
                              ...settings,
                              usedRows: totalData ?? data
                          })
                      })
                  ]),
              size:
                  calcHeight(isStartedTotalRowPositionStart ? metricIndex + 1 : resultRows.length + metricIndex) ??
                  rowsHeight
          }))
        : [
              {
                  id: resultRows.length + 1,
                  cells: rowsAndColumns
                      .map((_, level) =>
                          utils.createCell({
                              type: constants.CellsTypes.TOTAL_ROW,
                              level,
                              value: level === 0 ? 'Итого' : null
                          })
                      )
                      .concat(
                          valuesSettigns.map((settings, level) =>
                              utils.createCell({
                                  type: constants.CellsTypes.TOTAL_ROW_CELL,
                                  level,
                                  value: buildCellValue({
                                      ...settings,
                                      usedRows: totalData ?? data
                                  })
                              })
                          )
                      ),
                  size: calcHeight(isStartedTotalRowPositionStart ? 1 : resultRows.length) ?? rowsHeight
              }
          ];

    if (isStartedTotalRowPositionStart) {
        resultRows.unshift(...totalRows);
    } else {
        resultRows.push(...totalRows);
    }
    resultRows.unshift(titleRow);
    appendIndexes(resultRows);
    return resultRows;
}

export const asyncGenerateFlatTable = (message) =>
    runWorker({
        func: generateFlatTable,
        message
    });
