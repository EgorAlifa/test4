/**
 *
 * @param {array} result
 * @param {string} csvDelimiter
 * @return {array}
 */
const toCsv = (result, csvDelimiter) =>
    result.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(csvDelimiter)).join('\n');
/**
 *
 * @param {{csvDelimiter:string, csvRows:array, csvHeaders:array}} options
 * @return {toCsv}
 */
export const resolveCsv = ({ csvDelimiter, csvRows, csvHeaders }) => {
    const values = csvRows.map((row) => csvHeaders.map((header) => row[header]));

    return toCsv([[...csvHeaders], ...values], csvDelimiter);
};

/**
 * @param {string} file
 * @param {import('@goodt-common/utils').FileDownloadOptions} options
 * @param {Window} [target=window]
 */
export const downloadEncodedCsvAsFile = (file, options, target = window) => {
    const { document } = target;
    const { filename } = options;
    const blob = new Blob(['﻿' + file], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('download', filename);
    link.setAttribute('href', url);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};
