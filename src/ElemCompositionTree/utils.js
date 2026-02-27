/**
 * Суммирует значения поля `fieldName` по всем строкам.
 * @param {Array<Object>} rows
 * @param {string} fieldName
 * @returns {number}
 */
export function aggregateSum(rows, fieldName) {
    if (!rows || !fieldName) return 0;
    return rows.reduce((sum, row) => {
        const val = row[fieldName];
        return sum + (val != null && !Number.isNaN(Number(val)) ? Number(val) : 0);
    }, 0);
}

/**
 * Фильтрует строки по цепочке значений измерений (path).
 * @param {Array<Object>} rows
 * @param {Array<{dimensionName: string, value: *}>} path
 * @returns {Array<Object>}
 */
export function filterRowsByPath(rows, path) {
    if (!rows || !path || path.length === 0) return rows || [];
    return rows.filter((row) =>
        path.every((seg) => {
            const rowVal = row[seg.dimensionName];
            const segVal = seg.value;
            if (rowVal == null && segVal == null) return true;
            // eslint-disable-next-line eqeqeq
            return rowVal == segVal;
        })
    );
}

/**
 * Возвращает топ-N уникальных значений измерения `dimensionName`,
 * отсортированных по убыванию суммарного значения метрики.
 * @param {Array<Object>} rows
 * @param {string} dimensionName
 * @param {string} metricName
 * @param {number} topN
 * @returns {Array<{value: *, metric: number}>}
 */
export function getDimensionValuesWithMetric(rows, dimensionName, metricName, topN) {
    if (!rows || !dimensionName || !metricName) return [];
    const map = new Map();
    for (const row of rows) {
        const dimVal = row[dimensionName];
        const metricVal = row[metricName];
        const key = dimVal != null ? String(dimVal) : '';
        const num = metricVal != null && !Number.isNaN(Number(metricVal)) ? Number(metricVal) : 0;
        map.set(key, (map.get(key) || 0) + num);
    }
    const entries = Array.from(map.entries())
        .map(([key, metric]) => ({ value: key, metric }))
        .sort((a, b) => b.metric - a.metric);
    return topN > 0 ? entries.slice(0, topN) : entries;
}

/**
 * Форматирует числовое значение согласно выбранному формату и разделителю разрядов.
 * @param {number|null|undefined} value
 * @param {string} format  — код из METRIC_FORMAT_OPTIONS
 * @param {string} separator — код из SEPARATOR_OPTIONS
 * @returns {string}
 */
export function formatMetricValue(value, format, separator) {
    if (value == null || Number.isNaN(Number(value))) return '\u2014';
    const num = Number(value);

    let thousandsSep = '\u00A0';
    if (separator === '2') thousandsSep = ',';
    else if (separator === '3') thousandsSep = '';

    const fmt = (n, decimals) => {
        const fixed = n.toFixed(decimals);
        const [intPart, decPart] = fixed.split('.');
        const intFormatted = thousandsSep
            ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep)
            : intPart;
        return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
    };

    switch (format) {
        case '2': return fmt(num, 0);
        case '3': return fmt(num, 1);
        case '4': return fmt(num, 2);
        case '5': return `${fmt(num / 1000, 1)}K`;
        case '6': return `${fmt(num / 1000000, 2)}M`;
        default: {
            if (Math.abs(num) >= 1000000) return `${fmt(num / 1000000, 2)}M`;
            if (Number.isInteger(num)) return fmt(num, 0);
            return fmt(num, 2);
        }
    }
}
