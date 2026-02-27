/**
 * Строит данные графа (nodes + links) из строк датасета.
 * Ожидается: каждая строка = одно ребро (source_id, target_id, опционально weight, label/type для узлов).
 *
 * @param {Array<Record<string, unknown>>} rows - строки датасета (result.rows)
 * @param {Object} fieldNames - имена полей
 * @param {Object} options - опции (defaultNodeType, weightToWidth и т.д.)
 * @returns {{ nodes: Array, links: Array }}
 */
export const buildGraphFromDatasetRows = (rows, fieldNames, options = {}) => {
    const {
        defaultNodeType = 'factor',
        weightToWidth = true,
        minEdgeWidth = 0.5,
        maxEdgeWidth = 4,
        defaultEdgeWidth = 1.5
    } = options;

    if (!Array.isArray(rows) || rows.length === 0) {
        return { nodes: [], links: [] };
    }

    const {
        sourceId: sourceIdField,
        targetId: targetIdField,
        weight: weightField,
        sourceLabel: sourceLabelField,
        targetLabel: targetLabelField,
        sourceType: sourceTypeField,
        targetType: targetTypeField
    } = fieldNames;

    const firstRow = rows[0];
    const rowKeys = firstRow && typeof firstRow === 'object' ? Object.keys(firstRow) : [];
    const resolveSourceId = (row) => {
        if (row[sourceIdField] != null) return row[sourceIdField];
        if (rowKeys.length > 0 && row[rowKeys[0]] != null) return row[rowKeys[0]];
        return undefined;
    };
    const resolveTargetId = (row) => {
        if (row[targetIdField] != null) return row[targetIdField];
        if (rowKeys.length > 1 && row[rowKeys[1]] != null) return row[rowKeys[1]];
        return undefined;
    };

    const nodesMap = new Map();
    const links = [];

    const ensureNode = (id, label, type) => {
        const key = String(id ?? '').trim();
        if (!key) return null;
        if (!nodesMap.has(key)) {
            nodesMap.set(key, {
                id: key,
                name: key,
                label: label != null && label !== '' ? String(label) : key,
                value: 1,
                category: type ?? defaultNodeType
            });
        } else {
            const n = nodesMap.get(key);
            if (label != null && label !== '') n.label = String(label);
            if (type != null && type !== '') n.category = type;
        }
        return key;
    };

    let minW = Infinity;
    let maxW = -Infinity;
    const weights = [];

    rows.forEach((row) => {
        const sourceId = resolveSourceId(row);
        const targetId = resolveTargetId(row);
        if (sourceId == null || targetId == null) return;

        const sourceLabel = sourceLabelField ? row[sourceLabelField] : null;
        const targetLabel = targetLabelField ? row[targetLabelField] : null;
        const sourceType = sourceTypeField ? row[sourceTypeField] : null;
        const targetType = targetTypeField ? row[targetTypeField] : null;

        const sid = ensureNode(sourceId, sourceLabel, sourceType);
        const tid = ensureNode(targetId, targetLabel, targetType);
        if (sid == null || tid == null) return;

        let value = defaultEdgeWidth;
        if (weightField != null && row[weightField] != null) {
            const v = Number(row[weightField]);
            if (!Number.isNaN(v)) {
                value = v;
                weights.push(value);
                if (v < minW) minW = v;
                if (v > maxW) maxW = v;
            }
        }

        links.push({
            source: sid,
            target: tid,
            value
        });
    });

    const nodes = Array.from(nodesMap.values());

    if (weightToWidth && weights.length > 0 && maxW > minW) {
        links.forEach((link) => {
            const t = (link.value - minW) / (maxW - minW);
            link.lineStyle = {
                width: minEdgeWidth + t * (maxEdgeWidth - minEdgeWidth),
                opacity: 0.4 + t * 0.5
            };
        });
    } else {
        links.forEach((link) => {
            link.lineStyle = {
                width: defaultEdgeWidth,
                opacity: 0.6
            };
        });
    }

    return { nodes, links };
};

/**
 * Демо-данные для отображения графа, когда датасет подключён и поля выбраны, но данных ещё нет.
 * Формат как у buildGraphFromDatasetRows (nodes + links).
 */
const SAMPLE_ROWS = [
    { id_источника: 'F1', id_цели: 'O1', вес: 2, подпись_источника: '[Фактор 1]', подпись_цели: '[Прерывание операции 1]', тип_источника: 'factor', тип_цели: 'operation' },
    { id_источника: 'F2', id_цели: 'O1', вес: 1, подпись_источника: '[Фактор 2]', подпись_цели: '[Прерывание операции 1]', тип_источника: 'factor', тип_цели: 'operation' },
    { id_источника: 'F3', id_цели: 'O2', вес: 2, подпись_источника: '[Фактор 3]', подпись_цели: '[Прерывание операции 2]', тип_источника: 'factor', тип_цели: 'operation' },
    { id_источника: 'O1', id_цели: 'O3', вес: 1, подпись_источника: '[Прерывание операции 1]', подпись_цели: '[Прерывание операции 3]', тип_источника: 'operation', тип_цели: 'operation' },
    { id_источника: 'O2', id_цели: 'O3', вес: 1, подпись_источника: '[Прерывание операции 2]', подпись_цели: '[Прерывание операции 3]', тип_источника: 'operation', тип_цели: 'operation' },
    { id_источника: 'O3', id_цели: 'STOP', вес: 2, подпись_источника: '[Прерывание операции 3]', подпись_цели: '[Неплановая остановка Предприятия]', тип_источника: 'operation', тип_цели: 'critical' }
];

const SAMPLE_FIELD_NAMES = {
    sourceId: 'id_источника',
    targetId: 'id_цели',
    weight: 'вес',
    sourceLabel: 'подпись_источника',
    targetLabel: 'подпись_цели',
    sourceType: 'тип_источника',
    targetType: 'тип_цели'
};

export const getSampleGraphData = () => buildGraphFromDatasetRows(SAMPLE_ROWS, SAMPLE_FIELD_NAMES, {
    weightToWidth: true,
    minEdgeWidth: 0.5,
    maxEdgeWidth: 4,
    defaultEdgeWidth: 1.5
});
