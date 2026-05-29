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
 * @param {file} string
 * @param {import('@goodt-common/utils').FileDownloadOptions} options
 * @param {Window} [target=window]
 */
export const downloadEncodedCsvAsFile = (file, options, target = window) => {
    const csvContent = `data:csv;charset=utf-8,%EF%BB%BF${encodeURI(file)}`;
    const { document } = target;
    const { filename } = options;
    const link = document.createElement('a');
    link.setAttribute('download', filename);
    link.setAttribute('href', csvContent);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
