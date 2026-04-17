/* eslint-disable no-undef */
import { runWorker } from './worker';

function generateHtmlTable({ data, sheetName }) {
    const cellStylesAliases = {
        'font-size': '--w-font-size',
        'font-family': '--w-font-family',
        'font-weight': '--w-font-weight',
        color: '--w-color'
    };
    const resolveCellStyle = (aliases, styles) =>
        Object.entries(aliases)
            .filter(([_, val]) => styles[val] != null && styles[val] !== '')
            .map(([key, val]) => `${key}: ${styles[val]}`)
            .join(';');

    const createTableHtml = (value) => `<table data-sheet-name="${sheetName}">${value}</table>`;
    const createRowHtml = (value) => `<tr>${value}</tr>`;
    const resolveCellValue = ({ type, value }) => {
        if (
            type === constants.CellsTypes.CELL ||
            type === constants.CellsTypes.TOTAL_CELL ||
            type === constants.CellsTypes.TOTAL_ROW_CELL
        ) {
            return `${value}`.replace(',', '.');
        }
        return value ?? '';
    };
    const createCellHtml = (cell) => {
        const { styles } = cell;
        return `<td style="${resolveCellStyle(cellStylesAliases ?? {}, styles ?? {})}">${resolveCellValue(cell)}</td>`;
    };

    return createTableHtml(
        data.reduce(
            (table, { cells }) =>
                `${table}${createRowHtml(cells.reduce((row, cell) => `${row}${createCellHtml(cell)}`, ''))}`,
            ''
        )
    );
}

export const asyncGenerateHtmlTable = (message) =>
    runWorker({
        func: generateHtmlTable,
        message
    });
