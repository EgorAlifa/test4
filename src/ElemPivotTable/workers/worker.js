import { QueryAggregateFunctionName } from '@goodt-common/data';
import {
    CellsTypes,
    TotalPositions,
    FILTER_HEIGHT,
    ValueType,
    CellSortTypes,
    createCell,
    LOADER_COLUMN_KEY,
    MetricType,
    TableDrawTypes,
    MetricsPosition
} from '../utils/constants';
import { AggregateMethodFunction, CalculatedCellAggregateMethodFunction, CellSortTypeFunctions } from '../utils/config';
import { uniqArray, findArrayMax, findIntesection, buildArgsAliases, buildExpression, calculate } from '../utils/utils';

const aliasObjectFunction2String = (obj) =>
    Object.entries(obj)
        .reduce((acc, [key, func]) => [...acc, `${key}:${func}`], [])
        .join(',');

const aggregateMethodFunctionValue = aliasObjectFunction2String(AggregateMethodFunction);
const cellSortTypeFunctionsValue = aliasObjectFunction2String(CellSortTypeFunctions);
const calculatedCellAggregateMethodFunctionValue = aliasObjectFunction2String(CalculatedCellAggregateMethodFunction);
const workerConstants = `${JSON.stringify({
    CellsTypes,
    TotalPositions,
    FILTER_HEIGHT,
    ValueType,
    CellSortTypes,
    LOADER_COLUMN_KEY,
    MetricType,
    QueryAggregateFunctionName,
    TableDrawTypes,
    MetricsPosition
})}`;
const workerConfig = `
{
    AggregateMethodFunction: {${aggregateMethodFunctionValue}},
    CellSortTypeFunctions: {${cellSortTypeFunctionsValue}},
    CalculatedCellAggregateMethodFunction: {${calculatedCellAggregateMethodFunctionValue}}
}`;
const workerUtils = `
{
    uniqArray: ${uniqArray},
    findArrayMax: ${findArrayMax},
    buildArgsAliases: ${buildArgsAliases},
    buildExpression: ${buildExpression},
    calculate: ${calculate},
    findIntesection: ${findIntesection},
    createCell: ${createCell}
}`;

const buildWorkerHandler = (func) => `
    const constants = ${workerConstants};
    const config = ${workerConfig};
    const utils = ${workerUtils};
    self.onmessage = function(event) {
      self.postMessage((${func})(event.data.message, {constants, config, utils}));
      return close();
    }
`;

const createWorker = ({ func = () => {} }) => {
    const blob = new Blob([buildWorkerHandler(func)], { type: 'application/javascript' });
    const url = window.URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker.disconnect = () => {
        window.URL.revokeObjectURL(url);
        worker.terminate();
    };
    return worker;
};

export const runWorker = ({ func = () => {}, message = {} }) => {
    const worker = createWorker({ func });
    return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            worker.disconnect();
            resolve(event.data);
        };
        worker.onerror = (e) => {
            worker.disconnect();
            console.error(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`);
            reject(e);
        };
        worker.postMessage({ message });
    });
};
